'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    ChevronLeft,
    ChevronRight,
    Flag,
    RotateCcw,
    Send,
    Languages,
    Bookmark,
    AlertTriangle,
    CheckCircle2,
    X,
    Sparkles,
    Loader2
} from 'lucide-react';
import { useExamStore } from '@/lib/store';
import { formatTime, getStatusColor } from '@/lib/utils';
import type { Question, ExamSession, ExamConfig } from '@/types';

export default function TestPage({ params }: { params: Promise<{ category: string }> }) {
    const resolvedParams = use(params);
    const category = resolvedParams.category;

    const searchParams = useSearchParams();
    const mode = searchParams.get('mode') || 'full';
    const difficulty = searchParams.get('difficulty') || 'intermediate';

    const {
        session,
        questions,
        answers,
        currentQuestionIndex,
        timeRemaining,
        isTimerRunning,
        language,
        isSubmitting,
        initExam,
        setCurrentQuestion,
        nextQuestion,
        prevQuestion,
        selectAnswer,
        clearAnswer,
        markForReview,
        unmarkForReview,
        decrementTime,
        setLanguage,
        submitExam,
        getStats,
    } = useExamStore();

    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showNavPanel, setShowNavPanel] = useState(true);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [isLoadingQuestions, setIsLoadingQuestions] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Preparing your exam...');
    const [error, setError] = useState<string | null>(null);
    const [retryCount, setRetryCount] = useState(0);
    const MAX_RETRIES = 3;

    // Generate questions using Gemini API with retry logic
    const generateQuestions = async (attempt: number = 1): Promise<Question[] | null> => {
        setLoadingMessage(`Connecting to Gemini AI... (Attempt ${attempt}/${MAX_RETRIES})`);

        try {
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

            const response = await fetch('/api/generate-questions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: category.toUpperCase(),
                    topic: 'Mixed - Mathematics, Reasoning, General Awareness, General Science',
                    difficulty: difficulty,
                    count: mode === 'mini' ? 10 : mode === 'topic' ? 15 : 20, // Reduced for faster loading
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            setLoadingMessage('Gemini 2.5 Flash is generating questions...');
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate questions');
            }

            if (data.questions && data.questions.length > 0) {
                setLoadingMessage('Questions ready! Preparing your exam...');
                return data.questions.map((q: any, i: number) => ({
                    id: `q_${i + 1}`,
                    category_id: category,
                    topic_id: q.topic || 'general',
                    difficulty: q.difficulty || difficulty,
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
            }

            throw new Error('No questions received from AI');

        } catch (error: any) {
            console.error(`Question generation attempt ${attempt} failed:`, error);

            // Retry if we haven't exceeded max retries
            if (attempt < MAX_RETRIES) {
                setLoadingMessage(`Retrying... (Attempt ${attempt + 1}/${MAX_RETRIES})`);
                await new Promise(resolve => setTimeout(resolve, 1500)); // Wait before retry
                return generateQuestions(attempt + 1);
            }

            // All retries failed
            setError(error?.message || 'Failed to generate questions. Please check your internet connection and try again.');
            return null;
        }
    };

    // Retry handler
    const handleRetry = async () => {
        setError(null);
        setRetryCount(prev => prev + 1);
        setIsLoadingQuestions(true);
        const questions = await generateQuestions();
        if (questions && questions.length > 0) {
            initializeExamWithQuestions(questions);
        }
        setIsLoadingQuestions(false);
    };

    // Initialize exam with questions
    const initializeExamWithQuestions = (generatedQuestions: Question[]) => {
        const mockSession: ExamSession = {
            id: `session_${Date.now()}`,
            user_id: 'user_1',
            category_id: category,
            difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced' | 'pro',
            mode: mode as ExamSession['mode'],
            started_at: new Date().toISOString(),
            total_questions: generatedQuestions.length,
            answered_count: 0,
            correct_count: 0,
            time_taken_seconds: 0,
            status: 'in_progress',
        };

        const config: ExamConfig = {
            category_id: category,
            mode: mode as ExamConfig['mode'],
            difficulty: difficulty as ExamConfig['difficulty'],
            question_count: generatedQuestions.length,
            time_limit_minutes: mode === 'practice' ? 0 : mode === 'mini' ? 30 : 90,
            negative_marking: mode === 'full',
            negative_mark_value: 0.33,
        };

        initExam(mockSession, generatedQuestions, config);
    };


    // Initialize exam
    useEffect(() => {
        const initializeExam = async () => {
            if (!session) {
                setIsLoadingQuestions(true);
                const generatedQuestions = await generateQuestions();

                if (generatedQuestions && generatedQuestions.length > 0) {
                    initializeExamWithQuestions(generatedQuestions);
                }
                setIsLoadingQuestions(false);
            }
        };

        initializeExam();
    }, [session, category, mode, difficulty, initExam]);


    // Timer
    useEffect(() => {
        if (!isTimerRunning || mode === 'practice') return;

        const timer = setInterval(() => {
            decrementTime();
        }, 1000);

        return () => clearInterval(timer);
    }, [isTimerRunning, mode, decrementTime]);

    // Auto-submit when time runs out
    useEffect(() => {
        if (timeRemaining === 0 && mode !== 'practice' && session) {
            setShowSubmitModal(true);
        }
    }, [timeRemaining, mode, session]);

    const currentQuestion = questions[currentQuestionIndex];
    const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : undefined;
    const stats = getStats();

    const handleOptionSelect = useCallback((optionIndex: number) => {
        if (currentQuestion) {
            selectAnswer(currentQuestion.id, optionIndex);
        }
    }, [currentQuestion, selectAnswer]);

    const handleMarkReview = useCallback(() => {
        if (currentQuestion && currentAnswer) {
            if (currentAnswer.status === 'marked_review' || currentAnswer.status === 'answered_marked') {
                unmarkForReview(currentQuestion.id);
            } else {
                markForReview(currentQuestion.id);
            }
        }
    }, [currentQuestion, currentAnswer, markForReview, unmarkForReview]);

    const handleClearResponse = useCallback(() => {
        if (currentQuestion) {
            clearAnswer(currentQuestion.id);
        }
    }, [currentQuestion, clearAnswer]);

    const handleSubmit = useCallback(() => {
        submitExam();
        window.location.href = `/results/${session?.id}`;
    }, [submitExam, session]);

    // Loading state
    if (isLoadingQuestions || !session || !currentQuestion) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)]">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
                        <Sparkles className="w-10 h-10 text-white animate-pulse" />
                    </div>

                    {error ? (
                        <>
                            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                <AlertTriangle className="w-6 h-6 text-red-400" />
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Failed to Generate Questions</h2>
                            <p className="text-slate-400 text-sm mb-6">{error}</p>
                            <div className="flex gap-3 justify-center">
                                <button
                                    onClick={handleRetry}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Try Again
                                </button>
                                <a
                                    href="/exams"
                                    className="btn-secondary flex items-center gap-2"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back to Exams
                                </a>
                            </div>
                        </>
                    ) : (
                        <>
                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
                            <p className="text-lg font-medium mb-2">{loadingMessage}</p>
                            <p className="text-slate-400 text-sm">Gemini 2.5 Flash is preparing your personalized exam...</p>
                        </>
                    )}
                </div>
            </div>
        );
    }


    const isReviewMarked = currentAnswer?.status === 'marked_review' || currentAnswer?.status === 'answered_marked';
    const isTimeWarning = timeRemaining <= 300 && mode !== 'practice';

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex">
            {/* Main Exam Area */}
            <div className={`flex-1 flex flex-col ${showNavPanel ? 'mr-80' : ''} transition-all`}>
                {/* Header */}
                <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-10">
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <h1 className="text-xl font-bold capitalize flex items-center gap-2">
                                    {category} Exam
                                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" />
                                        AI Generated
                                    </span>
                                </h1>
                                <span className="text-sm text-slate-400 capitalize">
                                    {mode} Mode • {difficulty}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                {/* Language Toggle */}
                                <button
                                    onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition"
                                >
                                    <Languages className="w-4 h-4" />
                                    <span className="text-sm">{language === 'en' ? 'हिंदी' : 'English'}</span>
                                </button>

                                {/* Timer */}
                                {mode !== 'practice' && (
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isTimeWarning ? 'bg-red-500/20 text-red-400 timer-warning' : 'bg-slate-800'
                                        }`}>
                                        <Clock className="w-5 h-5" />
                                        <span className="text-xl font-mono font-bold">{formatTime(timeRemaining)}</span>
                                    </div>
                                )}

                                {/* Submit Button */}
                                <button
                                    onClick={() => setShowSubmitModal(true)}
                                    className="btn-primary flex items-center gap-2"
                                >
                                    <Send className="w-4 h-4" />
                                    Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Question Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto">
                        {/* Question Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <span className="text-lg font-bold">
                                    Question {currentQuestionIndex + 1}
                                    <span className="text-slate-500 font-normal"> / {questions.length}</span>
                                </span>
                                <span className={`badge ${currentQuestion.difficulty === 'beginner' ? 'bg-green-500/20 text-green-400' :
                                    currentQuestion.difficulty === 'intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                                        currentQuestion.difficulty === 'advanced' ? 'bg-orange-500/20 text-orange-400' :
                                            'bg-red-500/20 text-red-400'
                                    }`}>
                                    {currentQuestion.difficulty}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsBookmarked(!isBookmarked)}
                                    className={`p-2 rounded-lg transition ${isBookmarked ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-slate-800'
                                        }`}
                                >
                                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                    onClick={handleMarkReview}
                                    className={`p-2 rounded-lg transition ${isReviewMarked ? 'bg-purple-500/20 text-purple-400' : 'hover:bg-slate-800'
                                        }`}
                                >
                                    <Flag className={`w-5 h-5 ${isReviewMarked ? 'fill-current' : ''}`} />
                                </button>
                            </div>
                        </div>

                        {/* Question Text */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQuestion.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className="glass-card p-6 mb-6"
                            >
                                <p className="text-lg">
                                    {language === 'en' ? currentQuestion.question_text : currentQuestion.question_text_hi}
                                </p>
                            </motion.div>
                        </AnimatePresence>

                        {/* Options */}
                        <div className="space-y-3">
                            {currentQuestion.options.map((option, index) => {
                                const isSelected = currentAnswer?.selected_option === index;
                                return (
                                    <motion.div
                                        key={option.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => handleOptionSelect(index)}
                                        className={`option-card ${isSelected ? 'selected' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${isSelected
                                            ? 'bg-blue-500 text-white'
                                            : 'bg-slate-700 text-slate-300'
                                            }`}>
                                            {['A', 'B', 'C', 'D'][index]}
                                        </div>
                                        <span className="flex-1">
                                            {language === 'en' ? option.text : option.text_hi}
                                        </span>
                                        {isSelected && (
                                            <CheckCircle2 className="w-5 h-5 text-blue-400" />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-between mt-8">
                            <div className="flex gap-2">
                                <button
                                    onClick={handleClearResponse}
                                    className="btn-secondary flex items-center gap-2"
                                    disabled={!currentAnswer}
                                >
                                    <RotateCcw className="w-4 h-4" />
                                    Clear Response
                                </button>
                                <button
                                    onClick={handleMarkReview}
                                    className={`btn-secondary flex items-center gap-2 ${isReviewMarked ? 'bg-purple-500/20 border-purple-500/50' : ''
                                        }`}
                                >
                                    <Flag className="w-4 h-4" />
                                    {isReviewMarked ? 'Unmark Review' : 'Mark for Review'}
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={prevQuestion}
                                    disabled={currentQuestionIndex === 0}
                                    className="btn-secondary flex items-center gap-2 disabled:opacity-50"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Previous
                                </button>
                                <button
                                    onClick={nextQuestion}
                                    disabled={currentQuestionIndex === questions.length - 1}
                                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                                >
                                    {currentQuestionIndex === questions.length - 1 ? 'Last Question' : 'Save & Next'}
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Panel */}
            {showNavPanel && (
                <div className="w-80 border-l border-slate-800 bg-slate-900/50 fixed right-0 top-0 bottom-0 overflow-y-auto">
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold">Question Navigator</h3>
                            <button
                                onClick={() => setShowNavPanel(false)}
                                className="p-1 hover:bg-slate-800 rounded"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-green-500"></div>
                                <span>Answered ({stats.answered})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-red-500"></div>
                                <span>Not Answered ({stats.notAnswered})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-purple-500"></div>
                                <span>Marked ({stats.markedForReview})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-4 h-4 rounded bg-slate-600"></div>
                                <span>Not Visited ({stats.notVisited})</span>
                            </div>
                        </div>

                        {/* Question Grid */}
                        <div className="nav-grid">
                            {questions.map((q, index) => {
                                const answer = answers.get(q.id);
                                let statusClass = 'nav-item-not-visited';

                                if (answer) {
                                    if (answer.status === 'answered_marked') {
                                        statusClass = 'nav-item-answered-marked';
                                    } else if (answer.status === 'marked_review') {
                                        statusClass = 'nav-item-marked';
                                    } else if (answer.status === 'answered') {
                                        statusClass = 'nav-item-answered';
                                    } else if (answer.status === 'skipped') {
                                        statusClass = 'nav-item-not-answered';
                                    }
                                }

                                return (
                                    <button
                                        key={q.id}
                                        onClick={() => setCurrentQuestion(index)}
                                        className={`nav-item ${statusClass} ${index === currentQuestionIndex ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900' : ''
                                            }`}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Nav Panel Button */}
            {!showNavPanel && (
                <button
                    onClick={() => setShowNavPanel(true)}
                    className="fixed right-4 top-1/2 -translate-y-1/2 p-2 bg-slate-800 rounded-lg hover:bg-slate-700 z-20"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
            )}

            {/* Submit Modal */}
            <AnimatePresence>
                {showSubmitModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="modal-overlay"
                        onClick={() => setShowSubmitModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="modal-content"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                    <AlertTriangle className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">Submit Exam?</h3>
                                    <p className="text-sm text-slate-400">This action cannot be undone</p>
                                </div>
                            </div>

                            <div className="glass-card p-4 mb-6">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-400">Answered:</span>
                                        <span className="ml-2 font-bold text-green-400">{stats.answered}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Not Answered:</span>
                                        <span className="ml-2 font-bold text-red-400">{stats.notAnswered}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Marked for Review:</span>
                                        <span className="ml-2 font-bold text-purple-400">{stats.markedForReview}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-400">Not Visited:</span>
                                        <span className="ml-2 font-bold text-slate-400">{stats.notVisited}</span>
                                    </div>
                                </div>
                            </div>

                            {stats.notAnswered > 0 && (
                                <div className="flex items-center gap-2 text-yellow-400 text-sm mb-6">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>You have {stats.notAnswered} unanswered questions!</span>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSubmitModal(false)}
                                    className="btn-secondary flex-1"
                                >
                                    Continue Exam
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="btn-primary flex-1"
                                >
                                    Submit Now
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
