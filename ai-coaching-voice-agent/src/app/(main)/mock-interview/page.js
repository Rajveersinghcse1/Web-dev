"use client";

import React, { useContext } from 'react';
import MockInterviewSystem from '@/components/MockInterviewSystem';
import { UserContext } from '@/app/AuthProvider';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';

export default function MockInterviewPage() {
    const { user, isLoading } = useContext(UserContext);
    const router = useRouter();

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center max-w-md mx-auto p-8">
                    <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Authentication Required
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                        Please sign in to access the mock interview system.
                    </p>
                    <button
                        onClick={() => router.push('/sign-in')}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    // User authenticated - show interview system
    return <MockInterviewSystem userId={user._id} />;
}
