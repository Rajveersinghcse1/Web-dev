"use client";
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Sparkles, BookOpen, Target, Flame, Crown, Trophy,
    Lock, Play, Clock, Coins, Star, CheckCircle, XCircle,
    ChevronRight, Award, Zap, Timer, Brain, RotateCcw,
    TrendingUp, Medal, ArrowRight, Loader2
} from 'lucide-react';
import { Button } from './ui/button';
import confetti from 'canvas-confetti';

// ==================== STATIC DATA (Will be replaced with DB) ====================

const LEVELS_DATA = [
    { level: 1, name: "Beginner", description: "Start your journey", requiredCoins: 0, questionsPerAttempt: 5, timePerQuestion: 60, coinReward: 10, xpReward: 5, passingScore: 60, icon: "Sparkles", color: "emerald" },
    { level: 2, name: "Foundation", description: "Build your base", requiredCoins: 50, questionsPerAttempt: 8, timePerQuestion: 55, coinReward: 15, xpReward: 8, passingScore: 65, icon: "BookOpen", color: "blue" },
    { level: 3, name: "Intermediate", description: "Challenge yourself", requiredCoins: 150, questionsPerAttempt: 10, timePerQuestion: 50, coinReward: 20, xpReward: 10, passingScore: 70, icon: "Target", color: "violet" },
    { level: 4, name: "Advanced", description: "Test your skills", requiredCoins: 300, questionsPerAttempt: 12, timePerQuestion: 45, coinReward: 25, xpReward: 15, passingScore: 70, icon: "Flame", color: "orange" },
    { level: 5, name: "Expert", description: "Prove expertise", requiredCoins: 500, questionsPerAttempt: 15, timePerQuestion: 40, coinReward: 30, xpReward: 20, passingScore: 75, icon: "Crown", color: "amber" },
    { level: 6, name: "Master", description: "Master challenges", requiredCoins: 800, questionsPerAttempt: 20, timePerQuestion: 35, coinReward: 40, xpReward: 25, passingScore: 80, icon: "Trophy", color: "red" }
];

const SAMPLE_QUESTIONS = {
    1: [
        { id: "q1", question: "What is 25% of 80?", options: [{ id: "a", text: "15" }, { id: "b", text: "20" }, { id: "c", text: "25" }, { id: "d", text: "30" }], correctAnswer: "b", explanation: "25% of 80 = (25/100) × 80 = 20", category: "Quantitative" },
        { id: "q2", question: "Complete the series: 2, 4, 8, 16, ?", options: [{ id: "a", text: "20" }, { id: "b", text: "24" }, { id: "c", text: "32" }, { id: "d", text: "36" }], correctAnswer: "c", explanation: "Each number is multiplied by 2", category: "Logical" },
        { id: "q3", question: "If a train travels 60 km in 1 hour, how far in 3 hours?", options: [{ id: "a", text: "120 km" }, { id: "b", text: "150 km" }, { id: "c", text: "180 km" }, { id: "d", text: "200 km" }], correctAnswer: "c", explanation: "Distance = Speed × Time = 60 × 3 = 180 km", category: "Quantitative" },
        { id: "q4", question: "Choose the synonym of 'HAPPY':", options: [{ id: "a", text: "Sad" }, { id: "b", text: "Joyful" }, { id: "c", text: "Angry" }, { id: "d", text: "Tired" }], correctAnswer: "b", explanation: "Joyful means feeling great happiness", category: "Verbal" },
        { id: "q5", question: "5, 10, 15, 20, ?", options: [{ id: "a", text: "22" }, { id: "b", text: "25" }, { id: "c", text: "30" }, { id: "d", text: "35" }], correctAnswer: "b", explanation: "Pattern adds 5 each time", category: "Logical" }
    ],
    2: [
        { id: "q6", question: "A shopkeeper sells at ₹450 with 25% profit. Cost price?", options: [{ id: "a", text: "₹320" }, { id: "b", text: "₹360" }, { id: "c", text: "₹380" }, { id: "d", text: "₹400" }], correctAnswer: "b", explanation: "CP = 450 / 1.25 = ₹360", category: "Quantitative" },
        { id: "q7", question: "Boys:Girls = 3:2, 30 boys. How many girls?", options: [{ id: "a", text: "15" }, { id: "b", text: "20" }, { id: "c", text: "25" }, { id: "d", text: "18" }], correctAnswer: "b", explanation: "30/3 × 2 = 20 girls", category: "Quantitative" },
        { id: "q8", question: "APPLE → ELPPA, MANGO → ?", options: [{ id: "a", text: "OGNAM" }, { id: "b", text: "MANOG" }, { id: "c", text: "GNAMO" }, { id: "d", text: "NAMGO" }], correctAnswer: "a", explanation: "Word is reversed", category: "Logical" },
        { id: "q9", question: "Antonym of 'ANCIENT':", options: [{ id: "a", text: "Old" }, { id: "b", text: "Historic" }, { id: "c", text: "Modern" }, { id: "d", text: "Traditional" }], correctAnswer: "c", explanation: "Modern is opposite of ancient", category: "Verbal" },
        { id: "q10", question: "What does HTML stand for?", options: [{ id: "a", text: "Hyper Text Markup Language" }, { id: "b", text: "High Tech Modern Language" }, { id: "c", text: "Hyper Transfer Markup Language" }, { id: "d", text: "Home Tool Markup Language" }], correctAnswer: "a", explanation: "HTML = Hyper Text Markup Language", category: "Technical" }
    ]
};

