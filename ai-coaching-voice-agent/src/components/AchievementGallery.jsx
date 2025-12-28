"use client";
import { useState, useMemo } from 'react';
import { useProgressStore } from '@/store';
import { ACHIEVEMENTS, ACHIEVEMENT_CATEGORIES, RARITY_CONFIG } from '@/lib/achievements';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Lock, Star, Trophy, Sparkles, Search, X, Zap, Layers, Grid3X3 } from 'lucide-react';
import { Button } from './ui/button';

// ==================== Helper Functions ====================

// Map icons from string names to components
const getIconComponent = (icon) => {
  if (typeof icon !== 'string') return icon;
  const iconMap = {
    Sparkles, Star, Trophy, Award, Zap, Lock,
    BookOpen: require('lucide-react').BookOpen,
    Brain: require('lucide-react').Brain,
    Target: require('lucide-react').Target,
    Crown: require('lucide-react').Crown,
    Flame: require('lucide-react').Flame,
    Clock: require('lucide-react').Clock,
    Rocket: require('lucide-react').Rocket,
    MessageSquare: require('lucide-react').MessageSquare,
    TrendingUp: require('lucide-react').TrendingUp,
    Heart: require('lucide-react').Heart,
    Medal: require('lucide-react').Medal,
  };
  return iconMap[icon] || Star;
};

// ==================== Sub-Components ====================

