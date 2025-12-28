'use client';

import React, { useState, useMemo } from 'react';
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
  Filter,
  Code,
  Users,
  Globe,
  Grid3X3,
  GraduationCap,
  Target,
  TrendingUp,
  Award,
  ChevronDown,
  ExternalLink
} from 'lucide-react';
import { useRecommendationsStore } from '@/lib/aiRecommendations';
import { generateLearningPath } from '@/services/LearningPathService';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { UserContext } from '@/app/AuthProvider';
import { toast } from 'sonner';

// Category configuration
const CATEGORIES = [
  { id: 'all', label: 'All Paths', icon: Grid3X3, color: 'violet' },
  { id: 'tech', label: 'Technology', icon: Code, color: 'blue' },
  { id: 'soft-skills', label: 'Soft Skills', icon: Users, color: 'emerald' },
  { id: 'languages', label: 'Languages', icon: Globe, color: 'orange' }
];

// Difficulty configuration
const DIFFICULTY_LEVELS = [
  { id: 'beginner', label: 'Beginner', color: 'emerald', description: 'Perfect for getting started' },
  { id: 'intermediate', label: 'Intermediate', color: 'amber', description: 'Build on existing knowledge' },
  { id: 'advanced', label: 'Advanced', color: 'rose', description: 'Master complex topics' }
];

// Session types for learning
const SESSION_TYPES = [
  {
    id: 'Lecture on Topic',
    label: 'Lecture',
    icon: BookOpen,
    color: 'violet',
    description: 'Learn with AI professor',
    expert: 'Professor Shweta'
  },
  {
    id: 'Mock Interview',
    label: 'Mock Interview',
    icon: Mic,
    color: 'blue',
    description: 'Practice interview questions',
    expert: 'Jokey'
  },
  {
    id: 'Ques Ans Prep',
    label: 'Q&A Prep',
    icon: UserCheck,
    color: 'emerald',
    description: 'Question & Answer practice',
    expert: 'Coach Sarah'
  }
];

