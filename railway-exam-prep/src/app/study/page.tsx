'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    BookOpen,
    FileText,
    Video,
    Layers,
    Search,
    ChevronRight,
    ChevronDown,
    Star,
    Download,
    Share2,
    Eye,
    Brain,
    Lightbulb,
    Calculator
} from 'lucide-react';
import { categoryConfig } from '@/lib/utils';

const studyCategories = [
    {
        id: 'general-awareness',
        name: 'General Awareness',
        icon: '🌍',
        topics: [
            { id: 'history', name: 'Indian History', items: 45 },
            { id: 'geography', name: 'Indian Geography', items: 38 },
            { id: 'polity', name: 'Indian Polity', items: 42 },
            { id: 'economy', name: 'Indian Economy', items: 35 },
            { id: 'science', name: 'General Science', items: 50 },
        ]
    },
    {
        id: 'mathematics',
        name: 'Mathematics',
        icon: '🔢',
        topics: [
            { id: 'number-system', name: 'Number System', items: 28 },
            { id: 'percentage', name: 'Percentage', items: 22 },
            { id: 'profit-loss', name: 'Profit & Loss', items: 25 },
            { id: 'time-work', name: 'Time & Work', items: 20 },
            { id: 'algebra', name: 'Algebra', items: 30 },
        ]
    },
    {
        id: 'reasoning',
        name: 'Reasoning',
        icon: '🧩',
        topics: [
            { id: 'analogy', name: 'Analogy', items: 32 },
            { id: 'coding-decoding', name: 'Coding-Decoding', items: 28 },
            { id: 'series', name: 'Number & Letter Series', items: 35 },
            { id: 'blood-relations', name: 'Blood Relations', items: 18 },
            { id: 'direction', name: 'Direction Sense', items: 15 },
        ]
    },
    {
        id: 'current-affairs',
        name: 'Current Affairs',
        icon: '📰',
        topics: [
            { id: 'jan-2025', name: 'January 2025', items: 60 },
            { id: 'dec-2024', name: 'December 2024', items: 55 },
            { id: 'nov-2024', name: 'November 2024', items: 48 },
            { id: 'railway-news', name: 'Railway Updates', items: 25 },
        ]
    },
];

const featuredMaterials = [
    {
        id: 1,
        title: 'Railway GK Master Notes',
        type: 'notes',
        category: 'General Awareness',
        pages: 150,
        downloads: 12500,
        rating: 4.8,
        icon: FileText,
    },
    {
        id: 2,
        title: 'Mathematics Formula Sheet',
        type: 'formula',
        category: 'Mathematics',
        pages: 25,
        downloads: 8900,
        rating: 4.9,
        icon: Calculator,
    },
    {
        id: 3,
        title: 'Reasoning Tricks & Tips',
        type: 'video',
        category: 'Reasoning',
        duration: '2h 30m',
        downloads: 6700,
        rating: 4.7,
        icon: Video,
    },
];

const flashcardSets = [
    { id: 1, title: 'Railway History', cards: 50, mastered: 32, color: 'from-blue-500 to-cyan-500' },
    { id: 2, title: 'Constitution Articles', cards: 60, mastered: 45, color: 'from-purple-500 to-pink-500' },
    { id: 3, title: 'Science Formulas', cards: 40, mastered: 28, color: 'from-green-500 to-emerald-500' },
    { id: 4, title: 'Geography Facts', cards: 55, mastered: 20, color: 'from-orange-500 to-red-500' },
];

