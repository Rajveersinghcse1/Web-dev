/**
 * Speech Recognition Manager
 * 
 * Prevents duplicate storage, manages listener lifecycle
 * NO interim results stored. NO double attachments. NO ghost listeners.
 */

class SpeechRecognitionManager {
  constructor() {
    this.recognition = null;
    this.isListening = false;
    this.sessionId = null;
    this.storedTranscripts = new Map(); // eventId -> transcript
    this.onFinalTranscript = null;
    this.onError = null;
  }

  /**
   * Initialize speech recognition for a session
   */
  initialize(sessionId, config = {}) {
    // Rule 0: Validate session ID
    if (!sessionId) {
      console.error('[SpeechManager] Invalid session ID');
      return false;
    }

    // Rule 1: Destroy existing listener before creating new one
    if (this.recognition) {
      console.log('[SpeechManager] Destroying previous recognition before init');
      this.destroy();
    }

    this.sessionId = sessionId;
    
    // Check browser support
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.error('[SpeechManager] Speech recognition not supported');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    // Configure recognition
    this.recognition.continuous = config.continuous !== false;
    this.recognition.interimResults = true; // Listen for interim, but don't store
    this.recognition.lang = config.lang || 'en-US';
    this.recognition.maxAlternatives = 1;

    // Attach event handlers
    this._attachHandlers();

    console.log('[SpeechManager] Initialized for session:', sessionId);
    return true;
  }

  /**
   * Start listening
   */
  start() {
    if (!this.recognition) {
      console.error('[SpeechManager] Not initialized');
      return false;
    }

    if (this.isListening) {
      console.warn('[SpeechManager] Already listening');
      return false;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      console.log('[SpeechManager] Started listening');
      return true;
    } catch (error) {
      console.error('[SpeechManager] Start error:', error);
      return false;
    }
  }

  /**
   * Stop listening
   */
  stop() {
    if (!this.recognition || !this.isListening) {
      return false;
    }

    try {
      this.recognition.stop();
      this.isListening = false;
      console.log('[SpeechManager] Stopped listening');
      return true;
    } catch (error) {
      console.error('[SpeechManager] Stop error:', error);
      return false;
    }
  }

  /**
   * Destroy recognition completely
   * MUST be called on session end
   */
  destroy() {
    if (!this.recognition) return;

    console.log('[SpeechManager] Destroying recognition for session:', this.sessionId);

    // Stop if listening
    if (this.isListening) {
      this.stop();
    }

    // Remove all event handlers
    this.recognition.onresult = null;
    this.recognition.onerror = null;
    this.recognition.onend = null;
    this.recognition.onstart = null;

    // Clear recognition
    this.recognition = null;
    this.isListening = false;
    this.sessionId = null;
    
    // Clear stored transcripts
    this.storedTranscripts.clear();

    // Clear callbacks
    this.onFinalTranscript = null;
    this.onError = null;

    console.log('[SpeechManager] Recognition destroyed');
  }

  /**
   * Set callback for final transcript
   */
  setOnFinalTranscript(callback) {
    this.onFinalTranscript = callback;
  }

  /**
   * Set callback for errors
   */
  setOnError(callback) {
    this.onError = callback;
  }

  /**
   * Check if currently listening
   */
  getIsListening() {
    return this.isListening;
  }

  // ============= PRIVATE METHODS =============

  _attachHandlers() {
    // Result handler
    this.recognition.onresult = (event) => {
      this._handleResult(event);
    };

    // Error handler
    this.recognition.onerror = (event) => {
      console.error('[SpeechManager] Recognition error:', event.error);
      if (this.onError) {
        this.onError(event.error);
      }
      this.isListening = false;
    };

    // End handler (auto-restart if continuous)
    this.recognition.onend = () => {
      console.log('[SpeechManager] Recognition ended');
      this.isListening = false;
      
      // CRITICAL: Only auto-restart if:
      // 1. Session still exists
      // 2. Recognition object still exists (not destroyed)
      // 3. Not currently listening
      if (this.sessionId && this.recognition && !this.isListening) {
        console.log('[SpeechManager] Auto-restarting recognition');
        setTimeout(() => {
          if (this.recognition && !this.isListening && this.sessionId) {
            this.start();
          }
        }, 100);
      } else {
        console.log('[SpeechManager] Not restarting - session ended or destroyed');
      }
    };

    // Start handler
    this.recognition.onstart = () => {
      console.log('[SpeechManager] Recognition started');
      this.isListening = true;
    };
  }

  _handleResult(event) {
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const result = event.results[i];
      
      // CRITICAL RULE: Store ONLY final results
      if (result.isFinal) {
        const transcript = result[0].transcript.trim();
        const eventId = this._generateEventId(transcript, result);

        // Prevent duplicate storage
        if (this._isDuplicate(eventId, transcript)) {
          console.warn('[SpeechManager] Duplicate blocked:', transcript);
          continue;
        }

        // Store and mark as processed
        this.storedTranscripts.set(eventId, transcript);
        
        // Notify callback
        if (this.onFinalTranscript) {
          this.onFinalTranscript({
            transcript,
            eventId,
            timestamp: Date.now()
          });
        }

        console.log('[SpeechManager] Final transcript stored:', transcript);
      }
    }
  }

  _generateEventId(transcript, result) {
    // Generate unique ID based on transcript and timestamp
    const timestamp = Date.now();
    return `${transcript.substring(0, 20)}_${timestamp}`;
  }

  _isDuplicate(eventId, transcript) {
    // Check if exact event already processed
    if (this.storedTranscripts.has(eventId)) {
      console.warn('[SpeechManager] Duplicate event ID:', eventId);
      return true;
    }

    // Normalize transcript for comparison
    const normalizedTranscript = transcript.toLowerCase().trim();
    const now = Date.now();
    
    // Check if similar transcript stored recently (within 3 seconds)
    for (const [storedId, storedTranscript] of this.storedTranscripts.entries()) {
      const [_, timestampStr] = storedId.split('_');
      const timestamp = parseInt(timestampStr);
      
      // Same or very similar transcript within 3 second window = duplicate
      const normalizedStored = storedTranscript.toLowerCase().trim();
      const timeDiff = now - timestamp;
      
      if (normalizedStored === normalizedTranscript && timeDiff < 3000) {
        console.warn('[SpeechManager] Duplicate transcript within time window:', transcript);
        return true;
      }
    }

    // Clean up old entries (older than 10 seconds)
    for (const [storedId] of this.storedTranscripts.entries()) {
      const [_, timestampStr] = storedId.split('_');
      const timestamp = parseInt(timestampStr);
      if (now - timestamp > 10000) {
        this.storedTranscripts.delete(storedId);
      }
    }

    return false;
  }
}

// Singleton instance
const speechRecognitionManager = new SpeechRecognitionManager();

export default speechRecognitionManager;
