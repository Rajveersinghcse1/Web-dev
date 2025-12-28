'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Briefcase, GraduationCap, Users, MessageSquare,
  BookOpen, Code, Lightbulb, Trophy, Heart, Star,
  Clock, TrendingUp, Plus, Edit2, Trash2, Sparkles, ArrowRight
} from 'lucide-react';
import { useProgressStore } from '@/store';

/**
 * ⚡ SESSION PRESETS
 * Quick-launch session templates with modernized UI
 */

// Built-in session presets
const BUILT_IN_PRESETS = [
  {
    id: 'quick-lecture',
    name: 'Quick Lecture',
    icon: GraduationCap,
    color: 'purple',
    topic: 'Introduction to Machine Learning',
    expert: 'AI Research Scientist',
    mode: 'lecture',
    estimatedDuration: 15,
    xpReward: 100,
    description: 'Fast-paced learning session',
  },
  {
    id: 'interview-prep',
    name: 'Interview Practice',
    icon: Briefcase,
    color: 'blue',
    topic: 'System Design Interview',
    expert: 'Senior Software Engineer',
    mode: 'interview',
    estimatedDuration: 30,
    xpReward: 150,
    description: 'Prepare for technical interviews',
  },
  {
    id: 'coding-mentor',
    name: 'Coding Session',
    icon: Code,
    color: 'green',
    topic: 'Data Structures & Algorithms',
    expert: 'Coding Mentor',
    mode: 'tutorial',
    estimatedDuration: 45,
    xpReward: 200,
    description: 'Hands-on coding practice',
  },
  {
    id: 'career-advice',
    name: 'Career Guidance',
    icon: TrendingUp,
    color: 'orange',
    topic: 'Career Development Strategy',
    expert: 'Career Coach',
    mode: 'discussion',
    estimatedDuration: 20,
    xpReward: 120,
    description: 'Professional growth insights',
  },
  {
    id: 'debate-session',
    name: 'Debate Practice',
    icon: MessageSquare,
    color: 'red',
    topic: 'Technology Ethics',
    expert: 'Ethics Professor',
    mode: 'debate',
    estimatedDuration: 25,
    xpReward: 180,
    description: 'Sharpen your argumentation',
  },
  {
    id: 'creative-thinking',
    name: 'Creative Workshop',
    icon: Lightbulb,
    color: 'yellow',
    topic: 'Innovation & Problem Solving',
    expert: 'Design Thinking Coach',
    mode: 'brainstorm',
    estimatedDuration: 30,
    xpReward: 160,
    description: 'Unlock creative potential',
  },
];

const COLOR_CLASSES = {
  purple: 'from-violet-500 to-purple-600 shadow-violet-500/20',
  blue: 'from-blue-500 to-indigo-600 shadow-blue-500/20',
  green: 'from-emerald-500 to-teal-600 shadow-emerald-500/20',
  orange: 'from-orange-500 to-amber-600 shadow-orange-500/20',
  red: 'from-rose-500 to-red-600 shadow-rose-500/20',
  yellow: 'from-yellow-400 to-amber-500 shadow-yellow-500/20',
};

