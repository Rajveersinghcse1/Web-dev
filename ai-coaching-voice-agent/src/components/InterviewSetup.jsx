"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import InterviewQuestionGenerator from '@/services/interviewQuestionGenerator';
import toast from 'react-hot-toast';

const INTERVIEWERS = [
    { name: 'Dell', image: '/Interview image/Dell.jpg', role: 'HR Manager', specialty: 'Behavioral & Soft Skills' },
    { name: 'Lafi', image: '/Interview image/Lafi.jpg', role: 'Technical Lead', specialty: 'Technical & Architecture' },
    { name: 'Rajveer', image: '/Interview image/Rajveer.jpg', role: 'Senior Engineer', specialty: 'Coding & Problem Solving' }
];

export default function InterviewSetup({ onStartInterview }) {
    const [title, setTitle] = useState('');
    const [topic, setTopic] = useState('');
    const [selectedInterviewer, setSelectedInterviewer] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};
        
        // Validate title
        if (!title.trim()) {
            newErrors.title = 'Interview title is required';
        } else if (title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        }

        // Validate topic
        const questionGenerator = new InterviewQuestionGenerator();
        const topicError = questionGenerator.getValidationError(topic);
        if (topicError) {
            newErrors.topic = topicError;
        }

        // Validate interviewer selection
        if (!selectedInterviewer) {
            newErrors.interviewer = 'Please select an interviewer';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleStartInterview = async () => {
        console.log('🎯 Mock Interview Setup: Starting interview...');
        console.log('📋 Interview Configuration:', {
            title: title.trim(),
            topic: topic.trim(),
            interviewer: selectedInterviewer?.name
        });
        
        if (!validateForm()) {
            console.warn('⚠️ Mock Interview Setup: Validation failed');
            toast.error('Please fix the errors before starting');
            return;
        }

        setIsGenerating(true);
        console.log('🔄 Mock Interview Setup: Generating questions...');

        try {
            // Generate questions using Gemini AI
            const generator = new InterviewQuestionGenerator();
            console.log('📡 Mock Interview Setup: Calling Gemini API for question generation...');
            const questions = await generator.generateQuestions(topic);

            console.log(`✅ Mock Interview Setup: Received ${questions.length} questions`);
            
            if (questions.length !== 10) {
                throw new Error('Failed to generate exactly 10 questions');
            }

            console.log('🚀 Mock Interview Setup: Starting interview with data:', {
                questionsCount: questions.length,
                interviewer: selectedInterviewer.name,
                interviewerImage: selectedInterviewer.image
            });

            // Start interview with generated data
            await onStartInterview({
                title: title.trim(),
                topic: topic.trim(),
                interviewer: selectedInterviewer,
                questions
            });

            console.log('✅ Mock Interview Setup: Interview started successfully');

        } catch (error) {
            console.error('❌ Mock Interview Setup: Error occurred:', error);
            console.error('Error details:', {
                message: error.message,
                name: error.name,
                stack: error.stack?.split('\n').slice(0, 3)
            });
            toast.error(error.message || 'Failed to generate questions. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        Mock Interview Setup
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-300">
                        Configure your personalized interview experience
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8"
                >
                    {/* Interview Details */}
                    <div className="space-y-6 mb-8">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Interview Title *
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    setErrors(prev => ({ ...prev, title: null }));
                                }}
                                placeholder="e.g., Python Developer Position"
                                className={`w-full px-4 py-3 rounded-lg border ${
                                    errors.title 
                                        ? 'border-red-500 focus:border-red-500' 
                                        : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                            />
                            {errors.title && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Interview Topic *
                            </label>
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => {
                                    setTopic(e.target.value);
                                    setErrors(prev => ({ ...prev, topic: null }));
                                }}
                                placeholder="e.g., Python Libraries, React Hooks, Data Structures"
                                className={`w-full px-4 py-3 rounded-lg border ${
                                    errors.topic 
                                        ? 'border-red-500 focus:border-red-500' 
                                        : 'border-gray-300 dark:border-gray-600 focus:border-blue-500'
                                } bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20`}
                            />
                            {errors.topic && (
                                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4" />
                                    {errors.topic}
                                </p>
                            )}
                            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                                Be specific for better question generation (min. 3 characters)
                            </p>
                        </div>
                    </div>

                    {/* Interviewer Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                            Select Your Interviewer *
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {INTERVIEWERS.map((interviewer) => (
                                <motion.div
                                    key={interviewer.name}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => {
                                        setSelectedInterviewer(interviewer);
                                        setErrors(prev => ({ ...prev, interviewer: null }));
                                    }}
                                    className={`relative cursor-pointer rounded-xl overflow-hidden border-4 transition-all ${
                                        selectedInterviewer?.name === interviewer.name
                                            ? 'border-blue-500 shadow-lg shadow-blue-500/50'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                                    }`}
                                >
                                    <div className="aspect-square relative bg-gradient-to-br from-blue-100 to-purple-100 dark:from-gray-700 dark:to-gray-800">
                                        <Image
                                            src={interviewer.image}
                                            alt={interviewer.name}
                                            fill
                                            className="object-cover"
                                            onError={(e) => {
                                                // Fallback to avatar placeholder if image fails to load
                                                e.target.style.display = 'none';
                                                const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                                                if (fallback) fallback.style.display = 'flex';
                                            }}
                                        />
                                        <div 
                                            className="avatar-fallback absolute inset-0 hidden items-center justify-center"
                                            style={{ display: 'none' }}
                                        >
                                            <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center">
                                                <span className="text-5xl text-blue-600 dark:text-blue-400 font-bold">
                                                    {interviewer.name.charAt(0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                                        <h3 className="text-white font-bold text-lg">{interviewer.name}</h3>
                                        <p className="text-gray-200 text-sm">{interviewer.role}</p>
                                        <p className="text-gray-300 text-xs mt-1">{interviewer.specialty}</p>
                                    </div>
                                    {selectedInterviewer?.name === interviewer.name && (
                                        <div className="absolute top-4 right-4 bg-blue-500 rounded-full p-2">
                                            <CheckCircle2 className="w-6 h-6 text-white" />
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                        {errors.interviewer && (
                            <p className="mt-4 text-sm text-red-600 flex items-center gap-1">
                                <AlertCircle className="w-4 h-4" />
                                {errors.interviewer}
                            </p>
                        )}
                    </div>
                </motion.div>

                {/* Start Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center"
                >
                    <button
                        onClick={handleStartInterview}
                        disabled={isGenerating}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Generating Interview Questions...
                            </>
                        ) : (
                            <>
                                <Mic className="w-5 h-5" />
                                Start Mock Interview
                            </>
                        )}
                    </button>

                    {isGenerating && (
                        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                            AI is generating 10 unique questions for your interview...
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
