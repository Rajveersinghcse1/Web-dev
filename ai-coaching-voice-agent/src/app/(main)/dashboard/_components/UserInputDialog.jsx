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
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { LoaderCircle, Sparkles, AlertCircle, RefreshCw, GraduationCap, Target, User } from 'lucide-react';
import { UserContext } from '@/app/AuthProvider';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [title, setTitle] = useState('');
    const [level, setLevel] = useState('');
    const createDiscussionRoom = useMutation(api.DiscussionRoom.CreateNewRoom);
    const updateUserToken = useMutation(api.users.UpdateUserToken);
    const [loading, setLoading] = useState(false);
    const [openDialog, setOpenDialog] = useState(false);
    const [error, setError] = useState(null);
    
    const router = useRouter();
    const { userData, setUserData, isLoading, isReady, error: authError, retry } = useContext(UserContext);

    const validateInputs = () => {
        setError(null);
        
        // Check if authentication is still loading
        if (isLoading) {
            setError('Loading your account... Please wait a moment.');
            return false;
        }

        // Check if there was an authentication error
        if (authError) {
            setError(`Account error: ${authError}. Please try refreshing the page.`);
            return false;
        }

        // Check if user context is ready
        if (!isReady) {
            setError('Your account is not ready yet. Please wait or try refreshing.');
            return false;
        }
        
        // Validate user is logged in and has data
        if (!userData) {
            setError('Unable to load your account. Please try refreshing the page or logging in again.');
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

        // Validate title
        if (!title || title.trim().length < 3) {
            setError('Please enter a session title with at least 3 characters.');
            return false;
        }

        // Validate level
        if (!level) {
            setError('Please select a difficulty level.');
            return false;
        }

        // Validate topic
        if (!topic || topic.trim().length < 10) {
            setError('Please provide more details about what you want to learn (at least 10 characters).');
            return false;
        }

        // Validate expert selection
        if (!selectedExpert) {
            setError('Please select an AI tutor to guide your session.');
            return false;
        }

        return true;
    };

    const OnClickNext = async () => {
        if (!validateInputs()) return;

        setLoading(true);
        setError(null);

        try {
            // Create the discussion room with retry logic and enhanced metadata
            const result = await retryWithBackoff(async () => {
                return await createDiscussionRoom({
                    topic: topic.trim(),
                    title: title.trim(),
                    level: level,
                    coachingOption: coachingOption?.name,
                    expertName: selectedExpert,
                    uid: userData._id,
                    // Gemini 2.5 Flash configuration
                    modelConfig: {
                        model: 'gemini-2.5-flash',
                        temperature: level === 'Beginner' ? 0.7 : level === 'Intermediate' ? 0.8 : 0.9,
                        topP: 0.95,
                        topK: 40,
                        maxOutputTokens: 2048
                    }
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
            // Reset all state when dialog closes
            setError(null);
            setTitle('');
            setLevel('');
            setTopic('');
            setSelectedExpert(undefined);
        }
    };

    return (
        <Dialog open={openDialog} onOpenChange={handleDialogChange}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Enhanced Header with gradient and icon */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-linear-to-br from-purple-600 via-pink-600 to-orange-500 p-6 text-white relative overflow-hidden"
                >
                    {/* Animated background blobs */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-1/2 -left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-blob" />
                        <div className="absolute -bottom-1/2 -right-1/4 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
                    </div>

                    <div className="flex items-center gap-4 relative z-10">
                        <motion.div 
                            className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm ring-2 ring-white/30"
                            whileHover={{ scale: 1.05, rotate: 5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <Sparkles className="w-6 h-6 text-white" />
                        </motion.div>
                        <div className="flex-1">
                            <DialogTitle className="text-2xl font-bold text-white drop-shadow-lg">
                                {coachingOption.name}
                            </DialogTitle>
                            <p className="text-white/90 text-sm mt-1 font-medium">
                                Configure your personalized AI learning session
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Content */}
                <div className="p-6">
                    {/* Loading State */}
                    {isLoading && !userData && (
                        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                            <LoaderCircle className="w-5 h-5 text-blue-600 animate-spin" />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-blue-900">Loading your account...</p>
                                <p className="text-xs text-blue-600 mt-1">Please wait a moment</p>
                            </div>
                        </div>
                    )}

                    {/* Auth Error with Retry */}
                    {authError && (
                        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <div className="flex items-start gap-2 mb-3">
                                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-red-900">Account Error</p>
                                    <p className="text-sm text-red-700 mt-1">{authError}</p>
                                </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={retry}
                                className="w-full border-red-300 text-red-700 hover:bg-red-100"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Retry Loading Account
                            </Button>
                        </div>
                    )}

                    {/* Validation Error Alert */}
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        </div>
                    )}
                    
                    <DialogDescription asChild>
                        <div className="space-y-6">
                            {/* Title Input */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                            >
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                                    <Target className="w-4 h-4 text-purple-600" />
                                    Session Title *
                                </label>
                                <Input 
                                    placeholder="e.g., Introduction to Machine Learning, React Fundamentals..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="border-gray-300 focus:border-purple-500 focus:ring-purple-500/30 transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">Give your session a clear, descriptive title</p>
                            </motion.div>

                            {/* Level Selection */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                                    <GraduationCap className="w-4 h-4 text-purple-600" />
                                    Difficulty Level *
                                </label>
                                <Select value={level} onValueChange={setLevel}>
                                    <SelectTrigger className="border-gray-300 focus:border-purple-500 focus:ring-purple-500/30">
                                        <SelectValue placeholder="Select your experience level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Beginner">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-green-500" />
                                                Beginner - New to this topic
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="Intermediate">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                                                Intermediate - Have some experience
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="Advanced">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                                Advanced - Deep knowledge required
                                            </div>
                                        </SelectItem>
                                        <SelectItem value="Expert">
                                            <div className="flex items-center gap-2">
                                                <span className="w-2 h-2 rounded-full bg-purple-500" />
                                                Expert - Master level discussion
                                            </div>
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="text-xs text-gray-500 mt-1">This helps tailor the AI's teaching approach</p>
                            </motion.div>

                            {/* Topic Details Input */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                            >
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                    What would you like to learn? *
                                </label>
                                <Textarea 
                                    placeholder="Be specific! e.g., I want to understand how neural networks work, their architecture, and how to implement a simple one in Python..."
                                    value={topic}
                                    className="min-h-[100px] resize-none border-gray-300 focus:border-purple-500 focus:ring-purple-500/30 transition-all" 
                                    onChange={(e) => setTopic(e.target.value)}
                                />
                                <div className="flex items-center justify-between mt-1">
                                    <p className="text-xs text-gray-500">More details = better personalized learning</p>
                                    <span className={`text-xs font-medium ${
                                        topic.length < 10 ? 'text-gray-400' : 
                                        topic.length < 50 ? 'text-yellow-600' : 
                                        'text-green-600'
                                    }`}>
                                        {topic.length} chars
                                    </span>
                                </div>
                            </motion.div>

                            {/* AI Tutor Selection */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                                    <User className="w-4 h-4 text-purple-600" />
                                    Choose Your AI Tutor *
                                </label>
                                <div className="grid grid-cols-4 md:grid-cols-4 gap-3">
                                    {CoachingExpert.map((expert, index) => (
                                        <motion.div 
                                            key={index}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.5 + index * 0.05 }}
                                            whileHover={{ scale: 1.05, y: -5 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setSelectedExpert(expert.name)} 
                                            className="flex flex-col items-center cursor-pointer group relative"
                                        >
                                            {/* Selection indicator */}
                                            <AnimatePresence>
                                                {selectedExpert === expert.name && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        exit={{ scale: 0 }}
                                                        className="absolute -top-2 -right-2 z-10 w-6 h-6 bg-linear-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg ring-2 ring-white"
                                                    >
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>

                                            <div className={`relative rounded-2xl p-1 transition-all duration-300 ${
                                                selectedExpert === expert.name 
                                                    ? 'bg-linear-to-br from-purple-600 via-pink-600 to-orange-500 shadow-xl ring-2 ring-purple-400' 
                                                    : 'bg-linear-to-br from-gray-200 to-gray-300 group-hover:from-purple-400 group-hover:to-pink-400 shadow-md'
                                            }`}>
                                                <Image
                                                    src={expert.avatar}
                                                    alt={expert.name}
                                                    width={80}
                                                    height={80}
                                                    className="rounded-xl h-16 w-16 object-cover bg-white"
                                                />
                                            </div>
                                            <span className={`text-xs mt-2 text-center transition-all font-medium ${
                                                selectedExpert === expert.name 
                                                    ? 'text-purple-700 font-bold' 
                                                    : 'text-gray-600 group-hover:text-purple-600'
                                            }`}>
                                                {expert.name}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                                <p className="text-xs text-gray-500 mt-3">Each tutor has a unique teaching style powered by Gemini 2.5 Flash</p>
                            </motion.div>

                            {/* Action Buttons */}
                            <motion.div 
                                className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <DialogClose asChild>
                                    <Button 
                                        variant="outline" 
                                        className="gap-2 border-gray-300 hover:bg-gray-50 transition-all"
                                        disabled={loading}
                                    >
                                        Cancel
                                    </Button>
                                </DialogClose>
                                <Button 
                                    disabled={(!title || !level || !topic || !selectedExpert || loading)} 
                                    onClick={OnClickNext}
                                    className="bg-linear-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-700 hover:via-pink-700 hover:to-orange-600 text-white font-semibold gap-2 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group"
                                >
                                    {/* Button shine effect */}
                                    <motion.div
                                        className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent"
                                        animate={{
                                            x: ['-200%', '200%']
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity,
                                            repeatDelay: 1
                                        }}
                                    />
                                    {loading ? (
                                        <LoaderCircle className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Sparkles className="w-4 h-4" />
                                    )}
                                    <span className="relative z-10">
                                        {loading ? 'Creating Session...' : 'Start Learning Session'}
                                    </span>
                                    {!loading && <Sparkles className="w-4 h-4" />}
                                </Button>
                            </motion.div>
                        </div>
                    </DialogDescription>
                </div>
            </DialogContent>
        </Dialog>
    );
}

export default UserInputDialog;