export default function LearningPaths() {
  const { learningPaths, activePath, setActivePath, addLearningPath, completeTopicInPath, resetPathProgress } = useRecommendationsStore();
  const [selectedPath, setSelectedPath] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPath, setGeneratedPath] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('beginner');
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [sessionModal, setSessionModal] = useState({ show: false, topic: null });
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const router = useRouter();
  const { userData, isLoading, isReady, error: authError } = useContext(UserContext);
  const createDiscussionRoom = useMutation(api.DiscussionRoom.CreateNewRoom);

  // Filter paths by category
  const filteredPaths = useMemo(() => {
    if (activeCategory === 'all') return learningPaths;
    return learningPaths.filter(path => path.category === activeCategory);
  }, [learningPaths, activeCategory]);

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

  // Open session type modal for a topic
  const openSessionModal = (topic) => {
    if (!topic.unlocked) {
      toast.error("Complete previous topics to unlock this one");
      return;
    }
    setSessionModal({ show: true, topic });
  };

  // Close session modal
  const closeSessionModal = () => {
    setSessionModal({ show: false, topic: null });
  };

  // Start a learning session with selected type
  const handleStartSession = async (topicName, type = 'Lecture on Topic') => {
    if (isLoading) {
      toast.info("Loading your account... Please wait.");
      return;
    }

    if (authError) {
      toast.error("Account error. Please refresh the page.");
      return;
    }

    if (!isReady || !userData?._id) {
      toast.error("Please wait for your account to load or try logging in again.");
      return;
    }

    setIsCreatingSession(true);
    const toastId = toast.loading(`Starting ${type}...`);
    const expertName = getExpertForType(type);

    try {
      const roomId = await createDiscussionRoom({
        topic: topicName,
        coachingOption: type,
        expertName: expertName,
        uid: userData._id,
      });

      toast.dismiss(toastId);
      toast.success("Session created! Redirecting...");
      closeSessionModal();
      router.push(`/discussion-room/${roomId}`);
    } catch (error) {
      console.error("Failed to create session:", error);
      toast.dismiss(toastId);
      toast.error("Failed to create session. Please try again.");
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleGeneratePath = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a skill or topic to generate a learning path");
      return;
    }

    setIsGenerating(true);
    setGeneratedPath(null);
    setSelectedPath(null);

    const toastId = toast.loading(`Generating ${selectedDifficulty} learning path for "${searchQuery}"...`);

    try {
      const path = await generateLearningPath(searchQuery, selectedDifficulty, 'tech');
      setGeneratedPath(path);
      toast.dismiss(toastId);
      toast.success("Learning path generated successfully!");
    } catch (error) {
      console.error("Failed to generate path", error);
      toast.dismiss(toastId);
      toast.error("Failed to generate path. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartGeneratedPath = () => {
    if (!generatedPath) return;

    const pathToAdd = {
      ...generatedPath,
      progress: 0,
      totalXp: generatedPath.totalXp || 2500,
      estimatedHours: generatedPath.estimatedHours ||
        (generatedPath.phases?.reduce((acc, p) => acc + (parseInt(p.duration) || 10), 0) || 20),
      topics: generatedPath.phases?.flatMap((phase, pIndex) =>
        phase.topics?.map((topic, tIndex) => ({
          id: `topic-${Date.now()}-${pIndex}-${tIndex}`,
          name: topic.title,
          completed: false,
          unlocked: pIndex === 0 && tIndex === 0,
          difficulty: topic.difficulty || 'medium',
          xpReward: topic.xpReward || 100,
          phase: phase.name,
          subtopics: topic.subtopics || []
        })) || []
      ) || []
    };

    addLearningPath(pathToAdd);
    setActivePath(pathToAdd.id);
    setGeneratedPath(null);
    setSearchQuery('');
    toast.success("Learning path added to your collection!");
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

  // If a pre-defined path is selected for details view
  if (selectedPath) {
    return (
      <>
        <PathDetails
          path={selectedPath}
          onBack={() => setSelectedPath(null)}
          isActive={activePath === selectedPath.id}
          onActivate={() => setActivePath(selectedPath.id)}
          onStartSession={handleStartSession}
          onOpenSessionModal={openSessionModal}
          onCompleteTopic={(topicId) => completeTopicInPath(selectedPath.id, topicId)}
          onResetProgress={() => resetPathProgress(selectedPath.id)}
        />

        {/* Session Type Modal */}
        <SessionTypeModal
          isOpen={sessionModal.show}
          topic={sessionModal.topic}
          onClose={closeSessionModal}
          onSelectType={(type) => handleStartSession(sessionModal.topic?.name, type)}
          isLoading={isCreatingSession}
        />
      </>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl shadow-lg shadow-violet-500/30">
                <Map className="w-6 h-6 text-white" />
              </div>
              Learning Paths
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Structured journeys to mastery with AI-powered roadmaps</p>
          </div>

          {/* Stats Badge */}
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 dark:bg-violet-900/30 rounded-full border border-violet-100 dark:border-violet-800">
              <BookOpen className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-medium text-violet-700 dark:text-violet-300">{learningPaths.length} Paths Available</span>
            </div>
          </div>
        </div>

        {/* AI Path Generator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-900/20 dark:via-purple-900/20 dark:to-fuchsia-900/20 rounded-2xl p-6 border border-violet-100 dark:border-violet-800/50"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h3 className="font-bold text-gray-900 dark:text-white">AI Path Generator</h3>
            <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-800 text-violet-700 dark:text-violet-300 text-xs font-bold rounded-full">Gemini 2.5</span>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Enter a skill (e.g., Python, Data Science, Leadership)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGeneratePath()}
                className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 dark:focus:ring-violet-800 outline-none transition-all bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>

            {/* Difficulty Selector */}
            <div className="relative">
              <button
                onClick={() => setShowDifficultyDropdown(!showDifficultyDropdown)}
                className="flex items-center justify-between gap-3 px-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl min-w-[180px] hover:border-violet-300 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium capitalize">{selectedDifficulty}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDifficultyDropdown ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {showDifficultyDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl z-20 overflow-hidden"
                  >
                    {DIFFICULTY_LEVELS.map((level) => (
                      <button
                        key={level.id}
                        onClick={() => {
                          setSelectedDifficulty(level.id);
                          setShowDifficultyDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${selectedDifficulty === level.id ? 'bg-violet-50 dark:bg-violet-900/30' : ''}`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900 dark:text-white">{level.label}</span>
                          <span className={`w-2 h-2 rounded-full bg-${level.color}-500`} />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{level.description}</p>
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Generate Button */}
            <button
              onClick={handleGeneratePath}
              disabled={isGenerating || !searchQuery.trim()}
              className="px-6 py-3.5 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 disabled:from-violet-400 disabled:to-purple-400 text-white rounded-xl font-semibold transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/30 hover:shadow-violet-500/40 disabled:shadow-none min-w-[180px]"
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
        </motion.div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            const isActive = activeCategory === category.id;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                  ${isActive
                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-violet-300 hover:text-violet-600'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Learning Paths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <AnimatePresence mode="popLayout">
          {filteredPaths.map((path, index) => (
            <PathCard
              key={path.id}
              path={path}
              index={index}
              isActive={activePath === path.id}
              onClick={() => setSelectedPath(path)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Empty State */}
      {filteredPaths.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No paths in this category</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Generate a custom learning path using AI above</p>
        </motion.div>
      )}
    </div>
  );
}

// Enhanced Path Card Component
function PathCard({ path, index, isActive, onClick }) {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-800';
      case 'intermediate': return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-800';
      case 'advanced': return 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-900/30 dark:border-rose-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'tech': return 'from-blue-500 to-cyan-500';
      case 'soft-skills': return 'from-emerald-500 to-teal-500';
      case 'languages': return 'from-orange-500 to-amber-500';
      default: return 'from-violet-500 to-purple-500';
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -6, transition: { duration: 0.2 } }}
      onClick={onClick}
      className={`
        group relative p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300
        ${isActive
          ? 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/30 dark:to-purple-900/30 border-violet-400 shadow-xl shadow-violet-500/20'
          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-500/10'
        }
      `}
    >
      {/* Active Badge */}
      {isActive && (
        <div className="absolute -top-3 left-4 px-3 py-1 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-lg">
          <Sparkles className="w-3 h-3" />
          Active
        </div>
      )}

      {/* Icon & Title */}
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${getCategoryColor(path.category)} flex items-center justify-center text-2xl shadow-lg group-hover:scale-110 transition-transform`}>
          {path.icon || '📚'}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors truncate">
            {path.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
            {path.description}
          </p>
        </div>
      </div>

      {/* Difficulty & Category Tags */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize ${getDifficultyColor(path.difficulty)}`}>
          {path.difficulty || 'beginner'}
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">
          {path.category?.replace('-', ' ') || 'general'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-gray-500 dark:text-gray-400">Progress</span>
          <span className="text-gray-900 dark:text-white font-bold">{Math.round(path.progress || 0)}%</span>
        </div>
        <div className="h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${path.progress || 0}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full bg-gradient-to-r ${isActive ? 'from-violet-500 to-fuchsia-500' : 'from-gray-300 to-gray-400 dark:from-gray-500 dark:to-gray-600'}`}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <BookOpen className="w-4 h-4" />
            <span>{path.topics?.length || 0} Topics</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{path.estimatedHours || 0}h</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm font-bold text-yellow-600 dark:text-yellow-400">
          <Trophy className="w-4 h-4" />
          <span>{path.totalXp || 0} XP</span>
        </div>
      </div>

      {/* Hover Arrow */}
      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="w-5 h-5 text-violet-500" />
      </div>
    </motion.div>
  );
}

// Generated Path Details Component
function GeneratedPathDetails({ path, onBack, onStart, onStartSession }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{path.icon || '📚'}</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{path.name}</h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{path.description}</p>
        </div>
        <button
          onClick={onStart}
          className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-violet-500/30 flex items-center gap-2"
        >
          <Play className="w-5 h-5" />
          Add to My Paths
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Duration</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{path.estimatedHours || 20}h</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <Trophy className="w-4 h-4" />
            <span className="text-sm">Total XP</span>
          </div>
          <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{path.totalXp || 2500}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <BookOpen className="w-4 h-4" />
            <span className="text-sm">Phases</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white">{path.phases?.length || 0}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
            <GraduationCap className="w-4 h-4" />
            <span className="text-sm">Level</span>
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white capitalize">{path.difficulty || 'Beginner'}</p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2">
        {/* Prerequisites */}
        {path.prerequisites && path.prerequisites.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-5 border border-amber-200 dark:border-amber-800">
            <h3 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-2 mb-3">
              <Target className="w-5 h-5" />
              Prerequisites
            </h3>
            <ul className="space-y-2">
              {path.prerequisites.map((prereq, idx) => (
                <li key={idx} className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <Check className="w-4 h-4" />
                  {prereq}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Learning Phases */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Map className="w-5 h-5 text-violet-600" />
            Learning Roadmap
          </h3>

          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-violet-500 via-purple-500 to-fuchsia-500" />

            {path.phases?.map((phase, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative pl-14 pb-8"
              >
                {/* Timeline Node */}
                <div className="absolute left-3 top-2 w-6 h-6 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  {index + 1}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white">{phase.name}</h4>
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {phase.duration}
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-xs font-bold">
                      Phase {index + 1}
                    </span>
                  </div>

                  {phase.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{phase.description}</p>
                  )}

                  {/* Topics */}
                  <div className="space-y-3">
                    <h5 className="font-semibold text-gray-800 dark:text-gray-200">Topics</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {phase.topics?.map((topic, tIndex) => (
                        <div
                          key={tIndex}
                          className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600 hover:border-violet-300 dark:hover:border-violet-500 transition-colors group"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 dark:text-white">{topic.title}</p>
                              {topic.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{topic.description}</p>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onStartSession(topic.title, 'Lecture on Topic');
                              }}
                              className="opacity-0 group-hover:opacity-100 p-2 bg-violet-100 dark:bg-violet-800 text-violet-600 dark:text-violet-300 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-700 transition-all"
                              title="Start Lecture"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          </div>
                          {topic.subtopics && topic.subtopics.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {topic.subtopics.slice(0, 3).map((sub, sIndex) => (
                                <li key={sIndex} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                  <div className="w-1 h-1 rounded-full bg-violet-400" />
                                  {sub}
                                </li>
                              ))}
                              {topic.subtopics.length > 3 && (
                                <li className="text-xs text-violet-500 font-medium">
                                  +{topic.subtopics.length - 3} more
                                </li>
                              )}
                            </ul>
                          )}
                          {topic.xpReward && (
                            <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400 font-medium">
                              <Zap className="w-3 h-3" />
                              +{topic.xpReward} XP
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projects */}
                  {phase.projects && phase.projects.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <h5 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-emerald-500" />
                        Hands-on Projects
                      </h5>
                      <div className="space-y-2">
                        {phase.projects.map((project, pIndex) => (
                          <div key={pIndex} className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-lg">
                            <p className="font-medium text-emerald-800 dark:text-emerald-300">{project.name}</p>
                            <p className="text-sm text-emerald-700 dark:text-emerald-400">{project.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Interview Questions */}
        {path.interviewQuestions && path.interviewQuestions.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-violet-600" />
              Interview Preparation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {path.interviewQuestions.map((category, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 shadow-sm">
                  <h4 className="font-bold text-gray-900 dark:text-white mb-3 pb-2 border-b border-gray-100 dark:border-gray-700">
                    {category.category}
                  </h4>
                  <ul className="space-y-3">
                    {category.questions?.slice(0, 4).map((q, qIndex) => (
                      <li key={qIndex} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                        <span className="text-violet-500 font-bold mt-0.5">•</span>
                        {q}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => onStartSession(`${path.name} - ${category.category} Interview`, 'Mock Interview')}
                    className="mt-4 w-full py-2.5 bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-800/50 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Mic className="w-4 h-4" />
                    Practice Interview
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Career Mapping */}
        {path.careerMapping && (
          <div className="space-y-4 pb-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-violet-600" />
              Career Opportunities
            </h3>
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Companies */}
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4 text-gray-500" />
                    Top Companies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {path.careerMapping.companies?.slice(0, 5).map((company, index) => (
                      <span key={index} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium">
                        {company}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Roles */}
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-gray-500" />
                    Target Roles
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {path.careerMapping.roles?.slice(0, 3).map((role, index) => (
                      <span key={index} className="px-3 py-1.5 bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-full text-sm font-medium border border-violet-100 dark:border-violet-800">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Salary */}
                {path.careerMapping.salaryRange && (
                  <div>
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      Salary Range
                    </h4>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {path.careerMapping.salaryRange}
                    </p>
                  </div>
                )}

                {/* Requirements */}
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-gray-500" />
                    Requirements
                  </h4>
                  <ul className="space-y-1.5">
                    {path.careerMapping.requirements?.slice(0, 3).map((req, index) => (
                      <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Growth Outlook */}
              {path.careerMapping.growthOutlook && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                    <Award className="w-4 h-4 text-violet-500" />
                    Career Growth
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">{path.careerMapping.growthOutlook}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Path Details Component (for pre-defined paths)
function PathDetails({ path, onBack, isActive, onActivate, onStartSession, onOpenSessionModal, onCompleteTopic, onResetProgress }) {
  const handleTopicClick = (topic) => {
    if (!topic.unlocked) return;
    // Use modal if available, otherwise fallback to direct session start
    if (onOpenSessionModal) {
      onOpenSessionModal(topic);
    } else {
      onStartSession(topic.name, 'Lecture on Topic');
    }
  };

  const handleMarkComplete = (e, topic) => {
    e.stopPropagation();
    if (onCompleteTopic && !topic.completed) {
      onCompleteTopic(topic.id);
      toast.success(`✨ ${topic.name} completed! +${topic.xpReward || 100} XP`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 flex-wrap">
        <button
          onClick={onBack}
          className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{path.icon || '📚'}</span>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{path.name}</h2>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {path.estimatedHours}h Est.
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-500" /> {path.totalXp} XP
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Reset Progress Button */}
          {path.progress > 0 && (
            <button
              onClick={onResetProgress}
              className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-medium transition-colors text-sm"
              title="Reset Progress"
            >
              Reset
            </button>
          )}

          {!isActive ? (
            <button
              onClick={onActivate}
              className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-violet-500/30 flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              Start Path
            </button>
          ) : (
            <div className="px-6 py-3 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 rounded-xl font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              In Progress
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <motion.div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 overflow-hidden flex flex-col">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-gray-900 dark:text-white">Your Progress</h3>
            <span className="text-violet-600 dark:text-violet-400 font-mono font-bold">{Math.round(path.progress || 0)}%</span>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${path.progress || 0}%` }}
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-full"
            />
          </div>
        </div>

        {/* Topics List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {path.topics?.map((topic, index) => (
            <TopicItem
              key={topic.id}
              topic={topic}
              index={index}
              onClick={() => handleTopicClick(topic)}
              onMarkComplete={(e) => handleMarkComplete(e, topic)}
            />
          ))}

          {/* Completion Reward */}
          {path.progress === 100 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-2xl text-center"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h4 className="text-2xl font-bold text-yellow-800 dark:text-yellow-300 mb-2">Path Completed! 🎉</h4>
              <p className="text-yellow-700 dark:text-yellow-400">You've mastered all topics in this path!</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Topic Item Component
function TopicItem({ topic, index, onClick, onMarkComplete }) {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:text-emerald-400 dark:bg-emerald-900/30 dark:border-emerald-800';
      case 'medium': return 'text-amber-600 bg-amber-50 border-amber-200 dark:text-amber-400 dark:bg-amber-900/30 dark:border-amber-800';
      case 'hard': return 'text-rose-600 bg-rose-50 border-rose-200 dark:text-rose-400 dark:bg-rose-900/30 dark:border-rose-800';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <motion.div
      whileHover={topic.unlocked ? { scale: 1.01, x: 4 } : {}}
      whileTap={topic.unlocked ? { scale: 0.99 } : {}}
      onClick={onClick}
      className={`
        flex items-center gap-4 p-4 rounded-xl border-2 transition-all group
        ${topic.completed
          ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/20'
          : topic.unlocked
            ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-violet-300 cursor-pointer'
            : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-50 cursor-not-allowed'
        }
      `}
    >
      {/* Number/Check */}
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 transition-colors
        ${topic.completed
          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
          : topic.unlocked
            ? 'bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400 border-2 border-violet-200 dark:border-violet-700'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border-2 border-gray-200 dark:border-gray-700'
        }
      `}>
        {topic.completed ? <Check className="w-6 h-6" /> : index + 1}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`font-bold text-lg truncate ${topic.completed ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-900 dark:text-white'}`}>
            {topic.name}
          </h4>
          {!topic.unlocked && <Lock className="w-4 h-4 text-gray-400" />}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getDifficultyColor(topic.difficulty)}`}>
            {(topic.difficulty || 'medium').charAt(0).toUpperCase() + (topic.difficulty || 'medium').slice(1)}
          </span>
          <span className="text-xs text-yellow-600 dark:text-yellow-400 flex items-center gap-1 font-medium">
            <Zap className="w-3 h-3" />
            +{topic.xpReward || 100} XP
          </span>
          {topic.phase && (
            <span className="text-xs text-gray-500 dark:text-gray-400">{topic.phase}</span>
          )}
          {topic.unlocked && !topic.completed && (
            <span className="text-xs text-violet-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <Play className="w-3 h-3" /> Start
            </span>
          )}
        </div>
      </div>

      {/* Status */}
      <div className="shrink-0 flex items-center gap-2">
        {/* Mark Complete Button */}
        {topic.unlocked && !topic.completed && onMarkComplete && (
          <button
            onClick={onMarkComplete}
            className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 border border-emerald-200 dark:border-emerald-700 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-all flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            Done
          </button>
        )}

        {topic.completed ? (
          <div className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700 rounded-full text-sm font-bold flex items-center gap-1">
            <Check className="w-4 h-4" />
            Done
          </div>
        ) : topic.unlocked ? (
          <div className="w-10 h-10 rounded-full bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center transition-colors border border-violet-200 dark:border-violet-700 group-hover:bg-violet-500 group-hover:border-violet-500">
            <Play className="w-5 h-5 text-violet-500 group-hover:text-white ml-0.5" />
          </div>
        ) : (
          <Lock className="w-5 h-5 text-gray-300 dark:text-gray-600" />
        )}
      </div>
    </motion.div>
  );
}

/**
 * Session Type Selection Modal
 */
function SessionTypeModal({ isOpen, topic, onClose, onSelectType, isLoading }) {
  if (!isOpen || !topic) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Choose Learning Mode</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              How would you like to learn: <span className="font-medium text-violet-600 dark:text-violet-400">{topic.name}</span>?
            </p>
          </div>

          {/* Session Types */}
          <div className="p-6 space-y-3">
            {SESSION_TYPES.map((type) => {
              const Icon = type.icon;
              const colorClasses = {
                violet: 'from-violet-500 to-purple-600 shadow-violet-500/30',
                blue: 'from-blue-500 to-cyan-600 shadow-blue-500/30',
                emerald: 'from-emerald-500 to-teal-600 shadow-emerald-500/30'
              };

              return (
                <button
                  key={type.id}
                  onClick={() => onSelectType(type.id)}
                  disabled={isLoading}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all group
                    ${isLoading
                      ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700'
                      : 'border-gray-200 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-500 hover:shadow-lg'
                    }
                    bg-white dark:bg-gray-800
                  `}
                >
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${colorClasses[type.color]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                      {type.label}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{type.description}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">with {type.expert}</p>
                  </div>

                  {/* Arrow */}
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-violet-500 group-hover:translate-x-1 transition-all" />
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Learning Path Progress Widget (for dashboard)
 */
export function LearningPathWidget() {
  const activePath = useRecommendationsStore(state => state.activePath);
  const paths = useRecommendationsStore(state => state.learningPaths);

  const currentPath = paths.find(p => p.id === activePath);

  if (!currentPath) {
    return (
      <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="text-center py-8">
          <Map className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No active learning path
          </p>
          <button className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors shadow-lg shadow-violet-600/20">
            Choose a Path
          </button>
        </div>
      </div>
    );
  }

  const nextTopic = currentPath.topics?.find(t => !t.completed && t.unlocked);

  return (
    <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2 text-gray-900 dark:text-white">
          <Map className="w-5 h-5 text-violet-500" />
          Current Path
        </h3>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {Math.round(currentPath.progress || 0)}%
        </span>
      </div>

      <div className="mb-4">
        <p className="font-medium mb-2 text-gray-900 dark:text-white">{currentPath.name}</p>
        <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${currentPath.progress || 0}%` }}
            className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
          />
        </div>
      </div>

      {nextTopic && (
        <div className="p-3 bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Next Up:</p>
          <p className="font-medium text-gray-900 dark:text-white">{nextTopic.name}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-400">
              {nextTopic.difficulty || 'medium'}
            </span>
            <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">
              +{nextTopic.xpReward || 100} XP
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
