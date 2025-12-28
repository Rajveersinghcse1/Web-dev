/**
 * Meditation Module
 * 
 * Pre-generated scripts, deterministic timing, NO microphone
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, X, Play, Pause, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import sessionManager, { SessionType } from '@/lib/sessionManager';
import { MeditationConfig } from '@/lib/sessionConfigs';

export default function MeditationModule({ onClose }) {
  const [setupComplete, setSetupComplete] = useState(false);
  const [config, setConfig] = useState({
    meditationType: 'breathing',
    duration: 'medium',
    voiceStyle: 'soft'
  });

  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const handleStartSession = async () => {
    const sessionId = sessionManager.startSession(SessionType.MEDITATION, config);
    if (!sessionId) return;

    setCurrentSessionId(sessionId);
    setIsGenerating(true);

    try {
      await generateMeditationScript(sessionId, config);
      sessionManager.activateSession(sessionId);
      setSetupComplete(true);
      toast.success('Meditation ready');
    } catch (error) {
      toast.error('Failed to prepare meditation');
      sessionManager.endSession(sessionId, 'generation_error');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMeditationScript = async (sessionId, config) => {
    try {
      // Real API call
      const response = await fetch('/api/ai/generate-meditation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: config.meditationType,
          duration: config.duration,
          focus: config.focus || 'general'
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success || !data.script) {
        throw new Error('Invalid API response');
      }

      const meditationScript = data.script.fullScript;
      sessionManager.writeToMemory(sessionId, 'script', meditationScript, `script_${sessionId}`);
      setScript(meditationScript);
      return meditationScript;
    } catch (error) {
      console.error('[Meditation] Failed to generate script:', error);
      throw error;
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
    toast.success('Meditation started');
    // TODO: Integrate TTS with deterministic timing
  };

  const handlePause = () => {
    setIsPlaying(false);
    toast('Paused');
  };

  const handleEndSession = () => {
    if (currentSessionId) {
      sessionManager.endSession(currentSessionId, 'user_action');
      onClose?.();
    }
  };

  // Timer
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
              <Heart className="w-8 h-8 text-pink-600" />
              <h2 className="text-2xl font-bold">Meditation Setup</h2>
            </div>
            <button onClick={onClose}><X className="w-6 h-6" /></button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Meditation Type</label>
              <div className="space-y-2">
                {MeditationConfig.meditationTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setConfig({ ...config, meditationType: type.id })}
                    className={`w-full px-4 py-3 border-2 rounded-lg text-left ${
                      config.meditationType === type.id ? 'border-pink-600 bg-pink-50 dark:bg-pink-900/20' : 'border-gray-300'
                    }`}
                  >
                    <div className="font-medium">{type.name}</div>
                    <div className="text-sm text-gray-500">Pacing: {type.pacing}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Duration</label>
              <div className="grid grid-cols-3 gap-3">
                {MeditationConfig.durations.map((dur) => (
                  <button
                    key={dur.id}
                    onClick={() => setConfig({ ...config, duration: dur.id })}
                    className={`px-4 py-3 border-2 rounded-lg ${
                      config.duration === dur.id ? 'border-pink-600 bg-pink-50 dark:bg-pink-900/20' : 'border-gray-300'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Voice Style</label>
              <div className="grid grid-cols-2 gap-3">
                {MeditationConfig.voiceStyles.map((voice) => (
                  <button
                    key={voice.id}
                    onClick={() => setConfig({ ...config, voiceStyle: voice.id })}
                    className={`px-4 py-3 border-2 rounded-lg ${
                      config.voiceStyle === voice.id ? 'border-pink-600 bg-pink-50 dark:bg-pink-900/20' : 'border-gray-300'
                    }`}
                  >
                    {voice.name}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleStartSession}
              disabled={isGenerating}
              className="w-full bg-gradient-to-r from-pink-600 to-purple-600 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <><Loader2 className="w-5 h-5 animate-spin" />Preparing...</> : <>Begin Meditation</>}
            </button>

            <p className="text-sm text-gray-500 text-center">
              ⚠️ Microphone will be disabled during meditation
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl max-w-2xl w-full text-white"
      >
        <div className="p-8">
          <div className="text-center mb-8">
            <Heart className="w-16 h-16 mx-auto mb-4 text-pink-300" />
            <h2 className="text-3xl font-bold mb-2">
              {MeditationConfig.meditationTypes.find(t => t.id === config.meditationType)?.name}
            </h2>
            <p className="text-pink-200 text-lg">{formatTime(elapsedTime)}</p>
          </div>

          <div className="bg-white/5 rounded-xl p-6 mb-8 min-h-[200px]">
            <p className="text-center text-lg leading-relaxed">{script}</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={isPlaying ? handlePause : handlePlay}
              className="flex-1 bg-white/20 hover:bg-white/30 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-6 h-6" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  Play
                </>
              )}
            </button>

            <button
              onClick={handleEndSession}
              className="px-6 py-4 bg-red-600/50 hover:bg-red-600/70 rounded-lg font-semibold transition-all"
            >
              End
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
