'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Trophy,
    Flame,
    Target,
    TrendingUp,
    Award,
    BookOpen,
    Clock,
    Edit2,
    Camera,
    Check,
    Star,
    Zap,
    Brain,
} from 'lucide-react';

// Mock user data
const userData = {
    name: 'Rajveer Singh',
    email: 'rajveer@example.com',
    phone: '+91 98765 43210',
    location: 'New Delhi, India',
    joinedDate: 'December 2024',
    avatar: null,
    level: 'Pro Learner',
    xp: 2450,
    xpToNext: 3000,
    rank: 156,
    totalUsers: 15000,
    streak: 7,
    maxStreak: 15,
    targetExam: 'RRB NTPC',
    examDate: 'March 2026',
};

const stats = [
    { label: 'Tests Taken', value: 45, icon: BookOpen, color: 'blue' },
    { label: 'Questions Solved', value: 1250, icon: Target, color: 'green' },
    { label: 'Hours Practiced', value: 68, icon: Clock, color: 'purple' },
    { label: 'Accuracy Rate', value: '78%', icon: TrendingUp, color: 'orange' },
];

const achievements = [
    { id: 1, name: 'First Test', description: 'Complete your first test', icon: '🎯', unlocked: true },
    { id: 2, name: '7 Day Streak', description: 'Practice for 7 days straight', icon: '🔥', unlocked: true },
    { id: 3, name: 'Perfect Score', description: 'Get 100% in a test', icon: '💯', unlocked: true },
    { id: 4, name: 'Speed Demon', description: 'Complete a test in half time', icon: '⚡', unlocked: false },
    { id: 5, name: 'Subject Master', description: 'Score 90%+ in all subjects', icon: '🏆', unlocked: false },
    { id: 6, name: 'AI Explorer', description: 'Use AI assistant 50 times', icon: '🤖', unlocked: false },
];

const recentActivity = [
    { type: 'test', title: 'NTPC Full Mock Test #8', score: 82, date: 'Today' },
    { type: 'practice', title: 'Mathematics - Algebra', questions: 25, date: 'Yesterday' },
    { type: 'streak', title: 'Daily Challenge Completed', xp: 60, date: 'Yesterday' },
    { type: 'notes', title: 'Generated Smart Notes', subject: 'Railway GK', date: '2 days ago' },
];

