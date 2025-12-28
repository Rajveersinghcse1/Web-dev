"use client";

import UnifiedLearningPage from '@/components/UnifiedLearningPage';
import ErrorBoundary from '@/components/ErrorBoundary';
import Link from 'next/link';
import { History } from 'lucide-react';

/**
 * NEW LEARNING PAGE with Session Management
 * 
 * This is the production-ready version with:
 * - Session state machine (one session at a time) ✅
 * - No duplicate speech storage ✅
 * - Database persistence to Convex ✅
 * - User authentication integrated ✅
 * - AI API endpoints connected ✅
 * - Clean session termination ✅
 * - All 5 learning modules ✅
 * 
 * Test at: http://localhost:3000/learning-new
 * 
 * What's working:
 * 1. Click any module tile → Opens setup
 * 2. Fill form and start → Real API calls for content generation
 * 3. While session active → Other tiles are LOCKED
 * 4. Complete or end session → Data saved to Convex database
 * 5. Speech input (Mock Interview, Language) → No duplicates
 * 6. Session history → Queryable in Convex
 * 
 * Ready for production? Yes!
 * - Replace this page: Move to src/app/(main)/learning/page.js
 * - Or keep both for gradual rollout
 */
export default function LearningNewPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Banner */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/30 animate-pulse">
              <span className="text-2xl">✨</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              New Learning System
            </h1>
          </div>
          <p className="text-gray-700 dark:text-gray-300 text-lg mb-4">
            With proper session management and no duplicate speech storage
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full shadow-lg shadow-green-500/20">
              <span className="text-sm">✅</span>
              <span className="text-sm font-semibold">Session State Machine</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full shadow-lg shadow-blue-500/20">
              <span className="text-sm">🔒</span>
              <span className="text-sm font-semibold">One Session at a Time</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg shadow-purple-500/20">
              <span className="text-sm">🎤</span>
              <span className="text-sm font-semibold">No Speech Duplicates</span>
            </div>
            <Link
              href="/history"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full shadow-lg shadow-orange-500/20 hover:shadow-xl transition-all hover:scale-105"
            >
              <History className="w-4 h-4" />
              <span className="text-sm font-semibold">View History</span>
            </Link>
          </div>
        </div>

        <ErrorBoundary fallbackMessage="Something went wrong with the learning system. Please try refreshing the page.">
          <UnifiedLearningPage />
        </ErrorBoundary>
      </div>
    </div>
  );
}
