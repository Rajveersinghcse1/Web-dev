import { useState } from 'react';
import { useTest } from '../context/TestContext';

type TabType = 'overview' | 'timing' | 'analysis' | 'answers';

export function Result() {
    const { result, subject, resetTest, testSets, testConfig } = useTest();
    const [activeTab, setActiveTab] = useState<TabType>('overview');
    const [filterSet, setFilterSet] = useState<string>('all');

    if (!result) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="text-gray-600">No results available</p>
            </div>
        );
    }

    const getGrade = () => {
        if (result.percentage >= 90) return { grade: 'A+', color: 'text-emerald-600', bg: 'bg-emerald-100', message: 'Outstanding!' };
        if (result.percentage >= 80) return { grade: 'A', color: 'text-emerald-600', bg: 'bg-emerald-100', message: 'Excellent!' };
        if (result.percentage >= 70) return { grade: 'B+', color: 'text-blue-600', bg: 'bg-blue-100', message: 'Very Good!' };
        if (result.percentage >= 60) return { grade: 'B', color: 'text-blue-600', bg: 'bg-blue-100', message: 'Good Job!' };
        if (result.percentage >= 50) return { grade: 'C', color: 'text-yellow-600', bg: 'bg-yellow-100', message: 'Average' };
        if (result.percentage >= 40) return { grade: 'D', color: 'text-orange-600', bg: 'bg-orange-100', message: 'Needs Work' };
        return { grade: 'F', color: 'text-red-600', bg: 'bg-red-100', message: 'Keep Practicing!' };
    };

    const gradeInfo = getGrade();
    const accuracy = result.attempted > 0 ? Math.round((result.correct / result.attempted) * 100) : 0;

    // Time analytics
    const totalTimeSpent = result.questionAnalysis.reduce((sum, q) => sum + (q.timeTaken || 0), 0);
    const avgTimePerQuestion = result.questionAnalysis.length > 0
        ? Math.round(totalTimeSpent / result.questionAnalysis.length)
        : 0;
    const fastestQuestion = result.questionAnalysis.reduce((min, q) =>
        (q.timeTaken || 999) < (min.timeTaken || 999) ? q : min, result.questionAnalysis[0]);
    const slowestQuestion = result.questionAnalysis.reduce((max, q) =>
        (q.timeTaken || 0) > (max.timeTaken || 0) ? q : max, result.questionAnalysis[0]);

    // Time distribution for chart
    const timeRanges = [
        { label: '0-15s', min: 0, max: 15, count: 0, color: 'bg-green-500' },
        { label: '16-30s', min: 16, max: 30, count: 0, color: 'bg-emerald-500' },
        { label: '31-45s', min: 31, max: 45, count: 0, color: 'bg-yellow-500' },
        { label: '46-60s', min: 46, max: 60, count: 0, color: 'bg-orange-500' },
        { label: '60s+', min: 61, max: 9999, count: 0, color: 'bg-red-500' },
    ];

    result.questionAnalysis.forEach(q => {
        const time = q.timeTaken || 0;
        const range = timeRanges.find(r => time >= r.min && time <= r.max);
        if (range) range.count++;
    });

    const maxTimeCount = Math.max(...timeRanges.map(r => r.count), 1);

    // Set-wise stats
    const getSetStats = (setId: string) => {
        const setQuestions = result.questionAnalysis.filter(q => q.question.includes(`[Set ${setId}`));
        const correct = setQuestions.filter(q => q.isCorrect).length;
        const incorrect = setQuestions.filter(q => q.userAnswer && !q.isCorrect).length;
        const unanswered = setQuestions.filter(q => !q.userAnswer).length;
        const totalTime = setQuestions.reduce((sum, q) => sum + (q.timeTaken || 0), 0);
        return { total: setQuestions.length, correct, incorrect, unanswered, totalTime };
    };

    // Filter questions
    const filteredQuestions = filterSet === 'all'
        ? result.questionAnalysis
        : result.questionAnalysis.filter(q => q.question.includes(`[Set ${filterSet}`));

    // Donut Chart
    const DonutChart = ({ correct, incorrect, unanswered }: { correct: number, incorrect: number, unanswered: number }) => {
        const total = correct + incorrect + unanswered;
        if (total === 0) return null;
        const correctPercent = (correct / total) * 100;
        const incorrectPercent = (incorrect / total) * 100;

        return (
            <div className="relative w-36 h-36 mx-auto">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                    {correct > 0 && (
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="10"
                            strokeDasharray={`${correctPercent * 2.51} 251`} strokeLinecap="round" />
                    )}
                    {incorrect > 0 && (
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#ef4444" strokeWidth="10"
                            strokeDasharray={`${incorrectPercent * 2.51} 251`}
                            strokeDashoffset={-correctPercent * 2.51} strokeLinecap="round" />
                    )}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-800">{accuracy}%</span>
                    <span className="text-xs text-gray-500">Accuracy</span>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-6 px-4">
            {/* Header */}
            <header className="max-w-5xl mx-auto mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <span className="text-white font-bold">FP</span>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Free Prep</h1>
                        <p className="text-xs text-gray-500">Test Results</p>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto">
                {/* Score Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6">
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-8 py-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-emerald-100 text-sm mb-1">📚 {subject}</p>
                                <h2 className="text-2xl font-bold mb-1">Test Completed!</h2>
                                <p className="text-emerald-200">{result.totalQuestions} Questions • {testSets.length} Sets</p>
                            </div>
                            <div className={`${gradeInfo.bg} rounded-2xl px-6 py-4 text-center shadow-lg`}>
                                <span className={`text-4xl font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
                                <p className={`text-sm ${gradeInfo.color} font-medium`}>{gradeInfo.message}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-5 divide-x divide-gray-100">
                        <div className="p-5 text-center">
                            <div className="text-3xl font-bold text-emerald-600">{result.totalScore}</div>
                            <div className="text-sm text-gray-500">Score</div>
                        </div>
                        <div className="p-5 text-center">
                            <div className="text-3xl font-bold text-gray-800">{result.totalQuestions}</div>
                            <div className="text-sm text-gray-500">Questions</div>
                        </div>
                        <div className="p-5 text-center">
                            <div className="text-3xl font-bold text-green-600">{result.correct}</div>
                            <div className="text-sm text-gray-500">Correct</div>
                        </div>
                        <div className="p-5 text-center">
                            <div className="text-3xl font-bold text-red-600">{result.incorrect}</div>
                            <div className="text-sm text-gray-500">Wrong</div>
                        </div>
                        <div className="p-5 text-center">
                            <div className="text-3xl font-bold text-gray-400">{result.unanswered}</div>
                            <div className="text-sm text-gray-500">Skipped</div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-6">
                    <div className="flex border-b border-gray-100">
                        {[
                            { id: 'overview', label: '📊 Overview' },
                            { id: 'timing', label: '⏱️ Time Analysis' },
                            { id: 'analysis', label: '📈 Sets' },
                            { id: 'answers', label: '📝 Answers' },
                        ].map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)}
                                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/50'
                                    : 'text-gray-500 hover:text-gray-700'
                                    }`}>
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Performance</h3>
                                    <DonutChart correct={result.correct} incorrect={result.incorrect} unanswered={result.unanswered} />
                                    <div className="flex justify-center gap-4 mt-4 text-sm">
                                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div>Correct</span>
                                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div>Wrong</span>
                                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-gray-300"></div>Skipped</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-emerald-50 rounded-xl p-5 border border-emerald-100">
                                        <p className="text-sm text-emerald-600 font-medium">Attempted</p>
                                        <p className="text-2xl font-bold text-emerald-700">{result.attempted} / {result.totalQuestions}</p>
                                    </div>
                                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                        <p className="text-sm text-blue-600 font-medium">Accuracy</p>
                                        <p className="text-2xl font-bold text-blue-700">{accuracy}%</p>
                                    </div>
                                    <div className="bg-teal-50 rounded-xl p-5 border border-teal-100">
                                        <p className="text-sm text-teal-600 font-medium">Time Spent</p>
                                        <p className="text-2xl font-bold text-teal-700">{Math.floor(totalTimeSpent / 60)}m {totalTimeSpent % 60}s</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Timing Tab */}
                    {activeTab === 'timing' && (
                        <div className="p-6">
                            <div className="grid md:grid-cols-2 gap-8">
                                {/* Time Distribution Chart */}
                                <div className="bg-gray-50 rounded-xl p-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">⏱️ Time Distribution</h3>
                                    <div className="space-y-3">
                                        {timeRanges.map((range) => (
                                            <div key={range.label} className="flex items-center gap-3">
                                                <span className="w-16 text-sm text-gray-600">{range.label}</span>
                                                <div className="flex-1 h-8 bg-gray-200 rounded-lg overflow-hidden">
                                                    <div
                                                        className={`h-full ${range.color} flex items-center justify-end pr-2 transition-all duration-500`}
                                                        style={{ width: `${(range.count / maxTimeCount) * 100}%` }}
                                                    >
                                                        {range.count > 0 && (
                                                            <span className="text-xs font-bold text-white">{range.count}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-4 text-center">
                                        Most questions answered in {timeRanges.reduce((max, r) => r.count > max.count ? r : max, timeRanges[0]).label}
                                    </p>
                                </div>

                                {/* Time Stats */}
                                <div className="space-y-4">
                                    <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-blue-600 font-medium">Average Time</p>
                                                <p className="text-2xl font-bold text-blue-700">{avgTimePerQuestion}s</p>
                                            </div>
                                            <span className="text-3xl">⏱️</span>
                                        </div>
                                        <p className="text-xs text-blue-500 mt-2">per question</p>
                                    </div>

                                    <div className="bg-green-50 rounded-xl p-5 border border-green-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-green-600 font-medium">Fastest Answer</p>
                                                <p className="text-2xl font-bold text-green-700">{fastestQuestion?.timeTaken || 0}s</p>
                                            </div>
                                            <span className="text-3xl">🚀</span>
                                        </div>
                                    </div>

                                    <div className="bg-orange-50 rounded-xl p-5 border border-orange-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-orange-600 font-medium">Slowest Answer</p>
                                                <p className="text-2xl font-bold text-orange-700">{slowestQuestion?.timeTaken || 0}s</p>
                                            </div>
                                            <span className="text-3xl">🐢</span>
                                        </div>
                                    </div>

                                    <div className="bg-purple-50 rounded-xl p-5 border border-purple-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-purple-600 font-medium">Total Time</p>
                                                <p className="text-2xl font-bold text-purple-700">{Math.floor(totalTimeSpent / 60)}m {totalTimeSpent % 60}s</p>
                                            </div>
                                            <span className="text-3xl">⌛</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Time per Question List */}
                            <div className="mt-8">
                                <h4 className="font-semibold text-gray-800 mb-4">Question-wise Time</h4>
                                <div className="grid grid-cols-10 gap-2">
                                    {result.questionAnalysis.slice(0, 60).map((q, i) => {
                                        const time = q.timeTaken || 0;
                                        const bgColor = time <= 15 ? 'bg-green-100 text-green-700' :
                                            time <= 30 ? 'bg-emerald-100 text-emerald-700' :
                                                time <= 45 ? 'bg-yellow-100 text-yellow-700' :
                                                    time <= 60 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700';
                                        return (
                                            <div key={i} className={`${bgColor} rounded-lg p-2 text-center`} title={`Q${i + 1}: ${time}s`}>
                                                <p className="text-xs font-bold">{i + 1}</p>
                                                <p className="text-xs">{time}s</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Analysis Tab */}
                    {activeTab === 'analysis' && (
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-6 text-center">Set-wise Performance</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                                {testSets.map((set) => {
                                    const stats = getSetStats(set.setId);
                                    const percent = stats.total > 0 ? (stats.correct / stats.total) * 100 : 0;
                                    return (
                                        <div key={set.setId} className="bg-gray-50 rounded-xl p-4 text-center border border-gray-100">
                                            <div className="w-14 h-14 mx-auto mb-2 relative">
                                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                                                    <circle cx="50" cy="50" r="40" fill="none" stroke="#10b981" strokeWidth="8"
                                                        strokeDasharray={`${percent * 2.51} 251`} strokeLinecap="round" />
                                                </svg>
                                                <div className="absolute inset-0 flex items-center justify-center font-bold text-gray-800">
                                                    {stats.correct}
                                                </div>
                                            </div>
                                            <p className="font-semibold">Set {set.setId}</p>
                                            <p className="text-xs text-gray-500">{stats.correct}/{stats.total}</p>
                                            <p className="text-xs text-teal-600">{Math.round(stats.totalTime / 60)}m</p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-gray-50 rounded-xl p-6">
                                <h4 className="font-semibold mb-4">💰 Score Breakdown</h4>
                                <div className="space-y-2">
                                    <div className="flex justify-between p-3 bg-green-50 rounded-lg">
                                        <span>✅ {result.correct} Correct × +{testConfig.positiveMarks}</span>
                                        <span className="font-bold text-green-600">+{result.positiveMarks}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-red-50 rounded-lg">
                                        <span>❌ {result.incorrect} Wrong × -{testConfig.negativeMarks}</span>
                                        <span className="font-bold text-red-600">-{result.negativeMarks}</span>
                                    </div>
                                    <div className="flex justify-between p-3 bg-emerald-100 rounded-lg border-2 border-emerald-300">
                                        <span className="font-semibold">🎯 Final Score</span>
                                        <span className="text-xl font-bold text-emerald-600">{result.totalScore} / {result.maxScore}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Answers Tab */}
                    {activeTab === 'answers' && (
                        <div className="p-6">
                            <div className="flex items-center gap-2 mb-6 flex-wrap">
                                <span className="text-sm text-gray-500">Filter:</span>
                                <button onClick={() => setFilterSet('all')}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${filterSet === 'all' ? 'bg-emerald-500 text-white' : 'bg-gray-100'}`}>
                                    All
                                </button>
                                {testSets.map(set => (
                                    <button key={set.setId} onClick={() => setFilterSet(set.setId)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium ${filterSet === set.setId ? 'bg-emerald-500 text-white' : 'bg-gray-100'}`}>
                                        Set {set.setId}
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-3 max-h-[500px] overflow-y-auto">
                                {filteredQuestions.map((analysis, index) => {
                                    const isCorrect = analysis.isCorrect;
                                    const wasAnswered = analysis.userAnswer !== null;

                                    return (
                                        <div key={analysis.questionId}
                                            className={`rounded-xl border-2 overflow-hidden ${!wasAnswered ? 'border-gray-200 bg-gray-50' : isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                                                }`}>
                                            <div className={`px-4 py-2 flex items-center justify-between ${!wasAnswered ? 'bg-gray-100' : isCorrect ? 'bg-green-100' : 'bg-red-100'
                                                }`}>
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-6 h-6 rounded flex items-center justify-center text-white text-xs font-bold ${!wasAnswered ? 'bg-gray-500' : isCorrect ? 'bg-green-500' : 'bg-red-500'
                                                        }`}>{index + 1}</span>
                                                    <span className="text-xs text-gray-500">⏱️ {analysis.timeTaken || 0}s</span>
                                                </div>
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${!wasAnswered ? 'bg-gray-200' : isCorrect ? 'bg-green-200 text-green-700' : 'bg-red-200 text-red-700'
                                                    }`}>
                                                    {!wasAnswered ? 'Skipped' : isCorrect ? '✅ +4' : '❌ -1'}
                                                </span>
                                            </div>
                                            <div className="p-4">
                                                <p className="text-gray-800 text-sm mb-2">{analysis.question}</p>
                                                <div className="flex gap-4 text-sm">
                                                    <span>Your: <strong className={isCorrect || !wasAnswered ? '' : 'text-red-600'}>{analysis.userAnswer || '-'}</strong></span>
                                                    <span>Correct: <strong className="text-green-600">{analysis.correctAnswer}</strong></span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <button onClick={resetTest}
                        className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:opacity-90 shadow-lg flex items-center gap-2">
                        🔄 Take Another Test
                    </button>
                </div>
            </div>
        </div>
    );
}
