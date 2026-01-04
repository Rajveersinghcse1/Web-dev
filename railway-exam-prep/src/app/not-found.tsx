'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md"
            >
                <div className="text-8xl mb-4">🚂</div>
                <h1 className="text-6xl font-bold mb-4 gradient-text">404</h1>
                <h2 className="text-2xl font-bold mb-3">Page Not Found</h2>
                <p className="text-slate-400 mb-8">
                    Looks like this train took a wrong turn! The page you're looking for doesn't exist.
                </p>

                <div className="flex gap-4 justify-center">
                    <Link href="/" className="btn-primary flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Go Home
                    </Link>
                    <Link href="/exams" className="btn-secondary flex items-center gap-2">
                        <Search className="w-4 h-4" />
                        Browse Exams
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
