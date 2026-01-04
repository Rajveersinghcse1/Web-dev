'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Sparkles,
    FileText,
    Download,
    Share2,
    Bookmark,
    BookOpen,
    Brain,
    Target,
    Clock,
    ChevronDown,
    Check,
    Loader2,
    Copy,
    Printer,
    Star,
    TrendingUp,
    Zap
} from 'lucide-react';

const examCategories = [
    { id: 'ntpc', name: 'RRB NTPC', icon: '🚂' },
    { id: 'alp', name: 'RRB ALP', icon: '🚃' },
    { id: 'group-d', name: 'RRB Group D', icon: '🔧' },
    { id: 'je', name: 'RRB JE', icon: '⚙️' },
];

const subjects = [
    { id: 'railway-gk', name: 'Railway GK', topics: ['Railway Zones', 'Railway History', 'Train Types', 'Projects', 'Officials'] },
    { id: 'general-awareness', name: 'General Awareness', topics: ['Indian History', 'Geography', 'Polity', 'Economy', 'Science'] },
    { id: 'mathematics', name: 'Mathematics', topics: ['Number System', 'Algebra', 'Geometry', 'Percentage', 'Profit & Loss'] },
    { id: 'reasoning', name: 'Reasoning', topics: ['Analogy', 'Series', 'Coding-Decoding', 'Blood Relations', 'Direction'] },
    { id: 'current-affairs', name: 'Current Affairs', topics: ['National', 'International', 'Sports', 'Awards', 'Economy'] },
];

interface NotesSection {
    title: string;
    content: string;
}

interface GeneratedNotes {
    title: string;
    lastUpdated: string;
    readTime: string;
    sections: NotesSection[];
    rawContent: string;
}

