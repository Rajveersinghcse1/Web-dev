"use client";
import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { UserContext } from '@/app/AuthProvider';
import { useProgressStore } from '@/store';
import { Flame, Star, TrendingUp, Zap, Target, Award } from 'lucide-react';

export default function EnhancedHeroSection({ onResumeSession }) {
  const { userData } = useContext(UserContext);
  const { 
    level, 
    currentLevelXP, 
    nextLevelXP, 
    currentStreak, 
    totalSessions,
    totalXP 
  } = useProgressStore();

  const progress = Math.min(100, (currentLevelXP / nextLevelXP) * 100);
  const todayXP = 150; // TODO: Calculate from today's sessions

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-8 text-white shadow-2xl"
    >
      {/* Animated Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full mix-blend-overlay filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-64 h-64 bg-purple-300 rounded-full mix-blend-overlay filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 grid gap-6 md:grid-cols-3">
        {/* Left: Greeting & Streak */}
        <div className="space-y-4">
          <motion.h2 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-extrabold"
          >
            Welcome back, {userData?.name?.split(' ')[0] || 'Learner'}! 👋
          </motion.h2>
          
          {/* Streak Display */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/30"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              <Flame className="w-8 h-8 text-orange-400" />
            </motion.div>
            <div>
              <div className="text-3xl font-bold">{currentStreak}</div>
              <div className="text-sm opacity-90">Day Streak 🔥</div>
            </div>
          </motion.div>

          {/* Motivational Message */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-white/90 text-sm"
          >
            {currentStreak > 0 
              ? `You're on fire! Keep the momentum going! 🚀`
              : `Start a session today to begin your streak! 💪`
            }
          </motion.p>
        </div>

        {/* Middle: Level Progress */}
        <div className="flex flex-col items-center justify-center space-y-4">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            className="relative w-32 h-32"
          >
            {/* Progress Ring */}
            <svg className="transform -rotate-90" viewBox="0 0 120 120">
              {/* Background Circle */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress Circle */}
              <motion.circle
                cx="60"
                cy="60"
                r="50"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50}`}
                strokeDashoffset={`${2 * Math.PI * 50 * (1 - progress / 100)}`}
                initial={{ strokeDashoffset: 2 * Math.PI * 50 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 50 * (1 - progress / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </svg>
            
            {/* Level Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Star className="w-6 h-6 text-yellow-300 mb-1" />
              <div className="text-3xl font-bold">{level}</div>
              <div className="text-xs opacity-80">LEVEL</div>
            </div>
          </motion.div>

          <div className="text-center">
            <div className="text-sm opacity-90">
              {currentLevelXP} / {nextLevelXP} XP
            </div>
            <div className="text-xs opacity-75 mt-1">
              {nextLevelXP - currentLevelXP} XP to Level {level + 1}
            </div>
          </div>
        </div>

        {/* Right: Quick Stats */}
        <div className="space-y-3">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{todayXP}</div>
                <div className="text-sm opacity-90">XP Today</div>
              </div>
              <Zap className="w-8 h-8 text-yellow-300" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalSessions}</div>
                <div className="text-sm opacity-90">Total Sessions</div>
              </div>
              <Target className="w-8 h-8 text-blue-300" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white/20 backdrop-blur-md rounded-xl p-4 border border-white/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{totalXP}</div>
                <div className="text-sm opacity-90">Lifetime XP</div>
              </div>
              <Award className="w-8 h-8 text-purple-300" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Resume Session Button (if applicable) */}
      {onResumeSession && (
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onResumeSession}
          className="relative z-10 mt-6 w-full md:w-auto px-8 py-4 bg-white text-purple-600 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          🎯 Resume Last Session
        </motion.button>
      )}
    </motion.div>
  );
}
