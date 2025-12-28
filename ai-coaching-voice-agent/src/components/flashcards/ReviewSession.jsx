import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Flashcard from './Flashcard';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import confetti from 'canvas-confetti';

const ReviewSession = () => {
  // In a real app, use: const dueCards = useQuery(api.spacedRepetition.getDueFlashcards);
  // const processReview = useMutation(api.spacedRepetition.processReview);

  // Mock Data
  const [cards, setCards] = useState([
    { _id: '1', front: 'What is the time complexity of QuickSort?', back: 'Average: O(n log n), Worst: O(n^2)', topic: 'Algorithms' },
    { _id: '2', front: 'Explain the concept of Closure in JavaScript.', back: 'A function bundled together with references to its surrounding state (lexical environment).', topic: 'JavaScript' },
    { _id: '3', front: 'What is the difference between TCP and UDP?', back: 'TCP is connection-oriented and reliable. UDP is connectionless and faster but unreliable.', topic: 'Networking' },
  ]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [stats, setStats] = useState({ correct: 0, incorrect: 0 });

  const currentCard = cards[currentIndex];
  const progress = ((currentIndex) / cards.length) * 100;

  const handleRate = (rating) => {
    // processReview({ cardId: currentCard._id, rating });
    
    if (rating >= 3) {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      if (rating === 5) confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
    } else {
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
    }

    if (currentIndex < cards.length - 1) {
      setIsFlipped(false);
      setTimeout(() => setCurrentIndex(prev => prev + 1), 300);
    } else {
      setSessionComplete(true);
      confetti({ particleCount: 150, spread: 100 });
    }
  };

  if (cards.length === 0) {
    return (
      <div className="text-center p-10">
        <h3 className="text-xl font-bold mb-2">All Caught Up! 🎉</h3>
        <p className="text-gray-500">No cards due for review right now.</p>
      </div>
    );
  }

  if (sessionComplete) {
    return (
      <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold mb-4">Session Complete!</h2>
        <div className="flex justify-center gap-8 mb-6">
          <div className="text-center">
            <span className="block text-3xl font-bold text-green-500">{stats.correct}</span>
            <span className="text-sm text-gray-500">Mastered</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-bold text-orange-500">{stats.incorrect}</span>
            <span className="text-sm text-gray-500">Learning</span>
          </div>
        </div>
        <Button onClick={() => window.location.reload()}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4 flex justify-between items-center text-sm text-gray-500">
        <span>Card {currentIndex + 1} of {cards.length}</span>
        <span>{currentCard.topic}</span>
      </div>
      
      <Progress value={progress} className="h-2 mb-6" />

      <div className="mb-8">
        <Flashcard 
          front={currentCard.front} 
          back={currentCard.back} 
          isFlipped={isFlipped} 
          onFlip={() => setIsFlipped(!isFlipped)} 
        />
      </div>

      <AnimatePresence mode="wait">
        {!isFlipped ? (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <p className="text-gray-500 mb-4">Tap card to reveal answer</p>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-4 gap-2"
          >
            <Button variant="outline" className="border-red-200 hover:bg-red-50 text-red-600 flex flex-col h-auto py-2" onClick={() => handleRate(1)}>
              <span className="text-lg font-bold">Again</span>
              <span className="text-[10px] opacity-70">&lt; 1m</span>
            </Button>
            <Button variant="outline" className="border-orange-200 hover:bg-orange-50 text-orange-600 flex flex-col h-auto py-2" onClick={() => handleRate(3)}>
              <span className="text-lg font-bold">Hard</span>
              <span className="text-[10px] opacity-70">2d</span>
            </Button>
            <Button variant="outline" className="border-blue-200 hover:bg-blue-50 text-blue-600 flex flex-col h-auto py-2" onClick={() => handleRate(4)}>
              <span className="text-lg font-bold">Good</span>
              <span className="text-[10px] opacity-70">4d</span>
            </Button>
            <Button variant="outline" className="border-green-200 hover:bg-green-50 text-green-600 flex flex-col h-auto py-2" onClick={() => handleRate(5)}>
              <span className="text-lg font-bold">Easy</span>
              <span className="text-[10px] opacity-70">7d</span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewSession;