// Icon mapping
const ICON_MAP = { Sparkles, BookOpen, Target, Flame, Crown, Trophy, Brain, Star, Award };

// ==================== SUB-COMPONENTS ====================

const LevelCard = ({ level, isUnlocked, isCurrent, userCoins, onStart, onUnlock }) => {
    const Icon = ICON_MAP[level.icon] || Star;
    const canUnlock = userCoins >= level.requiredCoins;

    const colorClasses = {
        emerald: "from-emerald-400 to-emerald-600 border-emerald-300",
        blue: "from-blue-400 to-blue-600 border-blue-300",
        violet: "from-violet-400 to-violet-600 border-violet-300",
        orange: "from-orange-400 to-orange-600 border-orange-300",
        amber: "from-amber-400 to-amber-600 border-amber-300",
        red: "from-red-400 to-red-600 border-red-300"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={isUnlocked ? { scale: 1.02, y: -5 } : {}}
            className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${isUnlocked
                    ? 'shadow-lg hover:shadow-2xl cursor-pointer'
                    : 'opacity-60 grayscale'
                }`}
        >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[level.color]} opacity-10`} />

            {/* Card Content */}
            <div className="relative p-6 bg-white border border-gray-200 rounded-2xl">
                {/* Level Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-full">
                    <span className="text-xs font-bold text-gray-600">Lv. {level.level}</span>
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${colorClasses[level.color]}`}>
                    {isUnlocked ? (
                        <Icon className="w-8 h-8 text-white" />
                    ) : (
                        <Lock className="w-8 h-8 text-white/80" />
                    )}
                </div>

                {/* Title & Description */}
                <h3 className="text-xl font-bold text-gray-900 mb-1">{level.name}</h3>
                <p className="text-sm text-gray-500 mb-4">{level.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{level.timePerQuestion}s/question</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                        <Target className="w-4 h-4" />
                        <span>{level.questionsPerAttempt} questions</span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                        <Coins className="w-4 h-4" />
                        <span>+{level.coinReward}/correct</span>
                    </div>
                    <div className="flex items-center gap-1 text-violet-500">
                        <Zap className="w-4 h-4" />
                        <span>+{level.xpReward} XP</span>
                    </div>
                </div>

                {/* Action Button */}
                {isUnlocked ? (
                    <Button
                        onClick={() => onStart(level)}
                        className={`w-full bg-gradient-to-r ${colorClasses[level.color]} text-white font-semibold`}
                    >
                        <Play className="w-4 h-4 mr-2" />
                        Start Test
                    </Button>
                ) : (
                    <Button
                        onClick={() => canUnlock && onUnlock(level)}
                        disabled={!canUnlock}
                        variant="outline"
                        className={`w-full ${canUnlock ? 'border-amber-400 text-amber-600 hover:bg-amber-50' : 'opacity-50'}`}
                    >
                        <Lock className="w-4 h-4 mr-2" />
                        Unlock ({level.requiredCoins} <Coins className="w-3 h-3 inline ml-1" />)
                    </Button>
                )}
            </div>
        </motion.div>
    );
};

