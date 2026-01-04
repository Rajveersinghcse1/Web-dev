'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Trophy,
    Clock,
    Target,
    TrendingUp,
    CheckCircle2,
    XCircle,
    MinusCircle,
    ChevronDown,
    ChevronUp,
    Home,
    RotateCcw,
    Share2,
    Brain,
    Lightbulb
} from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, Tooltip
} from 'recharts';
import { formatTimeHMS, getGrade } from '@/lib/utils';

// Mock result data
const mockResult = {
    session: {
        id: 'session_1',
        category: 'NTPC',
        difficulty: 'intermediate',
        total_questions: 100,
        answered: 85,
        correct: 68,
        wrong: 17,
        skipped: 15,
        time_taken: 4820, // seconds
        max_time: 5400,
        score: 62.39, // with negative marking
        max_score: 100,
        percentile: 78,
    },
    topicAnalysis: [
        { topic: 'General Awareness', total: 35, correct: 28, wrong: 5, skipped: 2, accuracy: 80, avgTime: 45 },
        { topic: 'Mathematics', total: 30, correct: 20, wrong: 8, skipped: 2, accuracy: 67, avgTime: 62 },
        { topic: 'Reasoning', total: 25, correct: 15, wrong: 3, skipped: 7, accuracy: 60, avgTime: 55 },
        { topic: 'Current Affairs', total: 10, correct: 5, wrong: 1, skipped: 4, accuracy: 50, avgTime: 38 },
    ],
    improvementTips: [
        'Focus more on Reasoning - your accuracy dropped to 60%',
        'Practice time management for Mathematics - avg 62s per question is high',
        'Current Affairs needs more preparation - attempt rate is low',
        'Review your weak areas in General Awareness - especially history topics',
        'Try AI-generated practice tests focused on your weak topics',
    ],
    xpEarned: 180,
    streakBonus: 25,
    achievements: ['exam_complete', 'accuracy_70'],
};

