/**
 * Unified Learning Page Controller
 * 
 * Single entry point for all 5 learning modules
 * Enforces session management, prevents overlapping sessions
 */

"use client";

import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Briefcase, HelpCircle, Languages, Heart,
  Lock, AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { UserContext } from '@/app/AuthProvider';
import sessionManager, { SessionState } from '@/lib/sessionManager';

// Import all learning modules
import MockInterviewModule from './MockInterviewModule';
import LectureModule from './LectureModule';
import QAPrepModule from './QAPrepModule';
import LanguageSkillModule from './LanguageSkillModule';
import MeditationModule from './MeditationModule';

// Import learning UI components
import EnhancedHeroSection from './learning/EnhancedHeroSection';
import DailyChallenges from './learning/DailyChallenges';
import SmartModuleCard from './learning/SmartModuleCard';


const LEARNING_OPTIONS = [
  {
    id: 'lecture',
    name: 'Lecture on Topic',
    description: 'Structured teaching with controlled sections',
    icon: BookOpen,
    color: 'from-blue-600 to-cyan-600',
    component: LectureModule
  },
  {
    id: 'mock-interview',
    name: 'Mock Interview',
    description: '10 questions with AI coach evaluation',
    icon: Briefcase,
    color: 'from-purple-600 to-pink-600',
    component: MockInterviewModule
  },
  {
    id: 'qa-prep',
    name: 'Q&A Prep',
    description: 'User-led learning, no pressure, no evaluation',
    icon: HelpCircle,
    color: 'from-green-600 to-emerald-600',
    component: QAPrepModule
  },
  {
    id: 'language',
    name: 'Language Skill',
    description: 'Speaking, listening, vocabulary, grammar practice',
    icon: Languages,
    color: 'from-orange-600 to-red-600',
    component: LanguageSkillModule
  },
  {
    id: 'meditation',
    name: 'Meditation',
    description: 'Breathing, focus, sleep, stress relief sessions',
    icon: Heart,
    color: 'from-pink-600 to-purple-600',
    component: MeditationModule
  }
];