export default function SmartNotesPage() {
    const [selectedExam, setSelectedExam] = useState('ntpc');
    const [selectedSubject, setSelectedSubject] = useState('railway-gk');
    const [isGenerating, setIsGenerating] = useState(false);
    const [showNotes, setShowNotes] = useState(false);
    const [expandedSection, setExpandedSection] = useState<number>(0);
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [notes, setNotes] = useState<GeneratedNotes | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateNotes = async () => {
        setIsGenerating(true);
        setError(null);

        try {
            const response = await fetch('/api/generate-notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    exam: examCategories.find(e => e.id === selectedExam)?.name,
                    subject: subjects.find(s => s.id === selectedSubject)?.name,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate notes');
            }

            const data = await response.json();

            if (data.error) {
                throw new Error(data.error);
            }

            // Parse the raw content into sections
            const content = data.rawContent || '';
            const sectionMatches = content.split(/^##\s+/gm).filter(Boolean);

            const sections: NotesSection[] = sectionMatches.map((section: string) => {
                const lines = section.split('\n');
                const title = lines[0]?.trim() || 'Section';
                const sectionContent = lines.slice(1).join('\n').trim();
                return { title, content: sectionContent };
            });

            setNotes({
                title: data.title || `${subjects.find(s => s.id === selectedSubject)?.name} - Complete Notes`,
                lastUpdated: data.lastUpdated || new Date().toLocaleDateString('en-IN'),
                readTime: data.readTime || `${Math.ceil(content.length / 1000)} min`,
                sections: sections.length > 0 ? sections : [{ title: 'Study Notes', content }],
                rawContent: content,
            });

            setShowNotes(true);
        } catch (err) {
            console.error('Error generating notes:', err);
            setError('Failed to generate notes. Please make sure the Gemini API is configured correctly.');
        } finally {
            setIsGenerating(false);
        }
    };

    const formatContent = (content: string) => {
        return content
            .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold text-purple-400 mt-4 mb-2">$1</h3>')
            .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`([^`]+)`/g, '<code class="bg-slate-800 px-1 rounded text-green-400">$1</code>')
            .replace(/^\- (.*$)/gim, '<li class="ml-4">• $1</li>')
            .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 list-decimal">$1</li>')
            .replace(/\n\n/g, '</p><p class="my-2">')
            .replace(/\n/g, '<br>');
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur border-b border-slate-800 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/study" className="p-2 hover:bg-slate-800 rounded-lg transition">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <div>
                                <h1 className="text-xl font-bold flex items-center gap-2">
                                    <Sparkles className="w-6 h-6 text-purple-500" />
                                    AI Smart Notes Generator
                                </h1>
                                <p className="text-sm text-slate-400">Generate comprehensive study notes with Gemini AI</p>
                            </div>
                        </div>
                        {showNotes && notes && (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setIsBookmarked(!isBookmarked)}
                                    className={`p-2 rounded-lg transition ${isBookmarked ? 'bg-yellow-500/20 text-yellow-400' : 'hover:bg-slate-800'}`}
                                >
                                    <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                                </button>
                                <button className="p-2 hover:bg-slate-800 rounded-lg">
                                    <Printer className="w-5 h-5" />
                                </button>
                                <button className="p-2 hover:bg-slate-800 rounded-lg">
                                    <Share2 className="w-5 h-5" />
                                </button>
                                <button className="btn-primary flex items-center gap-2">
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                {!showNotes ? (
                    /* Configuration Panel */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* AI Info Card */}
                        <div className="glass-card p-6 mb-8 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                                    <Brain className="w-8 h-8 text-white" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-xl font-bold mb-2">AI-Powered Deep Analysis</h2>
                                    <p className="text-slate-400 mb-4">
                                        Gemini AI analyzes exam patterns, previous year questions, and expert study materials
                                        to generate comprehensive, exam-focused notes tailored for your success.
                                    </p>
                                    <div className="flex flex-wrap gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <TrendingUp className="w-4 h-4 text-green-400" />
                                            <span>PYQ Trend Analysis</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Target className="w-4 h-4 text-blue-400" />
                                            <span>Exam-Focused Content</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Star className="w-4 h-4 text-yellow-400" />
                                            <span>Important Topics Highlighted</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Zap className="w-4 h-4 text-orange-400" />
                                            <span>Quick Revision Points</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="glass-card p-4 mb-6 border border-red-500/50 bg-red-500/10 text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Select Exam */}
                            <div className="glass-card p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-400" />
                                    Select Exam
                                </h3>
                                <div className="space-y-2">
                                    {examCategories.map(exam => (
                                        <button
                                            key={exam.id}
                                            onClick={() => setSelectedExam(exam.id)}
                                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${selectedExam === exam.id
                                                    ? 'bg-blue-500/20 border border-blue-500/50'
                                                    : 'bg-slate-800/50 hover:bg-slate-800'
                                                }`}
                                        >
                                            <span className="text-2xl">{exam.icon}</span>
                                            <span className="font-medium">{exam.name}</span>
                                            {selectedExam === exam.id && (
                                                <Check className="w-5 h-5 text-blue-400 ml-auto" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Select Subject */}
                            <div className="glass-card p-6">
                                <h3 className="font-bold mb-4 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-purple-400" />
                                    Select Subject
                                </h3>
                                <div className="space-y-2">
                                    {subjects.map(subject => (
                                        <button
                                            key={subject.id}
                                            onClick={() => setSelectedSubject(subject.id)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl transition ${selectedSubject === subject.id
                                                    ? 'bg-purple-500/20 border border-purple-500/50'
                                                    : 'bg-slate-800/50 hover:bg-slate-800'
                                                }`}
                                        >
                                            <span className="font-medium">{subject.name}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-slate-500">{subject.topics.length} topics</span>
                                                {selectedSubject === subject.id && (
                                                    <Check className="w-5 h-5 text-purple-400" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <div className="text-center mt-8">
                            <button
                                onClick={handleGenerateNotes}
                                disabled={isGenerating}
                                className="btn-primary text-lg px-8 py-4 flex items-center gap-3 mx-auto"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Gemini is analyzing & generating notes...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-6 h-6" />
                                        Generate Smart Notes
                                    </>
                                )}
                            </button>
                            <p className="text-sm text-slate-500 mt-3">
                                Takes 15-30 seconds to generate comprehensive notes with AI
                            </p>
                        </div>
                    </motion.div>
                ) : notes && (
                    /* Generated Notes */
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                    >
                        {/* Notes Header */}
                        <div className="glass-card p-6 mb-6">
                            <div className="flex items-start justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">{notes.title}</h2>
                                    <div className="flex items-center gap-4 text-sm text-slate-400">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" />
                                            {notes.readTime} read
                                        </span>
                                        <span>Updated: {notes.lastUpdated}</span>
                                        <span className="flex items-center gap-1 text-green-400">
                                            <Sparkles className="w-4 h-4" />
                                            Generated by Gemini AI
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowNotes(false);
                                        setNotes(null);
                                    }}
                                    className="btn-secondary"
                                >
                                    Generate New
                                </button>
                            </div>
                        </div>

                        {/* Table of Contents */}
                        <div className="glass-card p-4 mb-6">
                            <h3 className="font-bold mb-3">📑 Table of Contents</h3>
                            <div className="flex flex-wrap gap-2">
                                {notes.sections.map((section, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setExpandedSection(index)}
                                        className={`px-3 py-1.5 rounded-lg text-sm transition ${expandedSection === index
                                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                                : 'bg-slate-800/50 hover:bg-slate-800'
                                            }`}
                                    >
                                        {section.title.substring(0, 40)}{section.title.length > 40 ? '...' : ''}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Notes Content */}
                        <div className="space-y-4">
                            {notes.sections.map((section, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="glass-card overflow-hidden"
                                >
                                    <button
                                        onClick={() => setExpandedSection(expandedSection === index ? -1 : index)}
                                        className="w-full p-4 flex items-center justify-between hover:bg-slate-800/50 transition"
                                    >
                                        <h3 className="font-bold text-lg text-left">{section.title}</h3>
                                        <ChevronDown className={`w-5 h-5 transition-transform ${expandedSection === index ? 'rotate-180' : ''
                                            }`} />
                                    </button>

                                    <AnimatePresence>
                                        {expandedSection === index && (
                                            <motion.div
                                                initial={{ height: 0 }}
                                                animate={{ height: 'auto' }}
                                                exit={{ height: 0 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-6 pt-0 prose prose-invert prose-sm max-w-none">
                                                    <div
                                                        dangerouslySetInnerHTML={{
                                                            __html: formatContent(section.content)
                                                        }}
                                                    />
                                                </div>
                                                <div className="p-4 border-t border-slate-800 flex items-center gap-2">
                                                    <button
                                                        className="btn-secondary text-sm"
                                                        onClick={() => navigator.clipboard.writeText(section.content)}
                                                    >
                                                        <Copy className="w-4 h-4 mr-1" />
                                                        Copy Section
                                                    </button>
                                                    <button className="btn-secondary text-sm">
                                                        <Bookmark className="w-4 h-4 mr-1" />
                                                        Save to Notes
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))}
                        </div>

                        {/* Related Actions */}
                        <div className="glass-card p-6 mt-8">
                            <h3 className="font-bold mb-4">🎯 What's Next?</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <Link href="/exams" className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 transition text-center">
                                    <Target className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                                    <div className="font-medium">Take Practice Test</div>
                                    <p className="text-xs text-slate-400">Test your knowledge</p>
                                </Link>
                                <Link href="/study" className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 transition text-center">
                                    <BookOpen className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                                    <div className="font-medium">Create Flashcards</div>
                                    <p className="text-xs text-slate-400">For quick revision</p>
                                </Link>
                                <Link href="/ai-assistant" className="p-4 rounded-xl bg-green-500/10 border border-green-500/30 hover:bg-green-500/20 transition text-center">
                                    <Brain className="w-8 h-8 text-green-400 mx-auto mb-2" />
                                    <div className="font-medium">Ask AI Assistant</div>
                                    <p className="text-xs text-slate-400">Clear your doubts</p>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </main>
        </div>
    );
}
