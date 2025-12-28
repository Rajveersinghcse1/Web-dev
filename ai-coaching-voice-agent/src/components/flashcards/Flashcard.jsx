import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from "@/components/ui/card";

const Flashcard = ({ front, back, isFlipped, onFlip }) => {
  return (
    <div className="relative w-full h-64 perspective-1000 cursor-pointer" onClick={onFlip}>
      <motion.div
        className="w-full h-full relative preserve-3d"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <Card className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 bg-white dark:bg-gray-800 border-2 border-purple-100 dark:border-purple-900 shadow-lg">
          <div className="text-center">
            <span className="text-xs font-bold text-purple-500 uppercase tracking-wider mb-2 block">Question</span>
            <h3 className="text-xl font-medium text-gray-800 dark:text-gray-100">{front}</h3>
          </div>
        </Card>

        {/* Back */}
        <Card 
          className="absolute w-full h-full backface-hidden flex items-center justify-center p-6 bg-purple-50 dark:bg-gray-900 border-2 border-purple-200 dark:border-purple-800 shadow-lg"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="text-center">
            <span className="text-xs font-bold text-green-500 uppercase tracking-wider mb-2 block">Answer</span>
            <p className="text-lg text-gray-700 dark:text-gray-300">{back}</p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Flashcard;
