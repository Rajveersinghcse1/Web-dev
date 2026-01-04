'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    Home,
    BookOpen,
    Trophy,
    Brain,
    FileText,
    Flame,
    BarChart3,
    User,
    Sparkles,
    Menu,
    X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
    { href: '/exams', label: 'Exams', icon: BookOpen },
    { href: '/study', label: 'Study', icon: FileText },
    { href: '/pyq', label: 'PYQ Bank', icon: Brain },
    { href: '/daily-challenge', label: 'Daily', icon: Flame },
    { href: '/leaderboard', label: 'Ranks', icon: Trophy },
    { href: '/ai-assistant', label: 'AI Help', icon: Sparkles },
];

export default function Navigation() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Don't show nav on auth pages or test pages
    if (pathname?.includes('/auth/') || pathname?.includes('/test')) {
        return null;
    }

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
                <div className="max-w-7xl mx-auto px-4 w-full">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-xl">🚂</span>
                            </div>
                            <div>
                                <div className="font-bold text-lg">RailwayPrep</div>
                                <div className="text-xs text-slate-400">AI-Powered Exam Platform</div>
                            </div>
                        </Link>

                        {/* Nav Links */}
                        <div className="flex items-center gap-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={`relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                                ? 'text-white'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                            }`}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeNav"
                                                className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30"
                                            />
                                        )}
                                        <span className="relative flex items-center gap-1.5">
                                            <item.icon className="w-4 h-4" />
                                            {item.label}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/smart-notes"
                                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 text-purple-400 text-sm font-medium hover:from-purple-500/30 hover:to-blue-500/30 transition flex items-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" />
                                Smart Notes
                            </Link>
                            <Link
                                href="/profile"
                                className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center hover:ring-2 hover:ring-blue-400 transition"
                            >
                                <User className="w-5 h-5 text-white" />
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation */}
            <nav className="md:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
                <div className="px-4">
                    <div className="flex items-center justify-between h-14">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                <span className="text-lg">🚂</span>
                            </div>
                            <span className="font-bold">RailwayPrep</span>
                        </Link>

                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 hover:bg-slate-800 rounded-lg"
                        >
                            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Dropdown */}
                {isMobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="absolute top-full left-0 right-0 bg-slate-900 border-b border-slate-800 p-4"
                    >
                        <div className="grid grid-cols-2 gap-2">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-2 p-3 rounded-xl text-sm ${isActive
                                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                                : 'bg-slate-800/50 hover:bg-slate-800'
                                            }`}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Link
                                href="/smart-notes"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex-1 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 text-center text-sm font-medium"
                            >
                                ✨ Smart Notes
                            </Link>
                            <Link
                                href="/profile"
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="flex-1 py-3 rounded-xl bg-slate-800 text-center text-sm font-medium"
                            >
                                👤 Profile
                            </Link>
                        </div>
                    </motion.div>
                )}
            </nav>

            {/* Spacer */}
            <div className="h-16 md:h-16" />
        </>
    );
}
