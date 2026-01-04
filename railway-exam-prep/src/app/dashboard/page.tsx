'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    Train,
    Trophy,
    Target,
    TrendingUp,
    Flame,
    Clock,
    BookOpen,
    Brain,
    ChevronRight,
    Star,
    Zap,
    Calendar,
    BarChart3,
    Bookmark,
    Settings
} from 'lucide-react';
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { categoryConfig, getLevelProgress } from '@/lib/utils';

// Mock data
const userData = {
    name: 'Rahul Kumar',
    email: 'rahul@example.com',
    level: 'Gold',
    xp: 2450,
    streak: 12,
    longestStreak: 28,
    examsCompleted: 45,
    accuracy: 72,
    studyHours: 156,
};

const recentExams = [
    { id: 1, category: 'NTPC', score: 78, date: '2025-01-02', questions: 100, time: '82 min' },
    { id: 2, category: 'ALP', score: 65, date: '2025-01-01', questions: 75, time: '58 min' },
    { id: 3, category: 'D Group', score: 82, date: '2024-12-31', questions: 100, time: '76 min' },
];

const weeklyProgress = [
    { day: 'Mon', score: 65, questions: 50 },
    { day: 'Tue', score: 72, questions: 75 },
    { day: 'Wed', score: 68, questions: 100 },
    { day: 'Thu', score: 75, questions: 80 },
    { day: 'Fri', score: 78, questions: 90 },
    { day: 'Sat', score: 82, questions: 120 },
    { day: 'Sun', score: 80, questions: 60 },
];

const topicStrength = [
    { topic: 'G. Awareness', score: 85 },
    { topic: 'Mathematics', score: 70 },
    { topic: 'Reasoning', score: 75 },
    { topic: 'Science', score: 65 },
    { topic: 'Current Affairs', score: 60 },
];

const weakAreas = [
    { topic: 'Current Affairs', accuracy: 48, suggested: 'Daily news reading + weekly quiz' },
    { topic: 'General Science', accuracy: 52, suggested: 'Focus on Physics basics' },
    { topic: 'Mathematics - Percentage', accuracy: 55, suggested: 'Practice 20 questions daily' },
];

