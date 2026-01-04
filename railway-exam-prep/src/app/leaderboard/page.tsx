'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Trophy,
    Medal,
    Crown,
    Flame,
    TrendingUp,
    Star,
    ChevronDown,
    Filter,
    Search,
    Award
} from 'lucide-react';
import { categoryConfig } from '@/lib/utils';

// Mock leaderboard data
const leaderboardData = [
    { rank: 1, name: 'Priya Sharma', avatar: '👩‍🎓', xp: 15420, level: 'Diamond', streak: 45, accuracy: 92, exams: 156, badge: 'crown' },
    { rank: 2, name: 'Rahul Kumar', avatar: '👨‍💼', xp: 14850, level: 'Diamond', streak: 38, accuracy: 89, exams: 142, badge: 'medal' },
    { rank: 3, name: 'Anjali Patel', avatar: '👩‍💻', xp: 13200, level: 'Platinum', streak: 28, accuracy: 87, exams: 128, badge: 'medal' },
    { rank: 4, name: 'Vikash Singh', avatar: '👨‍🔧', xp: 11500, level: 'Platinum', streak: 22, accuracy: 85, exams: 115, badge: null },
    { rank: 5, name: 'Sneha Gupta', avatar: '👩‍🏫', xp: 10800, level: 'Gold', streak: 19, accuracy: 84, exams: 108, badge: null },
    { rank: 6, name: 'Amit Verma', avatar: '👨‍🎓', xp: 9650, level: 'Gold', streak: 15, accuracy: 82, exams: 96, badge: null },
    { rank: 7, name: 'Pooja Yadav', avatar: '👩‍⚕️', xp: 8900, level: 'Gold', streak: 12, accuracy: 80, exams: 89, badge: null },
    { rank: 8, name: 'Rajesh Tiwari', avatar: '👨‍💻', xp: 7800, level: 'Silver', streak: 10, accuracy: 78, exams: 78, badge: null },
    { rank: 9, name: 'Kavita Mishra', avatar: '👩‍🎤', xp: 7200, level: 'Silver', streak: 8, accuracy: 76, exams: 72, badge: null },
    { rank: 10, name: 'Suresh Pandey', avatar: '👨‍🌾', xp: 6500, level: 'Silver', streak: 7, accuracy: 75, exams: 65, badge: null },
];

// Current user mock data
const currentUser = {
    rank: 47,
    name: 'You',
    avatar: '🧑‍💻',
    xp: 2450,
    level: 'Gold',
    streak: 12,
    accuracy: 72,
    exams: 45,
};

const filterOptions = [
    { id: 'all', label: 'All Time' },
    { id: 'weekly', label: 'This Week' },
    { id: 'daily', label: 'Today' },
];

const categoryFilters = [
    { id: 'all', label: 'All Categories' },
    { id: 'alp', label: 'ALP' },
    { id: 'ntpc', label: 'NTPC' },
    { id: 'd-group', label: 'D Group' },
    { id: 'sectional-controller', label: 'Sectional Controller' },
    { id: 'technician', label: 'Technician' },
];

const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
        Diamond: 'text-cyan-400',
        Platinum: 'text-slate-300',
        Gold: 'text-yellow-400',
        Silver: 'text-gray-400',
        Bronze: 'text-amber-600',
    };
    return colors[level] || colors.Bronze;
};

const getBadgeIcon = (badge: string | null, rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-slate-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return null;
};

