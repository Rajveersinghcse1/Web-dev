"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, Zap, Brain } from 'lucide-react';

/**
 * Loading Window Component for Learning Modules
 * Beautiful animated loading states
 */

export function GeneratingQuestionsLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-gradient-to-br from-black/80 via-purple-900/80 to-black/80 backdrop-blur-xl flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative bg-gradient-to-br from-white via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-950 dark:to-gray-900 rounded-3xl shadow-2xl p-12 max-w-md w-full border-2 border-purple-500/30"
      >
        {/* Animated Background Glow */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-violet-500/20 via-purple-500/20 to-pink-500/20 rounded-3xl blur-2xl"
        />

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Animated Icon */}
          <div className="relative inline-block mb-8">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="w-24 h-24 bg-gradient-to-br from-violet-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-600/50"
            >
              <Brain className="w-12 h-12 text-white" />
            </motion.div>
            
            {/* Sparkles */}
            <motion.div
              animate={{
                scale: [1, 1.3, 1],
                rotate: [0, 180, 360]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-8 h-8 text-yellow-400" fill="currentColor" />
            </motion.div>
            
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [360, 180, 0]
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute -bottom-2 -left-2"
            >
              <Zap className="w-8 h-8 text-orange-400" fill="currentColor" />
            </motion.div>
          </div>

          {/* Title */}
          <motion.h2
            animate={{ opacity: [0.7, 1, 0.7] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-3xl font-extrabold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4"
          >
            Generating Questions
          </motion.h2>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
            Our AI is crafting personalized interview questions just for you...
          </p>

          {/* Progress Dots */}
          <div className="flex items-center justify-center gap-3 mb-8">
            {[0, 1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  backgroundColor: [
                    'rgb(139, 92, 246)',
                    'rgb(236, 72, 153)',
                    'rgb(139, 92, 246)'
                  ]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                className="w-3 h-3 rounded-full bg-violet-600"
              />
            ))}
          </div>

          {/* Status Text */}
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-sm text-gray-500 dark:text-gray-500"
          >
            This will only take a moment...
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function ProcessingAnswerLoader() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-blue-900/30 to-purple-900/30 backdrop-blur-md rounded-2xl flex items-center justify-center z-10"
    >
      <div className="text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="inline-block mb-4"
        >
          <Loader2 className="w-16 h-16 text-white" />
        </motion.div>
        <p className="text-white font-semibold text-lg">Processing your answer...</p>
      </div>
    </motion.div>
  );
}

export function SavingSessionLoader() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="fixed top-4 right-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-6 h-6" />
      </motion.div>
      <span className="font-semibold">Saving session...</span>
    </motion.div>
  );
}

export function SessionReadyLoader({ message = "Getting ready..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360]
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-20 h-20 bg-gradient-to-br from-violet-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl shadow-violet-600/50 mb-6"
      >
        <Sparkles className="w-10 h-10 text-white" />
      </motion.div>
      <motion.p
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-gray-600 dark:text-gray-400 font-medium text-lg"
      >
        {message}
      </motion.p>
    </div>
  );
}

export default GeneratingQuestionsLoader;
