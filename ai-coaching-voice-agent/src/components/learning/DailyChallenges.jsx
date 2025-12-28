"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Clock, CheckCircle, Target, BookOpen } from 'lucide-react';

const SAMPLE_CHALLENGES = [
  {
    id: 'daily_1',
    title: 'Complete 2 Learning Sessions',
    description: 'Finish any 2 sessions today',
    current: 0,
    target: 2,
    xpReward: 50,
    icon: Trophy,
  },
  {
    id: 'daily_2',
    title: 'Maintain Your Streak',
    description: 'Keep your learning streak alive',
    current: 0,
    target: 1,
    xpReward: 25,
    icon: Zap,
  },
  {
    id: 'daily_3',
    title: 'Try a New Module',
    description: 'Explore a module you haven\'t tried yet',
    current: 0,
    target: 1,
    xpReward: 100,
    icon: BookOpen,
  },
];

export default function DailyChallenges() {
  const [challenges, setChallenges] = useState(SAMPLE_CHALLENGES);
  const [timeToReset, setTimeToReset] = useState('');

  // Calculate time to midnight
  useEffect(() => {
    const calculateTimeToReset = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      
      const diff = midnight - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeToReset(`${hours}h ${minutes}m`);
    };

    calculateTimeToReset();
    const interval = setInterval(calculateTimeToReset, 60000);
    return () => clearInterval(interval);
  }, []);

  const totalXP = challenges.reduce((sum, c) =>
    c.current >= c.target ? sum + c.xpReward : sum, 0
  );

  const completedCount = challenges.filter(c => c.current >= c.target).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl border border-gray-200 dark:border-gray-700"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            Daily Challenges
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {completedCount}/{challenges.length} completed • {totalXP} XP earned
          </p>
        </div>
        
        {/* Timer */}
        <div className="text-right">
          <div className="text-xs text-gray-600 dark:text-gray-400">Resets in</div>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {timeToReset}
          </div>
        </div>
      </div>

      {/* Challenges List */}
      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {challenges.map((challenge, index) => {
            const Icon = challenge.icon;
            const isCompleted = challenge.current >= challenge.target;
            const progress = (challenge.current / challenge.target) * 100;

            return (
              <motion.div
                key={challenge.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  relative overflow-hidden rounded-2xl p-4 border-2 transition-all
                  ${isCompleted
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-300 dark:border-green-700'
                    : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                  }
                `}
              >
                {/* Progress Background */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`
                    absolute inset-y-0 left-0 opacity-10
                    ${isCompleted 
                      ? 'bg-green-500' 
                      : 'bg-purple-500'
                    }
                  `}
                />

                {/* Content */}
                <div className="relative flex items-start gap-4">
                  {/* Icon */}
                  <div className={`
                    w-12 h-12 rounded-xl flex items-center justify-center shadow-lg shrink-0
                    ${isCompleted
                      ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                      : 'bg-gradient-to-br from-purple-400 to-violet-500'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Icon className="w-6 h-6 text-white" />
                    )}
                  </div>

                  {/* Text */}
                  <div className="flex-1">
                    <h4 className={`
                      font-bold text-lg mb-1
                      ${isCompleted
                        ? 'text-green-700 dark:text-green-300 line-through'
                        : 'text-gray-900 dark:text-white'
                      }
                    `}>
                      {challenge.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {challenge.description}
                    </p>

                    {/* Progress Bar */}
                    {!isCompleted && (
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-gray-600 dark:text-gray-400">
                              {challenge.current}/{challenge.target}
                            </span>
                            <span className="text-purple-600 dark:text-purple-400 font-bold">
                              +{challenge.xpReward} XP
                            </span>
                          </div>
                          <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              transition={{ duration: 0.5 }}
                              className="h-full bg-gradient-to-r from-purple-500 to-violet-500"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reward Badge */}
                    {isCompleted && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-xs font-bold"
                      >
                        <Zap className="w-3 h-3" />
                        +{challenge.xpReward} XP Claimed
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Summary */}
      {completedCount === challenges.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-6 p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl text-white text-center"
        >
          <div className="text-3xl mb-2">🎉</div>
          <div className="font-bold text-lg">All Challenges Complete!</div>
          <div className="text-sm opacity-90">Come back tomorrow for more!</div>
        </motion.div>
      )}
    </motion.div>
  );
}
