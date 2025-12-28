import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { AIModelToGenerateFeedbackAndNotes } from '@/services/GlobalServices';
import { 
    LoaderCircle, 
    Sparkles, 
    Bot, 
    User, 
    Copy, 
    Check, 
    Volume2,
    VolumeX,
    MessageSquare,
    Clock
} from 'lucide-react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ConvertTextToSpeech, stopSpeaking } from '@/services/GlobalServices';
import ReactMarkdown from 'react-markdown';

function ChatBox({ conversation = [], enableFeedbackNotes = false, coachingOption }) {
    const [loading, setLoading] = useState(false);
    const [copiedIndex, setCopiedIndex] = useState(null);
    const [speakingIndex, setSpeakingIndex] = useState(null);
    const updateSummery = useMutation(api.DiscussionRoom.UpdateSummery);
    const { roomid } = useParams();
    const chatEndRef = useRef(null);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    const GenerateFeedbackNotes = async () => {
        if (!conversation || conversation.length === 0) {
            toast.error('No conversation to generate feedback from');
            return;
        }
        
        setLoading(true);
        try {
            const result = await AIModelToGenerateFeedbackAndNotes(coachingOption, conversation);
            await updateSummery({
                id: roomid,
                summery: result.content,
            });
            toast.success('Feedback & Notes generated successfully!');
        } catch (e) {
            console.error('GenerateFeedbackNotes error', e);
            toast.error('Failed to generate feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const copyMessage = async (content, index) => {
        try {
            await navigator.clipboard.writeText(content);
            setCopiedIndex(index);
            setTimeout(() => setCopiedIndex(null), 2000);
            toast.success('Copied to clipboard');
        } catch (err) {
            toast.error('Failed to copy');
        }
    };

    const speakMessage = async (content, index) => {
        if (speakingIndex === index) {
            stopSpeaking();
            setSpeakingIndex(null);
            return;
        }

        setSpeakingIndex(index);
        await ConvertTextToSpeech(
            content,
            () => {},
            () => setSpeakingIndex(null)
        );
    };

    const formatTime = (index) => {
        // Simple time estimation based on message index
        const now = new Date();
        const minutesAgo = (conversation.length - index - 1) * 2;
        const time = new Date(now.getTime() - minutesAgo * 60000);
        return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat Messages */}
            <div className='h-[45vh] md:h-[60vh] bg-gray-50/50 border border-gray-100 rounded-2xl flex flex-col overflow-hidden shadow-inner'>
                {conversation.length === 0 ? (
                    <div className="flex-1 flex items-center justify-center p-6">
                        <div className="text-center">
                            <div className="w-20 h-20 bg-linear-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <MessageSquare className="w-10 h-10 text-purple-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">Start the Conversation</h3>
                            <p className="text-gray-500 max-w-xs mx-auto">
                                Speak or type to begin your coaching session. I'm listening!
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
                        {conversation.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                            >
                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                                    msg.role === 'user' 
                                        ? 'bg-linear-to-br from-blue-500 to-indigo-600 text-black' 
                                        : 'bg-linear-to-br from-purple-500 to-pink-600 text-black'
                                }`}>
                                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                                </div>

                                {/* Message Bubble */}
                                <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`
                                        p-4 rounded-2xl shadow-sm text-sm leading-relaxed relative group
                                        ${msg.role === 'user' 
                                            ? 'bg-white text-gray-800 border border-gray-100 rounded-tr-none' 
                                            : 'bg-white text-gray-800 border border-purple-100 rounded-tl-none'
                                        }
                                    `}>
                                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        
                                        {/* Message Actions */}
                                        <div className={`
                                            absolute top-2 ${msg.role === 'user' ? '-left-16' : '-right-16'} 
                                            opacity-0 group-hover:opacity-100 transition-opacity flex gap-1
                                        `}>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50"
                                                onClick={() => copyMessage(msg.content, index)}
                                            >
                                                {copiedIndex === index ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-gray-400" />}
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-6 w-6 rounded-full bg-white shadow-sm border border-gray-100 hover:bg-gray-50"
                                                onClick={() => speakMessage(msg.content, index)}
                                            >
                                                {speakingIndex === index ? <VolumeX className="w-3 h-3 text-purple-500" /> : <Volume2 className="w-3 h-3 text-gray-400" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-1 px-1">
                                        {formatTime(index)}
                                    </span>
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                )}
            </div>

            {/* Feedback Button */}
            <div className="mt-4 flex justify-end">
                <Button 
                    onClick={GenerateFeedbackNotes}
                    disabled={loading || conversation.length === 0}
                    className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-black shadow-lg hover:shadow-xl transition-all rounded-full px-6"
                >
                    {loading ? (
                        <>
                            <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing Session...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Full Report
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}

export default ChatBox;

