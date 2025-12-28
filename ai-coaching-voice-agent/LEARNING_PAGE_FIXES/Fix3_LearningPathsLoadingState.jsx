// ============================================================================
// FIX 3: Learning Paths with Ready Guards
// ============================================================================
// Location: src/components/LearningPaths.jsx
// 
// Adds loading states and ready checks for Learning Paths component
// ============================================================================

'use client';

import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Map, 
  ChevronRight, 
  Star, 
  Trophy, 
  Lock, 
  Check, 
  Play, 
  Zap, 
  BookOpen, 
  Clock, 
  ArrowLeft,
  Sparkles,
  Search,
  Loader2,
  Briefcase,
  Building,
  UserCheck,
  Mic,
  AlertCircle
} from 'lucide-react';
import { useRecommendationsStore } from '@/lib/aiRecommendations';
import { generateLearningPath } from '@/services/LearningPathService';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/app/AuthProvider';
import { toast } from 'sonner';

// ✨ NEW: Loading skeleton component
function LearningPathsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div>
        <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>
      
      <div className="flex gap-2">
        <div className="flex-1 h-12 bg-gray-200 rounded-xl"></div>
        <div className="w-40 h-12 bg-gray-200 rounded-xl"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-48 bg-gray-200 rounded-2xl"></div>
        ))}
      </div>
    </div>
  );
}

