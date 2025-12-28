/**
 * Language Skill Module
 * 
 * Speaking, Listening, Vocabulary, Grammar - ONE mode at a time
 * Corrections do NOT interrupt speech
 */

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Languages, X, Mic, MicOff, AlertCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import sessionManager, { SessionType } from '@/lib/sessionManager';
import speechRecognitionManager from '@/lib/speechRecognitionManager';
import { LanguageSkillConfig } from '@/lib/sessionConfigs';

export default function LanguageSkillModule({ onClose }) {
  const [setupComplete, setSetupComplete] = useState(false);
  const [config, setConfig] = useState({
    skillMode: 'speaking',
    topic: '',
    difficulty: 'Intermediate',
    correctionStrictness: 'medium'
  });

  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState([]);
  const [corrections, setCorrections] = useState([]);

  const handleStartSession = async () => {
    if (!config.topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    const sessionId = sessionManager.startSession(SessionType.LANGUAGE_SKILL, config);
    if (!sessionId) return;

    setCurrentSessionId(sessionId);
    
    sessionManager.activateSession(sessionId);
    setSetupComplete(true);
    toast.success('Session started!');
  };

  const startListening = () => {
    const initialized = speechRecognitionManager.initialize(currentSessionId, { continuous: true });
    if (!initialized) {
      toast.error('Speech recognition not available');
      return;
    }

    speechRecognitionManager.setOnFinalTranscript((data) => {
      const newTranscript = [...transcript, { text: data.transcript, timestamp: data.timestamp }];
      setTranscript(newTranscript);
      sessionManager.writeToMemory(currentSessionId, 'transcript', newTranscript, data.eventId);

      // Analyze for corrections (NON-BLOCKING)
      analyzeForCorrections(data.transcript);
    });

    speechRecognitionManager.start();
    setIsListening(true);
  };

  const stopListening = () => {
    speechRecognitionManager.stop();
    setIsListening(false);
  };

  const analyzeForCorrections = async (text) => {
    try {
      // Real API call for language analysis
      const response = await fetch('/api/ai/analyze-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLanguage: sessionConfig.targetLanguage,
          nativeLanguage: sessionConfig.nativeLanguage || 'Unknown',
          skillMode: sessionConfig.skillMode
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.analysis) {
        throw new Error('Invalid API response');
      }

      // Store corrections without interrupting speech
      const correction = {
        original: text,
        corrections: data.analysis.corrections,
        suggestions: data.analysis.suggestions,
        scores: data.analysis.scores,
        feedback: data.analysis.overallFeedback,
        type: 'analysis',
        timestamp: Date.now()
      };
      
      const newCorrections = [...corrections, correction];
      setCorrections(newCorrections);
      sessionManager.writeToMemory(currentSessionId, 'corrections', newCorrections, `correction_${Date.now()}`);
    } catch (error) {
      console.error('[LanguageSkill] Failed to analyze language:', error);
      // Don't show error toast - this is background analysis
    }
  };

  const handleEndSession = () => {
    if (isListening) {
      speechRecognitionManager.destroy();
    }
    if (currentSessionId) {
      sessionManager.endSession(currentSessionId, 'user_action');
      onClose?.();
    }
  };

  if (!setupComplete) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full"
        >
          <div className="p-6 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Languages className="w-8 h-8 text-orange-600" />
              <h2 className="text-2xl font-bold">Language Skill Setup</h2>
            </div>
            <button onClick={onClose}><X className="w-6 h-6" /></button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Skill Mode *</label>
              <div className="space-y-2">
                {LanguageSkillConfig.skillModes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setConfig({ ...config, skillMode: mode.id })}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-left ${
                      config.skillMode === mode.id ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{mode.name}</div>
                    {mode.requiresMic && <div className="text-xs text-orange-600">Requires microphone</div>}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Topic *</label>
              <input
                type="text"
                value={config.topic}
                onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                placeholder="e.g., Daily Conversation"
                className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <div className="grid grid-cols-3 gap-3">
                {LanguageSkillConfig.difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setConfig({ ...config, difficulty: diff })}
                    className={`px-4 py-3 border-2 rounded-lg ${
                      config.difficulty === diff ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Correction Strictness</label>
              <div className="space-y-2">
                {LanguageSkillConfig.correctionStrictnessLevels.map((level) => (
                  <button
                    key={level.id}
                    onClick={() => setConfig({ ...config, correctionStrictness: level.id })}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-left ${
                      config.correctionStrictness === level.id ? 'border-orange-600 bg-orange-50 dark:bg-orange-900/20' : 'border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{level.name}</div>
                    <div className="text-sm text-gray-500">{level.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartSession}
              className="w-full bg-orange-600 text-white py-4 rounded-lg font-semibold"
            >
              Start Session
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex"
      >
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-2xl font-bold">{config.topic}</h2>
            <button onClick={handleEndSession} className="px-4 py-2 bg-red-600 text-white rounded-lg">
              End Session
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="mb-6 text-center">
              <button
                onClick={isListening ? stopListening : startListening}
                className={`p-8 rounded-full ${
                  isListening ? 'bg-red-600 animate-pulse' : 'bg-orange-600'
                } text-white hover:opacity-90 transition-all`}
              >
                {isListening ? <MicOff className="w-12 h-12" /> : <Mic className="w-12 h-12" />}
              </button>
              <p className="mt-4 text-sm text-gray-500">
                {isListening ? 'Listening... Click to stop' : 'Click to start speaking'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-bold mb-2">Your Speech</h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 min-h-[100px]">
                  {transcript.map((t, i) => (
                    <p key={i} className="mb-2">{t.text}</p>
                  ))}
                  {transcript.length === 0 && (
                    <p className="text-gray-400">Start speaking to see your transcript...</p>
                  )}
                </div>
              </div>

              {corrections.length > 0 && (
                <div>
                  <h3 className="font-bold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    Corrections
                  </h3>
                  <div className="space-y-2">
                    {corrections.map((c, i) => (
                      <div key={i} className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
                        <p className="text-sm text-gray-600 line-through">{c.original}</p>
                        <p className="font-medium text-green-600">{c.suggestion}</p>
                        <p className="text-xs text-gray-500 mt-1">{c.type}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
