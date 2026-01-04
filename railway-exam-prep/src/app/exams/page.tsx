'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Clock,
    BookOpen,
    TrendingUp,
    Target,
    Brain,
    Star,
    ChevronRight,
    Filter
} from 'lucide-react';
import { categoryConfig } from '@/lib/utils';

const examCategories = [
    {
        id: 'alp',
        name: 'ALP',
        fullName: 'Assistant Loco Pilot',
        description: 'Technical & aptitude tests for locomotive pilots - CBT 1 & CBT 2',
        questions: 5000,
        tests: 120,
        syllabus: [
            { topic: 'Mathematics', weight: 25 },
            { topic: 'General Intelligence & Reasoning', weight: 25 },
            { topic: 'Basic Science & Engineering', weight: 30 },
            { topic: 'General Awareness', weight: 20 },
        ]
    },
    {
        id: 'ntpc',
        name: 'NTPC',
        fullName: 'Non-Technical Popular Categories',
        description: 'Graduate-level railway positions - CBT 1 & CBT 2',
        questions: 8000,
        tests: 200,
        syllabus: [
            { topic: 'General Awareness', weight: 40 },
            { topic: 'Mathematics', weight: 30 },
            { topic: 'General Intelligence & Reasoning', weight: 30 },
        ]
    },
    {
        id: 'd-group',
        name: 'D Group',
        fullName: 'Group D',
        description: 'Entry-level railway recruitment with minimum qualifications',
        questions: 6000,
        tests: 150,
        syllabus: [
            { topic: 'General Science', weight: 25 },
            { topic: 'Mathematics', weight: 25 },
            { topic: 'General Intelligence & Reasoning', weight: 30 },
            { topic: 'General Awareness & Current Affairs', weight: 20 },
        ]
    },
    {
        id: 'sectional-controller',
        name: 'Sectional Controller',
        fullName: 'Sectional Controller',
        description: 'Train control room operations with aptitude tests',
        questions: 3000,
        tests: 80,
        syllabus: [
            { topic: 'General Intelligence & Reasoning', weight: 35 },
            { topic: 'Quantitative Aptitude', weight: 25 },
            { topic: 'General Awareness', weight: 25 },
            { topic: 'English Language', weight: 15 },
        ]
    },
    {
        id: 'technician',
        name: 'Technician',
        fullName: 'Railway Technician',
        description: 'Technical grade positions for ITI holders',
        questions: 4000,
        tests: 100,
        syllabus: [
            { topic: 'Mathematics', weight: 25 },
            { topic: 'General Intelligence & Reasoning', weight: 25 },
            { topic: 'General Science', weight: 25 },
            { topic: 'General Awareness', weight: 25 },
        ]
    },
];

const testTypes = [
    { id: 'full', name: 'Full Mock Test', description: '100 questions, 90 minutes', icon: Clock },
    { id: 'practice', name: 'Practice Mode', description: 'Unlimited questions, no timer', icon: BookOpen },
    { id: 'smart', name: 'AI Smart Test', description: 'Based on your weak areas', icon: Brain },
    { id: 'pyq', name: 'Previous Year Papers', description: 'Actual exam questions', icon: Star },
];

export default function ExamsPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedTestType, setSelectedTestType] = useState<string>('full');
    const [difficulty, setDifficulty] = useState<string>('intermediate');

    const currentCategory = examCategories.find(c => c.id === selectedCategory);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Header */}
            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-slate-800 rounded-lg transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">Choose Your Exam</h1>
                            <p className="text-sm text-slate-400">Select an exam category and start practicing</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Left Column - Exam Categories */}
                    <div className="lg:col-span-2">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-400" />
                            Exam Categories
                        </h2>

                        <div className="grid md:grid-cols-2 gap-4">
                            {examCategories.map((category, index) => {
                                const config = categoryConfig[category.name] || categoryConfig.ALP;
                                const isSelected = selectedCategory === category.id;

                                return (
                                    <motion.div
                                        key={category.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`glass-card p-5 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-blue-500 glow' : 'hover:bg-slate-800/50'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`w-14 h-14 rounded-xl ${config.gradient} flex items-center justify-center text-2xl`}>
                                                {config.icon}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg">{category.name}</h3>
                                                <p className="text-sm text-slate-400 mb-2">{category.fullName}</p>
                                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                                    <span>{category.questions.toLocaleString()} questions</span>
                                                    <span>{category.tests} tests</span>
                                                </div>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="mt-4 pt-4 border-t border-slate-700"
                                            >
                                                <p className="text-sm text-slate-300 mb-3">{category.description}</p>
                                                <div className="space-y-2">
                                                    {category.syllabus.map((item) => (
                                                        <div key={item.topic} className="flex items-center justify-between text-sm">
                                                            <span className="text-slate-400">{item.topic}</span>
                                                            <span className="text-blue-400 font-medium">{item.weight}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Right Column - Test Configuration */}
                    <div>
                        <div className="glass-card p-6 sticky top-24">
                            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                                <Filter className="w-5 h-5 text-purple-400" />
                                Configure Test
                            </h2>

                            {/* Test Type */}
                            <div className="mb-6">
                                <label className="text-sm text-slate-400 mb-2 block">Test Type</label>
                                <div className="space-y-2">
                                    {testTypes.map((type) => (
                                        <div
                                            key={type.id}
                                            onClick={() => setSelectedTestType(type.id)}
                                            className={`p-3 rounded-xl cursor-pointer transition flex items-center gap-3 ${selectedTestType === type.id
                                                    ? 'bg-blue-500/20 border border-blue-500/50'
                                                    : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent'
                                                }`}
                                        >
                                            <type.icon className={`w-5 h-5 ${selectedTestType === type.id ? 'text-blue-400' : 'text-slate-500'
                                                }`} />
                                            <div>
                                                <div className="font-medium text-sm">{type.name}</div>
                                                <div className="text-xs text-slate-500">{type.description}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Difficulty */}
                            <div className="mb-6">
                                <label className="text-sm text-slate-400 mb-2 block">Difficulty Level</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['beginner', 'intermediate', 'advanced', 'pro'].map((level) => (
                                        <button
                                            key={level}
                                            onClick={() => setDifficulty(level)}
                                            className={`py-2 px-3 rounded-lg text-sm font-medium capitalize transition ${difficulty === level
                                                    ? `difficulty-${level}`
                                                    : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                                }`}
                                        >
                                            {level}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* AI Insights Preview */}
                            {selectedCategory && (
                                <div className="mb-6 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-4 h-4 text-purple-400" />
                                        <span className="text-sm font-medium text-purple-300">AI Insights</span>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-2">
                                        Based on trend analysis for {currentCategory?.name}:
                                    </p>
                                    <ul className="text-xs text-slate-300 space-y-1">
                                        <li>• Focus on General Awareness (↑ 15% this year)</li>
                                        <li>• 23 high-probability repeated questions</li>
                                        <li>• Recommended study time: 45 hours</li>
                                    </ul>
                                </div>
                            )}

                            {/* Start Button */}
                            <Link
                                href={selectedCategory ? `/exams/${selectedCategory}/test?mode=${selectedTestType}&difficulty=${difficulty}` : '#'}
                                className={`btn-primary w-full flex items-center justify-center gap-2 ${!selectedCategory ? 'opacity-50 cursor-not-allowed' : ''
                                    }`}
                                onClick={(e) => !selectedCategory && e.preventDefault()}
                            >
                                Start Test <ChevronRight className="w-5 h-5" />
                            </Link>

                            {!selectedCategory && (
                                <p className="text-xs text-slate-500 text-center mt-2">
                                    Select an exam category to continue
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