const QuizTimer = ({ timeLeft, totalTime }) => {
    const percentage = (timeLeft / totalTime) * 100;
    const isLow = timeLeft <= 10;

    return (
        <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${isLow ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
                <Timer className={`w-5 h-5 ${isLow ? 'animate-pulse' : ''}`} />
                <span className="font-mono font-bold text-lg">{timeLeft}s</span>
            </div>
            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${isLow ? 'bg-red-500' : 'bg-emerald-500'}`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </div>
    );
};

const QuestionCard = ({ question, selectedAnswer, onSelect, showResult, isCorrect }) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
        >
            {/* Category Badge */}
            <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-sm font-medium">
                    {question.category}
                </span>
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold text-gray-900 mb-8">{question.question}</h2>

            {/* Options */}
            <div className="space-y-4">
                {question.options.map((option, index) => {
                    const isSelected = selectedAnswer === option.id;
                    const isCorrectOption = question.correctAnswer === option.id;

                    let optionClass = "border-gray-200 hover:border-violet-400 hover:bg-violet-50";
                    if (showResult) {
                        if (isCorrectOption) {
                            optionClass = "border-emerald-500 bg-emerald-50 text-emerald-700";
                        } else if (isSelected && !isCorrectOption) {
                            optionClass = "border-red-500 bg-red-50 text-red-700";
                        }
                    } else if (isSelected) {
                        optionClass = "border-violet-500 bg-violet-50 text-violet-700";
                    }

                    return (
                        <motion.button
                            key={option.id}
                            whileHover={!showResult ? { scale: 1.01 } : {}}
                            whileTap={!showResult ? { scale: 0.99 } : {}}
                            onClick={() => !showResult && onSelect(option.id)}
                            disabled={showResult}
                            className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${optionClass}`}
                        >
                            <span className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                                {String.fromCharCode(65 + index)}
                            </span>
                            <span className="flex-1 font-medium">{option.text}</span>
                            {showResult && isCorrectOption && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                            {showResult && isSelected && !isCorrectOption && <XCircle className="w-6 h-6 text-red-500" />}
                        </motion.button>
                    );
                })}
            </div>

            {/* Explanation (shown after answer) */}
            {showResult && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-6 p-4 rounded-xl ${isCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}
                >
                    <p className="font-medium text-gray-800">
                        <span className="font-bold">{isCorrect ? '✅ Correct!' : '❌ Incorrect.'}</span>
                        {' '}{question.explanation}
                    </p>
                </motion.div>
            )}
        </motion.div>
    );
};

const ResultsScreen = ({ results, level, onRetry, onContinue }) => {
    const { correctAnswers, totalQuestions, coinsEarned, xpEarned, passed } = results;
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100);

    useEffect(() => {
        if (passed) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });
        }
    }, [passed]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
        >
            <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${passed ? 'bg-emerald-100' : 'bg-amber-100'}`}>
                {passed ? (
                    <Trophy className="w-12 h-12 text-emerald-500" />
                ) : (
                    <RotateCcw className="w-12 h-12 text-amber-500" />
                )}
            </div>

            <h2 className={`text-3xl font-bold mb-2 ${passed ? 'text-emerald-600' : 'text-amber-600'}`}>
                {passed ? 'Level Passed!' : 'Keep Practicing!'}
            </h2>
            <p className="text-gray-600 mb-8">
                {passed
                    ? `Great job! You've mastered Level ${level.level}`
                    : `You need ${level.passingScore}% to pass. Try again!`}
            </p>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-3xl font-bold text-gray-900">{accuracy}%</div>
                    <div className="text-sm text-gray-500">Accuracy</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-3xl font-bold text-gray-900">{correctAnswers}/{totalQuestions}</div>
                    <div className="text-sm text-gray-500">Correct</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-3xl font-bold text-amber-500 flex items-center justify-center gap-1">
                        <Coins className="w-6 h-6" />
                        +{coinsEarned}
                    </div>
                    <div className="text-sm text-gray-500">Coins Earned</div>
                </div>
                <div className="bg-white rounded-xl p-4 border border-gray-200">
                    <div className="text-3xl font-bold text-violet-500 flex items-center justify-center gap-1">
                        <Zap className="w-6 h-6" />
                        +{xpEarned}
                    </div>
                    <div className="text-sm text-gray-500">XP Earned</div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
                <Button onClick={onRetry} variant="outline" className="flex-1">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Retry
                </Button>
                <Button onClick={onContinue} className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white">
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </motion.div>
    );
};

// ==================== MAIN COMPONENT ====================

