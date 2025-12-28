/**
 * Q&A Prep Module
 * 
 * User-led learning, NO interview pressure, NO evaluation tone
 */

"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, X, Lightbulb, CheckCircle, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import sessionManager, { SessionType } from '@/lib/sessionManager';
import { QAPrepConfig } from '@/lib/sessionConfigs';

export default function QAPrepModule({ onClose }) {
  const [setupComplete, setSetupComplete] = useState(false);
  const [config, setConfig] = useState({
    topic: '',
    difficulty: 'Medium',
    mode: 'mixed'
  });

  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [attempted, setAttempted] = useState([]);

  const handleStartSession = async () => {
    if (!config.topic.trim()) {
      toast.error('Please enter a topic');
      return;
    }

    const sessionId = sessionManager.startSession(SessionType.QA_PREP, config);
    if (!sessionId) return;

    setCurrentSessionId(sessionId);
    setIsGenerating(true);

    try {
      await generateQuestions(sessionId, config);
      sessionManager.activateSession(sessionId);
      setSetupComplete(true);
      toast.success('Questions ready!');
    } catch (error) {
      toast.error('Failed to generate questions');
      sessionManager.endSession(sessionId, 'generation_error');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateQuestions = async (sessionId, config) => {
    try {
      // Real API call
      const response = await fetch('/api/ai/generate-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: config.topic,
          difficulty: config.difficulty,
          count: QAPrepConfig.questionCount
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.questions) {
        throw new Error('Invalid API response');
      }

      const qs = data.questions;
      sessionManager.writeToMemory(sessionId, 'questions', qs, `qa_gen_${sessionId}`);
      setQuestions(qs);
      return qs;
    } catch (error) {
      console.error('[QAPrep] Failed to generate questions:', error);
      throw error;
    }
  };

  const handleSelectQuestion = (question) => {
    setSelectedQuestion(question);
    setShowExplanation(false);
  };

  const handleShowExplanation = () => {
    if (selectedQuestion && !attempted.includes(selectedQuestion.id)) {
      const newAttempted = [...attempted, selectedQuestion.id];
      setAttempted(newAttempted);
      sessionManager.writeToMemory(currentSessionId, 'attempted', newAttempted);
    }
    setShowExplanation(true);
  };

  const handleEndSession = () => {
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
              <HelpCircle className="w-8 h-8 text-green-600" />
              <h2 className="text-2xl font-bold">Q&A Prep Setup</h2>
            </div>
            <button onClick={onClose}><X className="w-6 h-6" /></button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Topic / Syllabus *</label>
              <input
                type="text"
                value={config.topic}
                onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                placeholder="e.g., JavaScript Closures"
                className="w-full px-4 py-3 border rounded-lg dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Difficulty</label>
              <div className="grid grid-cols-3 gap-3">
                {QAPrepConfig.difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setConfig({ ...config, difficulty: diff })}
                    className={`px-4 py-3 border-2 rounded-lg ${
                      config.difficulty === diff ? 'border-green-600 bg-green-50 dark:bg-green-900/20' : 'border-gray-300'
                    }`}
                  >
                    {diff}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mode</label>
              <div className="space-y-2">
                {QAPrepConfig.modes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => setConfig({ ...config, mode: mode.id })}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-left ${
                      config.mode === mode.id ? 'border-green-600 bg-green-50 dark:bg-green-900/20' : 'border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{mode.name}</div>
                    <div className="text-sm text-gray-500">{mode.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartSession}
              disabled={isGenerating}
              className="w-full bg-green-600 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" />Generating...</> : <>Start Learning</>}
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
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          <div className="p-4 border-b">
            <h3 className="font-bold">Questions ({questions.length})</h3>
          </div>
          <div className="p-2 space-y-2">
            {questions.map((q) => (
              <button
                key={q.id}
                onClick={() => handleSelectQuestion(q)}
                className={`w-full p-3 rounded-lg text-left text-sm ${
                  selectedQuestion?.id === q.id
                    ? 'bg-green-100 dark:bg-green-900/20 border-2 border-green-600'
                    : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100'
                } ${attempted.includes(q.id) ? 'opacity-50' : ''}`}
              >
                {attempted.includes(q.id) && <CheckCircle className="w-4 h-4 inline mr-2 text-green-600" />}
                {q.question}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-2xl font-bold">{config.topic}</h2>
            <button onClick={handleEndSession} className="px-4 py-2 bg-red-600 text-white rounded-lg">
              End Session
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            {selectedQuestion ? (
              <>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 mb-6">
                  <p className="text-lg font-medium">{selectedQuestion.question}</p>
                </div>

                {showExplanation ? (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Lightbulb className="w-6 h-6 text-yellow-600" />
                      <h3 className="font-bold text-lg">Explanation</h3>
                    </div>
                    <p>{selectedQuestion.explanation}</p>
                  </div>
                ) : (
                  <button
                    onClick={handleShowExplanation}
                    className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2"
                  >
                    <Lightbulb className="w-5 h-5" />
                    Show Explanation
                  </button>
                )}
              </>
            ) : (
              <div className="text-center text-gray-500 mt-20">
                Select a question to begin
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
