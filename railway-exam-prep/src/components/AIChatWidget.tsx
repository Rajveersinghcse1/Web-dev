'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MessageCircle,
    X,
    Send,
    Bot,
    User,
    Minimize2,
    Maximize2,
    Sparkles
} from 'lucide-react';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
}

const quickQuestions = [
    "Explain Railway zones",
    "NTPC syllabus",
    "Math shortcuts",
    "Current Affairs tips",
];

export default function AIChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const generateResponse = async (userMessage: string): Promise<string> => {
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
            console.error('Gemini API error:', error);
            return "I couldn't process your request. Please ensure the API is configured correctly.";
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const userMsg: Message = {
            id: `msg_${Date.now()}`,
            role: 'user',
            content: inputValue.trim(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsLoading(true);

        const response = await generateResponse(userMsg.content);

        const assistantMsg: Message = {
            id: `msg_${Date.now() + 1}`,
            role: 'assistant',
            content: response,
        };

        setMessages(prev => [...prev, assistantMsg]);
        setIsLoading(false);
    };

    return (
        <>
            {/* Chat Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/30 flex items-center justify-center hover:scale-110 transition-transform z-50"
                    >
                        <MessageCircle className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[var(--bg-primary)]"></span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className={`fixed bottom-6 right-6 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden ${isMinimized ? 'w-72 h-14' : 'w-96 h-[500px]'
                            }`}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 p-3 flex items-center justify-between border-b border-slate-700">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                    <Bot className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="font-semibold text-sm">RailwayPrep AI</div>
                                    <div className="text-xs text-green-400 flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                                        Gemini Powered
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setIsMinimized(!isMinimized)}
                                    className="p-1.5 hover:bg-slate-800 rounded-lg"
                                >
                                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-slate-800 rounded-lg"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {!isMinimized && (
                            <>
                                {/* Messages */}
                                <div className="h-[360px] overflow-y-auto p-3 space-y-3">
                                    {messages.length === 0 ? (
                                        <div className="text-center py-6">
                                            <Sparkles className="w-10 h-10 text-purple-400 mx-auto mb-3" />
                                            <p className="text-sm text-slate-400 mb-4">Ask me anything about Railway exams!</p>
                                            <div className="flex flex-wrap justify-center gap-2">
                                                {quickQuestions.map((q, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setInputValue(q)}
                                                        className="text-xs px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 transition"
                                                    >
                                                        {q}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                                            >
                                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-500' : 'bg-gradient-to-br from-purple-500 to-blue-500'
                                                    }`}>
                                                    {msg.role === 'user' ? (
                                                        <User className="w-4 h-4 text-white" />
                                                    ) : (
                                                        <Bot className="w-4 h-4 text-white" />
                                                    )}
                                                </div>
                                                <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${msg.role === 'user'
                                                        ? 'bg-blue-500 text-white rounded-tr-none'
                                                        : 'bg-slate-800 rounded-tl-none'
                                                    }`}>
                                                    <div
                                                        dangerouslySetInnerHTML={{
                                                            __html: msg.content
                                                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                                .replace(/\n/g, '<br>')
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))
                                    )}

                                    {isLoading && (
                                        <div className="flex gap-2">
                                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                                <Bot className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="bg-slate-800 rounded-xl rounded-tl-none px-3 py-2">
                                                <div className="flex gap-1">
                                                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                                    <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>

                                {/* Input */}
                                <div className="p-3 border-t border-slate-700">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                            placeholder="Ask a question..."
                                            className="flex-1 text-sm rounded-xl"
                                        />
                                        <button
                                            onClick={handleSend}
                                            disabled={!inputValue.trim() || isLoading}
                                            className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-blue-500 text-white disabled:opacity-50"
                                        >
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
