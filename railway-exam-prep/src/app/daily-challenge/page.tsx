'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Flame,
    Trophy,
    Clock,
    Zap,
    Gift,
    CheckCircle2,
    XCircle,
    ChevronRight,
    Star,
    Target,
    Award,
    Sparkles,
    Loader2
} from 'lucide-react';
import type { Question } from '@/types';

const dailyChallenge = {
    date: new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    questions: 10,
    timeLimit: 600,
    xpReward: 50,
    streakBonus: 10,
    completed: false,
};

const rewards = [
    { day: 1, xp: 10, claimed: true },
    { day: 2, xp: 15, claimed: true },
    { day: 3, xp: 20, claimed: true },
    { day: 4, xp: 25, claimed: false },
    { day: 5, xp: 30, claimed: false },
    { day: 6, xp: 40, claimed: false },
    { day: 7, xp: 100, claimed: false, special: true },
];

export default function DailyChallengePage() {
    const [stage, setStage] = useState<'intro' | 'loading' | 'challenge' | 'result'>('intro');
    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<Map<number, number>>(new Map());
    const [timeLeft, setTimeLeft] = useState(dailyChallenge.timeLimit);
    const [streak] = useState(3);

    // Fetch questions from Gemini when challenge starts
    const startChallenge = async () => {
        setStage('loading');

        try {
            const response = await fetch('/api/generate-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: 'Railway Mixed',
                    topic: 'Daily Challenge - Mixed Topics',
                    difficulty: 'intermediate',
                    count: 10,
                }),
            });

            if (response.ok) {
                const data = await response.json();
                if (data.questions && data.questions.length > 0) {
                    const formattedQuestions: Question[] = data.questions.map((q: any, i: number) => ({
                        id: `daily_q_${i + 1}`,
                        category_id: 'mixed',
                        topic_id: q.topic || 'general',
                        difficulty: 'intermediate',
                        question_text: q.question,
                        question_text_hi: q.question_hi || q.question,
                        options: q.options.map((opt: string, idx: number) => ({
                            id: idx,
                            text: opt,
                            text_hi: q.options_hi?.[idx] || opt,
                        })),
                        correct_option: q.correct,
                        explanation: q.explanation,
                        source: 'ai_generated',
                        times_appeared: 0,
                        created_at: new Date().toISOString(),
                    }));
                    setQuestions(formattedQuestions);
                    setStage('challenge');
                    return;
                }
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
        }

        // Fallback questions
        const fallbackQuestions: Question[] = Array.from({ length: 10 }, (_, i) => ({
            id: `daily_q_${i + 1}`,
            category_id: 'mixed',
            topic_id: `topic_${(i % 5) + 1}`,
            difficulty: 'intermediate',
            question_text: `Daily Challenge Question ${i + 1}: This is a ${['Mathematics', 'Reasoning', 'GK', 'Science', 'Current Affairs'][i % 5]} question.`,
            question_text_hi: `दैनिक प्रश्न ${i + 1}`,
            options: [
                { id: 0, text: `Option A for Q${i + 1}`, text_hi: 'विकल्प क' },
                { id: 1, text: `Option B for Q${i + 1}`, text_hi: 'विकल्प ख' },
                { id: 2, text: `Option C for Q${i + 1}`, text_hi: 'विकल्प ग' },
                { id: 3, text: `Option D for Q${i + 1}`, text_hi: 'विकल्प घ' },
            ],
            correct_option: i % 4,
            explanation: 'Explanation will be shown after completion.',
            source: 'manual',
            times_appeared: 0,
            created_at: new Date().toISOString(),
        }));
        setQuestions(fallbackQuestions);
        setStage('challenge');
    };

    // Timer
    useEffect(() => {
        if (stage !== 'challenge' || timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setStage('result');
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [stage, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleAnswer = (optionIndex: number) => {
        const newAnswers = new Map(answers);
        newAnswers.set(currentIndex, optionIndex);
        setAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setStage('result');
        }
    };

    const calculateScore = () => {
        let correct = 0;
        answers.forEach((answer, index) => {
            if (questions[index] && answer === questions[index].correct_option) {
                correct++;
            }
        });
        return correct;
    };

    const currentQuestion = questions[currentIndex];
    const score = calculateScore();
    const accuracy = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold flex items-center gap-2">
                                    <Flame className="w-6 h-6 text-orange-500" />
                                    Daily Challenge
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        AI
                                    </span>
                                </h1>
                                <p className="text-sm text-slate-400">{dailyChallenge.date}</p>
                            </div>
                        </div>

                        {stage === 'challenge' && (
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${timeLeft <= 60 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800'
                                }`}>
                                <Clock className="w-5 h-5" />
                                <span className="text-xl font-mono font-bold">{formatTime(timeLeft)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Intro Stage */}
                {stage === 'intro' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Streak Card */}
                        <div className="glass-card p-6 mb-8 text-center">
                            <div className="text-6xl mb-4">🔥</div>
                            <h2 className="text-3xl font-bold text-orange-400 mb-2">{streak} Day Streak!</h2>
                            <p className="text-slate-400">Complete today's challenge to keep your streak alive</p>
                        </div>

                        {/* Weekly Rewards */}
                        <div className="glass-card p-6 mb-8">
                            <h3 className="font-bold mb-4 flex items-center gap-2">
                                <Gift className="w-5 h-5 text-purple-400" />
                                Weekly Streak Rewards
                            </h3>
                            <div className="flex justify-between">
                                {rewards.map((reward) => (
                                    <div
                                        key={reward.day}
                                        className={`text-center p-3 rounded-xl ${reward.claimed ? 'bg-green-500/20 border border-green-500/30' :
                                            reward.day === streak + 1 ? 'bg-orange-500/20 border border-orange-500/30' :
                                                'bg-slate-800/50'
                                            }`}
                                    >
                                        <div className="text-sm text-slate-400 mb-1">Day {reward.day}</div>
                                        {reward.special ? (
                                            <Star className="w-6 h-6 text-yellow-400 mx-auto mb-1" />
                                        ) : (
                                            <Zap className={`w-5 h-5 mx-auto mb-1 ${reward.claimed ? 'text-green-400' : 'text-slate-500'}`} />
                                        )}
                                        <div className={`font-bold ${reward.claimed ? 'text-green-400' : 'text-slate-400'}`}>
                                            +{reward.xp} XP
                                        </div>
                                        {reward.claimed && <CheckCircle2 className="w-4 h-4 text-green-400 mx-auto mt-1" />}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Challenge Info */}
                        <div className="glass-card p-6 mb-8">
                            <h3 className="font-bold mb-4">Today's AI-Generated Challenge</h3>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center p-4 rounded-xl bg-slate-800/50">
                                    <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold">{dailyChallenge.questions}</div>
                                    <div className="text-sm text-slate-400">Questions</div>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-slate-800/50">
                                    <Clock className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold">{dailyChallenge.timeLimit / 60}</div>
                                    <div className="text-sm text-slate-400">Minutes</div>
                                </div>
                                <div className="text-center p-4 rounded-xl bg-slate-800/50">
                                    <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold">+{dailyChallenge.xpReward}</div>
                                    <div className="text-sm text-slate-400">XP Reward</div>
                                </div>
                            </div>
                            <button
                                onClick={startChallenge}
                                className="btn-primary w-full text-lg py-4 flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-5 h-5" />
                                Start AI Challenge
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* Loading Stage */}
                {stage === 'loading' && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mx-auto mb-6">
                                <Flame className="w-10 h-10 text-white animate-pulse" />
                            </div>
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
                            <p className="text-lg font-medium">Generating Today's Challenge...</p>
                            <p className="text-slate-400 text-sm">Gemini AI is preparing fresh questions for you</p>
                        </div>
                    </div>
                )}

                {/* Challenge Stage */}
                {stage === 'challenge' && currentQuestion && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {/* Progress */}
                        <div className="mb-6">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-slate-400">Question {currentIndex + 1} of {questions.length}</span>
                                <span className="text-blue-400">{answers.size} answered</span>
                            </div>
                            <div className="progress-bar h-2">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                                />
                            </div>
                        </div>

                        {/* Question */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQuestion.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="glass-card p-6 mb-6"
                            >
                                <p className="text-lg">{currentQuestion.question_text}</p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Options */}
                        <div className="space-y-3 mb-6">
                            {currentQuestion.options.map((option, index) => {
                                const isSelected = answers.get(currentIndex) === index;
                                return (
                                    <div
                                        key={option.id}
                                        onClick={() => handleAnswer(index)}
                                        className={`option-card ${isSelected ? 'selected' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isSelected ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'
                                            }`}>
                                            {['A', 'B', 'C', 'D'][index]}
                                        </div>
                                        <span>{option.text}</span>
                                        {isSelected && <CheckCircle2 className="w-5 h-5 text-blue-400" />}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between">
                            <button
                                onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                                disabled={currentIndex === 0}
                                className="btn-secondary disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleNext}
                                className="btn-primary flex items-center gap-2"
                            >
                                {currentIndex === questions.length - 1 ? 'Submit' : 'Next'}
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Quick Nav */}
                        <div className="flex justify-center gap-2 mt-6">
                            {questions.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`w-8 h-8 rounded-full text-sm font-medium ${index === currentIndex ? 'bg-blue-500 text-white' :
                                        answers.has(index) ? 'bg-green-500/20 text-green-400 border border-green-500/50' :
                                            'bg-slate-800 text-slate-400'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Result Stage */}
                {stage === 'result' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                    >
                        {/* Celebration */}
                        <div className="mb-8">
                            {accuracy >= 70 ? (
                                <>
                                    <div className="text-6xl mb-4">🎉</div>
                                    <h2 className="text-3xl font-bold text-green-400 mb-2">Excellent!</h2>
                                </>
                            ) : accuracy >= 50 ? (
                                <>
                                    <div className="text-6xl mb-4">👍</div>
                                    <h2 className="text-3xl font-bold text-yellow-400 mb-2">Good Job!</h2>
                                </>
                            ) : (
                                <>
                                    <div className="text-6xl mb-4">💪</div>
                                    <h2 className="text-3xl font-bold text-blue-400 mb-2">Keep Practicing!</h2>
                                </>
                            )}
                            <p className="text-slate-400">You completed today's AI challenge</p>
                        </div>

                        {/* Score Card */}
                        <div className="glass-card p-8 mb-8">
                            <div className="grid grid-cols-3 gap-6">
                                <div>
                                    <CheckCircle2 className="w-10 h-10 text-green-400 mx-auto mb-2" />
                                    <div className="text-3xl font-bold text-green-400">{score}</div>
                                    <div className="text-slate-400">Correct</div>
                                </div>
                                <div>
                                    <XCircle className="w-10 h-10 text-red-400 mx-auto mb-2" />
                                    <div className="text-3xl font-bold text-red-400">{questions.length - score}</div>
                                    <div className="text-slate-400">Wrong</div>
                                </div>
                                <div>
                                    <Target className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                                    <div className="text-3xl font-bold text-blue-400">{accuracy}%</div>
                                    <div className="text-slate-400">Accuracy</div>
                                </div>
                            </div>
                        </div>

                        {/* Rewards */}
                        <div className="glass-card p-6 mb-8">
                            <h3 className="font-bold mb-4">Rewards Earned</h3>
                            <div className="flex justify-center gap-8">
                                <div className="text-center xp-gain">
                                    <Zap className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-yellow-400">+{dailyChallenge.xpReward} XP</div>
                                    <div className="text-sm text-slate-400">Base Reward</div>
                                </div>
                                <div className="text-center">
                                    <Flame className="w-8 h-8 text-orange-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-orange-400">+{dailyChallenge.streakBonus} XP</div>
                                    <div className="text-sm text-slate-400">Streak Bonus</div>
                                </div>
                                <div className="text-center">
                                    <Award className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                                    <div className="text-2xl font-bold text-purple-400">{streak + 1} Days</div>
                                    <div className="text-sm text-slate-400">New Streak!</div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-center gap-4">
                            <Link href="/dashboard" className="btn-secondary">
                                Back to Dashboard
                            </Link>
                            <Link href="/exams" className="btn-primary">
                                Practice More
                            </Link>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
