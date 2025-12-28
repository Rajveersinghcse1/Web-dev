"use client";
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Users, Play, Clock, Eye, EyeOff, Copy, Check,
    Trash2, ChevronRight, ArrowRight, Lock, Globe, X,
    Timer, Award, Target, Zap, Trophy, Search, Hash,
    FileText, Edit3, Loader2, CheckCircle, XCircle
} from 'lucide-react';
import { Button } from './ui/button';
import confetti from 'canvas-confetti';

// ==================== STATIC DATA ====================

const CATEGORIES = [
    { id: 'aptitude', name: 'Aptitude', icon: '🧠' },
    { id: 'technical', name: 'Technical', icon: '💻' },
    { id: 'verbal', name: 'Verbal', icon: '📝' },
    { id: 'logical', name: 'Logical', icon: '🔢' },
    { id: 'hr', name: 'HR Interview', icon: '👔' },
    { id: 'general', name: 'General', icon: '📚' }
];

// ==================== SUB-COMPONENTS ====================

const TabButton = ({ active, onClick, icon: Icon, children }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all ${active
                ? 'bg-violet-600 text-white shadow-lg shadow-violet-200'
                : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
            }`}
    >
        <Icon className="w-4 h-4" />
        {children}
    </button>
);

const TestCard = ({ test, onPlay, onCopy, onDelete, isOwner }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(test.code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-shadow"
        >
            <div className="flex items-start justify-between mb-3">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">{test.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{test.description}</p>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${test.visibility === 'public'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                    {test.visibility === 'public' ? <Globe className="w-3 h-3 inline mr-1" /> : <Lock className="w-3 h-3 inline mr-1" />}
                    {test.visibility}
                </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {test.questionsCount} questions
                </span>
                <span className="flex items-center gap-1">
                    <Timer className="w-4 h-4" />
                    {test.timePerQuestion}s
                </span>
                <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {test.participantsCount || 0}
                </span>
            </div>

            {/* Code Display */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-4 py-2 mb-4">
                <Hash className="w-4 h-4 text-gray-400" />
                <span className="font-mono font-bold text-gray-900 tracking-wider">{test.code}</span>
                <button
                    onClick={handleCopy}
                    className="ml-auto p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-gray-500" />}
                </button>
            </div>

            <div className="flex gap-2">
                <Button onClick={onPlay} className="flex-1 bg-violet-600 text-white hover:bg-violet-700">
                    <Play className="w-4 h-4 mr-2" />
                    Take Test
                </Button>
                {isOwner && (
                    <Button variant="outline" size="icon" onClick={onDelete} className="text-red-500 border-red-200 hover:bg-red-50">
                        <Trash2 className="w-4 h-4" />
                    </Button>
                )}
            </div>
        </motion.div>
    );
};

const QuestionEditor = ({ question, index, onChange, onRemove }) => (
    <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gray-50 rounded-2xl p-5 border border-gray-200"
    >
        <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-bold text-violet-600">Question {index + 1}</span>
            <button
                onClick={onRemove}
                className="p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
            >
                <X className="w-4 h-4" />
            </button>
        </div>

        <input
            type="text"
            value={question.question}
            onChange={(e) => onChange({ ...question, question: e.target.value })}
            placeholder="Enter your question..."
            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-900 mb-4 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />

        <div className="grid grid-cols-2 gap-3 mb-4">
            {question.options.map((opt, i) => (
                <div key={opt.id} className="flex items-center gap-2">
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${question.correctAnswer === opt.id
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }`}>
                        {String.fromCharCode(65 + i)}
                    </span>
                    <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                            const newOptions = [...question.options];
                            newOptions[i] = { ...opt, text: e.target.value };
                            onChange({ ...question, options: newOptions });
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                    />
                    <button
                        onClick={() => onChange({ ...question, correctAnswer: opt.id })}
                        className={`p-2 rounded-lg transition-colors ${question.correctAnswer === opt.id
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'hover:bg-gray-100 text-gray-400'
                            }`}
                        title="Set as correct answer"
                    >
                        <Check className="w-4 h-4" />
                    </button>
                </div>
            ))}
        </div>

        <input
            type="text"
            value={question.explanation || ''}
            onChange={(e) => onChange({ ...question, explanation: e.target.value })}
            placeholder="Explanation (optional)"
            className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-violet-500"
        />
    </motion.div>
);

