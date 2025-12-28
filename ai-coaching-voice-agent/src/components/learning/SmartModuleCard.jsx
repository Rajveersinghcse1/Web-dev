"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, TrendingUp, Award, ChevronRight, Play, Lock } from 'lucide-react';

export default function SmartModuleCard({ 
  module,
  isLocked,
  onStart,
  lastSession,
  progress,
  achievements
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const Icon = module.icon;

  return (
    <motion.div
      onHoverStart={() => !isLocked && setIsFlipped(true)}
      onHoverEnd={() => setIsFlipped(false)}
      whileHover={!isLocked ? { y: -10 } : {}}
      className="relative h-96 perspective-1000"
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring" }}
        className="relative w-full h-full preserve-3d"
      >
        {/* Front Face */}
        <div className={`
          absolute w-full h-full backface-hidden rounded-3xl p-6
          ${isLocked 
            ? 'bg-gray-100 dark:bg-gray-800' 
            : 'bg-gradient-to-br from-white via-gray-50 to-white dark:from-gray-800 dark:via-gray-850 dark:to-gray-900'
          }
          shadow-xl border-2 ${isLocked ? 'border-gray-300' : 'border-transparent hover:border-purple-300'}
        `}>
          {/* Lock Overlay */}
          {isLocked && (
            <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-xl rounded-3xl flex flex-col items-center justify-center z-10">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Lock className="w-16 h-16 text-white mb-4" />
              </motion.div>
              <p className="text-white font-bold text-lg">Session in Progress</p>
              <p className="text-white/80 text-sm mt-2">Complete current session first</p>
            </div>
          )}

          {/* Icon */}
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${module.color} flex items-center justify-center mb-4 shadow-lg`}
          >
            <Icon className="w-10 h-10 text-white" strokeWidth={2.5} />
          </motion.div>

          {/* Content */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {module.name}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {module.description}
          </p>

          {/* Stats Preview */}
          {!isLocked && progress && (
            <div className="space-y-3 mb-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Progress</span>
                  <span className="text-gray-900 dark:text-white font-medium">
                    {progress.completed}/{progress.total} sessions
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(progress.completed / progress.total) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full bg-gradient-to-r ${module.color}`}
                  />
                </div>
              </div>

              {/* Last Session */}
              {lastSession && (
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <Clock className="w-4 h-4" />
                  <span>Last session: {lastSession}</span>
                </div>
              )}
            </div>
          )}

          {/* Achievements Preview */}
          {!isLocked && achievements && achievements.length > 0 && (
            <div className="flex gap-2 mb-4">
              {achievements.slice(0, 3).map((achievement, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg"
                  title={achievement.name}
                >
                  <Award className="w-4 h-4 text-white" />
                </motion.div>
              ))}
              {achievements.length > 3 && (
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold">
                  +{achievements.length - 3}
                </div>
              )}
            </div>
          )}

          {/* Start Button */}
          {!isLocked && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onStart}
              className={`w-full mt-auto px-6 py-3 bg-gradient-to-r ${module.color} text-white rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2`}
            >
              <Play className="w-5 h-5" />
              Start Learning
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </div>

        {/* Back Face */}
        {!isLocked && (
          <div className="absolute w-full h-full backface-hidden rotateY-180 rounded-3xl p-6 bg-gradient-to-br from-purple-600 via-violet-600 to-fuchsia-600 text-white shadow-xl">
            <h4 className="text-xl font-bold mb-4">Session Stats</h4>
            
            <div className="space-y-4">
              {/* Completion Rate */}
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">Completion Rate</span>
                  <span className="text-2xl font-bold">
                    {Math.round((progress?.completed || 0) / (progress?.total || 1) * 100)}%
                  </span>
                </div>
              </div>

              {/* Total XP Earned */}
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm opacity-90">XP Earned</span>
                  <span className="text-2xl font-bold">{progress?.xpEarned || 0}</span>
                </div>
              </div>

              {/* Average Performance */}
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <div>
                    <div className="text-sm opacity-90">Performance</div>
                    <div className="text-lg font-bold">
                      {progress?.averageScore || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Time Spent */}
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  <div>
                    <div className="text-sm opacity-90">Time Spent</div>
                    <div className="text-lg font-bold">
                      {progress?.totalMinutes || 0} min
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 text-xs opacity-75 text-center">
              Hover away to return
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
