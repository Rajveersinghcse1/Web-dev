'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    Lightbulb,
    RotateCcw,
    Bookmark,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Pause,
    Play,
    SkipForward,
    Brain,
    Eye,
    Sparkles,
    Loader2
} from 'lucide-react';
import type { Question } from '@/types';

export default function PracticePage({ params }: { params: Promise<{ category: string }> }) {
    const resolvedParams = use(params);
    const category = resolvedParams.category;
    const router = useRouter();
    const searchParams = useSearchParams();
    const topic = searchParams.get('topic') || 'all';

    const [questions, setQuestions] = useState<Question[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [showHint, setShowHint] = useState(false);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [language, setLanguage] = useState<'en' | 'hi'>('en');
    const [isPaused, setIsPaused] = useState(false);
    const [timeSpent, setTimeSpent] = useState(0);
    const [stats, setStats] = useState({ correct: 0, wrong: 0, total: 0 });
    const [isLoading, setIsLoading] = useState(true);
    const [aiHint, setAiHint] = useState<string | null>(null);
    const [isLoadingHint, setIsLoadingHint] = useState(false);

    // Generate questions using Gemini API
    useEffect(() => {
        const fetchQuestions = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/generate-questions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        category: category.toUpperCase(),
                        topic: topic === 'all' ? 'Mixed' : topic,
                        difficulty: 'intermediate',
                        count: 50,
                    }),
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.questions && data.questions.length > 0) {
                        const formattedQuestions: Question[] = data.questions.map((q: any, i: number) => ({
                            id: `practice_q_${i + 1}`,
                            category_id: category,
                            topic_id: q.topic || 'general',
                            difficulty: q.difficulty || 'intermediate',
                            question_text: q.question,
                            question_text_hi: q.question_hi || q.question,
                            options: q.options.map((opt: string, idx: number) => ({
                                id: idx,
                                text: opt,
                                text_hi: q.options_hi?.[idx] || opt,
                            })),
                            correct_option: q.correct,
                            explanation: q.explanation,
                            explanation_hi: q.explanation,
                            source: 'ai_generated',
                            times_appeared: 0,
                            created_at: new Date().toISOString(),
                        }));
                        setQuestions(formattedQuestions);
                        setIsLoading(false);
                        return;
                    }
                }
            } catch (error) {
                console.error('Error fetching questions:', error);
            }

            // Fallback questions
            const fallbackQuestions: Question[] = Array.from({ length: 50 }, (_, i) => ({
                id: `practice_q_${i + 1}`,
                category_id: category,
                topic_id: `topic_${(i % 5) + 1}`,
                difficulty: 'intermediate',
                question_text: `Practice Question ${i + 1}: This is a ${['Mathematics', 'Reasoning', 'GK', 'Science', 'Current Affairs'][i % 5]} question.`,
                question_text_hi: `अभ्यास प्रश्न ${i + 1}`,
                options: [
                    { id: 0, text: `Option A for Q${i + 1}`, text_hi: 'विकल्प क' },
                    { id: 1, text: `Option B for Q${i + 1}`, text_hi: 'विकल्प ख' },
                    { id: 2, text: `Option C for Q${i + 1}`, text_hi: 'विकल्प ग' },
                    { id: 3, text: `Option D for Q${i + 1}`, text_hi: 'विकल्प घ' },
                ],
                correct_option: i % 4,
                explanation: 'Explanation will be shown after checking the answer.',
                explanation_hi: 'उत्तर जाँचने के बाद व्याख्या दिखाई जाएगी।',
                source: 'manual',
                times_appeared: 0,
                created_at: new Date().toISOString(),
            }));
            setQuestions(fallbackQuestions);
            setIsLoading(false);
        };

        fetchQuestions();
    }, [category, topic]);

    const currentQuestion = questions[currentIndex];

    // Timer
    useEffect(() => {
        if (isPaused || isLoading) return;
        const timer = setInterval(() => {
            setTimeSpent(prev => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [isPaused, isLoading]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Get AI hint
    const getAIHint = async () => {
        if (!currentQuestion) return;
        setIsLoadingHint(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `Give me a short hint (2-3 sentences) for this question without revealing the answer: "${currentQuestion.question_text}". Options: ${currentQuestion.options.map((o, i) => `${['A', 'B', 'C', 'D'][i]}) ${o.text}`).join(', ')}`,
                    history: [],
                }),
            });

            if (response.ok) {
                const data = await response.json();
                setAiHint(data.response);
            } else {
                setAiHint('Focus on the key concept in the question and eliminate obviously wrong options first.');
            }
        } catch (error) {
            setAiHint('Focus on the key concept in the question and eliminate obviously wrong options first.');
        }
        setIsLoadingHint(false);
    };

    const handleOptionSelect = useCallback((optionIndex: number) => {
        if (showAnswer) return;
        setSelectedOption(optionIndex);
    }, [showAnswer]);

    const handleCheckAnswer = useCallback(() => {
        if (selectedOption === null || !currentQuestion) return;
        setShowAnswer(true);

        const isCorrect = selectedOption === currentQuestion.correct_option;
        setStats(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            wrong: prev.wrong + (isCorrect ? 0 : 1),
            total: prev.total + 1,
        }));
    }, [selectedOption, currentQuestion]);

    const handleNext = useCallback(() => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setSelectedOption(null);
            setShowAnswer(false);
            setShowHint(false);
            setAiHint(null);
        }
    }, [currentIndex, questions.length]);

    const handlePrevious = useCallback(() => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setSelectedOption(null);
            setShowAnswer(false);
            setShowHint(false);
            setAiHint(null);
        }
    }, [currentIndex]);

    const handleSkip = useCallback(() => {
        handleNext();
    }, [handleNext]);

    const getOptionClass = (index: number) => {
        if (!showAnswer) {
            return selectedOption === index ? 'selected' : '';
        }

        if (index === currentQuestion?.correct_option) {
            return 'correct';
        }
        if (selectedOption === index && index !== currentQuestion?.correct_option) {
            return 'wrong';
        }
        return '';
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
                <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-10 h-10 text-white animate-pulse" />
                    </div>
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="text-lg font-medium mb-2">Preparing practice questions...</p>
                    <p className="text-slate-400 text-sm">Gemini AI is generating personalized questions</p>
                </div>
            </div>
        );
    }

    if (!currentQuestion) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>No questions available</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/exams" className="p-2 hover:bg-slate-800 rounded-lg transition">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <div className="text-lg font-bold capitalize flex items-center gap-2">
                            {category.replace('-', ' ')} Practice
                            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                AI
                            </span>
                        </div>
                        <div className="text-sm text-slate-400">Unlimited questions • Learn at your pace</div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Stats */}
                    <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-slate-800/50">
                        <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-medium">{stats.correct}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <XCircle className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 font-medium">{stats.wrong}</span>
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/50">
                        <Clock className="w-4 h-4 text-blue-400" />
                        <span className="font-mono">{formatTime(timeSpent)}</span>
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="p-1 hover:bg-slate-700 rounded"
                        >
                            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
                        </button>
                    </div>

                    {/* Language Toggle */}
                    <button
                        onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                        className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition text-sm font-medium"
                    >
                        {language === 'en' ? 'EN' : 'हिं'}
                    </button>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6">
                {/* Question Progress */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-blue-400">Q{currentIndex + 1}</span>
                        <span className="text-slate-500">of {questions.length}</span>
                        <span className={`badge difficulty-${currentQuestion.difficulty}`}>
                            {currentQuestion.difficulty}
                        </span>
                    </div>
                    <button
                        onClick={() => setIsBookmarked(!isBookmarked)}
                        className={`p-2 rounded-lg transition ${isBookmarked ? 'bg-yellow-500/20 text-yellow-400' : 'bg-slate-800 text-slate-400 hover:text-yellow-400'
                            }`}
                    >
                        <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="glass-card p-6 mb-6"
                    >
                        <p className="text-lg leading-relaxed">
                            {language === 'en' ? currentQuestion.question_text : currentQuestion.question_text_hi}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* AI Hint Button */}
                {!showAnswer && (
                    <div className="mb-4">
                        <button
                            onClick={() => {
                                setShowHint(!showHint);
                                if (!aiHint && !showHint) {
                                    getAIHint();
                                }
                            }}
                            className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition"
                        >
                            <Lightbulb className="w-4 h-4" />
                            {showHint ? 'Hide AI Hint' : 'Get AI Hint'}
                        </button>
                        {showHint && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-2 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 text-sm"
                            >
                                {isLoadingHint ? (
                                    <div className="flex items-center gap-2 text-purple-300">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Gemini is thinking...
                                    </div>
                                ) : (
                                    <p className="text-purple-300">💡 {aiHint}</p>
                                )}
                            </motion.div>
                        )}
                    </div>
                )}

                {/* Options */}
                <div className="space-y-3 mb-6">
                    {currentQuestion.options.map((option, index) => {
                        const optionClass = getOptionClass(index);
                        const optionLabels = ['A', 'B', 'C', 'D'];

                        return (
                            <motion.div
                                key={option.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <div
                                    onClick={() => handleOptionSelect(index)}
                                    className={`option-card ${optionClass} ${showAnswer ? 'cursor-default' : 'cursor-pointer'}`}
                                >
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${optionClass === 'correct' ? 'bg-green-500 text-white' :
                                        optionClass === 'wrong' ? 'bg-red-500 text-white' :
                                            optionClass === 'selected' ? 'bg-blue-500 text-white' :
                                                'bg-slate-700 text-slate-300'
                                        }`}>
                                        {optionLabels[index]}
                                    </div>
                                    <span className="flex-1">
                                        {language === 'en' ? option.text : option.text_hi}
                                    </span>
                                    {showAnswer && index === currentQuestion.correct_option && (
                                        <CheckCircle2 className="w-5 h-5 text-green-400" />
                                    )}
                                    {showAnswer && selectedOption === index && index !== currentQuestion.correct_option && (
                                        <XCircle className="w-5 h-5 text-red-400" />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Explanation (shown after answer) */}
                {showAnswer && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="glass-card p-6 mb-6 border-l-4 border-blue-500"
                    >
                        <h4 className="font-bold mb-3 flex items-center gap-2">
                            <Brain className="w-5 h-5 text-blue-400" />
                            Explanation
                        </h4>
                        <p className="text-slate-300 whitespace-pre-line">
                            {language === 'en' ? currentQuestion.explanation : currentQuestion.explanation_hi}
                        </p>
                    </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handlePrevious}
                            disabled={currentIndex === 0}
                            className="btn-secondary flex items-center gap-2 disabled:opacity-50"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Previous
                        </button>
                        {!showAnswer && (
                            <button
                                onClick={handleSkip}
                                className="btn-secondary flex items-center gap-2"
                            >
                                <SkipForward className="w-4 h-4" />
                                Skip
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {!showAnswer ? (
                            <button
                                onClick={handleCheckAnswer}
                                disabled={selectedOption === null}
                                className="btn-primary flex items-center gap-2 disabled:opacity-50"
                            >
                                <Eye className="w-4 h-4" />
                                Check Answer
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                disabled={currentIndex >= questions.length - 1}
                                className="btn-primary flex items-center gap-2 disabled:opacity-50"
                            >
                                Next Question
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Session Summary (floating) */}
                {stats.total > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="fixed bottom-6 right-6 glass-card p-4 shadow-xl"
                    >
                        <div className="text-sm text-slate-400 mb-2">Session Progress</div>
                        <div className="flex items-center gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-400">{stats.correct}</div>
                                <div className="text-xs text-slate-500">Correct</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-400">{stats.wrong}</div>
                                <div className="text-xs text-slate-500">Wrong</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-400">
                                    {stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0}%
                                </div>
                                <div className="text-xs text-slate-500">Accuracy</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