const JoinModal = ({ isOpen, onClose, onJoin }) => {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleJoin = async () => {
        if (code.length !== 6) {
            setError('Code must be 6 characters');
            return;
        }
        setLoading(true);
        setError('');
        await onJoin(code.toUpperCase());
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl"
            >
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Join a Test</h2>
                <p className="text-gray-500 mb-6">Enter the 6-character code to join</p>

                <div className="relative mb-4">
                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 6))}
                        placeholder="XXXXXX"
                        className="w-full pl-12 pr-4 py-4 bg-gray-100 border-2 border-transparent rounded-xl text-center text-2xl font-mono font-bold tracking-[0.3em] text-gray-900 focus:outline-none focus:border-violet-500 transition-colors"
                        maxLength={6}
                    />
                </div>

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <div className="flex gap-3">
                    <Button variant="outline" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleJoin}
                        disabled={code.length !== 6 || loading}
                        className="flex-1 bg-violet-600 text-white"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Join Test'}
                    </Button>
                </div>
            </motion.div>
        </motion.div>
    );
};

const ShareModal = ({ isOpen, onClose, code, testName }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    useEffect(() => {
        if (isOpen) {
            confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl p-8 w-full max-w-md shadow-2xl text-center"
            >
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-emerald-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-2">Test Created!</h2>
                <p className="text-gray-500 mb-6">"{testName}" is ready. Share this code:</p>

                <div
                    onClick={handleCopy}
                    className="bg-gray-100 rounded-2xl p-6 mb-6 cursor-pointer hover:bg-gray-150 transition-colors"
                >
                    <p className="text-4xl font-mono font-bold tracking-[0.3em] text-violet-600">{code}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        {copied ? '✓ Copied!' : 'Click to copy'}
                    </p>
                </div>

                <Button onClick={onClose} className="w-full bg-violet-600 text-white">
                    Done
                </Button>
            </motion.div>
        </motion.div>
    );
};

// ==================== MAIN COMPONENT ====================

export default function CommunityTestCreator() {
    // Mode: 'browse' | 'create' | 'take'
    const [mode, setMode] = useState('browse');
    const [activeTab, setActiveTab] = useState('public'); // 'public' | 'my-tests'

    // Mock user
    const mockUser = { id: 'user_123', name: 'Test User' };

    // Tests data (static for now)
    const [publicTests, setPublicTests] = useState([
        { testId: 't1', code: 'ABC123', name: 'Basic Aptitude', description: 'Test your aptitude skills', visibility: 'public', questionsCount: 5, timePerQuestion: 30, participantsCount: 12, creatorId: 'other' },
        { testId: 't2', code: 'XYZ789', name: 'Technical MCQ', description: 'Programming basics', visibility: 'public', questionsCount: 10, timePerQuestion: 45, participantsCount: 8, creatorId: 'other' }
    ]);
    const [myTests, setMyTests] = useState([]);

    // Create form state
    const [testForm, setTestForm] = useState({
        name: '',
        description: '',
        category: 'general',
        visibility: 'public',
        timePerQuestion: 30,
        questions: []
    });

    // Modals
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [createdCode, setCreatedCode] = useState('');
    const [createdTestName, setCreatedTestName] = useState('');

    // Quiz state
    const [currentTest, setCurrentTest] = useState(null);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showAnswer, setShowAnswer] = useState(false);
    const [quizScore, setQuizScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(30);

    // Timer for quiz
    useEffect(() => {
        if (mode !== 'take' || showAnswer || !currentTest) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    handleQuizSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [mode, showAnswer, currentQuestionIdx]);

    // Add new question
    const addQuestion = () => {
        setTestForm(prev => ({
            ...prev,
            questions: [...prev.questions, {
                question: '',
                options: [
                    { id: 'a', text: '' },
                    { id: 'b', text: '' },
                    { id: 'c', text: '' },
                    { id: 'd', text: '' }
                ],
                correctAnswer: 'a',
                explanation: ''
            }]
        }));
    };

    // Remove question
    const removeQuestion = (index) => {
        setTestForm(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index)
        }));
    };

    // Update question
    const updateQuestion = (index, updatedQuestion) => {
        setTestForm(prev => ({
            ...prev,
            questions: prev.questions.map((q, i) => i === index ? updatedQuestion : q)
        }));
    };

    // Create test
    const handleCreateTest = () => {
        if (!testForm.name || testForm.questions.length === 0) return;

        const code = 'ABCDEF'.split('').map(() =>
            'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
        ).join('');

        const newTest = {
            testId: `test_${Date.now()}`,
            code,
            name: testForm.name,
            description: testForm.description,
            category: testForm.category,
            visibility: testForm.visibility,
            timePerQuestion: testForm.timePerQuestion,
            questionsCount: testForm.questions.length,
            participantsCount: 0,
            creatorId: mockUser.id,
            questions: testForm.questions
        };

        setMyTests(prev => [newTest, ...prev]);
        if (testForm.visibility === 'public') {
            setPublicTests(prev => [newTest, ...prev]);
        }

        setCreatedCode(code);
        setCreatedTestName(testForm.name);
        setShowShareModal(true);

        // Reset form
        setTestForm({
            name: '',
            description: '',
            category: 'general',
            visibility: 'public',
            timePerQuestion: 30,
            questions: []
        });
        setMode('browse');
    };

    // Join test
    const handleJoinTest = async (code) => {
        const test = [...publicTests, ...myTests].find(t => t.code === code);
        if (test) {
            startQuiz(test);
            setShowJoinModal(false);
        } else {
            alert('Test not found');
        }
    };

    // Start quiz
    const startQuiz = (test) => {
        setCurrentTest(test);
        setCurrentQuestionIdx(0);
        setSelectedAnswer(null);
        setShowAnswer(false);
        setQuizScore(0);
        setTimeLeft(test.timePerQuestion);
        setMode('take');
    };

    // Submit answer
    const handleQuizSubmit = useCallback((auto = false) => {
        if (!currentTest?.questions) return;

        const currentQ = currentTest.questions[currentQuestionIdx];
        const isCorrect = selectedAnswer === currentQ.correctAnswer;

        if (isCorrect) setQuizScore(prev => prev + 1);
        setShowAnswer(true);

        setTimeout(() => {
            if (currentQuestionIdx < currentTest.questions.length - 1) {
                setCurrentQuestionIdx(prev => prev + 1);
                setSelectedAnswer(null);
                setShowAnswer(false);
                setTimeLeft(currentTest.timePerQuestion);
            } else {
                // Quiz complete
                confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
                setMode('results');
            }
        }, 2000);
    }, [currentTest, currentQuestionIdx, selectedAnswer]);

    // Render
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-violet-50/30 p-6">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Community Tests</h1>
                        <p className="text-gray-500">Create & share aptitude tests with others</p>
                    </div>

                    {mode === 'browse' && (
                        <div className="flex gap-3">
                            <Button
                                onClick={() => setShowJoinModal(true)}
                                variant="outline"
                                className="border-violet-200 text-violet-600 hover:bg-violet-50"
                            >
                                <Hash className="w-4 h-4 mr-2" />
                                Join by Code
                            </Button>
                            <Button
                                onClick={() => setMode('create')}
                                className="bg-violet-600 text-white hover:bg-violet-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Test
                            </Button>
                        </div>
                    )}

                    {(mode === 'create' || mode === 'take') && (
                        <Button
                            onClick={() => setMode('browse')}
                            variant="outline"
                        >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                        </Button>
                    )}
                </div>

                {/* Content */}
                <AnimatePresence mode="wait">
                    {/* Browse Mode */}
                    {mode === 'browse' && (
                        <motion.div
                            key="browse"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Tabs */}
                            <div className="flex gap-3 mb-6">
                                <TabButton
                                    active={activeTab === 'public'}
                                    onClick={() => setActiveTab('public')}
                                    icon={Globe}
                                >
                                    Public Tests
                                </TabButton>
                                <TabButton
                                    active={activeTab === 'my-tests'}
                                    onClick={() => setActiveTab('my-tests')}
                                    icon={Edit3}
                                >
                                    My Created Tests
                                </TabButton>
                            </div>

                            {/* Tests Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {(activeTab === 'public' ? publicTests : myTests).map(test => (
                                    <TestCard
                                        key={test.testId}
                                        test={test}
                                        onPlay={() => startQuiz(test)}
                                        onDelete={() => {
                                            setMyTests(prev => prev.filter(t => t.testId !== test.testId));
                                            setPublicTests(prev => prev.filter(t => t.testId !== test.testId));
                                        }}
                                        isOwner={test.creatorId === mockUser.id}
                                    />
                                ))}

                                {(activeTab === 'public' ? publicTests : myTests).length === 0 && (
                                    <div className="col-span-full text-center py-20">
                                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <FileText className="w-10 h-10 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">No tests yet</h3>
                                        <p className="text-gray-500 mb-6">
                                            {activeTab === 'public'
                                                ? 'Be the first to create a public test!'
                                                : 'Create your first test to get started'}
                                        </p>
                                        <Button onClick={() => setMode('create')} className="bg-violet-600 text-white">
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Test
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Create Mode */}
                    {mode === 'create' && (
                        <motion.div
                            key="create"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="max-w-3xl mx-auto"
                        >
                            <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
                                <h2 className="text-xl font-bold text-gray-900 mb-6">Test Details</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Test Name *</label>
                                        <input
                                            type="text"
                                            value={testForm.name}
                                            onChange={(e) => setTestForm(prev => ({ ...prev, name: e.target.value }))}
                                            placeholder="e.g., Basic Aptitude Quiz"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                            value={testForm.description}
                                            onChange={(e) => setTestForm(prev => ({ ...prev, description: e.target.value }))}
                                            placeholder="Describe your test..."
                                            rows={2}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Visibility</label>
                                            <select
                                                value={testForm.visibility}
                                                onChange={(e) => setTestForm(prev => ({ ...prev, visibility: e.target.value }))}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            >
                                                <option value="public">🌐 Public</option>
                                                <option value="private">🔒 Private</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                            <select
                                                value={testForm.category}
                                                onChange={(e) => setTestForm(prev => ({ ...prev, category: e.target.value }))}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            >
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Time/Question</label>
                                            <select
                                                value={testForm.timePerQuestion}
                                                onChange={(e) => setTestForm(prev => ({ ...prev, timePerQuestion: Number(e.target.value) }))}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500"
                                            >
                                                <option value={15}>15 seconds</option>
                                                <option value={30}>30 seconds</option>
                                                <option value={45}>45 seconds</option>
                                                <option value={60}>60 seconds</option>
                                                <option value={90}>90 seconds</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Questions */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Questions ({testForm.questions.length})</h2>
                                    <Button onClick={addQuestion} variant="outline" className="border-violet-200 text-violet-600">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Add Question
                                    </Button>
                                </div>

                                <div className="space-y-4">
                                    <AnimatePresence>
                                        {testForm.questions.map((q, i) => (
                                            <QuestionEditor
                                                key={i}
                                                question={q}
                                                index={i}
                                                onChange={(updated) => updateQuestion(i, updated)}
                                                onRemove={() => removeQuestion(i)}
                                            />
                                        ))}
                                    </AnimatePresence>

                                    {testForm.questions.length === 0 && (
                                        <div className="text-center py-12 text-gray-500">
                                            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                            <p>No questions yet. Click "Add Question" to start.</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Create Button */}
                            <Button
                                onClick={handleCreateTest}
                                disabled={!testForm.name || testForm.questions.length === 0}
                                className="w-full py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-lg disabled:opacity-50"
                            >
                                <Check className="w-5 h-5 mr-2" />
                                Create Test
                            </Button>
                        </motion.div>
                    )}

                    {/* Take Test Mode */}
                    {mode === 'take' && currentTest?.questions && (
                        <motion.div
                            key="take"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="max-w-3xl mx-auto"
                        >
                            {/* Header */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-sm text-gray-500">Question {currentQuestionIdx + 1} of {currentTest.questions.length}</span>
                                        <h2 className="font-bold text-gray-900">{currentTest.name}</h2>
                                    </div>
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700'}`}>
                                        <Timer className={`w-5 h-5 ${timeLeft <= 10 ? 'animate-pulse' : ''}`} />
                                        <span className="font-mono font-bold text-lg">{timeLeft}s</span>
                                    </div>
                                </div>
                            </div>

                            {/* Question */}
                            <div className="bg-white rounded-2xl border border-gray-200 p-8">
                                <h3 className="text-2xl font-bold text-gray-900 mb-8">
                                    {currentTest.questions[currentQuestionIdx].question}
                                </h3>

                                <div className="space-y-4">
                                    {currentTest.questions[currentQuestionIdx].options.map((opt, i) => {
                                        const isSelected = selectedAnswer === opt.id;
                                        const isCorrect = opt.id === currentTest.questions[currentQuestionIdx].correctAnswer;

                                        let classes = 'border-gray-200 hover:border-violet-400 hover:bg-violet-50';
                                        if (showAnswer) {
                                            if (isCorrect) classes = 'border-emerald-500 bg-emerald-50';
                                            else if (isSelected) classes = 'border-red-500 bg-red-50';
                                        } else if (isSelected) {
                                            classes = 'border-violet-500 bg-violet-50';
                                        }

                                        return (
                                            <button
                                                key={opt.id}
                                                onClick={() => !showAnswer && setSelectedAnswer(opt.id)}
                                                disabled={showAnswer}
                                                className={`w-full p-4 rounded-xl border-2 text-left flex items-center gap-4 transition-all ${classes}`}
                                            >
                                                <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-gray-600">
                                                    {String.fromCharCode(65 + i)}
                                                </span>
                                                <span className="flex-1 font-medium">{opt.text}</span>
                                                {showAnswer && isCorrect && <CheckCircle className="w-6 h-6 text-emerald-500" />}
                                                {showAnswer && isSelected && !isCorrect && <XCircle className="w-6 h-6 text-red-500" />}
                                            </button>
                                        );
                                    })}
                                </div>

                                {!showAnswer && (
                                    <Button
                                        onClick={() => handleQuizSubmit(false)}
                                        disabled={!selectedAnswer}
                                        className="w-full mt-6 py-3 bg-violet-600 text-white disabled:opacity-50"
                                    >
                                        Submit Answer
                                        <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Results Mode */}
                    {mode === 'results' && currentTest && (
                        <motion.div
                            key="results"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="max-w-lg mx-auto text-center"
                        >
                            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-emerald-100 flex items-center justify-center">
                                <Trophy className="w-12 h-12 text-emerald-500" />
                            </div>

                            <h2 className="text-3xl font-bold text-gray-900 mb-2">Test Complete!</h2>
                            <p className="text-gray-500 mb-8">{currentTest.name}</p>

                            <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
                                <div className="text-5xl font-bold text-violet-600 mb-2">
                                    {Math.round((quizScore / currentTest.questions.length) * 100)}%
                                </div>
                                <div className="text-gray-500">
                                    {quizScore} of {currentTest.questions.length} correct
                                </div>
                            </div>

                            <Button onClick={() => setMode('browse')} className="w-full bg-violet-600 text-white">
                                Back to Tests
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Modals */}
                <JoinModal
                    isOpen={showJoinModal}
                    onClose={() => setShowJoinModal(false)}
                    onJoin={handleJoinTest}
                />
                <ShareModal
                    isOpen={showShareModal}
                    onClose={() => setShowShareModal(false)}
                    code={createdCode}
                    testName={createdTestName}
                />
            </div>
        </div>
    );
}
