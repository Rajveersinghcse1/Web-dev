"use client";

import React from 'react';
import ReviewSession from '@/components/flashcards/ReviewSession';
import { motion } from 'framer-motion';

export default function ReviewPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl min-h-[80vh] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 mb-2">
          Daily Review
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Strengthen your memory with spaced repetition.
        </p>
      </motion.div>

      <ReviewSession />
    </div>
  );
}
