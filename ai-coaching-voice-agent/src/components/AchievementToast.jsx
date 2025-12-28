'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Trophy, X, Sparkles, Star } from 'lucide-react';
import { RARITY_CONFIG } from '@/lib/achievements';

/**
 * Achievement Toast Notification
 * Celebration animation when user unlocks achievements
 * Modernized with glassmorphism and advanced animations
 */

export default function AchievementToast({ achievement, onClose }) {
  const [showConfetti, setShowConfetti] = useState(true);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    });

    // Auto-dismiss after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    // Stop confetti after 3 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(confettiTimer);
    };
  }, [onClose]);

  if (!achievement) return null;

  const rarity = RARITY_CONFIG[achievement.rarity] || RARITY_CONFIG.common;
  const Icon = achievement.icon || Trophy;

  return (
    <>
      {/* Confetti celebration */}
      {showConfetti && (
        <Confetti
          width={dimensions.width}
          height={dimensions.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']}
        />
      )}

      {/* Achievement notification */}
      <AnimatePresence>
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -100, opacity: 0, scale: 0.8 }}
          transition={{ type: "spring", bounce: 0.4 }}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-9999 w-full max-w-md px-4"
        >
          <div className="relative overflow-hidden rounded-3xl p-px">
            {/* Animated Border Gradient */}
            <div className={`absolute inset-0 bg-linear-to-r ${rarity.gradient} animate-pulse`} />
            
            <div className="relative bg-white backdrop-blur-xl rounded-[23px] p-5 border border-gray-300 shadow-2xl shadow-black/50">
              {/* Background Glow */}
              <div className={`absolute top-0 right-0 w-32 h-32 bg-linear-to-br ${rarity.gradient} opacity-20 blur-3xl rounded-full -mr-10 -mt-10 pointer-events-none`} />
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1.5 rounded-full transition-colors text-gray-700 hover:text-black"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-start gap-5">
                {/* Icon */}
                <motion.div
                  animate={{
                    rotate: [0, -10, 10, -10, 0],
                    scale: [1, 1.1, 1, 1.1, 1]
                  }}
                  transition={{
                    duration: 0.5,
                    repeat: 3,
                    repeatDelay: 0.3
                  }}
                  className={`shrink-0 p-4 rounded-2xl bg-linear-to-br ${rarity.gradient} shadow-lg shadow-purple-500/20 relative group`}
                >
                  <div className="absolute inset-0 bg-gray-200 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <Icon className="w-8 h-8 text-black drop-shadow-md" />
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                    <span className={`text-xs font-bold uppercase tracking-wider bg-clip-text text-transparent bg-linear-to-r ${rarity.gradient}`}>
                      Achievement Unlocked!
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-black leading-tight mb-1">
                    {achievement.title}
                  </h3>
                  
                  <p className="text-sm text-gray-800 leading-relaxed">
                    {achievement.description}
                  </p>
                  
                  {achievement.xpReward > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="px-2.5 py-1 rounded-lg bg-gray-100 border border-gray-300 flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs font-bold text-black">+{achievement.xpReward} XP</span>
                      </div>
                      <span className="text-xs text-gray-700 font-medium">
                        {rarity.label} Rarity
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}

export function AchievementToastContainer() {
  const [achievement, setAchievement] = useState(null);

  useEffect(() => {
    const handleAchievement = (event) => {
      setAchievement(event.detail);
    };

    window.addEventListener('achievement-unlocked', handleAchievement);
    return () => window.removeEventListener('achievement-unlocked', handleAchievement);
  }, []);

  return (
    <AchievementToast 
      achievement={achievement} 
      onClose={() => setAchievement(null)} 
    />
  );
}

