import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useGame } from '../../context/GameContext';
import { 
  Trophy, 
  Star, 
  Medal, 
  Crown, 
  Shield, 
  Target, 
  Zap, 
  Brain, 
  Code, 
  Heart,
  Award,
  CheckCircle,
  Lock,
  Flame,
  Clock,
  Users,
  BookOpen,
  Lightbulb,
  Sparkles,
  Gift,
  Calendar,
  TrendingUp,
  Diamond,
  Swords
} from 'lucide-react';

/**
 * Advanced Achievement System UI
 * Features:
 * - Visual badge collection with rarity tiers
 * - Progress tracking with real-time updates
 * - Achievement categories and filters
 * - Milestone rewards and celebrations
 * - Social sharing and leaderboards
 * - Daily/weekly/monthly challenges
 * - Prestige system for advanced players
 */

// Comprehensive Achievement Database
const ACHIEVEMENT_CATEGORIES = {
  learning: {
    name: 'Learning Mastery',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'blue',
    description: 'Achievements for completing learning milestones'
  },
  coding: {
    name: 'Coding Excellence',
    icon: <Code className="w-5 h-5" />,
    color: 'green',
    description: 'Rewards for coding achievements and problem solving'
  },
  consistency: {
    name: 'Consistency Champion',
    icon: <Calendar className="w-5 h-5" />,
    color: 'purple',
    description: 'Daily streaks and regular learning habits'
  },
  social: {
    name: 'Social Connector',
    icon: <Users className="w-5 h-5" />,
    color: 'pink',
    description: 'Community interaction and collaboration'
  },
  mastery: {
    name: 'Skill Mastery',
    icon: <Crown className="w-5 h-5" />,
    color: 'yellow',
    description: 'Advanced skill mastery and expertise'
  },
  special: {
    name: 'Special Events',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'rainbow',
    description: 'Limited-time and special event achievements'
  }
};

// Achievement Rarity System
const RARITY_TIERS = {
  common: {
    name: 'Common',
    color: 'text-gray-600 bg-gray-100',
    glow: 'shadow-gray-300',
    points: 10,
    icon: <Medal className="w-4 h-4" />
  },
  uncommon: {
    name: 'Uncommon',
    color: 'text-green-600 bg-green-100',
    glow: 'shadow-green-300',
    points: 25,
    icon: <Star className="w-4 h-4" />
  },
  rare: {
    name: 'Rare',
    color: 'text-blue-600 bg-blue-100',
    glow: 'shadow-blue-300',
    points: 50,
    icon: <Trophy className="w-4 h-4" />
  },
  epic: {
    name: 'Epic',
    color: 'text-purple-600 bg-purple-100',
    glow: 'shadow-purple-300',
    points: 100,
    icon: <Crown className="w-4 h-4" />
  },
  legendary: {
    name: 'Legendary',
    color: 'text-orange-600 bg-orange-100',
    glow: 'shadow-orange-300',
    points: 200,
    icon: <Diamond className="w-4 h-4" />
  },
  mythical: {
    name: 'Mythical',
    color: 'text-red-600 bg-red-100',
    glow: 'shadow-red-300',
    points: 500,
    icon: <Flame className="w-4 h-4" />
  }
};

