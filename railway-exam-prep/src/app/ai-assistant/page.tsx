'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Send,
    Bot,
    User,
    Sparkles,
    BookOpen,
    Brain,
    Target,
    Lightbulb,
    Copy,
    Check,
    RefreshCw,
} from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const suggestedQuestions = [
    "Explain the Indian Railway zones and their headquarters",
    "What is the difference between ALP and Technician exams?",
    "Give me tips for solving reasoning questions faster",
    "What are the most important topics for NTPC exam?",
    "Explain the concept of simple and compound interest",
    "What is the syllabus for RRB Group D exam?",
];

const features = [
    { icon: Brain, title: 'Doubt Solving', desc: 'Get instant answers to your questions' },
    { icon: BookOpen, title: 'Concept Explanation', desc: 'Understand topics in depth' },
    { icon: Target, title: 'Exam Strategy', desc: 'Get personalized preparation tips' },
    { icon: Lightbulb, title: 'Quick Tips', desc: 'Learn shortcuts and tricks' },
];

export default function AIAssistantPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateAIResponse = async (userMessage: string): Promise<string> => {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    history: messages.map(m => ({ role: m.role, content: m.content })),
                }),
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error calling Gemini API:', error);
            return "I'm sorry, I couldn't process your request. Please make sure the Gemini API is configured correctly by copying `env-template.txt` to `.env.local` and restarting the server.";
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMessage: Message = {
            id: `msg_${Date.now()}`,
            role: 'user',
            content: inputValue.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await generateAIResponse(userMessage.content);

            const assistantMessage: Message = {
                id: `msg_${Date.now() + 1}`,
                role: 'assistant',
                content: response,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Error generating response:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleSuggestedQuestion = (question: string) => {
        setInputValue(question);
        inputRef.current?.focus();
    };

    const copyToClipboard = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const clearChat = () => {
        setMessages([]);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="p-2 hover:bg-slate-800 rounded-lg transition">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                    <Bot className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-lg font-bold">RailwayPrep AI</h1>
                                    <p className="text-xs text-green-400 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                        Online • Powered by Gemini 2.5 Flash
                                    </p>
                                </div>
                            </div>
                        </div>
                        {messages.length > 0 && (
                            <button
                                onClick={clearChat}
                                className="p-2 hover:bg-slate-800 rounded-lg transition text-slate-400 hover:text-white"
                            >
                                <RefreshCw className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    {messages.length === 0 ? (
                        /* Welcome Screen */
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-12"
                        >
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
                                <Sparkles className="w-10 h-10 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Hi! I'm your Railway Exam AI Assistant</h2>
                            <p className="text-slate-400 mb-8 max-w-md mx-auto">
                                Ask me anything about Railway exams, syllabus, preparation tips, or any concept you want to understand.
                            </p>

                            {/* Features */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                {features.map((feature) => (
                                    <div key={feature.title} className="glass-card p-4 text-center">
                                        <feature.icon className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                                        <h3 className="font-medium text-sm">{feature.title}</h3>
                                        <p className="text-xs text-slate-500">{feature.desc}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Suggested Questions */}
                            <div>
                                <h3 className="text-sm text-slate-400 mb-3">Try asking:</h3>
                                <div className="flex flex-wrap justify-center gap-2">
                                    {suggestedQuestions.map((question, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSuggestedQuestion(question)}
                                            className="px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700 text-sm hover:bg-slate-800 hover:border-purple-500/50 transition"
                                        >
                                            {question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        /* Messages */
                        <div className="space-y-6">
                            <AnimatePresence>
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${message.role === 'user'
                                                ? 'bg-blue-500'
                                                : 'bg-gradient-to-br from-purple-500 to-blue-500'
                                            }`}>
                                            {message.role === 'user' ? (
                                                <User className="w-5 h-5 text-white" />
                                            ) : (
                                                <Bot className="w-5 h-5 text-white" />
                                            )}
                                        </div>
                                        <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                                            <div className={`inline-block max-w-full rounded-2xl px-4 py-3 ${message.role === 'user'
                                                    ? 'bg-blue-500 text-white rounded-tr-none'
                                                    : 'glass-card rounded-tl-none'
                                                }`}>
                                                {message.role === 'assistant' ? (
                                                    <div className="prose prose-invert prose-sm max-w-none">
                                                        <div
                                                            dangerouslySetInnerHTML={{
                                                                __html: message.content
                                                                    .replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-blue-400 mt-4 mb-2">$1</h2>')
                                                                    .replace(/^### (.*$)/gim, '<h3 class="font-bold text-purple-400 mt-3 mb-1">$1</h3>')
                                                                    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
                                                                    .replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1 rounded text-green-400">$1</code>')
                                                                    .replace(/```([\s\S]*?)```/g, '<pre class="bg-slate-800 p-3 rounded-lg my-2 overflow-x-auto"><code>$1</code></pre>')
                                                                    .replace(/\n/g, '<br>')
                                                            }}
                                                        />
                                                    </div>
                                                ) : (
                                                    <p>{message.content}</p>
                                                )}
                                            </div>
                                            {message.role === 'assistant' && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <button
                                                        onClick={() => copyToClipboard(message.content, message.id)}
                                                        className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition"
                                                    >
                                                        {copiedId === message.id ? (
                                                            <Check className="w-4 h-4 text-green-400" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                    <span className="text-xs text-slate-600">
                                                        {message.timestamp.toLocaleTimeString()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Loading indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-4"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                        <Bot className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="glass-card rounded-2xl rounded-tl-none px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                            <span className="ml-2 text-sm text-slate-400">Gemini is thinking...</span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </div>
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-800 bg-slate-900/80 backdrop-blur p-4">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-end gap-4">
                        <div className="flex-1 relative">
                            <textarea
                                ref={inputRef}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask anything about Railway exams..."
                                className="w-full resize-none rounded-2xl pr-12 min-h-[52px] max-h-[150px]"
                                rows={1}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading}
                                className="absolute right-2 bottom-2 p-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                    <p className="text-xs text-slate-600 text-center mt-2">
                        Powered by Gemini 2.5 Flash • Responses may take a few seconds
                    </p>
                </div>
            </div>
        </div>
    );
}
