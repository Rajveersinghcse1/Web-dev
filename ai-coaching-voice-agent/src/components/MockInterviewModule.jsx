/**
 * Mock Interview Module (Refactored with Session Management)
 * 
 * Enforces proper session lifecycle, prevents duplicates, controls concurrency
 */

"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Briefcase, Target, User, BookOpen, Play, X, AlertCircle, 
  CheckCircle, Loader2, Volume2, Mic, MicOff, Sparkles 
} from 'lucide-react';
import toast from 'react-hot-toast';
import sessionManager, { SessionType, SessionState } from '@/lib/sessionManager';
import speechRecognitionManager from '@/lib/speechRecognitionManager';
import { MockInterviewConfig } from '@/lib/sessionConfigs';
import { GeneratingQuestionsLoader, ProcessingAnswerLoader } from './LoadingWindows';
import { SessionInfoPanel, EndSessionButton } from './SessionControl';

export default function MockInterviewModule({ onClose }) {
  // Setup state
  const [setupComplete, setSetupComplete] = useState(false);
  const [config, setConfig] = useState({
    title: '',
    level: 'Intermediate',
    aiCoach: 'balanced',
    domain: 'Frontend Development'
  });

  // Session state
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sessionStatus, setSessionStatus] = useState(SessionState.IDLE);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  
  // Interview state
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [answers, setAnswers] = useState([]);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Listen to session events
  useEffect(() => {
    const handleSessionActivated = (session) => {
      setSessionStatus(session.status);
      setCurrentSessionId(session.id);
    };

    const handleSessionEnded = () => {
      setSessionStatus(SessionState.IDLE);
      setCurrentSessionId(null);
      cleanup();
    };

    sessionManager.addEventListener('session_activated', handleSessionActivated);
    sessionManager.addEventListener('session_ended', handleSessionEnded);

    return () => {
      sessionManager.removeEventListener('session_activated', handleSessionActivated);
      sessionManager.removeEventListener('session_ended', handleSessionEnded);
    };
  }, []);

  // Validate setup form
  const validateSetup = () => {
    const newErrors = {};
    
    if (!config.title || config.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    
    if (!config.level) {
      newErrors.level = 'Please select a difficulty level';
    }
    
    if (!config.aiCoach) {
      newErrors.aiCoach = 'Please select an AI coach';
    }
    
    if (!config.domain) {
      newErrors.domain = 'Please select an interview domain';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Start session and generate questions
  const handleStartSession = async () => {
    // Validate form
    if (!validateSetup()) {
      toast.error('Please fill all required fields');
      return;
    }

    // Rule 1: Check if another session is active
    if (sessionStatus !== SessionState.IDLE) {
      toast.error('A session is already active');
      return;
    }

    try {
      // Step 1: Lock the session
      const sessionId = sessionManager.startSession(SessionType.MOCK_INTERVIEW, config);
      
      if (!sessionId) {
        toast.error('Failed to create session');
        return;
      }

      setCurrentSessionId(sessionId);
      setSessionStatus(SessionState.INITIALIZING);
      setIsGeneratingQuestions(true);

      // Step 2: Spawn Process 1 - Generate Questions (ASYNC, runs ONCE)
      await generateQuestions(sessionId, config);

      // Step 3: Activate session
      const activated = sessionManager.activateSession(sessionId);
      
      if (!activated) {
        throw new Error('Failed to activate session');
      }

      setSessionStatus(SessionState.ACTIVE);
      setSetupComplete(true);
      toast.success('Session started! Good luck!');

    } catch (error) {
      console.error('[MockInterview] Start session error:', error);
      toast.error('Failed to start session: ' + error.message);
      
      // Cleanup on error
      if (currentSessionId) {
        sessionManager.endSession(currentSessionId, 'initialization_error');
      }
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Generate questions (MUST run only once)
  const generateQuestions = async (sessionId, config) => {
    console.log('[MockInterview] Generating questions for session:', sessionId);

    // Rule: This function must run exactly ONCE per session
    // If it runs twice, the architecture is broken
    const startTime = Date.now();
    const TIMEOUT = 30000; // 30 second timeout

    try {
      // Create timeout promise
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Question generation timeout')), TIMEOUT)
      );

      // Call AI API to generate questions
      const apiPromise = fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          domain: config.domain,
          level: config.level,
          title: config.title,
          count: MockInterviewConfig.questionCount,
          sessionId, // Pass session ID for tracking
        }),
      });

      // Race between API and timeout
      const response = await Promise.race([apiPromise, timeoutPromise]);

      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.questions) {
        throw new Error('Invalid response from API');
      }

      // Transform API response to match our structure
      const generatedQuestions = data.questions.map((q, i) => ({
        id: q.id || `q_${sessionId}_${i + 1}`,
        question: q.text,
        expectedAnswer: `[AI-generated answer for ${q.category || config.domain}]`,
        difficulty: q.difficulty || config.level,
        category: q.category,
      }));

      // Validate question count
      if (generatedQuestions.length !== MockInterviewConfig.questionCount) {
        console.warn('[MockInterview] Question count mismatch:', generatedQuestions.length);
      }

      // Store in session memory (write-once with event ID)
      const eventId = `generate_questions_${sessionId}`;
      const written = sessionManager.writeToMemory(
        sessionId,
        'questions',
        generatedQuestions,
        eventId
      );

      if (!written) {
        throw new Error('Failed to write questions to memory (duplicate event)');
      }

      setQuestions(generatedQuestions);
      const duration = Date.now() - startTime;
      console.log(`[MockInterview] Questions generated successfully in ${duration}ms:`, generatedQuestions.length);
      
      return generatedQuestions;
      
    } catch (error) {
      console.error('[MockInterview] Question generation error:', error);
      throw error;
    }
  };

  // Start speech recognition
  const startListening = useCallback(() => {
    if (!currentSessionId) {
      console.error('[MockInterview] Cannot start listening - no session');
      return;
    }

    // Verify session is ACTIVE
    const session = sessionManager.getCurrentSession();
    if (!session || session.status !== SessionState.ACTIVE) {
      toast.error('Session not active. Cannot start recording.');
      return;
    }

    const initialized = speechRecognitionManager.initialize(currentSessionId, {
      continuous: true,
      lang: 'en-US'
    });

    if (!initialized) {
      toast.error('Speech recognition not available in this browser');
      return;
    }

    // Handle final transcript ONLY (no interim results stored)
    speechRecognitionManager.setOnFinalTranscript((data) => {
      console.log('[MockInterview] Final transcript received:', data.transcript);
      
      // Get current memory
      const memory = sessionManager.getSessionMemory(currentSessionId);
      if (!memory) {
        console.error('[MockInterview] No session memory available');
        return;
      }

      // Store with event ID to prevent duplicates
      const written = sessionManager.writeToMemory(
        currentSessionId,
        'transcript',
        [...(memory.transcript || []), data.transcript],
        data.eventId // Unique event ID from speech manager
      );

      if (written) {
        setUserAnswer(prev => {
          const updated = prev ? `${prev} ${data.transcript}` : data.transcript;
          return updated.trim();
        });
      } else {
        console.warn('[MockInterview] Duplicate transcript blocked:', data.transcript);
      }
    });

    speechRecognitionManager.setOnError((error) => {
      console.error('[MockInterview] Speech error:', error);
      toast.error(`Speech recognition error: ${error}`);
      setIsListening(false);
    });

    const started = speechRecognitionManager.start();
    if (started) {
      setIsListening(true);
      toast.success('🎤 Listening... Speak your answer');
    } else {
      toast.error('Failed to start speech recognition');
    }
  }, [currentSessionId]);

  // Stop speech recognition
  const stopListening = useCallback(() => {
    speechRecognitionManager.stop();
    setIsListening(false);
  }, []);

  // Submit answer and move to next question
  const handleSubmitAnswer = async () => {
    // Validation
    if (!currentSessionId) {
      toast.error('No active session');
      return;
    }

    if (!userAnswer.trim()) {
      toast.error('Please provide an answer before submitting');
      return;
    }

    // Verify session is ACTIVE
    const session = sessionManager.getCurrentSession();
    if (!session || session.status !== SessionState.ACTIVE) {
      toast.error('Session not active. Cannot submit answer.');
      return;
    }

    // Stop listening if active
    if (isListening) {
      stopListening();
    }

    // Store answer in memory
    const answer = {
      questionId: questions[currentQuestionIndex].id,
      questionText: questions[currentQuestionIndex].question,
      answer: userAnswer.trim(),
      timestamp: Date.now(),
      questionIndex: currentQuestionIndex
    };

    const memory = sessionManager.getSessionMemory(currentSessionId);
    const updatedAnswers = [...(memory?.answers || []), answer];
    
    // Write with event ID to prevent duplicates
    const written = sessionManager.writeToMemory(
      currentSessionId, 
      'answers', 
      updatedAnswers,
      `answer_${currentQuestionIndex}_${Date.now()}`
    );

    if (!written) {
      toast.error('Failed to save answer');
      return;
    }

    setAnswers(updatedAnswers);
    setUserAnswer('');

    // Move to next question
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      sessionManager.writeToMemory(
        currentSessionId, 
        'currentQuestionIndex', 
        nextIndex,
        `index_${nextIndex}`
      );
      toast.success(`✅ Answer recorded! Question ${nextIndex + 1}/${questions.length}`);
    } else {
      // Interview complete
      toast.success('🎉 All questions answered!');
      setTimeout(() => {
        handleEndInterview('completed');
      }, 1500);
    }
  };

  // End interview
  const handleEndInterview = (status = 'user_terminated') => {
    if (!currentSessionId) {
      console.warn('[MockInterview] No session to end');
      onClose?.();
      return;
    }

    console.log('[MockInterview] Ending interview:', currentSessionId, status);

    // Step 1: Stop speech recognition (DESTROY, not pause)
    if (isListening) {
      speechRecognitionManager.destroy();
      setIsListening(false);
      console.log('[MockInterview] Speech recognition destroyed');
    }

    // Step 2: Cancel any pending AI calls
    // TODO: Implement AbortController for API calls if needed

    // Step 3: End session (this clears temp memory)
    const ended = sessionManager.endSession(currentSessionId, status);
    
    if (ended) {
      console.log('[MockInterview] Session ended successfully');
      toast.success('Interview ended. Thank you!');
    } else {
      console.error('[MockInterview] Failed to end session');
      toast.error('Error ending session');
    }

    // Step 4: Local cleanup
    cleanup();

    // Step 5: Close UI
    onClose?.();
  };

  // Cleanup
  const cleanup = () => {
    console.log('[MockInterview] Cleanup initiated');
    
    // Destroy speech recognition if still active
    if (isListening) {
      speechRecognitionManager.destroy();
    }
    
    // Reset all local state
    setSetupComplete(false);
    setQuestions([]);
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setUserAnswer('');
    setIsListening(false);
    setCurrentSessionId(null);
    setSessionStatus(SessionState.IDLE);
    setErrors({});
    
    console.log('[MockInterview] Cleanup complete');
  };

  // Setup UI
  if (!setupComplete) {
    return (
      <>
        <AnimatePresence>
          {isGeneratingQuestions && <GeneratingQuestionsLoader />}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed inset-0 bg-gradient-to-br from-black/80 via-purple-900/50 to-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, rotateX: -15 }}
            animate={{ scale: 1, rotateX: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative bg-gradient-to-br from-white via-purple-50/50 to-pink-50/50 dark:from-gray-900 dark:via-purple-950/50 dark:to-gray-900 rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border-2 border-purple-500/20"
          >
            {/* Animated Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-purple-500/10 to-pink-500/5 rounded-3xl pointer-events-none" />

            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 p-8 flex items-center justify-between rounded-t-3xl z-10">
              <div className="flex items-center gap-4">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl"
                >
                  <Briefcase className="w-8 h-8 text-white" strokeWidth={2.5} />
                </motion.div>
                <div>
                  <h2 className="text-3xl font-extrabold text-white drop-shadow-lg">
                    Mock Interview Setup
                  </h2>
                  <p className="text-white/90 font-medium mt-1">Prepare for your dream interview</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-white/20 rounded-xl transition-all duration-300 group"
              >
                <X className="w-7 h-7 text-white group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>

            {/* Form */}
            <div className="p-8 space-y-6 relative z-10">
              {/* Interview Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <BookOpen className="w-4 h-4 inline mr-2" />
                Interview Title *
              </label>
              <input
                type="text"
                value={config.title}
                onChange={(e) => setConfig({ ...config, title: e.target.value })}
                placeholder="e.g., React Developer Position"
                className={`w-full px-4 py-3 border ${errors.title ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Difficulty Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Target className="w-4 h-4 inline mr-2" />
                Difficulty Level *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {MockInterviewConfig.levels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setConfig({ ...config, level })}
                    className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${
                      config.level === level
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20 text-purple-600'
                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* AI Coach */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Choose Your AI Coach *
              </label>
              <div className="space-y-2">
                {MockInterviewConfig.aiCoaches.map((coach) => (
                  <button
                    key={coach.id}
                    onClick={() => setConfig({ ...config, aiCoach: coach.id })}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-left transition-all ${
                      config.aiCoach === coach.id
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20'
                        : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{coach.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{coach.personality}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Interview Domain */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Interview Domain *
              </label>
              <select
                value={config.domain}
                onChange={(e) => setConfig({ ...config, domain: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              >
                {MockInterviewConfig.domains.map((domain) => (
                  <option key={domain} value={domain}>{domain}</option>
                ))}
              </select>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStartSession}
              disabled={isGeneratingQuestions || sessionStatus !== SessionState.IDLE}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isGeneratingQuestions ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating {MockInterviewConfig.questionCount} Questions...
                </>
              ) : sessionStatus !== SessionState.IDLE ? (
                <>
                  <AlertCircle className="w-5 h-5" />
                  Session Already Active
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Interview
                </>
              )}
            </button>

            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {MockInterviewConfig.questionCount} questions will be generated based on your selection
            </p>

            {sessionStatus !== SessionState.IDLE && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  Another session is active. End it before starting a new interview.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
      </>
    );
  }

  // Interview UI
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header with Session Info */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{config.title}</h2>
            <EndSessionButton
              sessionId={currentSessionId}
              onEnd={(status) => {
                if (status === 'success' || status === 'no_session') {
                  cleanup();
                  onClose?.();
                }
              }}
              variant="danger"
            />
          </div>
          
          {/* Session Info */}
          <div className="mb-4">
            <SessionInfoPanel 
              session={sessionManager.getCurrentSession()}
            />
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            <span className="font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span>•</span>
            <span>{config.level}</span>
            <span>•</span>
            <span>{config.domain}</span>
            <span>•</span>
            <span className="text-purple-600 dark:text-purple-400">
              {answers.length} answered
            </span>
          </div>
        </div>

        {/* Question */}
        <div className="p-8">
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 mb-6">
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              {questions[currentQuestionIndex]?.question}
            </p>
          </div>

          {/* Answer Input */}
          <div className="space-y-4">
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Type or speak your answer..."
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white resize-none"
            />

            <div className="flex items-center gap-4">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`flex-1 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  isListening
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5" />
                    Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5" />
                    Start Recording
                  </>
                )}
              </button>

              <button
                onClick={handleSubmitAnswer}
                disabled={!userAnswer.trim()}
                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-5 h-5" />
                Submit Answer
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