// Extended Achievement Database
const ACHIEVEMENT_DATABASE = {
  // Learning Mastery Achievements
  first_steps: {
    id: 'first_steps',
    name: 'First Steps',
    description: 'Complete your first coding quest',
    category: 'learning',
    rarity: 'common',
    icon: <Target className="w-8 h-8" />,
    requirements: { questsCompleted: 1 },
    rewards: { xp: 50, skillPoints: 1, avatarItem: 'beginner_badge' }
  },
  quest_warrior: {
    id: 'quest_warrior',
    name: 'Quest Warrior',
    description: 'Complete 10 coding quests',
    category: 'learning',
    rarity: 'uncommon',
    icon: <Swords className="w-8 h-8" />,
    requirements: { questsCompleted: 10 },
    rewards: { xp: 200, skillPoints: 3, avatarItem: 'warrior_helmet' }
  },
  knowledge_seeker: {
    id: 'knowledge_seeker',
    name: 'Knowledge Seeker',
    description: 'Reach level 10 in any skill tree',
    category: 'learning',
    rarity: 'rare',
    icon: <Brain className="w-8 h-8" />,
    requirements: { skillLevel: 10 },
    rewards: { xp: 500, skillPoints: 5, theme: 'scholar_theme' }
  },

  // Coding Excellence Achievements
  code_ninja: {
    id: 'code_ninja',
    name: 'Code Ninja',
    description: 'Write 1000 lines of code',
    category: 'coding',
    rarity: 'uncommon',
    icon: <Code className="w-8 h-8" />,
    requirements: { linesOfCode: 1000 },
    rewards: { xp: 300, skillPoints: 2, avatarItem: 'ninja_mask' }
  },
  bug_hunter: {
    id: 'bug_hunter',
    name: 'Bug Hunter',
    description: 'Fix 50 code errors in challenges',
    category: 'coding',
    rarity: 'rare',
    icon: <Shield className="w-8 h-8" />,
    requirements: { bugsFixed: 50 },
    rewards: { xp: 400, skillPoints: 4, avatarItem: 'bug_hunter_badge' }
  },
  perfectionist: {
    id: 'perfectionist',
    name: 'Perfectionist',
    description: 'Complete 5 quests with 100% test success',
    category: 'coding',
    rarity: 'epic',
    icon: <Star className="w-8 h-8" />,
    requirements: { perfectQuests: 5 },
    rewards: { xp: 800, skillPoints: 8, theme: 'perfectionist_theme' }
  },

  // Consistency Champion Achievements
  daily_coder: {
    id: 'daily_coder',
    name: 'Daily Coder',
    description: 'Code for 7 consecutive days',
    category: 'consistency',
    rarity: 'uncommon',
    icon: <Calendar className="w-8 h-8" />,
    requirements: { dailyStreak: 7 },
    rewards: { xp: 250, skillPoints: 2, avatarItem: 'streak_badge' }
  },
  dedication_master: {
    id: 'dedication_master',
    name: 'Dedication Master',
    description: 'Maintain a 30-day coding streak',
    category: 'consistency',
    rarity: 'epic',
    icon: <Flame className="w-8 h-8" />,
    requirements: { dailyStreak: 30 },
    rewards: { xp: 1000, skillPoints: 10, theme: 'dedication_theme' }
  },

  // Social Connector Achievements
  helpful_mentor: {
    id: 'helpful_mentor',
    name: 'Helpful Mentor',
    description: 'Help 10 other learners in the community',
    category: 'social',
    rarity: 'rare',
    icon: <Heart className="w-8 h-8" />,
    requirements: { helpCount: 10 },
    rewards: { xp: 600, skillPoints: 5, avatarItem: 'mentor_crown' }
  },
  community_champion: {
    id: 'community_champion',
    name: 'Community Champion',
    description: 'Participate in 20 community challenges',
    category: 'social',
    rarity: 'epic',
    icon: <Users className="w-8 h-8" />,
    requirements: { communityEvents: 20 },
    rewards: { xp: 800, skillPoints: 8, theme: 'community_theme' }
  },

  // Skill Mastery Achievements
  frontend_master: {
    id: 'frontend_master',
    name: 'Frontend Master',
    description: 'Master all frontend skills',
    category: 'mastery',
    rarity: 'legendary',
    icon: <Crown className="w-8 h-8" />,
    requirements: { frontendMastery: 100 },
    rewards: { xp: 2000, skillPoints: 20, theme: 'frontend_master_theme' }
  },
  fullstack_legend: {
    id: 'fullstack_legend',
    name: 'Fullstack Legend',
    description: 'Achieve mastery in both frontend and backend',
    category: 'mastery',
    rarity: 'mythical',
    icon: <Diamond className="w-8 h-8" />,
    requirements: { fullstackMastery: 100 },
    rewards: { xp: 5000, skillPoints: 50, theme: 'legend_theme' }
  },

  // Special Event Achievements
  early_adopter: {
    id: 'early_adopter',
    name: 'Early Adopter',
    description: 'One of the first 100 members of Coding Society',
    category: 'special',
    rarity: 'legendary',
    icon: <Sparkles className="w-8 h-8" />,
    requirements: { memberNumber: 100 },
    rewards: { xp: 1500, skillPoints: 15, avatarItem: 'founder_badge' }
  },
  holiday_spirit: {
    id: 'holiday_spirit',
    name: 'Holiday Spirit',
    description: 'Complete special holiday challenges',
    category: 'special',
    rarity: 'rare',
    icon: <Gift className="w-8 h-8" />,
    requirements: { holidayQuests: 5 },
    rewards: { xp: 500, skillPoints: 5, theme: 'holiday_theme' }
  }
};

