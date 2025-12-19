"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Leaderboard from '@/components/social/Leaderboard';
import SocialHub from '@/components/social/SocialHub';

export default function CommunityPage() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">
          Community Hub
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Connect with other learners, compete on leaderboards, and share your achievements.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Social Feed & Friends (2/3 width) */}
        <div className="lg:col-span-2">
          <SocialHub />
        </div>

        {/* Right Column: Leaderboard (1/3 width) */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <Leaderboard />
          </div>
        </div>
      </div>
    </div>
  );
}