export default function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Header */}
            <header className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-800">
                <div className="max-w-6xl mx-auto px-4 py-6">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-bold">Profile</h1>
                    </div>

                    {/* Profile Card */}
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold">
                                {userData.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <button className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center hover:bg-slate-700 transition">
                                <Camera className="w-5 h-5" />
                            </button>
                            <div className="absolute -top-2 -left-2 px-2 py-1 rounded-lg bg-gradient-to-r from-yellow-500 to-orange-500 text-xs font-bold">
                                {userData.level}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                                <h2 className="text-2xl font-bold">{userData.name}</h2>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="p-1.5 hover:bg-slate-800 rounded-lg transition"
                                >
                                    <Edit2 className="w-4 h-4 text-slate-400" />
                                </button>
                            </div>
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-400 mb-4">
                                <span className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    {userData.email}
                                </span>
                                <span className="flex items-center gap-1">
                                    <MapPin className="w-4 h-4" />
                                    {userData.location}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" />
                                    Joined {userData.joinedDate}
                                </span>
                            </div>

                            {/* XP Progress */}
                            <div className="max-w-md mx-auto md:mx-0">
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="text-slate-400">Level Progress</span>
                                    <span className="text-yellow-400 font-medium flex items-center gap-1">
                                        <Zap className="w-4 h-4" />
                                        {userData.xp} / {userData.xpToNext} XP
                                    </span>
                                </div>
                                <div className="progress-bar h-3">
                                    <div
                                        className="progress-fill bg-gradient-to-r from-yellow-500 to-orange-500"
                                        style={{ width: `${(userData.xp / userData.xpToNext) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex gap-4">
                            <div className="text-center p-4 rounded-xl bg-slate-800/50">
                                <div className="text-3xl font-bold text-blue-400">#{userData.rank}</div>
                                <div className="text-sm text-slate-400">Global Rank</div>
                            </div>
                            <div className="text-center p-4 rounded-xl bg-slate-800/50">
                                <div className="text-3xl font-bold text-orange-400 flex items-center justify-center gap-1">
                                    <Flame className="w-6 h-6" />
                                    {userData.streak}
                                </div>
                                <div className="text-sm text-slate-400">Day Streak</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Target Exam */}
                <div className="glass-card p-6 mb-8 bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                                <Target className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <div className="text-sm text-slate-400">Target Exam</div>
                                <div className="text-xl font-bold">{userData.targetExam}</div>
                                <div className="text-sm text-green-400">Exam Date: {userData.examDate}</div>
                            </div>
                        </div>
                        <Link href="/exams" className="btn-primary">
                            Take Test
                        </Link>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card p-4 text-center"
                        >
                            <stat.icon className={`w-8 h-8 mx-auto mb-2 text-${stat.color}-400`} />
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="text-sm text-slate-400">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Achievements */}
                    <div className="glass-card p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            Achievements
                        </h3>
                        <div className="space-y-3">
                            {achievements.map((achievement) => (
                                <div
                                    key={achievement.id}
                                    className={`flex items-center gap-3 p-3 rounded-xl ${achievement.unlocked
                                            ? 'bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30'
                                            : 'bg-slate-800/50 opacity-60'
                                        }`}
                                >
                                    <div className="text-2xl">{achievement.icon}</div>
                                    <div className="flex-1">
                                        <div className="font-medium">{achievement.name}</div>
                                        <div className="text-xs text-slate-400">{achievement.description}</div>
                                    </div>
                                    {achievement.unlocked && (
                                        <Check className="w-5 h-5 text-green-400" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="glass-card p-6">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-400" />
                            Recent Activity
                        </h3>
                        <div className="space-y-3">
                            {recentActivity.map((activity, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50"
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.type === 'test' ? 'bg-blue-500/20' :
                                            activity.type === 'practice' ? 'bg-green-500/20' :
                                                activity.type === 'streak' ? 'bg-orange-500/20' :
                                                    'bg-purple-500/20'
                                        }`}>
                                        {activity.type === 'test' && <BookOpen className="w-5 h-5 text-blue-400" />}
                                        {activity.type === 'practice' && <Target className="w-5 h-5 text-green-400" />}
                                        {activity.type === 'streak' && <Flame className="w-5 h-5 text-orange-400" />}
                                        {activity.type === 'notes' && <Brain className="w-5 h-5 text-purple-400" />}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{activity.title}</div>
                                        <div className="text-xs text-slate-400">
                                            {activity.score && `Score: ${activity.score}%`}
                                            {activity.questions && `${activity.questions} questions`}
                                            {activity.xp && `+${activity.xp} XP`}
                                            {activity.subject && activity.subject}
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500">{activity.date}</div>
                                </div>
                            ))}
                        </div>
                        <Link
                            href="/dashboard"
                            className="block text-center text-sm text-blue-400 mt-4 hover:text-blue-300"
                        >
                            View All Activity →
                        </Link>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="glass-card p-6 mt-8">
                    <h3 className="font-bold mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link
                            href="/exams"
                            className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 text-center hover:bg-blue-500/20 transition"
                        >
                            <BookOpen className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                            <div className="font-medium">Start Test</div>
                        </Link>
                        <Link
                            href="/daily-challenge"
                            className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 text-center hover:bg-orange-500/20 transition"
                        >
                            <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                            <div className="font-medium">Daily Challenge</div>
                        </Link>
                        <Link
                            href="/smart-notes"
                            className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-center hover:bg-purple-500/20 transition"
                        >
                            <Brain className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                            <div className="font-medium">Smart Notes</div>
                        </Link>
                        <Link
                            href="/ai-assistant"
                            className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-center hover:bg-green-500/20 transition"
                        >
                            <Star className="w-8 h-8 text-green-400 mx-auto mb-2" />
                            <div className="font-medium">AI Assistant</div>
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
