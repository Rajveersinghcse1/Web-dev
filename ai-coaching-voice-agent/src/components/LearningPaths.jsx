'use client';

import React, { useState } from 'react';
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
  Mic
} from 'lucide-react';
import { useRecommendationsStore } from '@/lib/aiRecommendations';
import { generateLearningPath } from '@/services/LearningPathService';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useRouter } from 'next/navigation';
import { useContext } from 'react';
import { UserContext } from '@/app/AuthProvider';
import { toast } from 'sonner';

export default function LearningPaths() {
  const { learningPaths, activePath, setActivePath, addLearningPath } = useRecommendationsStore();
  const [selectedPath, setSelectedPath] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPath, setGeneratedPath] = useState(null);
  
  const router = useRouter();
  const { userData } = useContext(UserContext);
  const createDiscussionRoom = useMutation(api.DiscussionRoom.CreateNewRoom);

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
    if (!userData?._id) {
      toast.error("Please log in to start a session");
      return;
    }

    const toastId = toast.loading("Creating session...");
    const expertName = getExpertForType(type);

    try {
      const roomId = await createDiscussionRoom({
        topic: topicName,
        coachingOption: type,
        expertName: expertName,
        level: 'Beginner', // Default level
        createdBy: userData._id,
      });

      toast.dismiss(toastId);
      toast.success("Session created!");
      router.push(`/discussion-room/${roomId}`);
    } catch (error) {
      console.error("Failed to create session:", error);
      toast.dismiss(toastId);
      toast.error("Failed to create session. Please try again.");
    }
  };

  const handleGeneratePath = async () => {
    if (!searchQuery.trim()) return;
    
    setIsGenerating(true);
    setGeneratedPath(null);
    setSelectedPath(null);
    
    try {
      const path = await generateLearningPath(searchQuery);
      setGeneratedPath(path);
    } catch (error) {
      console.error("Failed to generate path", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartGeneratedPath = () => {
    if (!generatedPath) return;

    // Transform generated path to match store structure while keeping rich data
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
          unlocked: pIndex === 0 && tIndex === 0, // Only unlock first topic
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
              onKeyDown={(e) => e.key === 'Enter' && handleGeneratePath()}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:border-violet-500 focus:ring-2 focus:ring-violet-200 outline-none transition-all bg-white text-black"
            />
          </div>
          <button
            onClick={handleGeneratePath}
            disabled={isGenerating || !searchQuery.trim()}
            className="px-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-400 text-white rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-violet-600/20"
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
    </div>
  );
}

function GeneratedPathDetails({ path, onBack, onStart, onStartSession }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 rounded-lg transition-colors text-gray-800 hover:text-black hover:bg-gray-100"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-black">{path.name}</h2>
          <p className="text-gray-600">{path.description}</p>
        </div>
        <button
          onClick={onStart}
          className="ml-auto px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-violet-600/20 flex items-center gap-2"
        >
          <Play className="w-4 h-4" />
          Start Path
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2">
        {/* Phases */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-black flex items-center gap-2">
            <Map className="w-5 h-5 text-violet-600" />
            Learning Phases
          </h3>
          {path.phases.map((phase, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold text-black">{phase.name}</h4>
                  <span className="text-sm text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {phase.duration}
                  </span>
                </div>
                <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">
                  Phase {index + 1}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h5 className="font-semibold text-gray-900 mb-2">Topics</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {phase.topics.map((topic, tIndex) => (
                      <div key={tIndex} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-violet-200 transition-colors group">
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-black">{topic.title}</p>
                          <button 
                            onClick={() => onStartSession(topic.title, 'Lecture on Topic')}
                            className="opacity-0 group-hover:opacity-100 p-1.5 bg-violet-100 text-violet-600 rounded-lg hover:bg-violet-200 transition-all"
                            title="Start Lecture"
                          >
                            <Play className="w-3 h-3" />
                          </button>
                        </div>
                        <ul className="mt-1 space-y-1">
                          {topic.subtopics.map((sub, sIndex) => (
                            <li key={sIndex} className="text-xs text-gray-600 flex items-center gap-1.5">
                              <div className="w-1 h-1 rounded-full bg-violet-400" />
                              {sub}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {phase.projects && phase.projects.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Projects</h5>
                    <div className="space-y-2">
                      {phase.projects.map((project, pIndex) => (
                        <div key={pIndex} className="flex items-start gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                          <Trophy className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-medium text-emerald-900">{project.name}</p>
                            <p className="text-sm text-emerald-700">{project.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Interview Questions */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-black flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-violet-600" />
            Interview Preparation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {path.interviewQuestions.map((category, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm flex flex-col">
                <h4 className="font-bold text-black mb-3 pb-2 border-b border-gray-100">
                  {category.category}
                </h4>
                <ul className="space-y-3 flex-1">
                  {category.questions.map((q, qIndex) => (
                    <li key={qIndex} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-violet-500 font-bold">•</span>
                      {q}
                    </li>
                  ))}
                </ul>
                <button 
                  onClick={() => onStartSession(`${path.name} - ${category.category} Interview`, 'Mock Interview')}
                  className="mt-4 w-full py-2 bg-violet-50 text-violet-600 hover:bg-violet-100 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  Start Mock Interview
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Career Mapping */}
        <div className="space-y-4 pb-8">
          <h3 className="text-xl font-bold text-black flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-violet-600" />
            Career Landscape
          </h3>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  Target Companies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {path.careerMapping.companies.map((company, index) => (
                    <span key={index} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      {company}
                    </span>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-gray-500" />
                  Target Roles
                </h4>
                <div className="flex flex-wrap gap-2">
                  {path.careerMapping.roles.map((role, index) => (
                    <span key={index} className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-sm border border-violet-100">
                      {role}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Check className="w-4 h-4 text-gray-500" />
                  Key Requirements
                </h4>
                <ul className="space-y-2">
                  {path.careerMapping.requirements.map((req, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PathCard({ path, index, isActive, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className={`
        group relative p-6 rounded-2xl border cursor-pointer transition-all duration-300
        ${isActive 
          ? 'bg-violet-100 border-violet-500/50 shadow-[0_0_30px_rgba(139,92,246,0.15)]' 
          : 'bg-white border-gray-300 hover:bg-white hover:border-gray-300 dark:hover:border-gray-300'
        }
        backdrop-blur-xl
      `}
    >
      {isActive && (
        <div className="absolute top-4 right-4 px-3 py-1 bg-violet-200 border border-violet-400 rounded-full text-xs font-bold text-violet-700 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3" />
          Active
        </div>
      )}

      <div className="flex items-start gap-4 mb-4">
        <div className={`
          p-3 rounded-xl 
          ${isActive ? 'bg-violet-200 text-violet-700' : 'bg-white text-gray-700 group-hover:text-black'}
          transition-colors
        `}>
          {path.icon || <Map className="w-6 h-6" />}
        </div>
        <div>
          <h3 className="font-bold text-lg text-black group-hover:text-violet-600 dark:group-hover:text-violet-300 transition-colors">
            {path.name}
          </h3>
          <p className="text-sm text-gray-800 line-clamp-2">
            {path.description}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-black/50">Progress</span>
          <span className="text-black font-medium">{Math.round(path.progress)}%</span>
        </div>
        <div className="h-2 bg-white rounded-full overflow-hidden border border-gray-300">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${path.progress}%` }}
            className={`h-full rounded-full ${isActive ? 'bg-linear-to-r from-violet-500 to-fuchsia-500' : 'bg-gray-200'}`}
          />
        </div>
        
        <div className="flex items-center gap-4 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-black/50">
            <BookOpen className="w-3.5 h-3.5" />
            {path.topics.length} Topics
          </div>
          <div className="flex items-center gap-1.5 text-xs text-black/50">
            <Clock className="w-3.5 h-3.5" />
            {path.estimatedHours}h
          </div>
          <div className="flex items-center gap-1.5 text-xs text-black/50 ml-auto">
            <Trophy className="w-3.5 h-3.5 text-yellow-500/70" />
            {path.totalXp} XP
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function PathDetails({ path, onBack, isActive, onActivate, onStartSession }) {
  const handleTopicClick = (topic) => {
    if (!topic.unlocked) return;
    // Start a lecture session for this topic
    onStartSession(topic.name, 'Lecture on Topic');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={onBack}
          className="p-2 rounded-lg transition-colors text-gray-800 hover:text-black"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-black">{path.name}</h2>
          <div className="flex items-center gap-3 text-sm text-gray-800">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> {path.estimatedHours}h Est.
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-500/70" /> {path.totalXp} XP Total
            </span>
          </div>
        </div>
        
        {!isActive && (
          <button
            onClick={onActivate}
            className="ml-auto px-4 py-2 bg-violet-600 hover:bg-violet-700 text-black rounded-lg font-medium transition-colors shadow-lg shadow-violet-600/20 flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            Start Path
          </button>
        )}
        
        {isActive && (
          <div className="ml-auto px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-lg font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            In Progress
          </div>
        )}
      </div>

      {/* Content */}
      <motion.div 
        className="flex-1 bg-white backdrop-blur-xl rounded-2xl border border-gray-300 p-6 overflow-hidden flex flex-col"
      >
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-bold text-black">Your Progress</h3>
            <span className="text-violet-400 font-mono">{Math.round(path.progress)}%</span>
          </div>
          <div className="h-3 bg-white rounded-full overflow-hidden border border-gray-300">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${path.progress}%` }}
              className="h-full bg-linear-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_15px_rgba(139,92,246,0.4)]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {path.topics.map((topic, index) => (
            <TopicItem
              key={topic.id}
              topic={topic}
              index={index}
              onClick={() => handleTopicClick(topic)}
            />
          ))}
          
          {/* Completion Reward */}
          {path.progress === 100 && (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-8 p-6 bg-linear-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl text-black text-center shadow-lg backdrop-blur-sm"
            >
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-yellow-500/30">
                <Trophy className="w-8 h-8 text-yellow-400" />
              </div>
              <h4 className="text-2xl font-bold mb-2 text-yellow-900">Path Completed! 🎉</h4>
              <p className="text-black/70 text-lg">You've mastered all topics in this path!</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

function TopicItem({ topic, index, onClick }) {
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
      case 'hard': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-gray-800 bg-white border-gray-300';
    }
  };
  
  return (
    <motion.div
      whileHover={topic.unlocked ? { scale: 1.01, x: 4 } : {}}
      whileTap={topic.unlocked ? { scale: 0.99 } : {}}
      onClick={onClick}
      className={`
        flex items-center gap-4 p-4 rounded-xl border transition-all shadow-sm group
        ${topic.completed 
          ? 'border-emerald-500/30 bg-emerald-500/5'
          : topic.unlocked
            ? 'border-gray-300 bg-white hover:border-violet-500/30 cursor-pointer'
            : 'border-gray-300 bg-white opacity-40 cursor-not-allowed'
        }
      `}
    >
      {/* Number */}
      <div className={`
        w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 transition-colors
        ${topic.completed 
          ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.3)]' 
          : topic.unlocked 
            ? 'bg-violet-500/20 text-violet-400 border border-violet-500/30' 
            : 'bg-gray-100 text-black/30 border border-gray-300'
        }
      `}>
        {topic.completed ? <Check className="w-6 h-6" /> : index + 1}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={`font-bold text-lg truncate ${topic.completed ? 'text-emerald-400' : 'text-black'}`}>
            {topic.name}
          </h4>
          {!topic.unlocked && <Lock className="w-4 h-4 text-black/30" />}
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${getDifficultyColor(topic.difficulty)}`}>
            {topic.difficulty.charAt(0).toUpperCase() + topic.difficulty.slice(1)}
          </span>
          <span className="text-xs text-black/50 flex items-center gap-1 font-medium">
            <Zap className="w-3 h-3 text-yellow-500" />
            +{topic.xpReward} XP
          </span>
          {topic.unlocked && !topic.completed && (
            <span className="text-xs text-violet-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <Play className="w-3 h-3" /> Start Session
            </span>
          )}
        </div>
      </div>
      
      {/* Status Icon */}
      <div className="shrink-0">
        {topic.completed ? (
          <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-sm font-bold">
            Done
          </div>
        ) : topic.unlocked ? (
          <div className="w-8 h-8 rounded-full bg-violet-500/10 flex items-center justify-center transition-colors border border-violet-500/20 group-hover:bg-violet-500 group-hover:text-white">
            <Play className="w-4 h-4 text-violet-400 group-hover:text-white ml-0.5" />
          </div>
        ) : (
          <Lock className="w-5 h-5 text-gray-400" />
        )}
      </div>
    </motion.div>
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
      <div className="p-6 bg-white backdrop-blur-md rounded-xl border border-gray-300">
        <div className="text-center py-8">
          <Map className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-800 mb-4">
            No active learning path
          </p>
          <button className="px-4 py-2 bg-violet-600 text-black rounded-lg hover:bg-violet-700 transition-colors shadow-lg shadow-violet-600/20">
            Choose a Path
          </button>
        </div>
      </div>
    );
  }
  
  const nextTopic = currentPath.topics.find(t => !t.completed && t.unlocked);
  
  return (
    <div className="p-6 bg-white backdrop-blur-md rounded-xl border border-gray-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2 text-black">
          <Map className="w-5 h-5 text-violet-400" />
          Current Path
        </h3>
        <span className="text-sm text-gray-800">
          {Math.round(currentPath.progress)}%
        </span>
      </div>
      
      <div className="mb-4">
        <p className="font-medium mb-2 text-black">{currentPath.name}</p>
        <div className="h-2 bg-white rounded-full overflow-hidden border border-gray-300">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${currentPath.progress}%` }}
            className="h-full bg-linear-to-r from-violet-500 to-fuchsia-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
          />
        </div>
      </div>
      
      {nextTopic && (
        <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
          <p className="text-sm text-gray-800 mb-1">Next Up:</p>
          <p className="font-medium text-black">{nextTopic.name}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-1 bg-white border border-gray-300 rounded text-black">
              {nextTopic.difficulty}
            </span>
            <span className="text-xs text-black/50">
              +{nextTopic.xpReward} XP
            </span>
          </div>
        </div>
      )}
    </div>
  );
}


