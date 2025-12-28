"use client";

import SessionHistory from '@/components/SessionHistory';
import ErrorBoundary from '@/components/ErrorBoundary';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

/**
 * Session History Page
 * 
 * Displays user's complete learning session history
 */
export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/learning-new"
            className="inline-flex items-center gap-2 text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Learning
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Your Learning Journey
          </h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
            Track your progress and review past sessions
          </p>
        </div>

        {/* Session History Component */}
        <ErrorBoundary fallbackMessage="Unable to load session history. Please try again later.">
          <SessionHistory />
        </ErrorBoundary>
      </div>
    </div>
  );
}