// ✨ NEW: Error fallback component
function LearningPathsError({ error, onRetry }) {
  return (
    <div className="p-8 bg-red-50 border border-red-200 rounded-2xl">
      <div className="flex items-start gap-4">
        <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-bold text-red-900 mb-2">
            Unable to Load Learning Paths
          </h3>
          <p className="text-sm text-red-700 mb-4">
            {error?.message || 'An unexpected error occurred while loading your learning paths.'}
          </p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Loader2 className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LearningPaths() {
  const { learningPaths, activePath, setActivePath, addLearningPath } = useRecommendationsStore();
  const [selectedPath, setSelectedPath] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPath, setGeneratedPath] = useState(null);
  const [generationError, setGenerationError] = useState(null);
  
  const router = useRouter();
  
  // ✨ NEW: Get full auth state from context
  const { userData, isReady, isLoading, error: authError } = useContext(UserContext);
  
  const createDiscussionRoom = useMutation(api.DiscussionRoom.CreateNewRoom);

  // ✨ NEW: Show loading state while auth initializes
  if (isLoading || !isReady) {
    return <LearningPathsSkeleton />;
  }

  // ✨ NEW: Show error if auth failed
  if (authError || !userData) {
    return (
      <LearningPathsError 
        error={authError || new Error('User data not available')}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // ✨ NEW: Additional safety validation
  if (!userData._id) {
    return (
      <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600" />
          <div>
            <h3 className="font-bold text-yellow-900">Account Setup Incomplete</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Please refresh the page or log in again to access learning paths.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getExpertForType = (type) => {
    switch (type) {
      case 'Lecture on Topic': return 'Professor Shweta';
      case 'Mock Interview': return 'Jokey';
      case 'Ques Ans Prep': return 'Coach Sarah';
      case 'Languages Skill': return 'Tutor Alex';
      case 'Meditation': return 'Guide Maya';
      default: return 'Joanna';
    }
  };

  const handleStartSession = async (topicName, type = 'Lecture on Topic') => {
    // ✨ NEW: Enhanced validation with better error messages
    if (!userData || !userData._id) {
      toast.error("Your session has expired. Please refresh the page.");
      return;
    }

    // ✨ NEW: Check credits before proceeding
    if (userData.credits === undefined || userData.credits < 100) {
      toast.error("Insufficient credits. Please upgrade your plan.");
      return;
    }

    const toastId = toast.loading("Creating session...");
    const expertName = getExpertForType(type);

    try {
      const roomId = await createDiscussionRoom({
        topic: topicName,
        coachingOption: type,
        expertName: expertName,
        level: 'Beginner',
        createdBy: userData._id,
      });

      toast.dismiss(toastId);
      toast.success("Session created!");
      router.push(`/discussion-room/${roomId}`);
    } catch (error) {
      console.error("Failed to create session:", error);
      toast.dismiss(toastId);
      
      // ✨ NEW: Better error categorization
      if (error.message?.includes('network') || error.message?.includes('fetch')) {
        toast.error("Network error. Please check your connection and try again.");
      } else if (error.message?.includes('auth')) {
        toast.error("Session expired. Please refresh the page and log in again.");
      } else {
        toast.error("Failed to create session. Please try again.");
      }
    }
  };

  const handleGeneratePath = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a skill or domain to generate a learning path");
      return;
    }
    
    setIsGenerating(true);
    setGeneratedPath(null);
    setSelectedPath(null);
    setGenerationError(null);
    
    try {
      const path = await generateLearningPath(searchQuery);
      
      // ✨ NEW: Check if we got fallback data
      if (path.id.includes('fallback')) {
        toast.warning("Using fallback data - AI generation failed. Try again later.");
      } else {
        toast.success("Learning path generated successfully!");
      }
      
      setGeneratedPath(path);
    } catch (error) {
      console.error("Failed to generate path:", error);
      setGenerationError(error);
      
      // ✨ NEW: Better error messaging
      if (error.message?.includes('timeout')) {
        toast.error("Request timed out. Please try again.");
      } else if (error.message?.includes('network')) {
        toast.error("Network error. Please check your connection.");
      } else {
        toast.error("Failed to generate learning path. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartGeneratedPath = () => {
    if (!generatedPath) return;

    try {
      const pathToAdd = {
        ...generatedPath,
        progress: 0,
        totalXp: 2500,
        estimatedHours: generatedPath.phases.reduce((acc, p) => acc + (parseInt(p.duration) || 10), 0),
        topics: generatedPath.phases.flatMap((phase, pIndex) => 
          phase.topics.map((topic, tIndex) => ({
            id: `topic-${Date.now()}-${pIndex}-${tIndex}`,
            name: topic.title,
            completed: false,
            unlocked: pIndex === 0 && tIndex === 0,
            difficulty: 'medium',
            xpReward: 100,
            phase: phase.name,
            subtopics: topic.subtopics
          }))
        )
      };

      addLearningPath(pathToAdd);
      setActivePath(pathToAdd.id);
      setGeneratedPath(null);
      toast.success("Learning path added to your dashboard!");
    } catch (error) {
      console.error("Failed to add learning path:", error);
      toast.error("Failed to save learning path. Please try again.");
    }
  };

  // If a generated path is available, show it
  if (generatedPath) {
    return (
      <GeneratedPathDetails 
        path={generatedPath} 
        onBack={() => setGeneratedPath(null)} 
        onStart={handleStartGeneratedPath}
        onStartSession={handleStartSession}
      />
    );
  }

  // If generation failed, show error
  if (generationError) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setGenerationError(null)}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Learning Paths
        </button>
        <LearningPathsError 
          error={generationError}
          onRetry={() => {
            setGenerationError(null);
            handleGeneratePath();
          }}
        />
      </div>
    );
  }

  // If a pre-defined path is selected for details view
  if (selectedPath) {
    return (
      <PathDetails 
        path={selectedPath} 
        onBack={() => setSelectedPath(null)} 
        isActive={activePath === selectedPath.id}
        onActivate={() => setActivePath(selectedPath.id)}
        onStartSession={handleStartSession}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-2xl font-bold text-black flex items-center gap-2">
            <Map className="w-6 h-6 text-violet-600" />
            Learning Paths
          </h2>
          <p className="text-gray-700">Structured journeys to mastery</p>
        </div>

        {/* Search/Generate Section */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Enter a skill or domain (e.g., Python, Data Science)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isGenerating && handleGeneratePath()}
              disabled={isGenerating}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all bg-white text-black disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <button
            onClick={handleGeneratePath}
            disabled={isGenerating || !searchQuery.trim()}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-violet-600/20"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Roadmap
              </>
            )}
          </button>
        </div>
      </div>

      {/* ✨ NEW: Show message if no paths available */}
      {learningPaths.length === 0 ? (
        <div className="text-center py-12 px-4 bg-white rounded-2xl border border-gray-200">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Map className="w-8 h-8 text-violet-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">No Learning Paths Yet</h3>
          <p className="text-gray-600 mb-6">
            Generate your first learning path using the search box above
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {learningPaths.map((path, index) => (
            <PathCard 
              key={path.id} 
              path={path} 
              index={index}
              isActive={activePath === path.id}
              onClick={() => setSelectedPath(path)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ... (Rest of the component code remains the same: GeneratedPathDetails, PathCard, PathDetails, TopicItem)
// The existing components don't need changes, just the main LearningPaths export above

function GeneratedPathDetails({ path, onBack, onStart, onStartSession }) {
  // Existing implementation - no changes needed
  return null; // Placeholder - use existing code
}

function PathCard({ path, index, isActive, onClick }) {
  // Existing implementation - no changes needed
  return null; // Placeholder - use existing code
}

function PathDetails({ path, onBack, isActive, onActivate, onStartSession }) {
  // Existing implementation - no changes needed
  return null; // Placeholder - use existing code
}

function TopicItem({ topic, index, onClick }) {
  // Existing implementation - no changes needed
  return null; // Placeholder - use existing code
}

export function LearningPathWidget() {
  // Existing implementation - no changes needed
  return null; // Placeholder - use existing code
}