export default function SessionPresets({ onSelectPreset, className = '' }) {
  const [customPresets, setCustomPresets] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recentlyUsed, setRecentlyUsed] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('session-presets');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setCustomPresets(data.custom || []);
        setFavorites(data.favorites || []);
        setRecentlyUsed(data.recent || []);
      } catch (e) {
        console.error('Failed to load presets:', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('session-presets', JSON.stringify({
      custom: customPresets,
      favorites,
      recent: recentlyUsed,
    }));
  }, [customPresets, favorites, recentlyUsed]);

  // Handle preset selection
  const handleSelectPreset = (preset) => {
    // Add to recently used
    setRecentlyUsed(prev => {
      const updated = [preset.id, ...prev.filter(id => id !== preset.id)];
      return updated.slice(0, 5);
    });

    // Trigger callback
    onSelectPreset?.(preset);
  };

  // Toggle favorite
  const toggleFavorite = (presetId, e) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(presetId)
        ? prev.filter(id => id !== presetId)
        : [...prev, presetId]
    );
  };

  // All presets (built-in + custom)
  const allPresets = [...BUILT_IN_PRESETS, ...customPresets];

  // Filter presets
  const favoritePresets = allPresets.filter(p => favorites.includes(p.id));
  const recentPresets = recentlyUsed
    .map(id => allPresets.find(p => p.id === id))
    .filter(Boolean);

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-black flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-xl border border-violet-500/30 backdrop-blur-sm">
              <Zap className="w-8 h-8 text-violet-400" />
            </div>
            Quick Launch
          </h2>
          <p className="text-gray-800 mt-2 ml-1">
            Start a session instantly with pre-configured templates
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-violet-600 to-indigo-600 text-black rounded-xl shadow-lg shadow-violet-500/20 border border-gray-300 hover:shadow-violet-500/40 transition-all"
        >
          <Plus className="w-5 h-5" />
          <span className="font-bold">Create Preset</span>
        </motion.button>
      </div>

      {/* Favorites Section */}
      {favoritePresets.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 px-1">
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <h3 className="font-bold text-black text-lg">
              Favorites
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {favoritePresets.map((preset, index) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                isFavorite={true}
                onSelect={handleSelectPreset}
                onToggleFavorite={toggleFavorite}
                delay={index * 0.1}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Section */}
      {recentPresets.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2 px-1">
            <Clock className="w-5 h-5 text-violet-400" />
            <h3 className="font-bold text-black text-lg">
              Recently Used
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentPresets.slice(0, 3).map((preset, index) => (
              <PresetCard
                key={preset.id}
                preset={preset}
                isFavorite={favorites.includes(preset.id)}
                onSelect={handleSelectPreset}
                onToggleFavorite={toggleFavorite}
                delay={0.2 + (index * 0.1)}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* All Presets */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-2 px-1">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-black text-lg">
            All Templates
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {BUILT_IN_PRESETS.map((preset, index) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              isFavorite={favorites.includes(preset.id)}
              onSelect={handleSelectPreset}
              onToggleFavorite={toggleFavorite}
              delay={0.4 + (index * 0.05)}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// Preset Card Component
function PresetCard({ preset, isFavorite, onSelect, onToggleFavorite, delay }) {
  const Icon = preset.icon;
  const colorClass = COLOR_CLASSES[preset.color] || COLOR_CLASSES.purple;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      onClick={() => onSelect(preset)}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="relative group text-left overflow-hidden rounded-3xl bg-white backdrop-blur-md border border-gray-300 hover:border-gray-300 transition-all shadow-lg hover:shadow-xl w-full"
    >
      {/* Gradient Header */}
      <div className={`bg-linear-to-br ${colorClass} p-5 text-black relative overflow-hidden`}>
        <div className="absolute inset-0 bg-white group-hover:bg-transparent transition-colors" />
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-gray-200 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
        
        <div className="flex items-start justify-between relative z-10">
          <div className="p-3 bg-gray-200 rounded-2xl backdrop-blur-md shadow-inner border border-gray-300">
            <Icon className="w-6 h-6 text-black" />
          </div>
          <div
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(preset.id, e);
            }}
            className="p-2 rounded-xl transition-colors cursor-pointer backdrop-blur-sm"
          >
            <Star
              className={`w-5 h-5 transition-all ${
                isFavorite ? 'fill-yellow-300 text-yellow-300 scale-110' : 'text-black/70 hover:text-black'
              }`}
            />
          </div>
        </div>
        <h3 className="font-bold text-xl mt-4 tracking-tight">{preset.name}</h3>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        <p className="text-sm text-gray-800 line-clamp-2 h-10">
          {preset.description}
        </p>
        
        <div className="flex items-center gap-3 text-xs font-medium text-gray-700">
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-300">
            <Clock className="w-3.5 h-3.5" />
            {preset.estimatedDuration}m
          </div>
          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-gray-300">
            <Trophy className="w-3.5 h-3.5 text-yellow-500" />
            {preset.xpReward} XP
          </div>
        </div>

        <div className="pt-4 border-t border-gray-300 flex items-center justify-between group/btn">
          <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
            {preset.mode}
          </span>
          <div className="flex items-center gap-1 text-sm font-bold text-violet-400 group-hover/btn:translate-x-1 transition-transform">
            Start
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.button>
  );
}


