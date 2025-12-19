"use client";
import React, { useState, useEffect, useRef } from 'react';
import { FileText, Plus, Trash2, Download, Share2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function NotesPanel({ enableFeedbackNotes, setEnableFeedbackNotes, conversation = [] }) {
    const [notes, setNotes] = useState([
        { id: 1, content: "Focus on maintaining eye contact during the introduction.", timestamp: "10:02 AM", type: "auto" },
        { id: 2, content: "Good use of the STAR method for the behavioral question.", timestamp: "10:05 AM", type: "auto" },
    ]);
    const [newNote, setNewNote] = useState("");
    const lastProcessedIndex = useRef(0);

    // Auto-generate notes from conversation
    useEffect(() => {
        if (!enableFeedbackNotes || !conversation || conversation.length === 0) return;

        // Only process new messages
        if (conversation.length > lastProcessedIndex.current) {
            const newMessages = conversation.slice(lastProcessedIndex.current);
            
            newMessages.forEach(msg => {
                // Simple heuristic for demo purposes
                // In a real app, this would be an LLM call or more sophisticated NLP
                if (msg.role === 'model' && (msg.content.includes("suggest") || msg.content.includes("try") || msg.content.includes("remember"))) {
                    const sentences = msg.content.match(/[^\.!\?]+[\.!\?]+/g) || [];
                    const keySentence = sentences.find(s => s.includes("suggest") || s.includes("try") || s.includes("remember"));
                    
                    if (keySentence) {
                        addAutoNote(keySentence.trim());
                    }
                }
            });

            lastProcessedIndex.current = conversation.length;
        }
    }, [conversation, enableFeedbackNotes]);

    const addAutoNote = (content) => {
        const note = {
            id: Date.now() + Math.random(),
            content: content,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: "auto"
        };
        setNotes(prev => [note, ...prev]);
        toast.success("New AI Insight added");
    };

    const handleAddNote = () => {
        if (!newNote.trim()) return;
        const note = {
            id: Date.now(),
            content: newNote,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: "manual"
        };
        setNotes([note, ...notes]);
        setNewNote("");
        toast.success("Note added");
    };

    const handleDeleteNote = (id) => {
        setNotes(notes.filter(n => n.id !== id));
    };

    return (
        <div className="flex flex-col h-full bg-gray-50/50">
            {/* Header Actions */}
            <div className="p-4 border-b border-gray-100 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">Session Notes</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                        {notes.length}
                    </span>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-purple-600">
                        <Download className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-purple-600">
                        <Share2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Auto-Notes Toggle */}
            <div className="px-4 py-3 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${enableFeedbackNotes ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                    <span className="text-sm font-medium text-purple-900">AI Auto-Notes</span>
                </div>
                <Button 
                    variant={enableFeedbackNotes ? "default" : "outline"}
                    size="sm" 
                    onClick={() => setEnableFeedbackNotes(!enableFeedbackNotes)}
                    className={`h-7 text-xs ${enableFeedbackNotes ? 'bg-purple-600 hover:bg-purple-700' : ''}`}
                >
                    {enableFeedbackNotes ? 'Active' : 'Enable'}
                </Button>
            </div>

            {/* Notes List */}
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                    {notes.length === 0 ? (
                        <div className="text-center py-10 text-gray-400">
                            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No notes yet. Start typing or enable AI Auto-Notes.</p>
                        </div>
                    ) : (
                        notes.map((note) => (
                            <div 
                                key={note.id} 
                                className={`group p-3 rounded-xl border transition-all hover:shadow-sm ${
                                    note.type === 'auto' 
                                        ? 'bg-white border-purple-100 hover:border-purple-200' 
                                        : 'bg-yellow-50/50 border-yellow-100 hover:border-yellow-200'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 ${
                                        note.type === 'auto' ? 'bg-purple-100 text-purple-600' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                        {note.type === 'auto' && <Sparkles className="w-3 h-3" />}
                                        {note.type === 'auto' ? 'AI Insight' : 'Personal'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-400">{note.timestamp}</span>
                                        <button 
                                            onClick={() => handleDeleteNote(note.id)}
                                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">
                                    {note.content}
                                </p>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
                <div className="relative">
                    <Textarea
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Add a quick note..."
                        className="min-h-[80px] pr-10 resize-none bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleAddNote();
                            }
                        }}
                    />
                    <Button 
                        size="icon" 
                        data-testid="add-note-button"
                        className="absolute bottom-2 right-2 h-8 w-8 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors"
                        onClick={handleAddNote}
                        disabled={!newNote.trim()}
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}
