import React, { useState, useContext } from 'react';
import {
    Dialog, 
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@/components/ui/dialog";
import { CoachingExpert } from '@/services/Options';
import Image from 'next/image';
import { Textarea } from "@/components/ui/textarea";
import { Button } from '@/components/ui/button';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { LoaderCircle, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { UserContext } from '@/app/AuthProvider';
import { toast } from 'sonner';

// Cost per session creation
const SESSION_COST = 100;
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

// Utility for retry with exponential backoff
const retryWithBackoff = async (fn, retries = MAX_RETRIES, delay = RETRY_DELAY) => {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(r => setTimeout(r, delay * Math.pow(2, i)));
        }
    }
};

function UserInputDialog({children, coachingOption}) {
    const [selectedExpert, setSelectedExpert] = useState();
    const [topic, setTopic] = useState('');
    const createDiscussionRoom = useMutation(api.DiscussionRoom.CreateNewRoom);
    const updateUserToken = useMutation(api.users.UpdateUserToken);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [error, setError] = useState(null);
    
    const router = useRouter();
    const {userData, setUserData} = useContext(UserContext);

    const validateInputs = () => {
        setError(null);
        
        // Validate user is logged in and has data
        if (!userData) {
            setError('Please wait for your account to load or try logging in again.');
            return false;
        }
        
        if (!userData._id) {
            setError('User session not found. Please refresh the page.');
            return false;
        }

        // Validate credits
        if (userData.credits === undefined || userData.credits === null) {
            setError('Unable to verify credits. Please refresh the page.');
            return false;
        }

        if (Number(userData.credits) < SESSION_COST) {
            setError(`Insufficient credits! You have ${userData.credits} but need ${SESSION_COST}.`);
            return false;
        }

        // Validate topic
        if (!topic || topic.trim().length < 3) {
            setError('Please enter a topic with at least 3 characters.');
            return false;
        }

        // Validate expert selection
        if (!selectedExpert) {
            setError('Please select an AI coach.');
            return false;
        }

        return true;
    };

    const OnClickNext = async () => {
        if (!validateInputs()) return;

        setLoading(true);
        setError(null);

        try {
            // Create the discussion room with retry logic
            const result = await retryWithBackoff(async () => {
                return await createDiscussionRoom({
                    topic: topic.trim(),
                    coachingOption: coachingOption?.name,
                    expertName: selectedExpert,
                    uid: userData._id
                });
            });

            if (!result) {
                throw new Error('Server returned empty response');
            }

            // Deduct credits for session creation
            const newCredits = Math.max(0, Number(userData.credits) - SESSION_COST);
            
            await retryWithBackoff(async () => {
                await updateUserToken({
                    id: userData._id,
                    credits: newCredits
                });
            });

            // Update local user data
            setUserData(prev => ({
                ...prev,
                credits: newCredits
            }));

            toast.success(`Session created! ${SESSION_COST} credits deducted.`);
            setOpenDialog(false);
            
            // Small delay to ensure dialog closes smoothly
            setTimeout(() => {
                router.push('/discussion-room/' + result);
            }, 100);
            
        } catch (error) {
            console.error('Session creation error:', error);
            
            // Provide specific error messages based on error type
            let errorMessage = 'Failed to create session.';
            
            if (error.message?.includes('network') || error.message?.includes('fetch')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.message?.includes('timeout')) {
                errorMessage = 'Request timed out. Please try again.';
            } else if (error.message?.includes('auth') || error.message?.includes('unauthorized')) {
                errorMessage = 'Session expired. Please refresh the page and log in again.';
            } else if (error.message?.includes('invalid') || error.message?.includes('validation')) {
                errorMessage = 'Invalid input. Please check your topic and try again.';
            } else if (error.message) {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleDialogChange = (open) => {
        setOpenDialog(open);
        if (!open) {
            // Reset state when dialog closes
            setError(null);
            setTopic('');
            setSelectedExpert(undefined);
        }
    };

    return (
        <Dialog open={openDialog} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-lg p-0 overflow-hidden border-none shadow-2xl">
                {/* Header with gradient */}
                <div className="bg-linear-to-r from-purple-600 to-pink-600 p-6 text-black">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-200 rounded-lg backdrop-blur-sm">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold text-black">
                                {coachingOption.name}
                            </DialogTitle>
                            <p className="text-black/80 text-sm mt-1">
                                Start a new learning session
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Error Alert */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}
                    
                    <DialogDescription asChild>
                        <div>
                            {/* Topic Input */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-900 mb-2">
                                    What would you like to learn?
                                </label>
                                <Textarea 
                                    placeholder="e.g., Machine Learning basics, React hooks, Public speaking..." 
                                    className="min-h-[80px] resize-none border-gray-200 focus:border-purple-400 focus:ring-purple-400/20" 
                                    onChange={(e) => setTopic(e.target.value)}
                                />
                            </div>

                            {/* Expert Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-3">
                                    Choose your AI coach
                                </label>
                                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                                    {CoachingExpert.map((expert, index) => (
                                        <div 
                                            key={index} 
                                            onClick={() => setSelectedExpert(expert.name)} 
                                            className="flex flex-col items-center cursor-pointer group"
                                        >
                                            <div className={`relative rounded-2xl p-0.5 transition-all duration-300 ${
                                                selectedExpert === expert.name 
                                                    ? 'bg-linear-to-r from-purple-600 to-pink-600 scale-105' 
                                                    : 'bg-gray-200 group-hover:bg-linear-to-r group-hover:from-purple-400 group-hover:to-pink-400'
                                            }`}>
                                                <Image
                                                    src={expert.avatar}
                                                    alt={expert.name}
                                                    width={80}
                                                    height={80}
                                                    className="rounded-xl h-14 w-14 md:h-16 md:w-16 object-cover bg-white"
                                                />
                                            </div>
                                            <span className={`text-xs mt-2 text-center transition-colors ${
                                                selectedExpert === expert.name 
                                                    ? 'text-purple-700 font-semibold' 
                                                    : 'text-gray-600 group-hover:text-purple-600'
                                            }`}>
                                                {expert.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3 justify-end mt-8 pt-4 border-t">
                                <DialogClose asChild>
                                    <Button variant="outline" className="gap-2">
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button 
                                    disabled={(!topic || !selectedExpert || loading)} 
                                    onClick={OnClickNext}
                                    className="bg-linear-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-black gap-2"
                                >
                                    {loading && <LoaderCircle className="w-4 h-4 animate-spin" />}
                                    Start Session
                                    <Sparkles className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </DialogDescription>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default UserInputDialog;