export default function LeaderboardPage() {
    const [timeFilter, setTimeFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const filteredData = leaderboardData.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-2xl font-bold flex items-center gap-2">
                                    <Trophy className="w-6 h-6 text-yellow-500" />
                                    Leaderboard
                                </h1>
                                <p className="text-sm text-slate-400">Compete with top Railway aspirants</p>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {/* Top 3 Podium */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-end justify-center gap-4 mb-8">
                        {/* 2nd Place */}
                        <div className="text-center">
                            <div className="relative mb-2">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-4xl border-4 border-slate-300">
                                    {leaderboardData[1].avatar}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-slate-300 flex items-center justify-center text-slate-800 font-bold">
                                    2
                                </div>
                            </div>
                            <div className="font-semibold">{leaderboardData[1].name}</div>
                            <div className="text-sm text-slate-400">{leaderboardData[1].xp.toLocaleString()} XP</div>
                            <div className="h-24 w-24 bg-gradient-to-t from-slate-500 to-slate-600 rounded-t-lg mt-2 flex items-end justify-center pb-2">
                                <Medal className="w-8 h-8 text-slate-200" />
                            </div>
                        </div>

                        {/* 1st Place */}
                        <div className="text-center">
                            <div className="relative mb-2">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center text-5xl border-4 border-yellow-300 shadow-lg shadow-yellow-500/30">
                                    {leaderboardData[0].avatar}
                                </div>
                                <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                                    <Crown className="w-8 h-8 text-yellow-400" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-yellow-400 flex items-center justify-center text-black font-bold">
                                    1
                                </div>
                            </div>
                            <div className="font-bold text-lg">{leaderboardData[0].name}</div>
                            <div className="text-sm text-yellow-400">{leaderboardData[0].xp.toLocaleString()} XP</div>
                            <div className="h-32 w-28 bg-gradient-to-t from-yellow-500 to-amber-500 rounded-t-lg mt-2 flex items-end justify-center pb-2">
                                <Trophy className="w-10 h-10 text-yellow-200" />
                            </div>
                        </div>

                        {/* 3rd Place */}
                        <div className="text-center">
                            <div className="relative mb-2">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-4xl border-4 border-amber-400">
                                    {leaderboardData[2].avatar}
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold">
                                    3
                                </div>
                            </div>
                            <div className="font-semibold">{leaderboardData[2].name}</div>
                            <div className="text-sm text-slate-400">{leaderboardData[2].xp.toLocaleString()} XP</div>
                            <div className="h-20 w-24 bg-gradient-to-t from-amber-600 to-amber-700 rounded-t-lg mt-2 flex items-end justify-center pb-2">
                                <Award className="w-8 h-8 text-amber-200" />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Filters */}
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-2">
                        {filterOptions.map(option => (
                            <button
                                key={option.id}
                                onClick={() => setTimeFilter(option.id)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${timeFilter === option.id
                                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                                    }`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 text-sm w-48"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="py-2 px-3 text-sm"
                        >
                            {categoryFilters.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Your Position Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-4 mb-6 border border-blue-500/30"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-2xl">
                            {currentUser.avatar}
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <span className="font-bold">{currentUser.name}</span>
                                <span className={`badge badge-${currentUser.level.toLowerCase()}`}>{currentUser.level}</span>
                            </div>
                            <div className="text-sm text-slate-400">
                                Rank #{currentUser.rank} • {currentUser.xp.toLocaleString()} XP
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center gap-1 text-orange-400 mb-1">
                                <Flame className="w-4 h-4" />
                                <span className="font-medium">{currentUser.streak} day streak</span>
                            </div>
                            <div className="text-sm text-slate-400">{currentUser.accuracy}% accuracy</div>
                        </div>
                    </div>
                </motion.div>

                {/* Leaderboard Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card overflow-hidden"
                >
                    <table className="w-full">
                        <thead className="bg-slate-800/50">
                            <tr className="text-left text-sm text-slate-400">
                                <th className="p-4 w-16">Rank</th>
                                <th className="p-4">User</th>
                                <th className="p-4 text-center">Level</th>
                                <th className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-1">
                                        <Flame className="w-4 h-4 text-orange-400" />
                                        Streak
                                    </div>
                                </th>
                                <th className="p-4 text-center">Accuracy</th>
                                <th className="p-4 text-right">XP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredData.map((user, index) => (
                                <motion.tr
                                    key={user.rank}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`border-t border-slate-800 hover:bg-slate-800/30 transition ${user.rank <= 3 ? 'bg-gradient-to-r from-yellow-500/5 to-transparent' : ''
                                        }`}
                                >
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            {getBadgeIcon(user.badge, user.rank)}
                                            <span className={`font-bold ${user.rank <= 3 ? 'text-yellow-400' : ''}`}>
                                                #{user.rank}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xl">
                                                {user.avatar}
                                            </div>
                                            <div>
                                                <div className="font-medium">{user.name}</div>
                                                <div className="text-xs text-slate-500">{user.exams} exams completed</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`${getLevelColor(user.level)} font-medium`}>
                                            {user.level}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-orange-400 font-medium">{user.streak}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className={`${user.accuracy >= 85 ? 'text-green-400' : user.accuracy >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {user.accuracy}%
                                        </span>
                                    </td>
                                    <td className="p-4 text-right font-bold text-blue-400">
                                        {user.xp.toLocaleString()}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </motion.div>

                {/* Load More */}
                <div className="text-center mt-6">
                    <button className="btn-secondary">
                        Load More
                        <ChevronDown className="w-4 h-4 ml-2" />
                    </button>
                </div>
            </main>
        </div>
    );
}