export default function UnifiedLearningPage() {
  const [activeModule, setActiveModule] = useState(null);
  const [sessionStatus, setSessionStatus] = useState(SessionState.IDLE);

  // User context
  const { userData, isLoading, isReady } = useContext(UserContext);

  // Convex mutations
  const createSessionRecord = useMutation(api.sessions.create);
  const saveSessionRecord = useMutation(api.sessions.save);

  // Monitor session state and save to database
  useEffect(() => {
    const handleSessionCreated = async (event) => {
      const session = event.detail || event;
      console.log('[UnifiedLearning] Session created:', session.id);
      setSessionStatus(SessionState.INITIALIZING);

      // Save initial session record to database
      if (userData?._id) {
        try {
          await createSessionRecord({
            userId: userData._id,
            sessionId: session.id,
            type: session.type,
            config: session.config,
            startTime: session.startTime,
          });
          console.log('[UnifiedLearning] Session saved to database');
        } catch (error) {
          console.error('[UnifiedLearning] Failed to save session:', error);
        }
      }
    };

    const handleSessionActivated = () => {
      setSessionStatus(SessionState.ACTIVE);
    };

    const handleSessionEnded = async (event) => {
      const session = event.detail;
      console.log('[UnifiedLearning] Session ended:', session.id);
      setSessionStatus(SessionState.IDLE);
      setActiveModule(null);

      // Save final session data to database
      if (userData?._id && session) {
        try {
          await saveSessionRecord({
            userId: userData._id,
            sessionId: session.id,
            type: session.type,
            memory: session.memory || {},
            startTime: session.startTime,
            endTime: session.endTime || Date.now(),
            completionStatus: session.completionStatus || 'completed',
            metadata: session.metadata || {},
          });
          console.log('[UnifiedLearning] Session data saved to database');
          toast.success('Session saved!');
        } catch (error) {
          console.error('[UnifiedLearning] Failed to save session data:', error);
          toast.error('Failed to save session');
        }
      }
    };

    sessionManager.addEventListener('session_created', handleSessionCreated);
    sessionManager.addEventListener('session_activated', handleSessionActivated);
    sessionManager.addEventListener('session_ended', handleSessionEnded);

    return () => {
      sessionManager.removeEventListener('session_created', handleSessionCreated);
      sessionManager.removeEventListener('session_activated', handleSessionActivated);
      sessionManager.removeEventListener('session_ended', handleSessionEnded);
    };
  }, [userData, createSessionRecord, saveSessionRecord]);

  // Handle module click
  const handleModuleClick = (moduleId) => {
    // Check authentication
    if (isLoading) {
      toast.error('Loading user data...');
      return;
    }

    if (!isReady || !userData?._id) {
      toast.error('Please log in to start a session');
      return;
    }

    // Rule 1: Block if another session is active (STRICT)
    const currentSession = sessionManager.getCurrentSession();
    if (currentSession && currentSession.status !== SessionState.IDLE && currentSession.status !== SessionState.DESTROYED) {
      console.error('[UnifiedLearning] Blocked module click - session active:', currentSession.id, currentSession.status);
      toast.error(
        `A ${currentSession.type} session is already active. End it first.`,
        { duration: 4000 }
      );
      return;
    }

    // Rule 2: Prevent switching modules
    if (activeModule && activeModule !== moduleId) {
      toast.error('Close the current module before opening another.');
      return;
    }

    // Rule 3: Open selected module
    console.log('[UnifiedLearning] Opening module:', moduleId);
    setActiveModule(moduleId);
  };

  // Handle module close
  const handleModuleClose = () => {
    const currentSession = sessionManager.getCurrentSession();

    // If session is active or initializing, force confirmation
    if (currentSession &&
      (currentSession.status === SessionState.ACTIVE ||
        currentSession.status === SessionState.INITIALIZING)) {
      const confirm = window.confirm(
        'Your session is still active. Closing will end the session and discard unsaved data. Continue?'
      );

      if (!confirm) {
        return; // User cancelled
      }

      console.log('[UnifiedLearning] Force ending session:', currentSession.id);
      sessionManager.endSession(currentSession.id, 'user_cancelled');
    }

    // Reset UI
    setActiveModule(null);
    console.log('[UnifiedLearning] Module closed');
  };

  // Render active module
  const renderActiveModule = () => {
    if (!activeModule) return null;

    const option = LEARNING_OPTIONS.find(opt => opt.id === activeModule);
    if (!option) return null;

    const ModuleComponent = option.component;
    return <ModuleComponent onClose={handleModuleClose} />;
  };

  // Loading state
  if (isLoading || !isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-block"
            >
              <div className="w-20 h-20 bg-gradient-to-br from-violet-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-600/50">
                <span className="text-4xl">🎓</span>
              </div>
            </motion.div>
            <h2 className="mt-6 text-2xl font-bold text-gray-700 dark:text-gray-300">Loading Learning Center...</h2>
            <div className="mt-4 flex justify-center gap-2">
              <div className="w-3 h-3 bg-violet-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl animate-pulse">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-2xl mb-4"></div>
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-lg mb-3 w-3/4"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 py-12 px-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/30 to-purple-600/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [360, 180, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/30 to-purple-600/30 rounded-full blur-3xl"
        />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Enhanced Hero Section */}
        <EnhancedHeroSection onResumeSession={null} />

        {/* Daily Challenges Widget */}
        <div className="mb-12">
          <DailyChallenges />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg mb-4">
            Choose Your Learning Path
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-700 dark:text-gray-300 font-medium max-w-2xl mx-auto"
          >
            Select a module to begin - one session at a time for focused learning
          </motion.p>

          {/* Session Status Indicator */}
          <AnimatePresence>
            {sessionStatus !== SessionState.IDLE && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0, y: -20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.8, opacity: 0, y: -20 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="mt-6 inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white rounded-full shadow-2xl shadow-green-500/50"
              >
                <motion.span
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-3 h-3 bg-white rounded-full"
                />
                <span className="text-base font-bold uppercase tracking-widest">Session Active</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Learning Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {LEARNING_OPTIONS.map((option, index) => {
            const isLocked = sessionStatus !== SessionState.IDLE && activeModule !== option.id;
            const isActive = activeModule === option.id;

            return (
              <SmartModuleCard
                key={option.id}
                module={option}
                isLocked={isLocked}
                onStart={() => handleModuleClick(option.id)}
                lastSession="2 days ago" // TODO: Get from database
                progress={{ completed: 5, total: 50, xpEarned: 450, averageScore: 'Good', totalMinutes: 120 }}
                achievements={[]} // TODO: Get from achievement store
              />
            );
          })}
        </div>
      </div>

      {/* Active Module Render */}
      <AnimatePresence mode="wait">
        {activeModule && (
          <motion.div
            key={activeModule}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            className="mt-12"
          >
            {renderActiveModule()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </div >
  );
}
