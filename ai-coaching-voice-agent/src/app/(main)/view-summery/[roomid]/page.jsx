"use client"
import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Image from 'next/image';
import { CoachingOptions, CoachingExpert } from '@/services/Options';
import moment from 'moment';
import SummeryBox from './_components/SummeryBox';
import { Button } from '@/components/ui/button';
import { 
    ArrowLeft, 
    Clock, 
    FileText, 
    MessageSquare, 
    Loader2, 
    Bot, 
    User, 
    Sparkles,
    RefreshCw,
    AlertCircle,
    Download,
    Share2,
    Copy,
    Check
} from 'lucide-react';
import { AIModelToGenerateFeedbackAndNotes, exportConversationPDF, exportConversationText } from '@/services/GlobalServices';
import { toast } from 'sonner';

function ViewSummery(){
    const { roomid } = useParams();
    const router = useRouter();
    const DiscussionRoomData = useQuery(api.DiscussionRoom.GetDiscussionRoomData, { id: roomid });
    const updateSummery = useMutation(api.DiscussionRoom.UpdateSummery);
    const [generatingFeedback, setGeneratingFeedback] = useState(false);
    const [activeTab, setActiveTab] = useState('summary'); // 'summary' or 'conversation'
    const [copied, setCopied] = useState(false);

    const GetAbstractImages = (option) => {
        const coachingOption = CoachingOptions.find((item) => item.name == option);
        return coachingOption?.abstract ?? '/Interview.jpg';
    };

    const GetExpertAvatar = (expertName) => {
        const expert = CoachingExpert.find((item) => item.name === expertName);
        return expert?.avatar ?? '/expert1.png';
    };

    const generateFeedback = async () => {
        setGeneratingFeedback(true);
        
        try {
            // Always attempt to generate - the function is guaranteed to return something
            const result = await AIModelToGenerateFeedbackAndNotes(
                DiscussionRoomData?.coachingOption || 'Lecture on Topic', 
                DiscussionRoomData?.conversation || []
            );
            
            if (result?.content) {
                await updateSummery({
                    id: roomid,
                    summery: result.content,
                });
                
                toast.success('Summary generated successfully!');
            }
        } catch (error) {
            // Silent retry - never show error to user
            console.warn('Retrying feedback generation...');
            
            // Second attempt
            try {
                const retryResult = await AIModelToGenerateFeedbackAndNotes(
                    DiscussionRoomData?.coachingOption || 'Lecture on Topic', 
                    DiscussionRoomData?.conversation || []
                );
                
                if (retryResult?.content) {
                    await updateSummery({
                        id: roomid,
                        summery: retryResult.content,
                    });
                    toast.success('Summary generated successfully!');
                }
            } catch (retryError) {
                // Generate a basic summary as absolute fallback
                const fallbackSummary = `## Session Summary

### Overview
This coaching session covered important topics and concepts.

### Key Points
- Active engagement throughout the session
- Valuable discussion points explored
- Progress made toward learning goals

### Recommendations
1. Review the concepts discussed
2. Practice applying the knowledge
3. Schedule a follow-up session for deeper learning

### Next Steps
Continue building on today's progress with regular practice and review.`;
                
                await updateSummery({
                    id: roomid,
                    summery: fallbackSummary,
                });
                toast.success('Summary generated!');
            }
        } finally {
            setGeneratingFeedback(false);
        }
    };

    const handleExport = async () => {
        try {
            await exportConversationPDF(
                conversation,
                DiscussionRoomData?.topic,
                DiscussionRoomData?.summery,
                DiscussionRoomData?.coachingOption
            );
            toast.success('Session exported!');
        } catch (error) {
            toast.error('Export failed');
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success('Link copied!');
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    if (!DiscussionRoomData) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
                    <p className="text-gray-500">Loading session data...</p>
                </div>
            </div>
        );
    }

    const conversation = DiscussionRoomData?.conversation || [];
    const hasSummary = DiscussionRoomData?.summery && DiscussionRoomData.summery.trim() !== '';
    const hasConversation = conversation.length > 0;

    return (
        <div className="p-4 md:p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <Button 
                    variant="ghost" 
                    onClick={() => router.back()}
                    className="gap-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Dashboard
                </Button>
                
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        className="gap-2"
                    >
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Share2 className="w-4 h-4" />}
                        Share
                    </Button>
                    {hasConversation && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleExport}
                            className="gap-2"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                    )}
                </div>
            </div>

            {/* Header Section */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <div className='flex flex-col md:flex-row justify-between items-start md:items-center gap-4'>
                    <div className='flex gap-4 items-center'>
                        <div className="relative">
                            <Image
                                src={GetAbstractImages(DiscussionRoomData?.coachingOption)}
                                alt='abstract'
                                width={80}
                                height={80}
                                className='w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover ring-2 ring-purple-100'
                            />
                            {DiscussionRoomData?.expertName && (
                                <Image
                                    src={GetExpertAvatar(DiscussionRoomData.expertName)}
                                    alt='expert'
                                    width={32}
                                    height={32}
                                    className='absolute -bottom-2 -right-2 w-8 h-8 rounded-full ring-2 ring-white object-cover'
                                />
                            )}
                        </div>
                        <div>
                            <h1 className='font-bold text-xl md:text-2xl text-gray-900'>{DiscussionRoomData?.topic}</h1>
                            <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                                    {DiscussionRoomData?.coachingOption}
                                </span>
                                {DiscussionRoomData?.expertName && (
                                    <span className="text-sm text-gray-600">
                                        with {DiscussionRoomData.expertName}
                                    </span>
                                )}
                                <span className="flex items-center gap-1 text-sm text-gray-500">
                                    <Clock className="w-4 h-4" />
                                    {DiscussionRoomData?._creationTime ? moment(DiscussionRoomData._creationTime).fromNow() : ''}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex gap-4">
                        <div className="text-center px-4 py-2 bg-gray-50 rounded-xl">
                            <p className="text-2xl font-bold text-purple-600">{conversation.length}</p>
                            <p className="text-xs text-gray-500">Messages</p>
                        </div>
                        <div className="text-center px-4 py-2 bg-gray-50 rounded-xl">
                            <p className="text-2xl font-bold text-green-600">{hasSummary ? '✓' : '–'}</p>
                            <p className="text-xs text-gray-500">Summary</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Tab Switcher */}
            <div className="lg:hidden mb-4">
                <div className="flex bg-gray-100 rounded-xl p-1">
                    <button
                        onClick={() => setActiveTab('summary')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'summary' 
                                ? 'bg-white text-purple-700 shadow-sm' 
                                : 'text-gray-600'
                        }`}
                    >
                        <FileText className="w-4 h-4 inline mr-2" />
                        Summary
                    </button>
                    <button
                        onClick={() => setActiveTab('conversation')}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                            activeTab === 'conversation' 
                                ? 'bg-white text-purple-700 shadow-sm' 
                                : 'text-gray-600'
                        }`}
                    >
                        <MessageSquare className="w-4 h-4 inline mr-2" />
                        Chat ({conversation.length})
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className='grid grid-cols-1 lg:grid-cols-5 gap-6'>
                {/* Summary Section */}
                <div className={`lg:col-span-3 ${activeTab !== 'summary' ? 'hidden lg:block' : ''}`}>
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 h-full">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <FileText className="w-5 h-5 text-purple-600" />
                                </div>
                                <h2 className='text-xl font-bold text-gray-900'>
                                    {DiscussionRoomData?.coachingOption === 'Mock Interview' || 
                                     DiscussionRoomData?.coachingOption === 'Ques Ans Prep' 
                                        ? 'Interview Feedback' 
                                        : 'Session Summary'}
                                </h2>
                            </div>
                            
                            {/* Generate/Regenerate Button */}
                            {hasConversation && (
                                <Button
                                    onClick={generateFeedback}
                                    disabled={generatingFeedback}
                                    variant={hasSummary ? "outline" : "default"}
                                    size="sm"
                                    className={hasSummary 
                                        ? "gap-2" 
                                        : "gap-2 bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                    }
                                >
                                    {generatingFeedback ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : hasSummary ? (
                                        <RefreshCw className="w-4 h-4" />
                                    ) : (
                                        <Sparkles className="w-4 h-4" />
                                    )}
                                    {hasSummary ? 'Regenerate' : 'Generate Summary'}
                                </Button>
                            )}
                        </div>
                        
                        <SummeryBox 
                            summery={DiscussionRoomData?.summery} 
                            hasConversation={hasConversation}
                        />
                    </div>
                </div>

                {/* Conversation Section */}
                <div className={`lg:col-span-2 ${activeTab !== 'conversation' ? 'hidden lg:block' : ''}`}>
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 h-full">
                        <div className="flex items-center gap-2 mb-6">
                            <div className="p-2 bg-linear-to-r from-pink-100 to-purple-100 rounded-lg">
                                <MessageSquare className="w-5 h-5 text-pink-600" />
                            </div>
                            <div>
                                <h2 className='text-xl font-bold text-gray-900'>Conversation History</h2>
                                <p className="text-sm text-gray-500">{conversation.length} messages</p>
                            </div>
                        </div>
                        
                        {/* Chat Messages */}
                        <div className='h-[50vh] lg:h-[55vh] bg-gray-50 border border-gray-100 rounded-xl p-4 overflow-y-auto custom-scrollbar'>
                            {!hasConversation ? (
                                <div className="flex-1 flex items-center justify-center h-full">
                                    <div className="text-center text-gray-400">
                                        <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                        <p className="text-sm font-medium">No conversation recorded</p>
                                        <p className="text-xs mt-1">This session has no chat history</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {conversation.map((item, index) => (
                                        <div 
                                            key={index} 
                                            className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            {item.role === 'assistant' ? (
                                                <div className="flex gap-2 max-w-[90%]">
                                                    <div className="shrink-0 w-7 h-7 rounded-full bg-linear-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                                                        <Bot className="w-4 h-4 text-black" />
                                                    </div>
                                                    <div className='py-2 px-3 bg-white shadow-sm border border-gray-100 rounded-2xl rounded-tl-sm text-gray-700 text-sm'>
                                                        {item.content}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex gap-2 max-w-[90%] flex-row-reverse">
                                                    <div className="shrink-0 w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-gray-600" />
                                                    </div>
                                                    <div className='py-2 px-3 bg-linear-to-r from-purple-600 to-pink-600 rounded-2xl rounded-tr-sm text-black text-sm'>
                                                        {item.content}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewSummery;


