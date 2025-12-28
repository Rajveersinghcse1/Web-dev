"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Mic, Users, Award, TrendingUp, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function MockInterviewCard() {
    const router = useRouter();

    const features = [
        { icon: Mic, label: 'AI-Powered Questions', color: 'text-blue-600' },
        { icon: Users, label: '3 Interviewer Personas', color: 'text-purple-600' },
        { icon: Award, label: 'Detailed Evaluation', color: 'text-green-600' },
        { icon: TrendingUp, label: 'Track Progress', color: 'text-orange-600' },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl overflow-hidden cursor-pointer"
            onClick={() => router.push('/mock-interview')}
        >
            <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                            <Mic className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                Mock Interview
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Practice with AI interviewers
                            </p>
                        </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs font-bold rounded-full">
                        NEW
                    </span>
                </div>

                {/* Description */}
                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                    Experience realistic interview simulations with AI-generated questions, 
                    automatic speech analysis, and comprehensive performance evaluation.
                </p>

                {/* Features Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <feature.icon className={`w-4 h-4 ${feature.color}`} />
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                {feature.label}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Interviewer Preview */}
                <div className="mb-6">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Choose Your Interviewer:
                    </p>
                    <div className="flex gap-2">
                        {['Dell', 'Lafi', 'Rajveer'].map((name) => (
                            <div key={name} className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-white dark:border-gray-700">
                                <Image
                                    src={`/Interview image/${name}.jpg`}
                                    alt={name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">10</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Questions</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">30s</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Per Answer</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">AI</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Powered</div>
                    </div>
                </div>

                {/* CTA Button */}
                <button
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg flex items-center justify-center gap-2"
                    onClick={(e) => {
                        e.stopPropagation();
                        router.push('/mock-interview');
                    }}
                >
                    Start Mock Interview
                    <ArrowRight className="w-5 h-5" />
                </button>
            </div>

            {/* Bottom Badge */}
            <div className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center">
                <p className="text-sm font-medium">
                    🎯 Get detailed feedback on grammar, fluency, and confidence
                </p>
            </div>
        </motion.div>
    );
}
