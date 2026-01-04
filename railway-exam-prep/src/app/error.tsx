'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, RefreshCw, AlertTriangle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md"
            >
                <div className="w-24 h-24 rounded-2xl bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                    <AlertTriangle className="w-12 h-12 text-red-500" />
                </div>

                <h1 className="text-3xl font-bold mb-3">Oops! Something went wrong</h1>
                <p className="text-slate-400 mb-8">
                    We encountered an unexpected error. Don't worry, your progress is safe.
                </p>

                <div className="flex gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="btn-secondary flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                    <Link href="/" className="btn-primary flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                </div>

                {error.digest && (
                    <p className="text-xs text-slate-600 mt-6">
                        Error ID: {error.digest}
                    </p>
                )}
            </motion.div>
        </div>
    );
}
