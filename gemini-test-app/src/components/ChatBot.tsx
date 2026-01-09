import { useState } from 'react';
import { useTest } from '../context/TestContext';
import { initializeGemini, generateQuestions } from '../api/gemini';

interface TestConfig {
    apiKey: string;
    subject: string;
    numSets: number;
    questionsPerSet: number;
    timePerQuestion: number;
}

export function ChatBot() {
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
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                            <span className="text-white font-bold text-xl">FP</span>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Free Prep</h1>
                            <p className="text-xs text-gray-500">AI-Powered Test Generator</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                            ✨ Powered by Gemini AI
                        </span>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="max-w-6xl mx-auto px-6 py-12">
                <div className="text-center mb-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Practice Smarter, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-600">Score Higher</span>
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Generate unlimited practice tests for Railway, SSC, JEE, NEET, and more.
                        AI creates questions from real exam patterns.
                    </p>
                </div>

                {/* Main Card */}
                <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
                    {/* Step 1: API Key */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm">1</span>
                            <label className="text-sm font-semibold text-gray-800">Enter your Gemini API Key</label>
                        </div>
                        <input
                            type="password"
                            value={config.apiKey}
                            onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                            placeholder="AIza..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                            <span>🔗</span>
                            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline">
                                Get free API key from Google AI Studio
                            </a>
                        </p>
                    </div>

                    {/* Step 2: Subject */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm">2</span>
                            <label className="text-sm font-semibold text-gray-800">Choose your subject</label>
                        </div>
                        <input
                            type="text"
                            value={config.subject}
                            onChange={(e) => handleConfigChange('subject', e.target.value)}
                            placeholder="e.g., Railway Group D General Science, SSC CGL Maths..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all mb-4"
                        />
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {quickTopics.map((topic) => (
                                <button
                                    key={topic.name}
                                    onClick={() => handleConfigChange('subject', topic.name)}
                                    className={`px-4 py-3 text-sm rounded-xl border transition-all flex items-center gap-2 ${config.subject === topic.name
                                        ? 'bg-emerald-500 border-emerald-500 text-white'
                                        : topic.color + ' hover:shadow-md'
                                        }`}
                                >
                                    <span>{topic.icon}</span>
                                    <span className="font-medium">{topic.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Step 3: Configuration */}
                    <div className="p-6 border-b border-gray-100">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center font-bold text-sm">3</span>
                            <label className="text-sm font-semibold text-gray-800">Configure your test</label>
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                            <p className="text-xs text-blue-700 flex items-center gap-2">
                                <span>💡</span>
                                <span><strong>Tip:</strong> Start with 1-2 sets and 10-15 questions for faster generation. Free tier has rate limits.</span>
                            </p>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <label className="block text-xs text-gray-500 mb-2">📋 Sets</label>
                                <select
                                    value={config.numSets}
                                    onChange={(e) => handleConfigChange('numSets', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {[1, 2, 3, 4, 5].map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <label className="block text-xs text-gray-500 mb-2">❓ Questions/Set</label>
                                <select
                                    value={config.questionsPerSet}
                                    onChange={(e) => handleConfigChange('questionsPerSet', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {[5, 10, 15, 20, 25, 30].map(n => (
                                        <option key={n} value={n}>{n}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                                <label className="block text-xs text-gray-500 mb-2">⏱️ Time/Q</label>
                                <select
                                    value={config.timePerQuestion}
                                    onChange={(e) => handleConfigChange('timePerQuestion', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-gray-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                >
                                    {[30, 45, 60, 90, 120].map(n => (
                                        <option key={n} value={n}>{n}s</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Summary & Submit */}
                    <div className="p-6 bg-gradient-to-r from-emerald-50 to-teal-50">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-6">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-emerald-600">{totalQuestions}</p>
                                    <p className="text-xs text-gray-500">Questions</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-teal-600">{totalMinutes}</p>
                                    <p className="text-xs text-gray-500">Minutes</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-gray-800">{config.numSets}</p>
                                    <p className="text-xs text-gray-500">Sets</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1 text-green-600 font-medium">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    +4 Correct
                                </span>
                                <span className="flex items-center gap-1 text-red-600 font-medium">
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                    -1 Wrong
                                </span>
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

                        <button
                            onClick={handleStartTest}
                            disabled={!config.subject.trim() || !config.apiKey.trim() || isLoading}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${config.subject.trim() && config.apiKey.trim() && !isLoading
                                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg hover:shadow-emerald-300/50 transform hover:scale-[1.02]'
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
                        </button>
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 mt-12">
                    <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                            <span className="text-2xl">🎯</span>
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2">PYQ Based Questions</h3>
                        <p className="text-sm text-gray-600">AI generates questions based on previous year exam patterns and most asked topics.</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
                            <span className="text-2xl">⏱️</span>
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2">Time Tracking</h3>
                        <p className="text-sm text-gray-600">Track how much time you spend on each question. Improve your speed with analytics.</p>
                    </div>
                    <div className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 border border-gray-100">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
                            <span className="text-2xl">📊</span>
                        </div>
                        <h3 className="font-bold text-gray-800 mb-2">Detailed Analysis</h3>
                        <p className="text-sm text-gray-600">Get comprehensive reports with charts, set-wise breakdown, and performance insights.</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-50 border-t border-gray-100 py-6 mt-12">
                <div className="max-w-6xl mx-auto px-6 text-center text-sm text-gray-500">
                    <p>Free Prep © 2024 • Powered by Google Gemini AI • Practice unlimited tests for free</p>
                </div>
            </footer>
        </div>
    );
}