export default function StudyPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategory, setExpandedCategory] = useState<string | null>('general-awareness');
    const [activeTab, setActiveTab] = useState<'topics' | 'notes' | 'flashcards' | 'videos'>('topics');

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <BookOpen className="w-6 h-6 text-blue-500" />
                                    Study Materials
                                </h1>
                                <p className="text-sm text-slate-400">Notes, flashcards, formulas & more</p>
                            </div>
                        </div>

                        {/* Search */}
                        <div className="relative w-80">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search topics, notes, videos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mt-4">
                        {[
                            { id: 'topics', label: 'Topics', icon: Layers },
                            { id: 'notes', label: 'Notes', icon: FileText },
                            { id: 'flashcards', label: 'Flashcards', icon: Lightbulb },
                            { id: 'videos', label: 'Videos', icon: Video },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.id
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                        : 'text-slate-400 hover:bg-slate-800'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {activeTab === 'topics' && (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Topics Sidebar */}
                        <div className="lg:col-span-2">
                            <h2 className="text-lg font-bold mb-4">Study Topics</h2>
                            <div className="space-y-3">
                                {studyCategories.map(category => (
                                    <motion.div
                                        key={category.id}
                                        className="glass-card overflow-hidden"
                                    >
                                        <button
                                            onClick={() => setExpandedCategory(
                                                expandedCategory === category.id ? null : category.id
                                            )}
                                            className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition"
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{category.icon}</span>
                                                <span className="font-medium">{category.name}</span>
                                                <span className="text-sm text-slate-500">
                                                    ({category.topics.reduce((a, t) => a + t.items, 0)} items)
                                                </span>
                                            </div>
                                            <ChevronDown className={`w-5 h-5 transition-transform ${expandedCategory === category.id ? 'rotate-180' : ''
                                                }`} />
                                        </button>

                                        <AnimatePresence>
                                            {expandedCategory === category.id && (
                                                <motion.div
                                                    initial={{ height: 0 }}
                                                    animate={{ height: 'auto' }}
                                                    exit={{ height: 0 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="p-4 pt-0 space-y-2">
                                                        {category.topics.map(topic => (
                                                            <Link
                                                                key={topic.id}
                                                                href={`/study/${category.id}/${topic.id}`}
                                                                className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition"
                                                            >
                                                                <span>{topic.name}</span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-sm text-slate-500">{topic.items} items</span>
                                                                    <ChevronRight className="w-4 h-4 text-slate-500" />
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Featured Materials */}
                        <div>
                            <h2 className="text-lg font-bold mb-4">Featured Materials</h2>
                            <div className="space-y-4">
                                {featuredMaterials.map(material => (
                                    <motion.div
                                        key={material.id}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="glass-card p-4"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                                <material.icon className="w-6 h-6 text-blue-400" />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-medium mb-1">{material.title}</h4>
                                                <div className="flex items-center gap-4 text-sm text-slate-400">
                                                    <span>{material.category}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                                                        {material.rating}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-4">
                                            <span className="text-xs text-slate-500">
                                                {material.downloads.toLocaleString()} downloads
                                            </span>
                                            <div className="flex gap-2">
                                                <button className="p-2 hover:bg-slate-800 rounded-lg">
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button className="p-2 hover:bg-slate-800 rounded-lg">
                                                    <Download className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'flashcards' && (
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold">Flashcard Sets</h2>
                            <button className="btn-secondary flex items-center gap-2">
                                <Brain className="w-4 h-4" />
                                Create New Set
                            </button>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {flashcardSets.map(set => (
                                <motion.div
                                    key={set.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.02 }}
                                    className="glass-card p-6 cursor-pointer"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${set.color} flex items-center justify-center mb-4`}>
                                        <Layers className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="font-bold mb-2">{set.title}</h3>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">{set.cards} cards</span>
                                        <span className="text-green-400">{set.mastered} mastered</span>
                                    </div>
                                    <div className="progress-bar mt-3 h-2">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${(set.mastered / set.cards) * 100}%` }}
                                        />
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Spaced Repetition Info */}
                        <div className="glass-card p-6 mt-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                    <Brain className="w-6 h-6 text-purple-400" />
                                </div>
                                <div>
                                    <h3 className="font-bold mb-2">Spaced Repetition System</h3>
                                    <p className="text-slate-400 text-sm mb-4">
                                        Our AI-powered spaced repetition algorithm schedules your flashcard reviews
                                        at optimal intervals to maximize retention and minimize study time.
                                    </p>
                                    <div className="flex gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-400">24</div>
                                            <div className="text-xs text-slate-500">Due Today</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-400">156</div>
                                            <div className="text-xs text-slate-500">Mastered</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-yellow-400">48</div>
                                            <div className="text-xs text-slate-500">Learning</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button className="btn-primary w-full mt-4">
                                Start Review Session (24 cards)
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...featuredMaterials, ...featuredMaterials].filter(m => m.type === 'notes' || m.type === 'formula').map((material, index) => (
                            <motion.div
                                key={`${material.id}-${index}`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card p-6"
                            >
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                                        <FileText className="w-7 h-7 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold mb-1">{material.title}</h3>
                                        <p className="text-sm text-slate-400">{material.category}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-sm mb-4">
                                    <span className="text-slate-400">{material.pages} pages</span>
                                    <span className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        {material.rating}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="btn-secondary flex-1 text-sm">
                                        <Eye className="w-4 h-4 mr-1" /> Preview
                                    </button>
                                    <button className="btn-primary flex-1 text-sm">
                                        <Download className="w-4 h-4 mr-1" /> Download
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {activeTab === 'videos' && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { id: 1, title: 'Complete Reasoning Course', duration: '8h 30m', views: 45000, thumbnail: '🧠' },
                            { id: 2, title: 'Mathematics Shortcuts', duration: '5h 15m', views: 38000, thumbnail: '🔢' },
                            { id: 3, title: 'GK One-Shot Video', duration: '6h 00m', views: 52000, thumbnail: '🌍' },
                            { id: 4, title: 'Current Affairs Monthly', duration: '2h 30m', views: 28000, thumbnail: '📰' },
                            { id: 5, title: 'Railway Special GK', duration: '4h 00m', views: 35000, thumbnail: '🚂' },
                            { id: 6, title: 'Science Made Easy', duration: '3h 45m', views: 22000, thumbnail: '🔬' },
                        ].map((video, index) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="glass-card overflow-hidden cursor-pointer card-hover"
                            >
                                <div className="h-40 bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-6xl relative">
                                    {video.thumbnail}
                                    <div className="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-sm">
                                        {video.duration}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-bold mb-2">{video.title}</h3>
                                    <div className="flex items-center justify-between text-sm text-slate-400">
                                        <span>{video.views.toLocaleString()} views</span>
                                        <span className="flex items-center gap-1">
                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                            4.8
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
