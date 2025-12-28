/**
 * Integration Example: Connecting New Session System to Existing Code
 * 
 * This file shows how to integrate the new session-based modules
 * with your existing application structure.
 */

import React from 'react';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { UserContext } from '@/app/AuthProvider';
import UnifiedLearningPage from '@/components/UnifiedLearningPage';
import sessionManager from '@/lib/sessionManager';

// ============================================================
// Example 1: Basic Page Integration
// ============================================================

/**
 * Replace your existing learning page with this
 */
export function LearningPageIntegration() {
  const { userData } = useContext(UserContext);
  const router = useRouter();

  // Optional: Track when user navigates away
  React.useEffect(() => {
    const handleRouteChange = () => {
      // End session if user navigates away
      const currentSession = sessionManager.getCurrentSession();
      if (currentSession) {
        sessionManager.endSession(currentSession.id, 'navigation_away');
      }
    };

    // Add your router's beforeunload handler
    return () => {
      handleRouteChange();
    };
  }, []);

  return <UnifiedLearningPage userId={userData?._id} />;
}

// ============================================================
// Example 2: Integrating with Existing Navigation
// ============================================================

/**
 * Add to your main layout or navigation component
 */
export function NavigationIntegration() {
  const handleLearningClick = () => {
    // Check if session is active before navigating
    const currentSession = sessionManager.getCurrentSession();
    
    if (currentSession) {
      const confirm = window.confirm(
        'You have an active learning session. Do you want to end it and continue?'
      );
      
      if (confirm) {
        sessionManager.endSession(currentSession.id, 'user_navigation');
      } else {
        return; // Don't navigate
      }
    }
    
    // Navigate to learning page
    window.location.href = '/learning';
  };

  return (
    <button onClick={handleLearningClick}>
      Go to Learning Center
    </button>
  );
}

// ============================================================
// Example 3: Connecting AI Service
// ============================================================

/**
 * Replace mock question generation with your actual AI service
 */
export async function generateInterviewQuestions(config) {
  try {
    // Option A: Using your existing API
    const response = await fetch('/api/ai/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain: config.domain,
        level: config.level,
        title: config.title,
        coach: config.aiCoach,
        count: 10
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate questions');
    }

    const data = await response.json();
    return data.questions;

    // Option B: Using Gemini directly (if you're using Google AI)
    /*
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Generate 10 ${config.level} level interview questions for ${config.domain}.
    Title: ${config.title}
    Format: Return as JSON array with fields: question, expectedAnswer, difficulty`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const questions = JSON.parse(text);
    return questions;
    */

  } catch (error) {
    console.error('Question generation error:', error);
    throw error;
  }
}

// ============================================================
// Example 4: Connecting TTS Service
// ============================================================

/**
 * Connect your existing TTS service
 */
export class TTSIntegration {
  constructor() {
    this.audioQueue = [];
    this.isPlaying = false;
  }

  async speak(text, options = {}) {
    try {
      // Option A: Using your Python TTS server
      const response = await fetch('http://localhost:5000/synthesize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text,
          voice: options.voiceStyle || 'soft',
          speed: options.speed || 1.0
        })
      });

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      const audio = new Audio(audioUrl);
      
      return new Promise((resolve, reject) => {
        audio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          resolve();
        };
        audio.onerror = reject;
        audio.play();
      });

      // Option B: Using Web Speech API (browser-native)
      /*
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = options.speed || 1.0;
      utterance.pitch = options.pitch || 1.0;
      
      return new Promise((resolve) => {
        utterance.onend = resolve;
        window.speechSynthesis.speak(utterance);
      });
      */

    } catch (error) {
      console.error('TTS error:', error);
      throw error;
    }
  }

  stop() {
    // Stop any playing audio
    window.speechSynthesis?.cancel();
  }
}

// ============================================================
// Example 5: Saving Session Data to Database
// ============================================================

/**
 * Save completed session to your database
 */