const RarityBadge = ({ rarity }) => {
  const config = RARITY_CONFIG[rarity] || RARITY_CONFIG['common'];
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm
      ${config.color} bg-white backdrop-blur-sm border border-gray-300
    `}>
      <Star className="w-3 h-3 fill-current" />
      {rarity}
    </span>
  );
};

const AchievementCard = ({ achievement, isUnlocked, isLocked, progress, onClick }) => {
  const Icon = getIconComponent(achievement.icon);
  const rarity = RARITY_CONFIG[achievement.rarity] || RARITY_CONFIG['common'];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={isUnlocked ? { y: -5, scale: 1.02 } : {}}
      whileTap={isUnlocked ? { scale: 0.98 } : {}}
      onClick={isUnlocked ? onClick : undefined}
      className={`
        relative group overflow-hidden rounded-2xl transition-all duration-300
        ${isUnlocked
          ? 'cursor-pointer shadow-lg hover:shadow-2xl ring-1 ring-white/10'
          : isLocked
            ? 'cursor-not-allowed opacity-40 grayscale'
            : 'cursor-default opacity-60 grayscale-[0.5]'
        }
      `}
    >
      {/* Background Gradient */}
      <div className={`absolute inset-0 opacity-10 transition-opacity duration-300 group-hover:opacity-20 bg-linear-to-br ${rarity.gradient}`} />

      {/* Card Content */}
      <div className="relative p-5 bg-white backdrop-blur-xl h-full flex flex-col items-center text-center border border-gray-300 rounded-2xl shadow-lg">

        {/* Level Badge */}
        {achievement.level && (
          <div className="absolute top-3 right-3 px-2 py-0.5 bg-gray-100 rounded-full text-xs font-semibold text-gray-600">
            Lv. {achievement.level}
          </div>
        )}

        {/* Icon Container */}
        <div className={`
          relative w-20 h-20 mb-4 rounded-2xl flex items-center justify-center shadow-inner
          ${isUnlocked
            ? `bg-linear-to-br ${rarity.gradient} text-black shadow-lg`
            : 'bg-gray-200 text-gray-400'}
        `}>
          <Icon className={`w-10 h-10 ${isUnlocked ? 'drop-shadow-md' : ''}`} />

          {/* Lock Overlay */}
          {!isUnlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-300/80 rounded-2xl backdrop-blur-[1px]">
              <Lock className="w-8 h-8 text-gray-500" />
            </div>
          )}
        </div>

        {/* Text Content */}
        <h3 className={`font-bold text-lg mb-1 leading-tight ${isUnlocked ? 'text-black' : 'text-gray-400'}`}>
          {achievement.name}
        </h3>

        <p className="text-sm text-gray-700 line-clamp-2 mb-4 flex-1">
          {achievement.description}
        </p>

        {/* Progress Bar (if applicable) */}
        {progress !== null && !isUnlocked && (
          <div className="w-full mb-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progress</span>
              <span>{progress.current}/{progress.target}</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full bg-linear-to-r ${rarity.gradient} rounded-full transition-all duration-500`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="w-full flex items-center justify-between mt-auto pt-4 border-t border-gray-300">
          <RarityBadge rarity={achievement.rarity} />
          <span className={`
            flex items-center gap-1 text-sm font-bold
            ${isUnlocked ? 'text-amber-500' : 'text-gray-300'}
          `}>
            <Zap className="w-4 h-4 fill-current" />
            {achievement.xpReward}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const AchievementModal = ({ achievement, onClose }) => {
  if (!achievement) return null;

  const Icon = getIconComponent(achievement.icon);
  const rarity = RARITY_CONFIG[achievement.rarity] || RARITY_CONFIG['common'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.8, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 50, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg overflow-hidden bg-white border border-gray-300 rounded-3xl shadow-2xl"
      >
        {/* Header Background */}
        <div className={`h-32 bg-linear-to-br ${rarity.gradient} relative overflow-hidden`}>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/30" />
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-32 h-32 bg-white rounded-full flex items-center justify-center p-2 shadow-xl">
            <div className={`w-full h-full rounded-full flex items-center justify-center bg-linear-to-br ${rarity.gradient}`}>
              <Icon className="w-14 h-14 text-black drop-shadow-lg" />
            </div>
          </div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/30 hover:bg-white/50 text-black rounded-full transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="pt-20 pb-8 px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-3xl font-bold text-black mb-2">
              {achievement.name}
            </h2>
            <div className="flex justify-center gap-3 mb-6">
              <RarityBadge rarity={achievement.rarity} />
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" />
                +{achievement.xpReward} XP
              </span>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-700 mb-8 leading-relaxed"
          >
            {achievement.description}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Category</div>
              <div className="text-black font-medium capitalize">{achievement.category.replace('_', ' ')}</div>
            </div>
            {achievement.level && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-1">Level</div>
                <div className="text-black font-medium">Level {achievement.level}</div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

function StatsCard({ icon: Icon, label, value, subtext, color }) {
  const colors = {
    purple: "bg-violet-500/10 text-violet-500 border-violet-500/20",
    amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  };

  return (
    <div className="bg-white backdrop-blur-md p-6 rounded-2xl border border-gray-300 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl border ${colors[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
        <h4 className="text-2xl font-bold text-black">{value}</h4>
        <p className="text-xs text-gray-500 mt-1">{subtext}</p>
      </div>
    </div>
  );
}

// ==================== Main Component ====================

export default function AchievementGallery() {
  const unlockedAchievements = useProgressStore(state => state.unlockedAchievements) || [];
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'levels'

  // Use static achievements data
  const achievementList = useMemo(() => Object.values(ACHIEVEMENTS), []);

  // Filter logic
  const filteredAchievements = useMemo(() => {
    return achievementList.filter(a => {
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!a.name.toLowerCase().includes(q) && !a.description.toLowerCase().includes(q)) return false;
      }
      if (filterCategory !== 'all' && a.category !== filterCategory) return false;
      if (filterRarity !== 'all' && a.rarity !== filterRarity) return false;
      if (showOnlyUnlocked && !unlockedAchievements.includes(a.id)) return false;
      return true;
    });
  }, [achievementList, filterCategory, filterRarity, showOnlyUnlocked, searchQuery, unlockedAchievements]);

  // Group by level for level view
  const achievementsByLevel = useMemo(() => {
    const grouped = {};
    filteredAchievements.forEach(a => {
      // Infer level from achievement properties or default to 1
      const level = a.level || (a.rarity === 'legendary' ? 10 : a.rarity === 'epic' ? 7 : a.rarity === 'rare' ? 5 : a.rarity === 'uncommon' ? 3 : 1);
      if (!grouped[level]) grouped[level] = [];
      grouped[level].push({ ...a, inferredLevel: level });
    });
    return grouped;
  }, [filteredAchievements]);

  // Stats
  const stats = useMemo(() => {
    const unlocked = unlockedAchievements.length;
    const total = achievementList.length;
    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0;
    const totalXP = achievementList
      .filter(a => unlockedAchievements.includes(a.id))
      .reduce((sum, a) => sum + a.xpReward, 0);
    const rareBadges = achievementList.filter(a =>
      unlockedAchievements.includes(a.id) && ['rare', 'epic', 'legendary'].includes(a.rarity)
    ).length;

    return { unlocked, total, percentage, totalXP, rareBadges };
  }, [unlockedAchievements, achievementList]);

  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          icon={Award}
          label="Unlocked"
          value={`${stats.unlocked}/${stats.total}`}
          subtext={`${stats.percentage}% complete`}
          color="purple"
        />
        <StatsCard
          icon={Zap}
          label="Total XP"
          value={stats.totalXP.toLocaleString()}
          subtext="Lifetime earned"
          color="amber"
        />
        <StatsCard
          icon={Trophy}
          label="Rare Badges"
          value={stats.rareBadges}
          subtext="Special achievements"
          color="blue"
        />
        <div className="bg-white backdrop-blur-md p-6 rounded-2xl border border-gray-300 shadow-sm flex flex-col justify-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Overall Progress</span>
            <span className="text-lg font-bold text-emerald-500">{stats.percentage}%</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${stats.percentage}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white backdrop-blur-md p-4 rounded-2xl border border-gray-300 shadow-sm flex flex-col xl:flex-row gap-4 items-center">
        {/* Search */}
        <div className="relative flex-1 w-full xl:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search achievements..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all placeholder-gray-400"
          />
        </div>

        {/* View Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black'}`}
          >
            <Grid3X3 className="w-4 h-4" />
            Grid
          </button>
          <button
            onClick={() => setViewMode('levels')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${viewMode === 'levels' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black'}`}
          >
            <Layers className="w-4 h-4" />
            Levels
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 w-full xl:w-auto overflow-x-auto pb-2 xl:pb-0">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            <option value="all">All Categories</option>
            {Object.keys(ACHIEVEMENT_CATEGORIES).map(cat => (
              <option key={cat} value={cat}>{ACHIEVEMENT_CATEGORIES[cat].name}</option>
            ))}
          </select>

          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-black focus:outline-none focus:ring-2 focus:ring-violet-500 cursor-pointer"
          >
            <option value="all">All Rarities</option>
            {Object.keys(RARITY_CONFIG).map(rarity => (
              <option key={rarity} value={rarity} className="capitalize">{rarity}</option>
            ))}
          </select>

          <button
            onClick={() => setShowOnlyUnlocked(!showOnlyUnlocked)}
            className={`
              px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap border
              ${showOnlyUnlocked
                ? 'bg-violet-100 text-violet-700 border-violet-300'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
              }
            `}
          >
            {showOnlyUnlocked ? '✓ Unlocked Only' : 'Show All'}
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          <AnimatePresence mode='popLayout'>
            {filteredAchievements.map(achievement => (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isUnlocked={unlockedAchievements.includes(achievement.id)}
                isLocked={false}
                progress={null}
                onClick={() => setSelectedAchievement(achievement)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="space-y-12">
          {Object.entries(achievementsByLevel)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([level, achs]) => (
              <div key={level}>
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
                  <h3 className="text-xl font-bold text-gray-800 bg-gradient-to-r from-violet-100 to-purple-100 px-6 py-2 rounded-full border border-violet-200 shadow-sm">
                    Level {level}
                  </h3>
                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent flex-1"></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {achs.sort((a, b) => (a.order || 0) - (b.order || 0)).map(achievement => (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      isUnlocked={unlockedAchievements.includes(achievement.id)}
                      isLocked={false}
                      progress={null}
                      onClick={() => setSelectedAchievement(achievement)}
                    />
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* No Results */}
      {filteredAchievements.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-200">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-black mb-2">
            No achievements found
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            We couldn't find any achievements matching your current filters.
          </p>
          <Button
            onClick={() => {
              setSearchQuery('');
              setFilterCategory('all');
              setFilterRarity('all');
              setShowOnlyUnlocked(false);
            }}
            variant="outline"
            className="bg-white border-gray-300 text-black hover:bg-gray-50"
          >
            Clear All Filters
          </Button>
        </motion.div>
      )}

      {/* Achievement Detail Modal */}
      <AnimatePresence>
        {selectedAchievement && (
          <AchievementModal
            achievement={selectedAchievement}
            onClose={() => setSelectedAchievement(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
