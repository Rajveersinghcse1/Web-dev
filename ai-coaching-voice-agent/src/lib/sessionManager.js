/**
 * Session State Machine - Core Controller
 * 
 * Enforces deterministic session lifecycle across ALL learning modules
 * NO bypassing. NO shortcuts. NO exceptions.
 */

// Session States (Non-negotiable)
export const SessionState = {
  IDLE: 'IDLE',
  INITIALIZING: 'INITIALIZING',
  ACTIVE: 'ACTIVE',
  TERMINATING: 'TERMINATING',
  DESTROYED: 'DESTROYED'
};

// Session Types (All learning modules)
export const SessionType = {
  MOCK_INTERVIEW: 'mock_interview',
  LECTURE: 'lecture',
  QA_PREP: 'qa_prep',
  LANGUAGE_SKILL: 'language_skill',
  MEDITATION: 'meditation'
};

class SessionManager {
  constructor() {
    this.currentSession = null;
    this.sessionHistory = [];
    this.listeners = new Map();
    this.isTransitioning = false; // Mutex lock for state transitions
  }

  /**
   * Start a new session
   * @returns {string|null} sessionId if created, null if blocked
   */
  startSession(type, config) {
    // Rule 0: Mutex lock - prevent concurrent session creation
    if (this.isTransitioning) {
      console.error('[SessionManager] State transition in progress, blocking new session');
      return null;
    }

    // Rule 1: Only ONE session at a time
    if (this.currentSession && this.currentSession.status !== SessionState.IDLE && this.currentSession.status !== SessionState.DESTROYED) {
      console.error('[SessionManager] Session already active:', this.currentSession.id);
      return null;
    }

    this.isTransitioning = true;

    // Rule 2: Validate session type
    if (!Object.values(SessionType).includes(type)) {
      console.error('[SessionManager] Invalid session type:', type);
      return null;
    }

    // Rule 3: Create session with strict structure
    const sessionId = this._generateSessionId();
    this.currentSession = {
      id: sessionId,
      type,
      config,
      status: SessionState.INITIALIZING,
      memory: this._initializeMemory(type),
      startTime: Date.now(),
      metadata: {
        retryCount: 0,
        errorLog: []
      }
    };

    console.log('[SessionManager] Session created:', sessionId, type);
    this._notifyListeners('session_created', this.currentSession);
    
    this.isTransitioning = false; // Release mutex lock
    return sessionId;
  }

  /**
   * Transition session to ACTIVE state
   */
  activateSession(sessionId) {
    if (this.isTransitioning) {
      console.error('[SessionManager] State transition in progress');
      return false;
    }

    if (!this._validateSession(sessionId)) return false;

    if (this.currentSession.status !== SessionState.INITIALIZING) {
      console.error('[SessionManager] Cannot activate session in state:', this.currentSession.status);
      return false;
    }

    this.isTransitioning = true;
    this.currentSession.status = SessionState.ACTIVE;
    console.log('[SessionManager] Session activated:', sessionId);
    this._notifyListeners('session_activated', this.currentSession);
    this.isTransitioning = false;
    
    return true;
  }

  /**
   * End session and clean up ALL resources
   */
  endSession(sessionId, reason = 'user_action') {
    if (this.isTransitioning) {
      console.error('[SessionManager] Cannot end session during state transition');
      return false;
    }

    if (!this._validateSession(sessionId)) return false;

    // Prevent double termination
    if (this.currentSession.status === SessionState.TERMINATING ||
        this.currentSession.status === SessionState.DESTROYED) {
      console.warn('[SessionManager] Session already terminating/destroyed');
      return false;
    }

    this.isTransitioning = true;
    this.currentSession.status = SessionState.TERMINATING;
    console.log('[SessionManager] Terminating session:', sessionId, 'Reason:', reason);
    this._notifyListeners('session_terminating', { id: sessionId, reason });

    // Archive session before destruction
    this.sessionHistory.push({
      ...this.currentSession,
      endTime: Date.now(),
      endReason: reason
    });

    // CRITICAL: Destroy memory explicitly
    this._destroyMemory(sessionId);

    // Mark as destroyed
    this.currentSession.status = SessionState.DESTROYED;
    this._notifyListeners('session_ended', { id: sessionId, reason });

    // Reset to IDLE
    this.currentSession = null;
    this.isTransitioning = false; // Release mutex lock
    
    console.log('[SessionManager] Session destroyed:', sessionId);
    return true;
  }

