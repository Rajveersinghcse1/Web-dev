"use client";

import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import InterviewSetup from './InterviewSetup';
import InterviewExecution from './InterviewExecution';
import InterviewReport from './InterviewReport';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

export default function MockInterviewSystem({ userId }) {
    const [stage, setStage] = useState('setup'); // 'setup', 'interview', 'report'
    const [interviewData, setInterviewData] = useState(null);
    const [sessionId, setSessionId] = useState(null);
    const [completedInterview, setCompletedInterview] = useState(null);
    const [idempotencyKey, setIdempotencyKey] = useState(null);

    const createSession = useMutation(api.mockInterviews.createSession);
    const updateResponse = useMutation(api.mockInterviews.updateResponse);
    const updateQuestionIndex = useMutation(api.mockInterviews.updateQuestionIndex);
    const completeSession = useMutation(api.mockInterviews.completeSession);
    const getSession = useQuery(api.mockInterviews.getSession, sessionId ? { sessionId } : 'skip');
    const getActiveSession = useQuery(api.mockInterviews.getActiveSession, userId ? { userId } : 'skip');

    // Check for active session on mount (crash recovery)
    useEffect(() => {
        if (getActiveSession && stage === 'setup') {
            const resumeConfirmed = window.confirm(
                `You have an active interview in progress (${getActiveSession.title}).\n\nWould you like to resume it?`
            );
            
            if (resumeConfirmed) {
                // Resume existing session
                setSessionId(getActiveSession.sessionId);
                setInterviewData({
                    title: getActiveSession.title,
                    topic: getActiveSession.topic,
                    questions: getActiveSession.questions,
                    interviewer: {
                        name: getActiveSession.interviewerName,
                        image: getActiveSession.interviewerImage,
                    }
                });
                setStage('interview');
                toast.success('Resuming your interview...');
            } else {
                // User declined - they can start a new interview normally
                toast.info('Start a new interview when ready');
            }
        }
    }, [getActiveSession, stage]);

    const handleStartInterview = async (setupData) => {
        try {
            // Generate idempotency key for this session
            const key = `${userId}_${Date.now()}_${crypto.randomUUID()}`;
            setIdempotencyKey(key);

            // Create session in database
            const result = await createSession({
                userId,
                idempotencyKey: key,
                title: setupData.title,
                topic: setupData.topic,
                interviewerImage: setupData.interviewer.image,
                interviewerName: setupData.interviewer.name,
                questions: setupData.questions,
            });

            setSessionId(result.sessionId);
            setInterviewData(setupData);
            setStage('interview');

            toast.success('Interview started successfully!');

        } catch (error) {
            console.error('Failed to start interview:', error);
            toast.error(error.message || 'Failed to start interview. Please try again.');
            throw error;
        }
    };

    const handleUpdateResponse = async (sessionId, responseData) => {
        try {
            await updateResponse({
                sessionId,
                questionId: responseData.questionId,
                audioUrl: responseData.audioUrl,
                transcription: responseData.transcription,
                responseTime: responseData.responseTime,
                answered: responseData.answered,
                grammarScore: responseData.grammarScore,
                fluencyScore: responseData.fluencyScore,
                fillerWords: responseData.fillerWords,
                hesitationCount: responseData.hesitationCount,
                clarityScore: responseData.clarityScore,
                relevanceScore: responseData.relevanceScore,
                confidenceScore: responseData.confidenceScore,
            });
        } catch (error) {
            console.error('Failed to update response:', error);
            toast.error('Failed to save response');
        }
    };

    const handleUpdateQuestionIndex = async (sessionId, index) => {
        try {
            await updateQuestionIndex({ sessionId, index });
        } catch (error) {
            console.error('Failed to update question index:', error);
        }
    };

    const handleCompleteInterview = async (sessionId, status, evaluation) => {
        try {
            await completeSession({
                sessionId,
                status,
                evaluation,
            });

            // Fetch completed interview data
            const interview = await getSession({ sessionId });
            setCompletedInterview(interview);
            setStage('report');

            toast.success('Interview completed!');

        } catch (error) {
            console.error('Failed to complete interview:', error);
            toast.error('Failed to save interview results');
        }
    };

    const handleRestart = () => {
        setStage('setup');
        setInterviewData(null);
        setSessionId(null);
        setCompletedInterview(null);
    };

    const handleGoHome = () => {
        // Navigate to dashboard (implementation depends on your routing)
        window.location.href = '/dashboard';
    };

    // Loading state while fetching session data
    if (stage === 'report' && !completedInterview) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">Loading interview results...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            {stage === 'setup' && (
                <InterviewSetup onStartInterview={handleStartInterview} />
            )}

            {stage === 'interview' && interviewData && sessionId && (
                <InterviewExecution
                    interviewData={interviewData}
                    sessionId={sessionId}
                    onComplete={handleCompleteInterview}
                    onUpdateResponse={handleUpdateResponse}
                    onUpdateQuestionIndex={handleUpdateQuestionIndex}
                />
            )}

            {stage === 'report' && completedInterview && (
                <InterviewReport
                    interview={completedInterview}
                    onRestart={handleRestart}
                    onHome={handleGoHome}
                />
            )}
        </>
    );
}