const trendInsights = {
    hotTopics: [
        { name: 'Indian Railways History', importance: 95, reason: 'Appeared in last 5 NTPC exams' },
        { name: 'Number Series', importance: 88, reason: 'Increasing frequency in 2024' },
        { name: 'Constitution Articles', importance: 85, reason: 'High weightage in Group D' },
    ],
    predictedCutoff: 67,
};

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('overview');
    const levelProgress = getLevelProgress(userData.xp);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Sidebar */}
            <aside className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900/80 backdrop-blur border-r border-slate-800 p-4 hidden lg:block">
                <Link href="/" className="flex items-center gap-2 mb-8">
                    <Train className="w-8 h-8 text-blue-500" />
                    <span className="text-xl font-bold gradient-text">RailwayPrep</span>
                </Link>

                <nav className="space-y-1">
                    {[
                        { id: 'overview', icon: BarChart3, label: 'Overview' },
                        { id: 'exams', icon: Target, label: 'My Exams' },
                        { id: 'progress', icon: TrendingUp, label: 'Progress' },
                        { id: 'study', icon: BookOpen, label: 'Study Materials' },
                        { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
                        { id: 'insights', icon: Brain, label: 'AI Insights' },
                        { id: 'settings', icon: Settings, label: 'Settings' },
                    ].map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === item.id
                                    ? 'bg-blue-500/20 text-blue-400'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="lg:ml-64 min-h-screen">
                {/* Header */}
                <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Welcome back, {userData.name.split(' ')[0]}! 👋</h1>
                            <p className="text-slate-400">Track your progress and keep improving</p>
                        </div>
                        <div className="flex items-center gap-4">
                            {/* Streak */}
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30">
                                <Flame className="w-5 h-5 text-orange-500 streak-fire" />
                                <span className="font-bold text-orange-400">{userData.streak} day streak</span>
                            </div>
                            {/* Level Badge */}
                            <div className={`badge badge-${userData.level.toLowerCase()}`}>
                                <Star className="w-4 h-4 mr-1" />
                                {userData.level}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                        {[
                            { label: 'Total XP', value: userData.xp.toLocaleString(), icon: Zap, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                            { label: 'Exams Completed', value: userData.examsCompleted, icon: Trophy, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                            { label: 'Avg Accuracy', value: `${userData.accuracy}%`, icon: Target, color: 'text-green-400', bg: 'bg-green-500/10' },
                            { label: 'Study Hours', value: userData.studyHours, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card p-4"
                            >
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="text-sm text-slate-400">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Level Progress */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6 mb-8"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h3 className="font-bold">Level Progress</h3>
                                <p className="text-sm text-slate-400">{levelProgress.xpNeeded} XP to {levelProgress.nextLevel}</p>
                            </div>
                            <div className={`badge badge-${userData.level.toLowerCase()}`}>
                                {userData.level}
                            </div>
                        </div>
                        <div className="progress-bar h-4">
                            <div
                                className="progress-fill"
                                style={{ width: `${levelProgress.progress}%` }}
                            />
                        </div>
                        <div className="flex justify-between text-sm text-slate-400 mt-2">
                            <span>{userData.xp} XP</span>
                            <span>{userData.xp + levelProgress.xpNeeded} XP</span>
                        </div>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-8 mb-8">
                        {/* Weekly Progress Chart */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass-card p-6"
                        >
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-blue-400" />
                                Weekly Performance
                            </h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <LineChart data={weeklyProgress}>
                                    <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
                                    <YAxis stroke="#64748b" fontSize={12} domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{
                                            background: 'var(--bg-card)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '8px',
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* Topic Strength Radar */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass-card p-6"
                        >
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Target className="w-5 h-5 text-purple-400" />
                                Topic Strength
                            </h3>
                            <ResponsiveContainer width="100%" height={200}>
                                <RadarChart data={topicStrength}>
                                    <PolarGrid stroke="#334155" />
                                    <PolarAngleAxis dataKey="topic" stroke="#64748b" fontSize={10} />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" />
                                    <Radar
                                        name="Score"
                                        dataKey="score"
                                        stroke="#8b5cf6"
                                        fill="#8b5cf6"
                                        fillOpacity={0.3}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-8 mb-8">
                        {/* Recent Exams */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="glass-card p-6"
                        >
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-green-400" />
                                Recent Exams
                            </h3>
                            <div className="space-y-3">
                                {recentExams.map((exam) => {
                                    const config = categoryConfig[exam.category] || categoryConfig.ALP;
                                    return (
                                        <Link
                                            key={exam.id}
                                            href={`/results/${exam.id}`}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition"
                                        >
                                            <div className={`w-10 h-10 rounded-lg ${config.gradient} flex items-center justify-center`}>
                                                {config.icon}
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-medium">{exam.category}</div>
                                                <div className="text-xs text-slate-400">{exam.date} • {exam.time}</div>
                                            </div>
                                            <div className={`text-lg font-bold ${exam.score >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>
                                                {exam.score}%
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                            <Link href="/exams" className="block text-center text-blue-400 text-sm mt-4 hover:underline">
                                View All Exams →
                            </Link>
                        </motion.div>

                        {/* Weak Areas */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="glass-card p-6"
                        >
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Brain className="w-5 h-5 text-red-400" />
                                Focus Areas
                            </h3>
                            <div className="space-y-3">
                                {weakAreas.map((area, index) => (
                                    <div key={index} className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-sm">{area.topic}</span>
                                            <span className="text-red-400 font-bold">{area.accuracy}%</span>
                                        </div>
                                        <p className="text-xs text-slate-400">{area.suggested}</p>
                                    </div>
                                ))}
                            </div>
                            <button className="btn-primary w-full mt-4 text-sm">
                                Start Smart Practice
                            </button>
                        </motion.div>

                        {/* AI Trend Insights */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.7 }}
                            className="glass-card p-6"
                        >
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                Hot Topics
                            </h3>
                            <div className="space-y-3">
                                {trendInsights.hotTopics.map((topic, index) => (
                                    <div key={index} className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-sm">{topic.name}</span>
                                            <span className="text-yellow-400 font-bold">{topic.importance}%</span>
                                        </div>
                                        <p className="text-xs text-slate-400">{topic.reason}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                <div className="flex items-center gap-2">
                                    <Target className="w-4 h-4 text-purple-400" />
                                    <span className="text-sm">Predicted Cutoff: <span className="font-bold text-purple-400">{trendInsights.predictedCutoff}%</span></span>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Quick Actions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
                    >
                        {[
                            { label: 'Daily Challenge', icon: Flame, href: '/daily-challenge', color: 'from-orange-500 to-red-500' },
                            { label: 'Smart Practice', icon: Brain, href: '/exams?mode=smart', color: 'from-purple-500 to-pink-500' },
                            { label: 'PYQ Papers', icon: BookOpen, href: '/exams?mode=pyq', color: 'from-blue-500 to-cyan-500' },
                            { label: 'Full Mock', icon: Target, href: '/exams?mode=full', color: 'from-green-500 to-emerald-500' },
                        ].map((action) => (
                            <Link
                                key={action.label}
                                href={action.href}
                                className={`glass-card p-4 flex items-center gap-3 card-hover bg-gradient-to-r ${action.color} bg-opacity-10`}
                            >
                                <action.icon className="w-6 h-6" />
                                <span className="font-medium">{action.label}</span>
                                <ChevronRight className="w-4 h-4 ml-auto" />
                            </Link>
                        ))}
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