  /**
   * Get current session (read-only)
   */
  getCurrentSession() {
    return this.currentSession ? { ...this.currentSession } : null;
  }

  /**
   * Get session memory (controlled access)
   */
  getSessionMemory(sessionId) {
    if (!this._validateSession(sessionId)) return null;
    return this.currentSession.memory;
  }

  /**
   * Write to session memory (single write per event)
   */
  writeToMemory(sessionId, key, value, eventId = null) {
    if (!this._validateSession(sessionId)) {
      console.error('[SessionManager] Cannot write to memory - invalid session:', sessionId);
      return false;
    }

    // Only allow writes to ACTIVE sessions
    if (this.currentSession.status !== SessionState.ACTIVE) {
      console.error('[SessionManager] Cannot write to memory - session not active:', this.currentSession.status);
      return false;
    }

    // Prevent duplicate writes for same event
    if (eventId && this.currentSession.memory._eventLog?.has(eventId)) {
      console.warn('[SessionManager] Duplicate write blocked for event:', eventId);
      return false;
    }

    this.currentSession.memory[key] = value;

    // Track event to prevent duplicates
    if (eventId) {
      if (!this.currentSession.memory._eventLog) {
        this.currentSession.memory._eventLog = new Set();
      }
      this.currentSession.memory._eventLog.add(eventId);
    }

    console.log(`[SessionManager] Memory updated [${sessionId}]:`, key);
    this._notifyListeners('memory_updated', { sessionId, key, value });
    return true;
  }

  /**
   * Check if session is in specific state
   */
  isSessionInState(state) {
    return this.currentSession?.status === state;
  }

  /**
   * Register listener for session events
   */
  addEventListener(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Remove listener
   */
  removeEventListener(event, callback) {
    if (!this.listeners.has(event)) return;
    const callbacks = this.listeners.get(event);
    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  }

  // ============= PRIVATE METHODS =============

  _generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  _validateSession(sessionId) {
    if (!this.currentSession) {
      console.error('[SessionManager] No active session');
      return false;
    }
    if (this.currentSession.id !== sessionId) {
      console.error('[SessionManager] Session ID mismatch');
      return false;
    }
    return true;
  }

  _initializeMemory(type) {
    const baseMemory = {
      _eventLog: new Set(), // Prevents duplicate writes
      _created: Date.now()
    };

    // Type-specific memory schemas
    switch (type) {
      case SessionType.MOCK_INTERVIEW:
        return {
          ...baseMemory,
          questions: [],
          answers: [],
          transcript: [],
          currentQuestionIndex: 0
        };
      
      case SessionType.LECTURE:
        return {
          ...baseMemory,
          outline: [],
          currentSectionIndex: 0,
          userNotes: []
        };
      
      case SessionType.QA_PREP:
        return {
          ...baseMemory,
          questions: [],
          attempted: [],
          explanations: []
        };
      
      case SessionType.LANGUAGE_SKILL:
        return {
          ...baseMemory,
          transcript: [],
          corrections: [],
          improvementTips: []
        };
      
      case SessionType.MEDITATION:
        return {
          ...baseMemory,
          script: '',
          currentStepIndex: 0
        };
      
      default:
        return baseMemory;
    }
  }

  _destroyMemory(sessionId) {
    if (!this.currentSession) return;

    // Clear all arrays and objects
    const memory = this.currentSession.memory;
    Object.keys(memory).forEach(key => {
      if (Array.isArray(memory[key])) {
        memory[key].length = 0;
      } else if (memory[key] instanceof Set) {
        memory[key].clear();
      } else if (typeof memory[key] === 'object') {
        memory[key] = null;
      } else {
        memory[key] = null;
      }
    });

    this.currentSession.memory = null;
    console.log('[SessionManager] Memory destroyed for session:', sessionId);
  }

  _notifyListeners(event, data) {
    if (!this.listeners.has(event)) return;
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('[SessionManager] Listener error:', error);
      }
    });
  }
}

// Singleton instance
const sessionManager = new SessionManager();

// Prevent resurrection after tab refresh
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (sessionManager.currentSession) {
      sessionManager.endSession(sessionManager.currentSession.id, 'page_unload');
    }
  });
}

export default sessionManager;