export default function ResultsPage({ params }: { params: Promise<{ sessionId: string }> }) {
    // Unwrap the params promise using React.use()
    const resolvedParams = use(params);
    const sessionId = resolvedParams.sessionId;

    const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
    const result = mockResult;
    const grade = getGrade(result.session.score);

    const pieData = [
        { name: 'Correct', value: result.session.correct, color: '#22c55e' },
        { name: 'Wrong', value: result.session.wrong, color: '#ef4444' },
        { name: 'Skipped', value: result.session.skipped, color: '#64748b' },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/exams" className="p-2 hover:bg-slate-800 rounded-lg transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold">Exam Results</h1>
                            <p className="text-sm text-slate-400">{result.session.category} • {result.session.difficulty}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="btn-secondary flex items-center gap-2">
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                        <Link href={`/exams/${result.session.category.toLowerCase()}/test`} className="btn-primary flex items-center gap-2">
                            <RotateCcw className="w-4 h-4" />
                            Retry
                        </Link>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                {/* Score Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-8 mb-8"
                >
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Main Score */}
                        <div className="text-center">
                            <div className="relative w-48 h-48 mx-auto mb-4">
                                <svg className="w-full h-full -rotate-90">
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="12"
                                        className="text-slate-700"
                                    />
                                    <circle
                                        cx="96"
                                        cy="96"
                                        r="88"
                                        fill="none"
                                        stroke="url(#scoreGradient)"
                                        strokeWidth="12"
                                        strokeDasharray={`${(result.session.score / 100) * 553} 553`}
                                        strokeLinecap="round"
                                    />
                                    <defs>
                                        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3b82f6" />
                                            <stop offset="100%" stopColor="#8b5cf6" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-5xl font-bold gradient-text">{result.session.score.toFixed(1)}</span>
                                    <span className="text-slate-400">out of 100</span>
                                </div>
                            </div>
                            <div className={`text-3xl font-bold ${grade.color}`}>Grade: {grade.grade}</div>
                            <div className="text-slate-400 mt-1">Top {100 - result.session.percentile}% of all attempts</div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="glass-card p-4 text-center">
                                <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-green-400">{result.session.correct}</div>
                                <div className="text-sm text-slate-400">Correct</div>
                            </div>
                            <div className="glass-card p-4 text-center">
                                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-red-400">{result.session.wrong}</div>
                                <div className="text-sm text-slate-400">Wrong</div>
                            </div>
                            <div className="glass-card p-4 text-center">
                                <MinusCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-slate-400">{result.session.skipped}</div>
                                <div className="text-sm text-slate-400">Skipped</div>
                            </div>
                            <div className="glass-card p-4 text-center">
                                <Clock className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                                <div className="text-2xl font-bold text-blue-400">{formatTimeHMS(result.session.time_taken)}</div>
                                <div className="text-sm text-slate-400">Time Taken</div>
                            </div>
                        </div>

                        {/* Pie Chart */}
                        <div>
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        dataKey="value"
                                        paddingAngle={3}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex justify-center gap-6 text-sm">
                                {pieData.map((item) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-slate-400">{item.name}: {item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* XP Earned */}
                    <div className="mt-6 pt-6 border-t border-slate-700 flex items-center justify-center gap-8">
                        <div className="flex items-center gap-2">
                            <Trophy className="w-6 h-6 text-yellow-500" />
                            <span className="text-xl font-bold text-yellow-400">+{result.xpEarned} XP</span>
                        </div>
                        {result.streakBonus > 0 && (
                            <div className="flex items-center gap-2">
                                <span className="text-lg">🔥</span>
                                <span className="text-orange-400">+{result.streakBonus} Streak Bonus</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Topic Analysis */}
                <div className="grid lg:grid-cols-2 gap-8 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6"
                    >
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-400" />
                            Topic-wise Analysis
                        </h2>

                        <div className="space-y-3">
                            {result.topicAnalysis.map((topic) => (
                                <div key={topic.topic} className="bg-slate-800/50 rounded-xl overflow-hidden">
                                    <button
                                        onClick={() => setExpandedTopic(expandedTopic === topic.topic ? null : topic.topic)}
                                        className="w-full p-4 flex items-center justify-between hover:bg-slate-800/70 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium">{topic.topic}</span>
                                            <span className="text-sm text-slate-400">({topic.total} questions)</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`font-bold ${topic.accuracy >= 70 ? 'text-green-400' : topic.accuracy >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                {topic.accuracy}%
                                            </span>
                                            {expandedTopic === topic.topic ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                        </div>
                                    </button>

                                    {expandedTopic === topic.topic && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            className="px-4 pb-4 grid grid-cols-3 gap-4 text-sm"
                                        >
                                            <div className="text-center p-2 rounded-lg bg-green-500/10">
                                                <div className="text-green-400 font-bold">{topic.correct}</div>
                                                <div className="text-slate-400">Correct</div>
                                            </div>
                                            <div className="text-center p-2 rounded-lg bg-red-500/10">
                                                <div className="text-red-400 font-bold">{topic.wrong}</div>
                                                <div className="text-slate-400">Wrong</div>
                                            </div>
                                            <div className="text-center p-2 rounded-lg bg-slate-500/10">
                                                <div className="text-slate-400 font-bold">{topic.skipped}</div>
                                                <div className="text-slate-400">Skipped</div>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Bar Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass-card p-6"
                    >
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-purple-400" />
                            Accuracy by Topic
                        </h2>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={result.topicAnalysis} layout="vertical" margin={{ left: 80 }}>
                                <XAxis type="number" domain={[0, 100]} stroke="#64748b" />
                                <YAxis type="category" dataKey="topic" stroke="#64748b" fontSize={12} />
                                <Tooltip
                                    contentStyle={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border)',
                                        borderRadius: '8px',
                                    }}
                                />
                                <Bar dataKey="accuracy" fill="url(#barGradient)" radius={[0, 4, 4, 0]} />
                                <defs>
                                    <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#3b82f6" />
                                        <stop offset="100%" stopColor="#8b5cf6" />
                                    </linearGradient>
                                </defs>
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>

                {/* AI Improvement Tips */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass-card p-6 mb-8"
                >
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-purple-400" />
                        AI Improvement Tips
                    </h2>
                    <div className="grid md:grid-cols-2 gap-4">
                        {result.improvementTips.map((tip, index) => (
                            <div key={index} className="flex items-start gap-3 p-4 rounded-xl bg-slate-800/50">
                                <Lightbulb className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
                                <p className="text-slate-300 text-sm">{tip}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4">
                    <Link href="/dashboard" className="btn-secondary flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Go to Dashboard
                    </Link>
                    <Link href="/exams" className="btn-primary flex items-center gap-2">
                        Practice More
                        <TrendingUp className="w-4 h-4" />
                    </Link>
                </div>
            </main>
        </div>
    );
}