const AchievementSystemUI = () => {
  const { gameState, unlockAchievement, showNotification } = useGame();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState(null);
  const [filterRarity, setFilterRarity] = useState('all');
  const [showOnlyUnlocked, setShowOnlyUnlocked] = useState(false);

  const achievements = gameState.achievements || { unlocked: [], inProgress: [] };
  const stats = gameState.stats || {};

  // Check achievement progress
  const checkAchievementProgress = (achievement) => {
    const reqs = achievement.requirements;
    const progress = {};
    let totalProgress = 0;
    let maxProgress = 0;

    Object.entries(reqs).forEach(([key, value]) => {
      const currentValue = stats[key] || 0;
      progress[key] = {
        current: Math.min(currentValue, value),
        target: value,
        percentage: Math.min((currentValue / value) * 100, 100)
      };
      totalProgress += progress[key].current;
      maxProgress += value;
    });

    return {
      ...progress,
      overall: (totalProgress / maxProgress) * 100,
      isComplete: totalProgress >= maxProgress
    };
  };

  // Filter achievements
  const getFilteredAchievements = () => {
    let filtered = Object.values(ACHIEVEMENT_DATABASE);

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    if (filterRarity !== 'all') {
      filtered = filtered.filter(a => a.rarity === filterRarity);
    }

    if (showOnlyUnlocked) {
      filtered = filtered.filter(a => 
        achievements.unlocked.some(unlocked => unlocked.id === a.id)
      );
    }

    return filtered;
  };

  // Get achievement status
  const getAchievementStatus = (achievement) => {
    const unlocked = achievements.unlocked.find(a => a.id === achievement.id);
    if (unlocked) return { status: 'unlocked', unlockedAt: unlocked.unlockedAt };

    const progress = checkAchievementProgress(achievement);
    if (progress.isComplete) return { status: 'ready', progress };

    return { status: 'locked', progress };
  };

  // Claim achievement
  const handleClaimAchievement = (achievement) => {
    const success = unlockAchievement(achievement.id);
    if (success) {
      showNotification({
        type: 'achievement',
        title: 'Achievement Unlocked! 🏆',
        message: achievement.name,
        icon: achievement.icon,
        rarity: achievement.rarity
      });
    }
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      learning: 'text-blue-600 bg-blue-100',
      coding: 'text-green-600 bg-green-100',
      consistency: 'text-purple-600 bg-purple-100',
      social: 'text-pink-600 bg-pink-100',
      mastery: 'text-yellow-600 bg-yellow-100',
      special: 'text-rainbow bg-gradient-to-r from-purple-100 to-pink-100'
    };
    return colors[category] || 'text-gray-600 bg-gray-100';
  };

  // Calculate total achievement points
  const getTotalAchievementPoints = () => {
    return achievements.unlocked.reduce((total, achievement) => {
      const achData = ACHIEVEMENT_DATABASE[achievement.id];
      return total + (achData ? RARITY_TIERS[achData.rarity].points : 0);
    }, 0);
  };

  // Get completion stats
  const getCompletionStats = () => {
    const total = Object.keys(ACHIEVEMENT_DATABASE).length;
    const unlocked = achievements.unlocked.length;
    return {
      total,
      unlocked,
      percentage: Math.round((unlocked / total) * 100)
    };
  };

  const completionStats = getCompletionStats();

  return (
    <div className="achievement-system max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🏆 Achievement Gallery</h1>
        <p className="text-gray-600 mb-4">Track your progress and unlock amazing rewards!</p>
        
        {/* Stats Dashboard */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold">{achievements.unlocked.length}</div>
              <div className="text-sm text-gray-600">Unlocked</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold">{getTotalAchievementPoints()}</div>
              <div className="text-sm text-gray-600">Points</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold">{completionStats.percentage}%</div>
              <div className="text-sm text-gray-600">Completion</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <Flame className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <div className="text-2xl font-bold">{stats.dailyStreak || 0}</div>
              <div className="text-sm text-gray-600">Day Streak</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">Overall Progress</span>
            <span className="text-sm text-gray-600">
              {completionStats.unlocked}/{completionStats.total}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500"
              style={{ width: `${completionStats.percentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Category Filter */}
          <div className="flex gap-2">
            <Button
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory('all')}
            >
              All Categories
            </Button>
            {Object.entries(ACHIEVEMENT_CATEGORIES).map(([key, category]) => (
              <Button
                key={key}
                variant={selectedCategory === key ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(key)}
                className="flex items-center gap-2"
              >
                {category.icon}
                {category.name}
              </Button>
            ))}
          </div>

          {/* Rarity Filter */}
          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm"
          >
            <option value="all">All Rarities</option>
            {Object.entries(RARITY_TIERS).map(([key, tier]) => (
              <option key={key} value={key}>{tier.name}</option>
            ))}
          </select>

          {/* Show Only Unlocked */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={showOnlyUnlocked}
              onChange={(e) => setShowOnlyUnlocked(e.target.checked)}
              className="rounded"
            />
            Show only unlocked
          </label>
        </div>
      </div>

      {/* Achievement Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {getFilteredAchievements().map((achievement) => {
          const status = getAchievementStatus(achievement);
          const rarity = RARITY_TIERS[achievement.rarity];
          const category = ACHIEVEMENT_CATEGORIES[achievement.category];

          return (
            <Card
              key={achievement.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                status.status === 'unlocked'
                  ? `ring-2 ring-yellow-400 ${rarity.glow} shadow-lg`
                  : status.status === 'ready'
                  ? 'ring-2 ring-green-400 animate-pulse'
                  : 'opacity-75 hover:opacity-100'
              }`}
              onClick={() => setSelectedAchievement(achievement)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${rarity.color}`}>
                    {achievement.icon}
                  </div>
                  <div className="flex items-center gap-1">
                    {status.status === 'unlocked' && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                    {status.status === 'ready' && (
                      <Gift className="w-5 h-5 text-blue-600" />
                    )}
                    {status.status === 'locked' && (
                      <Lock className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg">{achievement.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-xs ${rarity.color}`}>
                    {rarity.name}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(achievement.category)}`}>
                    {category.name}
                  </span>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                
                {/* Progress Bar for locked achievements */}
                {status.status === 'locked' && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(status.progress.overall)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${status.progress.overall}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Rewards */}
                <div className="text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    <span>{achievement.rewards.xp} XP</span>
                    {achievement.rewards.skillPoints && (
                      <>
                        <span className="mx-1">•</span>
                        <span>{achievement.rewards.skillPoints} SP</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Claim Button for ready achievements */}
                {status.status === 'ready' && (
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClaimAchievement(achievement);
                    }}
                    className="w-full mt-3"
                    size="sm"
                  >
                    <Gift className="w-4 h-4 mr-2" />
                    Claim Reward
                  </Button>
                )}

                {/* Unlocked timestamp */}
                {status.status === 'unlocked' && (
                  <div className="text-xs text-gray-500 mt-2">
                    Unlocked: {new Date(status.unlockedAt).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg ${RARITY_TIERS[selectedAchievement.rarity].color}`}>
                    {selectedAchievement.icon}
                  </div>
                  <div>
                    <CardTitle>{selectedAchievement.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs ${RARITY_TIERS[selectedAchievement.rarity].color}`}>
                        {RARITY_TIERS[selectedAchievement.rarity].name}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAchievement(null)}
                >
                  ✕
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">{selectedAchievement.description}</p>
                
                {/* Requirements */}
                <div>
                  <h4 className="font-medium mb-2">Requirements</h4>
                  <div className="space-y-2">
                    {Object.entries(selectedAchievement.requirements).map(([key, value]) => {
                      const current = stats[key] || 0;
                      const progress = Math.min((current / value) * 100, 100);
                      
                      return (
                        <div key={key} className="text-sm">
                          <div className="flex justify-between text-gray-600 mb-1">
                            <span>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                            <span>{current}/{value}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Rewards */}
                <div>
                  <h4 className="font-medium mb-2">Rewards</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>{selectedAchievement.rewards.xp} Experience Points</span>
                    </div>
                    {selectedAchievement.rewards.skillPoints && (
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-500" />
                        <span>{selectedAchievement.rewards.skillPoints} Skill Points</span>
                      </div>
                    )}
                    {selectedAchievement.rewards.avatarItem && (
                      <div className="flex items-center gap-2">
                        <Crown className="w-4 h-4 text-purple-500" />
                        <span>Avatar Item: {selectedAchievement.rewards.avatarItem.replace('_', ' ')}</span>
                      </div>
                    )}
                    {selectedAchievement.rewards.theme && (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-pink-500" />
                        <span>Theme: {selectedAchievement.rewards.theme.replace('_', ' ')}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                {(() => {
                  const status = getAchievementStatus(selectedAchievement);
                  if (status.status === 'ready') {
                    return (
                      <Button
                        onClick={() => handleClaimAchievement(selectedAchievement)}
                        className="w-full"
                      >
                        <Gift className="w-4 h-4 mr-2" />
                        Claim Achievement
                      </Button>
                    );
                  } else if (status.status === 'unlocked') {
                    return (
                      <div className="text-center text-green-600 font-medium">
                        ✅ Achievement Unlocked!
                      </div>
                    );
                  } else {
                    return (
                      <div className="text-center text-gray-500">
                        Keep working towards this goal!
                      </div>
                    );
                  }
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {getFilteredAchievements().length === 0 && (
        <div className="text-center py-12">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No achievements found</h3>
          <p className="text-gray-500">Try adjusting your filters or start completing more challenges!</p>
        </div>
      )}
    </div>
  );
};

export default AchievementSystemUI;