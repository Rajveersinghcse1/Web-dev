import { useState } from 'react';
import { useTest } from '../context/TestContext';
import { initializeGemini, generateQuestions } from '../api/gemini';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface TestConfig {
    apiKey: string;
    subject: string;
    numSets: number;
    questionsPerSet: number;
    timePerQuestion: number;
}

interface ChatBotProps {
    onBack?: () => void;
}

export function ChatBot({ onBack }: ChatBotProps) {
    const { setSubject, setTestSets, setPhase, setIsLoading, setError, isLoading, error, setTestConfig } = useTest();
    const [config, setConfig] = useState<TestConfig>({
        apiKey: '',
        subject: '',
        numSets: 3,
        questionsPerSet: 20,
        timePerQuestion: 60,
    });

    const quickTopics = [
        { name: 'Railway ALP Science', icon: '🚂', color: 'bg-blue-50 border-blue-200 text-blue-700' },
        { name: 'SSC CGL Reasoning', icon: '🧠', color: 'bg-purple-50 border-purple-200 text-purple-700' },
        { name: 'JEE Physics', icon: '⚡', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
        { name: 'NEET Biology', icon: '🧬', color: 'bg-green-50 border-green-200 text-green-700' },
        { name: 'Bank PO Maths', icon: '🏦', color: 'bg-pink-50 border-pink-200 text-pink-700' },
        { name: 'UPSC GK', icon: '📚', color: 'bg-orange-50 border-orange-200 text-orange-700' },
    ];

    const handleConfigChange = (field: keyof TestConfig, value: string | number) => {
        setConfig(prev => ({ ...prev, [field]: value }));
    };

    const handleStartTest = async () => {
        if (!config.subject.trim() || !config.apiKey.trim()) return;

        initializeGemini(config.apiKey.trim());

        setSubject(config.subject.trim());
        setTestConfig({
            questionsPerSet: config.questionsPerSet,
            timePerQuestion: config.timePerQuestion,
            numSets: config.numSets,
        });
        setIsLoading(true);
        setError(null);
        setPhase('loading');

        try {
            const sets = await generateQuestions(config.subject.trim(), config.questionsPerSet, config.numSets);
            setTestSets(sets);
            setPhase('test');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate questions');
            setPhase('chat');
        } finally {
            setIsLoading(false);
        }
    };

    const totalQuestions = config.numSets * config.questionsPerSet;
    const totalMinutes = Math.round((totalQuestions * config.timePerQuestion) / 60);

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-emerald-50/30 relative overflow-hidden">
            {/* Enhanced Background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -right-1/3 w-200 h-200 bg-gradient-to-br from-emerald-400/20 via-teal-400/10 to-cyan-400/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-1/2 -left-1/3 w-200 h-200 bg-gradient-to-tr from-purple-400/10 via-pink-400/5 to-rose-400/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-size-[64px_64px]"></div>
            </div>
            
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <motion.div 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                            <span className="text-white font-bold text-xl">FP</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Free Prep</h1>
                            <p className="text-xs text-gray-500">AI-Powered Test Generator</p>
                        </div>
                    </motion.div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 backdrop-blur-sm border border-emerald-200/50 rounded-full text-sm font-semibold text-emerald-700 flex items-center gap-2 shadow-sm">
                            <Sparkles className="w-4 h-4 text-emerald-600" />
                            Powered by Gemini AI
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                        </div>
                        {onBack && (
                            <button
                                onClick={onBack}
                                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="max-w-6xl mx-auto px-6 py-6 relative z-10">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-6"
                >
                    <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 leading-tight">
                        Practice Smarter, <br className="sm:hidden" />
                        <span className="relative inline-block">
                            <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-gradient">Score Higher</span>
                            <motion.div
                                className="absolute -bottom-1 left-0 right-0 h-2 bg-linear-to-r from-emerald-400/30 to-teal-400/30 blur-sm"
                                animate={{ scaleX: [0.8, 1, 0.8] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            />
                        </span>
                    </h2>
                    <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
                        Generate unlimited practice tests for <span className="text-emerald-600 font-semibold">Railway, SSC, JEE, NEET,</span> and more.
                        AI creates questions from <span className="text-teal-600 font-semibold">real exam patterns.</span>
                    </p>
                </motion.div>

                {/* Main Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="max-w-3xl mx-auto relative"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl blur opacity-20" />
                    <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">
                    {/* Step 1: API Key */}
                    <div className="p-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg shadow-emerald-200">1</div>
                            <label className="text-sm font-bold text-gray-800">Enter your Gemini API Key</label>
                        </div>
                        <input
                            type="password"
                            value={config.apiKey}
                            onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                            placeholder="AIza..."
                            className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white transition-all font-mono"
                        />
                        <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                            <span>🔗</span>
                            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                                Get free API key from Google AI Studio
                            </a>
                        </p>
                    </div>

                    {/* Step 2: Subject */}
                    <div className="p-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-cyan-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg shadow-teal-200">2</div>
                            <label className="text-sm font-bold text-gray-800">Choose your subject</label>
                        </div>
                        <input
                            type="text"
                            value={config.subject}
                            onChange={(e) => handleConfigChange('subject', e.target.value)}
                            placeholder="e.g., Railway Group D General Science, SSC CGL Maths..."
                            className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-lg text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:bg-white transition-all mb-3"
                        />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {quickTopics.map((topic) => (
                                <motion.button
                                    key={topic.name}
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleConfigChange('subject', topic.name)}
                                    className={`px-3 py-2 text-xs rounded-lg border-2 transition-all flex items-center gap-1.5 font-semibold shadow-sm ${config.subject === topic.name
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-500 text-white shadow-lg shadow-emerald-200'
                                        : topic.color + ' hover:shadow-md hover:border-current'
                                        }`}
                                >
                                    <span className="text-sm">{topic.icon}</span>
                                    <span>{topic.name}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Step 3: Configuration */}
                    <div className="p-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-lg shadow-cyan-200">3</div>
                            <label className="text-sm font-bold text-gray-800">Configure your test</label>
                        </div>
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-2.5 mb-3 shadow-sm">
                            <p className="text-xs text-amber-800 flex items-center gap-1.5">
                                <span>💡</span>
                                <span><strong className="font-bold">Tip:</strong> Start with 1-2 sets for faster generation.</span>
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-200 hover:border-cyan-300 transition-all shadow-sm">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">📋 Sets</label>
                                <select
                                    value={config.numSets}
                                    onChange={(e) => handleConfigChange('numSets', parseInt(e.target.value))}
                                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                                >
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-200 hover:border-cyan-300 transition-all shadow-sm">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">❓ Questions/Set</label>
                                <select
                                    value={config.questionsPerSet}
                                    onChange={(e) => handleConfigChange('questionsPerSet', parseInt(e.target.value))}
                                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                                >
                                    {[5, 10, 15, 20, 25, 30].map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-200 hover:border-cyan-300 transition-all shadow-sm">
                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">⏱️ Time/Q</label>
                                <select
                                    value={config.timePerQuestion}
                                    onChange={(e) => handleConfigChange('timePerQuestion', parseInt(e.target.value))}
                                    className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded text-sm text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                                >
                                    {[30, 45, 60, 90, 120].map(n => (
                                        <option key={n} value={n}>{n}s</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Summary & Submit */}
                    <div className="p-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 border-t border-gray-100">
                        <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-3">
                            <div className="flex items-center gap-4 flex-wrap justify-center">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-emerald-600">{totalQuestions}</p>
                                    <p className="text-xs text-gray-600 font-medium">Questions</p>
                                </div>
                                <div className="w-px h-8 bg-gray-300" />
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-teal-600">{totalMinutes}</p>
                                    <p className="text-xs text-gray-600 font-medium">Minutes</p>
                                </div>
                                <div className="w-px h-8 bg-gray-300" />
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-cyan-600">{config.numSets}</p>
                                    <p className="text-xs text-gray-600 font-medium">Sets</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg shadow-sm">
                                    <p className="text-xs font-bold text-green-700">+4</p>
                                    <p className="text-[10px] text-green-600">Correct</p>
                                </div>
                                <div className="px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                                    <p className="text-xs font-bold text-red-700">-1</p>
                                    <p className="text-[10px] text-red-600">Wrong</p>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4">
                                <p className="text-sm font-medium mb-2">
                                    {error.includes('⏰') || error.includes('❌') || error.includes('🔑') || error.includes('⚠️')
                                        ? error
                                        : `⚠️ ${error}`}
                                </p>
                                {(error.includes('Rate limit') || error.includes('quota')) && (
                                    <div className="mt-2 pt-2 border-t border-red-300">
                                        <p className="text-xs text-red-600">
                                            <strong>What to do:</strong>
                                        </p>
                                        <ul className="text-xs text-red-600 mt-1 ml-4 list-disc space-y-1">
                                            <li>Wait 60 seconds before trying again</li>
                                            <li>Try with fewer questions/sets (e.g., 1 set, 10 questions)</li>
                                            <li>Use a different API key if available</li>
                                            <li>Check your usage at <a href="https://ai.dev/usage" target="_blank" rel="noreferrer" className="underline">ai.dev/usage</a></li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        <motion.button
                            whileHover={{ scale: config.subject.trim() && config.apiKey.trim() && !isLoading ? 1.02 : 1 }}
                            whileTap={{ scale: config.subject.trim() && config.apiKey.trim() && !isLoading ? 0.98 : 1 }}
                            onClick={handleStartTest}
                            disabled={!config.subject.trim() || !config.apiKey.trim() || isLoading}
                            className={`w-full py-3 rounded-xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg ${config.subject.trim() && config.apiKey.trim() && !isLoading
                                ? 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white hover:shadow-xl hover:shadow-emerald-300/50'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating Your Test...
                                </>
                            ) : (
                                <>
                                    🚀 Start Practice Test
                                </>
                            )}
                        </motion.button>
                    </div>
                    </div>
                </motion.div>
                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                    className="grid md:grid-cols-3 gap-6 mt-16"
                >
                    <motion.div whileHover={{ scale: 1.05, y: -5 }} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-gray-100 hover:border-purple-200 transition-all">
                        <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                            <span className="text-2xl">🎯</span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">PYQ Based Questions</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">AI generates questions based on previous year exam patterns and most asked topics.</p>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05, y: -5 }} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-gray-100 hover:border-orange-200 transition-all">
                        <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                            <span className="text-2xl">⏱️</span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">Time Tracking</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">Track how much time you spend on each question. Improve your speed with analytics.</p>
                    </motion.div>
                    <motion.div whileHover={{ scale: 1.05, y: -5 }} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border-2 border-gray-100 hover:border-blue-200 transition-all">
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
                            <span className="text-2xl">📊</span>
                        </div>
                        <h3 className="font-bold text-gray-900 mb-2 text-lg">Detailed Analysis</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">Get comprehensive reports with charts, set-wise breakdown, and performance insights.</p>
                    </motion.div>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-100 py-4 mt-6">
                <div className="max-w-6xl mx-auto px-6 text-center text-xs text-gray-500">
                    <p>Free Prep © 2024 • Powered by Google Gemini AI</p>
                </div>
            </footer>
        </div>
    );
}