export default function AptitudeTraining() {
    // State
    const [view, setView] = useState('levels'); // 'levels', 'quiz', 'results'
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [userProgress, setUserProgress] = useState({
        currentLevel: 1,
        totalCoins: 100, // Start with some coins for testing
        totalXp: 0,
        unlockedLevels: [1]
    });

    // Quiz State
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60);
    const [quizResults, setQuizResults] = useState({
        correctAnswers: 0,
        totalQuestions: 0,
        coinsEarned: 0,
        xpEarned: 0,
        passed: false
    });

    // Timer Effect
    useEffect(() => {
        if (view !== 'quiz' || showResult) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleSubmitAnswer(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [view, showResult, currentQuestionIndex]);

    // Handlers
    const handleStartTest = (level) => {
        setSelectedLevel(level);
        const levelQuestions = SAMPLE_QUESTIONS[level.level] || SAMPLE_QUESTIONS[1];
        setQuestions(levelQuestions.slice(0, level.questionsPerAttempt));
        setCurrentQuestionIndex(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setTimeLeft(level.timePerQuestion);
        setQuizResults({ correctAnswers: 0, totalQuestions: levelQuestions.length, coinsEarned: 0, xpEarned: 0, passed: false });
        setView('quiz');
    };

    const handleUnlockLevel = (level) => {
        if (userProgress.totalCoins >= level.requiredCoins) {
            setUserProgress(prev => ({
                ...prev,
                totalCoins: prev.totalCoins - level.requiredCoins,
                unlockedLevels: [...prev.unlockedLevels, level.level]
            }));
        }
    };

    const handleSubmitAnswer = useCallback((autoSubmit = false) => {
        const currentQuestion = questions[currentQuestionIndex];
        const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

        setShowResult(true);

        // Update results
        setQuizResults(prev => ({
            ...prev,
            correctAnswers: prev.correctAnswers + (isCorrect ? 1 : 0),
            coinsEarned: prev.coinsEarned + (isCorrect ? selectedLevel.coinReward : 0),
            xpEarned: prev.xpEarned + (isCorrect ? selectedLevel.xpReward : 0)
        }));

        // Move to next question after delay
        setTimeout(() => {
            if (currentQuestionIndex < questions.length - 1) {
                setCurrentQuestionIndex(prev => prev + 1);
                setSelectedAnswer(null);
                setShowResult(false);
                setTimeLeft(selectedLevel.timePerQuestion);
            } else {
                // Quiz complete
                const finalResults = {
                    correctAnswers: quizResults.correctAnswers + (isCorrect ? 1 : 0),
                    totalQuestions: questions.length,
                    coinsEarned: quizResults.coinsEarned + (isCorrect ? selectedLevel.coinReward : 0),
                    xpEarned: quizResults.xpEarned + (isCorrect ? selectedLevel.xpReward : 0),
                    passed: ((quizResults.correctAnswers + (isCorrect ? 1 : 0)) / questions.length * 100) >= selectedLevel.passingScore
                };
                setQuizResults(finalResults);

                // Update user progress
                setUserProgress(prev => ({
                    ...prev,
                    totalCoins: prev.totalCoins + finalResults.coinsEarned,
                    totalXp: prev.totalXp + finalResults.xpEarned
                }));

                setView('results');
            }
        }, 2000);
    }, [selectedAnswer, currentQuestionIndex, questions, selectedLevel, quizResults]);

    const handleRetry = () => {
        handleStartTest(selectedLevel);
    };

    const handleContinue = () => {
        setView('levels');
        setSelectedLevel(null);
    };

    // Render
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-violet-50/30 p-6">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Aptitude Training</h1>
                        <p className="text-gray-500">Master placement interviews level by level</p>
                    </div>

                    {/* User Stats */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                            <Coins className="w-5 h-5 text-amber-500" />
                            <span className="font-bold text-gray-900">{userProgress.totalCoins}</span>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                            <Zap className="w-5 h-5 text-violet-500" />
                            <span className="font-bold text-gray-900">{userProgress.totalXp} XP</span>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {view === 'levels' && (
                        <motion.div
                            key="levels"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {LEVELS_DATA.map(level => (
                                    <LevelCard
                                        key={level.level}
                                        level={level}
                                        isUnlocked={userProgress.unlockedLevels.includes(level.level)}
                                        isCurrent={userProgress.currentLevel === level.level}
                                        userCoins={userProgress.totalCoins}
                                        onStart={handleStartTest}
                                        onUnlock={handleUnlockLevel}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {view === 'quiz' && questions.length > 0 && (
                        <motion.div
                            key="quiz"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="max-w-3xl mx-auto"
                        >
                            {/* Quiz Header */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-500">Level {selectedLevel?.level}</span>
                                        <ChevronRight className="w-4 h-4 text-gray-400" />
                                        <span className="text-sm font-bold text-violet-600">{selectedLevel?.name}</span>
                                    </div>
                                    <div className="text-sm font-medium text-gray-500">
                                        Question {currentQuestionIndex + 1} of {questions.length}
                                    </div>
                                </div>

                                {/* Timer */}
                                <QuizTimer timeLeft={timeLeft} totalTime={selectedLevel?.timePerQuestion || 60} />
                            </div>

                            {/* Question */}
                            <QuestionCard
                                question={questions[currentQuestionIndex]}
                                selectedAnswer={selectedAnswer}
                                onSelect={setSelectedAnswer}
                                showResult={showResult}
                                isCorrect={selectedAnswer === questions[currentQuestionIndex]?.correctAnswer}
                            />

                            {/* Submit Button */}
                            {!showResult && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 flex justify-end"
                                >
                                    <Button
                                        onClick={() => handleSubmitAnswer(false)}
                                        disabled={!selectedAnswer}
                                        className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold disabled:opacity-50"
                                    >
                                        Submit Answer
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {view === 'results' && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <ResultsScreen
                                results={quizResults}
                                level={selectedLevel}
                                onRetry={handleRetry}
                                onContinue={handleContinue}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