export async function saveSessionToDatabase(sessionData) {
  try {
    // Using Convex (your existing backend)
    const { useMutation } = require('convex/react');
    const { api } = require('@/convex/_generated/api');

    // You'll need to create this mutation in Convex
    const saveSession = useMutation(api.sessions.save);

    await saveSession({
      userId: sessionData.userId,
      sessionId: sessionData.id,
      type: sessionData.type,
      config: sessionData.config,
      memory: {
        questions: sessionData.memory?.questions || [],
        answers: sessionData.memory?.answers || [],
        transcript: sessionData.memory?.transcript || []
      },
      startTime: sessionData.startTime,
      endTime: sessionData.endTime,
      duration: sessionData.endTime - sessionData.startTime,
      status: sessionData.endReason
    });

    console.log('Session saved to database:', sessionData.id);

  } catch (error) {
    console.error('Failed to save session:', error);
    // Don't throw - saving is optional
  }
}

// ============================================================
// Example 6: Using Session Events for Analytics
// ============================================================

/**
 * Track session events for analytics
 */
export function setupAnalyticsTracking() {
  // Track session creation
  sessionManager.addEventListener('session_created', (session) => {
    // Your analytics service (e.g., Google Analytics, Mixpanel)
    if (typeof gtag !== 'undefined') {
      gtag('event', 'session_started', {
        session_type: session.type,
        session_id: session.id
      });
    }
  });

  // Track session completion
  sessionManager.addEventListener('session_ended', ({ id, reason }) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'session_ended', {
        session_id: id,
        reason: reason
      });
    }
  });

  // Track memory updates (interactions)
  sessionManager.addEventListener('memory_updated', ({ sessionId, key }) => {
    if (typeof gtag !== 'undefined') {
      gtag('event', 'session_interaction', {
        session_id: sessionId,
        interaction_type: key
      });
    }
  });
}

// ============================================================
// Example 7: Complete Integration in a Page Component
// ============================================================

/**
 * Full page component example
 */
export default function LearningPage() {
  const { userData, isLoading } = useContext(UserContext);
  const [sessionStats, setSessionStats] = React.useState({
    totalSessions: 0,
    lastSessionType: null
  });

  // Setup analytics on mount
  React.useEffect(() => {
    setupAnalyticsTracking();
  }, []);

  // Track session stats
  React.useEffect(() => {
    const handleSessionEnded = () => {
      const history = sessionManager.sessionHistory;
      setSessionStats({
        totalSessions: history.length,
        lastSessionType: history[history.length - 1]?.type
      });
    };

    sessionManager.addEventListener('session_ended', handleSessionEnded);
    
    return () => {
      sessionManager.removeEventListener('session_ended', handleSessionEnded);
    };
  }, []);

  // Save session when it ends
  React.useEffect(() => {
    const handleSessionEnded = async () => {
      const lastSession = sessionManager.sessionHistory[sessionManager.sessionHistory.length - 1];
      if (lastSession && userData) {
        await saveSessionToDatabase({
          ...lastSession,
          userId: userData._id
        });
      }
    };

    sessionManager.addEventListener('session_ended', handleSessionEnded);
    
    return () => {
      sessionManager.removeEventListener('session_ended', handleSessionEnded);
    };
  }, [userData]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      {/* Optional: Show stats */}
      <div className="stats">
        <p>Total Sessions: {sessionStats.totalSessions}</p>
        {sessionStats.lastSessionType && (
          <p>Last Session: {sessionStats.lastSessionType}</p>
        )}
      </div>

      {/* Main learning page */}
      <UnifiedLearningPage userId={userData?._id} />
    </div>
  );
}

// ============================================================
// Example 8: Error Boundary Integration
// ============================================================

/**
 * Wrap learning page with error boundary
 */
export class LearningErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Learning page error:', error, errorInfo);
    
    // End any active session on error
    const currentSession = sessionManager.getCurrentSession();
    if (currentSession) {
      sessionManager.endSession(currentSession.id, 'error_crash');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Usage:
// <LearningErrorBoundary>
//   <LearningPage />
// </LearningErrorBoundary>
