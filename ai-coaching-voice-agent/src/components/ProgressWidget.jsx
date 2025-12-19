'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useProgressStore } from '@/store';
import { Trophy, Flame, Star, TrendingUp, Award, Zap, Target, Crown } from 'lucide-react';

/**
 * Progress Dashboard Widget
 * Displays user XP, level, streaks, and achievements
 * Modernized with glassmorphism and advanced animations
 */

export default function ProgressWidget() {
  const {
    level,
    currentLevelXP,
    nextLevelXP,
    totalXP,
    currentStreak,
    longestStreak,
    totalSessions,
    totalMinutes,
    unlockedAchievements
  } = useProgressStore();

  const progress = Math.min(100, Math.max(0, (currentLevelXP / nextLevelXP) * 100));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white backdrop-blur-xl rounded-3xl p-6 border border-gray-300 shadow-xl relative overflow-hidden group"
    >
      {/* Background Decoration */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none transition-colors duration-500" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none transition-colors duration-500" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-black flex items-center gap-2">
            <div className="p-2 bg-violet-500/20 rounded-xl border border-violet-500/30">
              <Zap className="w-5 h-5 text-violet-400 fill-violet-400" />
            </div>
            Your Progress
          </h3>
          <p className="text-sm text-gray-700 mt-2 ml-1">Keep up the momentum!</p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-violet-600 to-indigo-600 rounded-2xl shadow-lg shadow-violet-500/20 border border-gray-300"
        >
          <Crown className="w-5 h-5 text-yellow-300 fill-yellow-300" />
          <span className="text-base font-bold text-black">
            Level {level}
          </span>
        </motion.div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-8 relative z-10 bg-white p-5 rounded-2xl border border-gray-300">
        <div className="flex justify-between items-end mb-3">
          <div>
            <span className="text-xs font-bold text-violet-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Star className="w-3 h-3" />
              Experience Points
            </span>
            <div className="text-2xl font-bold text-black mt-1 flex items-baseline gap-2">
              {currentLevelXP.toLocaleString()} 
              <span className="text-sm text-gray-500 font-normal">/ {nextLevelXP.toLocaleString()} XP</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-indigo-400">
              {Math.round(progress)}%
            </span>
          </div>
        </div>
        
        <div className="h-4 bg-gray-200 rounded-full overflow-hidden p-1 border border-gray-300">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1.5, ease: "circOut" }}
            className="h-full bg-linear-to-r from-violet-500 via-indigo-500 to-purple-500 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.5)] relative"
          >
            <div className="absolute inset-0 bg-gray-200 animate-[shimmer_2s_infinite]" />
          </motion.div>
        </div>
        <div className="flex justify-between items-center mt-3">
          <p className="text-xs text-gray-500">
            Current Level Progress
          </p>
          <p className="text-xs text-violet-600 font-medium">
            {(nextLevelXP - currentLevelXP).toLocaleString()} XP to Level {level + 1}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 relative z-10">
        {/* Streak */}
        <StatBox 
          icon={Flame}
          color="orange"
          label="Current Streak"
          value={`${currentStreak} days`}
          subtext={`Best: ${longestStreak}`}
          delay={0.1}
        />

        {/* Total Sessions */}
        <StatBox 
          icon={Target}
          color="blue"
          label="Sessions"
          value={totalSessions}
          subtext="Completed"
          delay={0.2}
        />

        {/* Time Spent */}
        <StatBox 
          icon={TrendingUp}
          color="green"
          label="Time Spent"
          value={hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`}
          subtext="Total focus"
          delay={0.3}
        />

        {/* Achievements */}
        <StatBox 
          icon={Award}
          color="purple"
          label="Achievements"
          value={unlockedAchievements.length}
          subtext="Unlocked"
          delay={0.4}
        />
      </div>

      {/* Total XP Footer */}
      <div className="mt-6 pt-6 border-t border-gray-300 relative z-10">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-300 transition-colors">
          <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            Lifetime XP Earned
          </span>
          <span className="text-xl font-black text-transparent bg-clip-text bg-linear-to-r from-violet-400 to-indigo-400">
            {totalXP.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function StatBox({ icon: Icon, color, label, value, subtext, delay }) {
  const colors = {
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]",
    purple: "bg-violet-500/10 text-violet-400 border-violet-500/20 shadow-[0_0_15px_rgba(139,92,246,0.1)]",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`p-4 rounded-2xl border ${colors[color].split(' ').filter(c => c.startsWith('border')).join(' ')} bg-white backdrop-blur-sm transition-all group/box`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-1.5 rounded-lg ${colors[color].split(' ').filter(c => !c.startsWith('border')).join(' ')} group-hover/box:scale-110 transition-transform`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
          {label}
        </span>
      </div>
      <p className="text-xl font-bold text-black truncate tracking-tight">
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-1 font-medium">
        {subtext}
      </p>
    </motion.div>
  );
}

