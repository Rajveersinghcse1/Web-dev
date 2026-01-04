'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    Filter,
    Search,
    Download,
    Star,
    Clock,
    TrendingUp,
    ChevronRight,
    FileText,
    CheckCircle2,
    Target,
    Flame
} from 'lucide-react';
import { categoryConfig } from '@/lib/utils';

const pyqYears = ['2024', '2023', '2022', '2021', '2020', '2019', '2018'];

const pyqPapers = [
    {
        id: 1,
        name: 'RRB NTPC CBT-1',
        year: '2024',
        shift: 'Shift 1 - Morning',
        date: '28 Dec 2024',
        questions: 100,
        duration: 90,
        category: 'NTPC',
        difficulty: 'moderate',
        attempts: 45000,
        avgScore: 68,
    },
    {
        id: 2,
        name: 'RRB NTPC CBT-1',
        year: '2024',
        shift: 'Shift 2 - Evening',
        date: '28 Dec 2024',
        questions: 100,
        duration: 90,
        category: 'NTPC',
        difficulty: 'hard',
        attempts: 38000,
        avgScore: 62,
    },
    {
        id: 3,
        name: 'RRB ALP CBT-1',
        year: '2024',
        shift: 'Shift 1',
        date: '20 Nov 2024',
        questions: 75,
        duration: 60,
        category: 'ALP',
        difficulty: 'moderate',
        attempts: 32000,
        avgScore: 65,
    },
    {
        id: 4,
        name: 'RRB Group D',
        year: '2024',
        shift: 'Phase 1 Day 1',
        date: '15 Oct 2024',
        questions: 100,
        duration: 90,
        category: 'D Group',
        difficulty: 'easy',
        attempts: 55000,
        avgScore: 72,
    },
    {
        id: 5,
        name: 'RRB NTPC CBT-2',
        year: '2023',
        shift: 'Level 6',
        date: '15 Aug 2023',
        questions: 120,
        duration: 90,
        category: 'NTPC',
        difficulty: 'hard',
        attempts: 28000,
        avgScore: 58,
    },
    {
        id: 6,
        name: 'RRB ALP CBT-2',
        year: '2023',
        shift: 'Part A',
        date: '10 Jul 2023',
        questions: 100,
        duration: 90,
        category: 'ALP',
        difficulty: 'hard',
        attempts: 22000,
        avgScore: 55,
    },
];

const trendingQuestions = [
    { id: 1, text: 'Who is the current Railway Minister of India?', appeared: 8, category: 'GK' },
    { id: 2, text: 'When was Indian Railways nationalized?', appeared: 6, category: 'GK' },
    { id: 3, text: 'What is the speed of Vande Bharat Express?', appeared: 5, category: 'GK' },
    { id: 4, text: 'Headquarters of South Central Railway is at...', appeared: 7, category: 'GK' },
];

