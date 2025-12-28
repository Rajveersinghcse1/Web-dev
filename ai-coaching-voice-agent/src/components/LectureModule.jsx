/**
 * Lecture on Topic Module
 * 
 * Structured teaching with controlled audio, section navigation
 */

"use client";

import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Play, Pause, SkipForward, RotateCcw, X, 
  Clock, Loader2, Volume2, CheckCircle 
} from 'lucide-react';
import toast from 'react-hot-toast';
import sessionManager, { SessionType, SessionState } from '@/lib/sessionManager';
import { LectureConfig } from '@/lib/sessionConfigs';

export default function LectureModule({ onClose }) {
  const [setupComplete, setSetupComplete] = useState(false);
  const [config, setConfig] = useState({
    topicTitle: '',
    depthLevel: 'Intermediate',
    teachingStyle: 'detailed',
    durationTarget: 'medium'
  });

  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [outline, setOutline] = useState([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleStartSession = async () => {
    if (!config.topicTitle.trim()) {
      toast.error('Please enter a topic title');
      return;
    }

    const sessionId = sessionManager.startSession(SessionType.LECTURE, config);
    if (!sessionId) {
      toast.error('Failed to create session');
      return;
    }

    setCurrentSessionId(sessionId);
    setIsGenerating(true);

    try {
      // Generate lecture outline
      await generateLectureOutline(sessionId, config);
      
      sessionManager.activateSession(sessionId);
      setSetupComplete(true);
      toast.success('Lecture prepared!');
    } catch (error) {
      console.error('[Lecture] Error:', error);
      toast.error('Failed to prepare lecture');
      sessionManager.endSession(sessionId, 'generation_error');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateLectureOutline = async (sessionId, config) => {
    try {
      // Call AI API to generate lecture outline
      const response = await fetch('/api/ai/generate-lecture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topicTitle: config.topicTitle,
          depthLevel: config.depthLevel,
          teachingStyle: config.teachingStyle,
          durationTarget: config.durationTarget,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.outline) {
        throw new Error('Invalid response from API');
      }

      const sections = data.outline.sections;

      sessionManager.writeToMemory(sessionId, 'outline', sections, `outline_${sessionId}`);
      setOutline(sections);
      console.log('[Lecture] Outline generated:', sections.length, 'sections');
      return sections;
      
    } catch (error) {
      console.error('[Lecture] Outline generation error:', error);
      throw error;
    }
  };

  const handlePlaySection = async () => {
    if (!outline[currentSectionIndex]) return;
    
    const section = outline[currentSectionIndex];
    setIsPlaying(true);
    
    try {
      // TODO: Connect to your Python TTS server
      // Uncomment when ready:
      /*
      const response = await fetch('http://localhost:5000/synthesize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: section.content,
          voice: 'en-US'
        })
      });
      
      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsPlaying(false);
        handleNextSection();
      };
      
      await audio.play();
      */
      
      // For now, show toast
      toast.success(`Playing: ${section.title}`);
      console.log('[Lecture] Playing section:', section.title);
      
    } catch (error) {
      console.error('[Lecture] TTS error:', error);
      toast.error('Audio playback failed');
      setIsPlaying(false);
    }
  };

  const handlePauseSection = () => {
    setIsPlaying(false);
    toast('Paused');
  };

  const handleNextSection = () => {
    if (currentSectionIndex < outline.length - 1) {
      const nextIndex = currentSectionIndex + 1;
      setCurrentSectionIndex(nextIndex);
      sessionManager.writeToMemory(currentSessionId, 'currentSectionIndex', nextIndex);
      setIsPlaying(false);
    } else {
      toast.success('Lecture completed!');
      handleEndSession('completed');
    }
  };

  const handleRepeatSection = () => {
    setIsPlaying(false);
    toast('Repeating section...');
    setTimeout(() => handlePlaySection(), 500);
  };

  const handleEndSession = (reason = 'user_action') => {
    if (currentSessionId) {
      sessionManager.endSession(currentSessionId, reason);
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
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold">Lecture Setup</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Topic Title *</label>
              <input
                type="text"
                value={config.topicTitle}
                onChange={(e) => setConfig({ ...config, topicTitle: e.target.value })}
                placeholder="e.g., React Hooks Fundamentals"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Depth Level</label>
              <div className="grid grid-cols-3 gap-3">
                {LectureConfig.depthLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => setConfig({ ...config, depthLevel: level })}
                    className={`px-4 py-3 border-2 rounded-lg ${
                      config.depthLevel === level ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Teaching Style</label>
              <div className="space-y-2">
                {LectureConfig.teachingStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setConfig({ ...config, teachingStyle: style.id })}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-left ${
                      config.teachingStyle === style.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{style.name}</div>
                    <div className="text-sm text-gray-500">{style.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration Target</label>
              <div className="grid grid-cols-3 gap-3">
                {LectureConfig.durationTargets.map((target) => (
                  <button
                    key={target.id}
                    onClick={() => setConfig({ ...config, durationTarget: target.id })}
                    className={`px-4 py-3 border-2 rounded-lg ${
                      config.durationTarget === target.id ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300'
                    }`}
                  >
                    {target.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartSession}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Preparing Lecture...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Lecture
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  const currentSection = outline[currentSectionIndex];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full"
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{config.topicTitle}</h2>
          <button onClick={() => handleEndSession()} className="px-4 py-2 bg-red-600 text-white rounded-lg">
            End Lecture
          </button>
        </div>

        <div className="p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">Section {currentSectionIndex + 1} of {outline.length}</span>
              <span className="text-sm text-gray-500 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {currentSection?.duration} min
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${((currentSectionIndex + 1) / outline.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-6">
            <h3 className="text-xl font-bold mb-2">{currentSection?.title}</h3>
            <p className="text-gray-600 dark:text-gray-300">{currentSection?.content}</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleRepeatSection}
              className="p-3 border-2 border-gray-300 rounded-lg hover:border-blue-600 transition-colors"
            >
              <RotateCcw className="w-6 h-6" />
            </button>

            <button
              onClick={isPlaying ? handlePauseSection : handlePlaySection}
              className="flex-1 bg-blue-600 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-6 h-6" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  Play Section
                </>
              )}
            </button>

            <button
              onClick={handleNextSection}
              className="p-3 border-2 border-gray-300 rounded-lg hover:border-blue-600 transition-colors"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-5 gap-2">
            {outline.map((section, index) => (
              <button
                key={section.id}
                onClick={() => {
                  setCurrentSectionIndex(index);
                  sessionManager.writeToMemory(currentSessionId, 'currentSectionIndex', index);
                }}
                className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                  index === currentSectionIndex
                    ? 'bg-blue-600 text-white'
                    : index < currentSectionIndex
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-600'
                    : 'bg-gray-100 dark:bg-gray-700'
                }`}
              >
                {index < currentSectionIndex && <CheckCircle className="w-4 h-4 mx-auto mb-1" />}
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
