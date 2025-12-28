"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { 
    CheckCircle2, XCircle, Award, TrendingUp, TrendingDown, 
    Clock, MessageSquare, AlertTriangle, Download, Home, RotateCcw 
} from 'lucide-react';
import Image from 'next/image';

export default function InterviewReport({ interview, onRestart, onHome }) {
    const { evaluation, interviewerImage, interviewerName, title, topic, questions, responses, status } = interview;

    // Determine readiness color
    const readinessColors = {
        'Ready': 'from-green-600 to-emerald-600',
        'Needs Improvement': 'from-yellow-600 to-orange-600',
        'Not Ready': 'from-red-600 to-pink-600',
    };

    const readinessColor = readinessColors[evaluation.interviewReadiness] || 'from-gray-600 to-gray-700';

    // Calculate percentile scores
    const scoreMetrics = [
        { label: 'Grammar Accuracy', score: evaluation.grammarAccuracy, icon: '📝' },
        { label: 'Fluency', score: evaluation.fluencyScore, icon: '🗣️' },
        { label: 'Topic Relevance', score: evaluation.topicRelevance, icon: '🎯' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-3 mb-4">
                        <Award className="w-12 h-12 text-purple-600" />
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                            Interview Report
                        </h1>
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        {title} - {topic}
                    </p>
                    {status === 'terminated' && (
                        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <span className="text-red-600 dark:text-red-400 font-medium">
                                Interview was terminated early
                            </span>
                        </div>
                    )}
                </motion.div>

                {/* Overall Readiness Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`bg-gradient-to-r ${readinessColor} rounded-2xl shadow-2xl p-8 mb-8 text-white`}
                >
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">Interview Readiness</h2>
                        <div className="text-6xl font-bold mb-2">{evaluation.interviewReadiness}</div>
                        <div className="text-3xl font-semibold mb-4">
                            Overall Score: {evaluation.overallScore}/100
                        </div>
                        <div className="flex justify-center gap-8 text-sm">
                            <div>
                                <CheckCircle2 className="w-6 h-6 mx-auto mb-1" />
                                <div>{evaluation.questionsAnswered} Answered</div>
                            </div>
                            <div>
                                <XCircle className="w-6 h-6 mx-auto mb-1" />
                                <div>{evaluation.questionsMissed} Missed</div>
                            </div>
                            <div>
                                <Clock className="w-6 h-6 mx-auto mb-1" />
                                <div>{evaluation.avgResponseTime}s Avg Time</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                    {/* Interviewer Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
                    >
                        <div className="aspect-square relative rounded-xl overflow-hidden mb-4">
                            <Image
                                src={interviewerImage}
                                alt={interviewerName}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Interviewed by {interviewerName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {questions.length} questions asked
                        </p>
                    </motion.div>

                    {/* Score Metrics */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
                    >
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                            Performance Metrics
                        </h3>
                        <div className="space-y-4">
                            {scoreMetrics.map((metric, index) => (
                                <div key={index}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {metric.icon} {metric.label}
                                        </span>
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                                            {metric.score}/100
                                        </span>
                                    </div>
                                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${metric.score}%` }}
                                            transition={{ delay: 0.5 + index * 0.1, duration: 0.8 }}
                                            className={`h-full rounded-full ${
                                                metric.score >= 80 ? 'bg-green-500' :
                                                metric.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                            }`}
                                        />
                                    </div>
                                </div>
                            ))}
                            
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        ⚠️ Hesitation Frequency
                                    </span>
                                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                                        {evaluation.hesitationFrequency.toFixed(1)} per response
                                    </span>
                                </div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, evaluation.hesitationFrequency * 10)}%` }}
                                        transition={{ delay: 0.8, duration: 0.8 }}
                                        className="h-full rounded-full bg-orange-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Strengths
                            </h3>
                        </div>
                        {evaluation.strengths.length > 0 ? (
                            <ul className="space-y-2">
                                {evaluation.strengths.map((strength, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700 dark:text-gray-300">{strength}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic">
                                No significant strengths identified
                            </p>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <TrendingDown className="w-6 h-6 text-red-600" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Areas for Improvement
                            </h3>
                        </div>
                        {evaluation.weaknesses.length > 0 ? (
                            <ul className="space-y-2">
                                {evaluation.weaknesses.map((weakness, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                        <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700 dark:text-gray-300">{weakness}</span>
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 italic">
                                No major weaknesses identified
                            </p>
                        )}
                    </motion.div>
                </div>

                {/* Suggestions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8"
                >
                    <div className="flex items-center gap-2 mb-4">
                        <MessageSquare className="w-6 h-6 text-blue-600" />
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                            Improvement Suggestions
                        </h3>
                    </div>
                    <ol className="space-y-2">
                        {evaluation.suggestions.map((suggestion, index) => (
                            <li key={index} className="flex items-start gap-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full flex items-center justify-center text-sm font-bold">
                                    {index + 1}
                                </span>
                                <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                            </li>
                        ))}
                    </ol>
                </motion.div>

                {/* Question-wise Performance */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8"
                >
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        Question-wise Performance
                    </h3>
                    <div className="space-y-4">
                        {questions.map((question, index) => {
                            const response = responses.find(r => r.questionId === question.questionId);
                            return (
                                <div key={question.questionId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                    Q{index + 1}:
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                                    question.difficulty === 'easy' 
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                        : question.difficulty === 'medium'
                                                        ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                                        : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                                }`}>
                                                    {question.difficulty}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                                                {question.questionText}
                                            </p>
                                        </div>
                                        {response?.answered ? (
                                            <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 ml-2" />
                                        ) : (
                                            <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 ml-2" />
                                        )}
                                    </div>
                                    {response?.answered ? (
                                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Grammar:</span>
                                                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                                        {response.grammarScore}/100
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Fluency:</span>
                                                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                                        {response.fluencyScore}/100
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Relevance:</span>
                                                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                                        {response.relevanceScore}/100
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500 dark:text-gray-400">Time:</span>
                                                    <span className="ml-1 font-medium text-gray-900 dark:text-white">
                                                        {response.responseTime}s
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                            <p className="text-xs text-red-600 dark:text-red-400">
                                                No response provided
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-wrap gap-4 justify-center"
                >
                    <button
                        onClick={onRestart}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Start New Interview
                    </button>
                    <button
                        onClick={onHome}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all shadow-lg"
                    >
                        <Home className="w-5 h-5" />
                        Go to Dashboard
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