export default function PYQPage() {
    const [selectedYear, setSelectedYear] = useState<string>('all');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredPapers = pyqPapers.filter(paper => {
        if (selectedYear !== 'all' && paper.year !== selectedYear) return false;
        if (selectedCategory !== 'all' && paper.category !== selectedCategory) return false;
        if (searchQuery && !paper.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
        return true;
    });

    const getDifficultyColor = (difficulty: string) => {
        const colors: Record<string, string> = {
            easy: 'text-green-400',
            moderate: 'text-yellow-400',
            hard: 'text-red-400',
        };
        return colors[difficulty] || colors.moderate;
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/exams" className="p-2 hover:bg-slate-800 rounded-lg transition">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <FileText className="w-6 h-6 text-yellow-500" />
                                    Previous Year Questions
                                </h1>
                                <p className="text-sm text-slate-400">Practice with actual exam papers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search papers..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10"
                                />
                            </div>

                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="px-4 py-2"
                            >
                                <option value="all">All Years</option>
                                {pyqYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>

                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="px-4 py-2"
                            >
                                <option value="all">All Categories</option>
                                <option value="NTPC">NTPC</option>
                                <option value="ALP">ALP</option>
                                <option value="D Group">Group D</option>
                                <option value="Technician">Technician</option>
                            </select>
                        </div>

                        {/* Papers List */}
                        <div className="space-y-4">
                            {filteredPapers.map((paper, index) => {
                                const config = categoryConfig[paper.category] || categoryConfig.ALP;
                                return (
                                    <motion.div
                                        key={paper.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="glass-card p-6"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-14 h-14 rounded-xl ${config.gradient} flex items-center justify-center text-2xl`}>
                                                {config.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-lg">{paper.name}</h3>
                                                        <p className="text-sm text-slate-400">{paper.shift}</p>
                                                    </div>
                                                    <span className="badge">{paper.year}</span>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
                                                    <span className="flex items-center gap-1 text-slate-400">
                                                        <Calendar className="w-4 h-4" />
                                                        {paper.date}
                                                    </span>
                                                    <span className="flex items-center gap-1 text-slate-400">
                                                        <Target className="w-4 h-4" />
                                                        {paper.questions} Questions
                                                    </span>
                                                    <span className="flex items-center gap-1 text-slate-400">
                                                        <Clock className="w-4 h-4" />
                                                        {paper.duration} min
                                                    </span>
                                                    <span className={`capitalize ${getDifficultyColor(paper.difficulty)}`}>
                                                        {paper.difficulty}
                                                    </span>
                                                </div>

                                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                                        <span>{paper.attempts.toLocaleString()} attempts</span>
                                                        <span>Avg Score: <span className="text-blue-400">{paper.avgScore}%</span></span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button className="btn-secondary text-sm">
                                                            <Download className="w-4 h-4 mr-1" />
                                                            PDF
                                                        </button>
                                                        <Link
                                                            href={`/exams/${paper.category.toLowerCase().replace(' ', '-')}/test?mode=pyq&paper=${paper.id}`}
                                                            className="btn-primary text-sm"
                                                        >
                                                            Start Test
                                                            <ChevronRight className="w-4 h-4 ml-1" />
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {filteredPapers.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-4">📄</div>
                                <h3 className="text-lg font-medium mb-2">No papers found</h3>
                                <p className="text-slate-400">Try adjusting your filters</p>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Quick Stats */}
                        <div className="glass-card p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Star className="w-5 h-5 text-yellow-400" />
                                Your PYQ Stats
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Papers Attempted</span>
                                    <span className="font-bold">12</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Avg Score</span>
                                    <span className="font-bold text-green-400">72%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-400">Best Score</span>
                                    <span className="font-bold text-blue-400">89%</span>
                                </div>
                            </div>
                        </div>

                        {/* Trending Questions */}
                        <div className="glass-card p-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Flame className="w-5 h-5 text-orange-400" />
                                Repeated Questions
                            </h3>
                            <div className="space-y-3">
                                {trendingQuestions.map((q, index) => (
                                    <div key={q.id} className="p-3 rounded-xl bg-slate-800/50">
                                        <p className="text-sm mb-2">{q.text}</p>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-500">{q.category}</span>
                                            <span className="text-orange-400">Appeared {q.appeared}x</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button className="text-blue-400 text-sm mt-4 hover:underline">
                                View all repeated questions →
                            </button>
                        </div>

                        {/* AI Prediction */}
                        <div className="glass-card p-6 bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/30">
                            <h3 className="font-bold mb-3 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                                AI Prediction
                            </h3>
                            <p className="text-sm text-slate-400 mb-4">
                                Based on trend analysis, these topics have high probability of appearing in next exam:
                            </p>
                            <ul className="space-y-2 text-sm">
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    Railway History & Zones
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    Number Series Patterns
                                </li>
                                <li className="flex items-center gap-2">
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                    Current Affairs 2024
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
