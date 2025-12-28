"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Loader2, AlertCircle, Clock, MessageSquare } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import SpeechAnalyzer from '@/services/speechAnalyzer';

const RESPONSE_TIMEOUT = 30; // 30 seconds
const EARLY_TERMINATION_THRESHOLD = 3; // Stop after 3 no-responses

// TTS Service Configuration
const TTS_ENDPOINTS = [
    process.env.NEXT_PUBLIC_TTS_URL || 'http://localhost:5000',
    // Add production TTS endpoint when available
];

export default function InterviewExecution({ 
    interviewData, 
    sessionId, 
    onComplete,
    onUpdateResponse,
    onUpdateQuestionIndex 
}) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isPlayingTTS, setIsPlayingTTS] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [timer, setTimer] = useState(RESPONSE_TIMEOUT);
    const [transcription, setTranscription] = useState('');
    const [responses, setResponses] = useState([]);
    const [noResponseCount, setNoResponseCount] = useState(0);
    const [isTerminated, setIsTerminated] = useState(false);

    const recognitionRef = useRef(null);
    const timerIntervalRef = useRef(null);
    const audioRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const responseStartTimeRef = useRef(null);

    const currentQuestion = interviewData.questions[currentQuestionIndex];
    const totalQuestions = interviewData.questions.length;
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'en-US';

                recognitionRef.current.onresult = (event) => {
                    let finalTranscript = '';
                    let interimTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            finalTranscript += transcript + ' ';
                        } else {
                            interimTranscript += transcript;
                        }
                    }

                    setTranscription(prev => prev + finalTranscript);
                };

                recognitionRef.current.onerror = (event) => {
                    console.error('Speech recognition error:', event.error);
                    if (event.error === 'no-speech') {
                        // Continue listening
                        return;
                    }
                    toast.error('Speech recognition error. Please check your microphone.');
                };
            } else {
                toast.error('Speech recognition not supported in this browser');
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    // Auto-play TTS when question loads
    useEffect(() => {
        if (currentQuestion && !isTerminated) {
            console.log(`📢 Interview Execution: Loading question ${currentQuestionIndex + 1}/${totalQuestions}`);
            console.log(`❓ Question: "${currentQuestion.questionText}"`);
            console.log(`👤 Interviewer: ${interviewData.interviewer.name}`);
            console.log(`🖼️  Interviewer Image: ${interviewData.interviewer.image}`);
            playQuestionTTS();
        }
    }, [currentQuestionIndex]);

    const playQuestionTTS = async () => {
        setIsPlayingTTS(true);
        
        // Try each TTS endpoint in order
        for (const endpoint of TTS_ENDPOINTS) {
            if (!endpoint) {
                // No endpoint available, skip TTS
                console.warn('⚠️ No TTS endpoint configured - skipping audio');
                toast('Read the question aloud', { icon: '📖' });
                setIsPlayingTTS(false);
                startListening();
                return;
            }
            
            try {
                const response = await fetch(`${endpoint}/synthesize`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: currentQuestion.questionText }),
                    signal: AbortSignal.timeout(5000) // 5 second timeout
                });

                if (!response.ok) {
                    throw new Error(`TTS service returned ${response.status}`);
                }

                const audioBlob = await response.blob();
                const audioUrl = URL.createObjectURL(audioBlob);

                audioRef.current = new Audio(audioUrl);
                audioRef.current.onended = () => {
                    setIsPlayingTTS(false);
                    startListening();
                };

                await audioRef.current.play();
                return; // Success - exit function

            } catch (error) {
                console.warn(`⚠️ TTS endpoint ${endpoint} failed:`, error.message);
                // Continue to next endpoint
            }
        }
        
        // All endpoints failed
        console.error('❌ All TTS endpoints failed');
        toast.info('Please read the question and start speaking');
        setIsPlayingTTS(false);
        startListening();
    };

    const startListening = async () => {
        setIsListening(true);
        setTranscription('');
        setTimer(RESPONSE_TIMEOUT);
        responseStartTimeRef.current = Date.now();

        // Start recording
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.start();
        } catch (error) {
            console.error('Microphone access denied:', error);
            toast.error('Microphone access denied');
        }

        // Start speech recognition
        if (recognitionRef.current) {
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error('Recognition start error:', error);
            }
        }

        // Start countdown timer
        timerIntervalRef.current = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    handleNoResponse();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const stopListening = () => {
        setIsListening(false);

        // Stop timer
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }

        // Stop recording
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }

        // Stop recognition
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (error) {
                console.error('Recognition stop error:', error);
            }
        }
    };

    const handleNoResponse = async () => {
        stopListening();

        const newNoResponseCount = noResponseCount + 1;
        setNoResponseCount(newNoResponseCount);

        // Save no-response
        const responseData = {
            questionId: currentQuestion.questionId,
            answered: false,
            responseTime: RESPONSE_TIMEOUT,
        };

        setResponses(prev => [...prev, responseData]);
        await onUpdateResponse(sessionId, responseData);

        toast.error('No response recorded');

        // Check for early termination
        if (newNoResponseCount >= EARLY_TERMINATION_THRESHOLD) {
            handleEarlyTermination();
            return;
        }

        // Move to next question
        setTimeout(() => {
            moveToNextQuestion();
        }, 1500);
    };

    const handleSubmitResponse = async () => {
        if (!transcription.trim()) {
            handleNoResponse();
            return;
        }

        stopListening();
        setIsProcessing(true);

        try {
            const responseTime = Math.floor((Date.now() - responseStartTimeRef.current) / 1000);

            // Analyze speech
            const analyzer = new SpeechAnalyzer();
            const analysis = await analyzer.analyzeResponse(transcription, currentQuestion.questionText);

            // Save audio blob (in real app, upload to storage)
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(audioBlob); // Temporary URL

            const responseData = {
                questionId: currentQuestion.questionId,
                audioUrl,
                transcription,
                responseTime,
                answered: true,
                ...analysis,
            };

            setResponses(prev => [...prev, responseData]);
            setNoResponseCount(0); // Reset on successful response
            
            await onUpdateResponse(sessionId, responseData);

            toast.success('Response recorded successfully');

            // Move to next question
            setTimeout(() => {
                moveToNextQuestion();
            }, 1500);

        } catch (error) {
            console.error('Response processing error:', error);
            toast.error('Failed to process response');
        } finally {
            setIsProcessing(false);
        }
    };

    const moveToNextQuestion = () => {
        if (currentQuestionIndex < totalQuestions - 1) {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);
            onUpdateQuestionIndex(sessionId, nextIndex);
        } else {
            completeInterview();
        }
    };

    const handleEarlyTermination = () => {
        setIsTerminated(true);
        toast.error('Interview ended due to insufficient responses');
        
        setTimeout(() => {
            completeInterviewWithStatus('terminated');
        }, 2000);
    };

    const completeInterview = () => {
        completeInterviewWithStatus('completed');
    };

    const completeInterviewWithStatus = async (status) => {
        setIsProcessing(true);

        try {
            // Generate evaluation
            const analyzer = new SpeechAnalyzer();
            const evaluation = await analyzer.generateEvaluation(responses, totalQuestions);

            await onComplete(sessionId, status, evaluation);

        } catch (error) {
            console.error('Interview completion error:', error);
            toast.error('Failed to complete interview');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isTerminated) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center p-8"
                >
                    <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        Interview Terminated
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300">
                        Interview ended due to insufficient responses
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Generating your evaluation report...
                    </p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Question {currentQuestionIndex + 1} of {totalQuestions}
                        </span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {Math.round(progress)}%
                        </span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Interviewer Panel */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sticky top-8"
                        >
                            {/* Interviewer Image - Prominently Displayed */}
                            <div className="aspect-square relative rounded-xl overflow-hidden mb-4 border-4 border-blue-500 shadow-lg">
                                <Image
                                    src={interviewData.interviewer.image}
                                    alt={interviewData.interviewer.name}
                                    fill
                                    className="object-cover"
                                    priority
                                    onError={(e) => {
                                        console.error('Failed to load interviewer image:', interviewData.interviewer.image);
                                        e.target.style.display = 'none';
                                    }}
                                />
                                {/* Fallback Avatar */}
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500">
                                    <span className="text-6xl font-bold text-white">
                                        {interviewData.interviewer.name.charAt(0)}
                                    </span>
                                </div>
                            </div>
                            {/* Live Indicator */}
                            <div className="mb-4 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-full animate-pulse">
                                <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
                                <span className="font-semibold text-sm">INTERVIEW IN PROGRESS</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                {interviewData.interviewer.name}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {interviewData.interviewer.role}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                                {interviewData.interviewer.specialty}
                            </p>

                            {/* Status Indicators */}
                            <div className="mt-6 space-y-3">
                                {isPlayingTTS && (
                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Speaking...</span>
                                    </div>
                                )}
                                {isListening && (
                                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                        <Mic className="w-4 h-4 animate-pulse" />
                                        <span className="text-sm">Listening...</span>
                                    </div>
                                )}
                                {isProcessing && (
                                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Processing...</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Question & Response Panel */}
                    <div className="lg:col-span-2">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={currentQuestionIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8"
                            >
                                {/* Question */}
                                <div className="mb-8">
                                    <div className="flex items-center gap-2 mb-4">
                                        <MessageSquare className="w-5 h-5 text-blue-600" />
                                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                                            Question {currentQuestionIndex + 1}
                                        </span>
                                        <span className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${
                                            currentQuestion.difficulty === 'easy' 
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                : currentQuestion.difficulty === 'medium'
                                                ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                                                : 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                        }`}>
                                            {currentQuestion.difficulty}
                                        </span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">
                                        {currentQuestion.questionText}
                                    </h2>
                                </div>

                                {/* Timer */}
                                {isListening && (
                                    <div className="mb-6">
                                        <div className="flex items-center justify-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                                            <Clock className={`w-6 h-6 ${timer <= 10 ? 'text-red-600 animate-pulse' : 'text-blue-600'}`} />
                                            <span className={`text-3xl font-bold ${timer <= 10 ? 'text-red-600' : 'text-blue-600'}`}>
                                                {timer}s
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Transcription */}
                                {isListening && (
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Your Response
                                        </label>
                                        <div className="min-h-[150px] p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                                            <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                                                {transcription || 'Start speaking...'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {isListening && (
                                    <div className="flex gap-4">
                                        <button
                                            onClick={handleSubmitResponse}
                                            disabled={!transcription.trim() || isProcessing}
                                            className="flex-1 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                                        >
                                            Submit Response
                                        </button>
                                    </div>
                                )}

                                {/* Loading State */}
                                {(isPlayingTTS || isProcessing) && (
                                    <div className="text-center py-12">
                                        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                                        <p className="text-gray-600 dark:text-gray-400">
                                            {isPlayingTTS ? 'Interviewer is speaking...' : 'Processing your response...'}
                                        </p>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
}
