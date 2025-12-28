/**
 * Achievements System
 * ===================
 * Gamification achievements for user engagement
 */

import { 
  Trophy, 
  Zap, 
  Target, 
  Award, 
  Star, 
  Flame, 
  Brain, 
  Heart, 
  BookOpen,
  MessageSquare,
  Clock,
  TrendingUp,
  Crown,
  Sparkles,
  Rocket,
  Medal
} from 'lucide-react';

export const ACHIEVEMENTS = {
  // Getting Started
  FIRST_SESSION: {
    id: 'first_session',
    name: 'First Steps',
    description: 'Complete your first coaching session',
    icon: Sparkles,
    xpReward: 50,
    rarity: 'common',
    category: 'getting_started'
  },
  
  PROFILE_COMPLETE: {
    id: 'profile_complete',
    name: 'All Set Up',
    description: 'Complete your profile setup',
    icon: Star,
    xpReward: 30,
    rarity: 'common',
    category: 'getting_started'
  },
  
  // Sessions
  SESSION_5: {
    id: 'session_5',
    name: 'Getting Started',
    description: 'Complete 5 sessions',
    icon: BookOpen,
    xpReward: 100,
    rarity: 'common',
    category: 'sessions'
  },
  
  SESSION_10: {
    id: 'session_10',
    name: 'Dedicated Learner',
    description: 'Complete 10 sessions',
    icon: Brain,
    xpReward: 200,
    rarity: 'uncommon',
    category: 'sessions'
  },
  
  SESSION_25: {
    id: 'session_25',
    name: 'Knowledge Seeker',
    description: 'Complete 25 sessions',
    icon: Target,
    xpReward: 500,
    rarity: 'rare',
    category: 'sessions'
  },
  
  SESSION_50: {
    id: 'session_50',
    name: 'Learning Master',
    description: 'Complete 50 sessions',
    icon: Trophy,
    xpReward: 1000,
    rarity: 'epic',
    category: 'sessions'
  },
  
  SESSION_100: {
    id: 'session_100',
    name: 'Century Club',
    description: 'Complete 100 sessions',
    icon: Crown,
    xpReward: 2500,
    rarity: 'legendary',
    category: 'sessions'
  },
  
  // Streaks
  STREAK_3: {
    id: 'streak_3',
    name: 'On Fire',
    description: '3-day learning streak',
    icon: Flame,
    xpReward: 75,
    rarity: 'common',
    category: 'streaks'
  },
  
  STREAK_7: {
    id: 'streak_7',
    name: 'Week Warrior',
    description: '7-day learning streak',
    icon: Flame,
    xpReward: 200,
    rarity: 'uncommon',
    category: 'streaks'
  },
  
  STREAK_30: {
    id: 'streak_30',
    name: 'Monthly Dedication',
    description: '30-day learning streak',
    icon: Flame,
    xpReward: 1000,
    rarity: 'epic',
    category: 'streaks'
  },
  
  STREAK_100: {
    id: 'streak_100',
    name: 'Unstoppable',
    description: '100-day learning streak',
    icon: Flame,
    xpReward: 5000,
    rarity: 'legendary',
    category: 'streaks'
  },
  
  // Time
  HOUR_1: {
    id: 'hour_1',
    name: 'Time Invested',
    description: 'Spend 1 hour learning',
    icon: Clock,
    xpReward: 100,
    rarity: 'common',
    category: 'time'
  },
  
  HOUR_10: {
    id: 'hour_10',
    name: 'Committed Student',
    description: 'Spend 10 hours learning',
    icon: Clock,
    xpReward: 500,
    rarity: 'uncommon',
    category: 'time'
  },
  
  HOUR_50: {
    id: 'hour_50',
    name: 'Time Master',
    description: 'Spend 50 hours learning',
    icon: Clock,
    xpReward: 2000,
    rarity: 'rare',
    category: 'time'
  },
  
  HOUR_100: {
    id: 'hour_100',
    name: 'Learning Legend',
    description: 'Spend 100 hours learning',
    icon: Clock,
    xpReward: 5000,
    rarity: 'legendary',
    category: 'time'
  },
  
  // Topics
  MULTI_TOPIC_3: {
    id: 'multi_topic_3',
    name: 'Curious Mind',
    description: 'Learn 3 different topics',
    icon: Brain,
    xpReward: 150,
    rarity: 'common',
    category: 'topics'
  },
  
  MULTI_TOPIC_10: {
    id: 'multi_topic_10',
    name: 'Renaissance Person',
    description: 'Learn 10 different topics',
    icon: Brain,
    xpReward: 500,
    rarity: 'uncommon',
    category: 'topics'
  },
  
  MULTI_TOPIC_25: {
    id: 'multi_topic_25',
    name: 'Jack of All Trades',
    description: 'Learn 25 different topics',
    icon: Brain,
    xpReward: 1500,
    rarity: 'rare',
    category: 'topics'
  },
  
  // Engagement
  EARLY_BIRD: {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a session before 8 AM',
    icon: Zap,
    xpReward: 100,
    rarity: 'uncommon',
    category: 'engagement'
  },
  
  NIGHT_OWL: {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Complete a session after 10 PM',
    icon: Zap,
    xpReward: 100,
    rarity: 'uncommon',
    category: 'engagement'
  },
  
  MARATHON: {
    id: 'marathon',
    name: 'Marathon Runner',
    description: 'Complete 5 sessions in one day',
    icon: Rocket,
    xpReward: 300,
    rarity: 'rare',
    category: 'engagement'
  },
  
  PERFECT_WEEK: {
    id: 'perfect_week',
    name: 'Perfect Week',
    description: 'Complete at least one session every day for a week',
    icon: Star,
    xpReward: 500,
    rarity: 'epic',
    category: 'engagement'
  },
  
  // Quality
  FEEDBACK_MASTER: {
    id: 'feedback_master',
    name: 'Feedback Seeker',
    description: 'View feedback for 10 sessions',
    icon: MessageSquare,
    xpReward: 200,
    rarity: 'common',
    category: 'quality'
  },
  
  IMPROVEMENT_KING: {
    id: 'improvement_king',
    name: 'Always Improving',
    description: 'Show improvement across 5 consecutive sessions',
    icon: TrendingUp,
    xpReward: 400,
    rarity: 'rare',
    category: 'quality'
  },
  
  // Special
  LEVEL_10: {
    id: 'level_10',
    name: 'Rising Star',
    description: 'Reach level 10',
    icon: Star,
    xpReward: 500,
    rarity: 'uncommon',
    category: 'levels'
  },
  
  LEVEL_25: {
    id: 'level_25',
    name: 'Expert Learner',
    description: 'Reach level 25',
    icon: Award,
    xpReward: 1500,
    rarity: 'rare',
    category: 'levels'
  },
  
  LEVEL_50: {
    id: 'level_50',
    name: 'Grand Master',
    description: 'Reach level 50',
    icon: Crown,
    xpReward: 5000,
    rarity: 'legendary',
    category: 'levels'
  },
  
  FIRST_SHARE: {
    id: 'first_share',
    name: 'Sharing is Caring',
    description: 'Share your progress for the first time',
    icon: Heart,
    xpReward: 100,
    rarity: 'common',
    category: 'social'
  },
  
  TOP_10_LEADERBOARD: {
    id: 'top_10_leaderboard',
    name: 'Top 10',
    description: 'Reach the top 10 on the leaderboard',
    icon: Medal,
    xpReward: 1000,
    rarity: 'epic',
    category: 'social'
  },
};

// Achievement categories with metadata
export const ACHIEVEMENT_CATEGORIES = {
  getting_started: {
    name: 'Getting Started',
    color: 'blue',
    icon: Sparkles
  },
  sessions: {
    name: 'Sessions',
    color: 'purple',
    icon: BookOpen
  },
  streaks: {
    name: 'Streaks',
    color: 'orange',
    icon: Flame
  },
  time: {
    name: 'Time Invested',
    color: 'green',
    icon: Clock
  },
  topics: {
    name: 'Topics',
    color: 'pink',
    icon: Brain
  },
  engagement: {
    name: 'Engagement',
    color: 'yellow',
    icon: Zap
  },
  quality: {
    name: 'Quality',
    color: 'teal',
    icon: TrendingUp
  },
  levels: {
    name: 'Levels',
    color: 'indigo',
    icon: Crown
  },
  social: {
    name: 'Social',
    color: 'red',
    icon: Heart
  }
};

// Rarity levels
export const RARITY_CONFIG = {
  common: {
    name: 'Common',
    color: 'gray',
    gradient: 'from-gray-400 to-gray-600'
  },
  uncommon: {
    name: 'Uncommon',
    color: 'green',
    gradient: 'from-green-400 to-green-600'
  },
  rare: {
    name: 'Rare',
    color: 'blue',
    gradient: 'from-blue-400 to-blue-600'
  },
  epic: {
    name: 'Epic',
    color: 'purple',
    gradient: 'from-purple-400 to-purple-600'
  },
  legendary: {
    name: 'Legendary',
    color: 'yellow',
    gradient: 'from-yellow-400 to-yellow-600'
  }
};

// Helper functions
export const checkAchievements = (progressData) => {
  const unlockedAchievements = [];
  
  // Session achievements
  if (progressData.totalSessions >= 1 && !progressData.unlockedAchievements.includes('first_session')) {
    unlockedAchievements.push(ACHIEVEMENTS.FIRST_SESSION);
  }
  if (progressData.totalSessions >= 5 && !progressData.unlockedAchievements.includes('session_5')) {
    unlockedAchievements.push(ACHIEVEMENTS.SESSION_5);
  }
  if (progressData.totalSessions >= 10 && !progressData.unlockedAchievements.includes('session_10')) {
    unlockedAchievements.push(ACHIEVEMENTS.SESSION_10);
  }
  if (progressData.totalSessions >= 25 && !progressData.unlockedAchievements.includes('session_25')) {
    unlockedAchievements.push(ACHIEVEMENTS.SESSION_25);
  }
  if (progressData.totalSessions >= 50 && !progressData.unlockedAchievements.includes('session_50')) {
    unlockedAchievements.push(ACHIEVEMENTS.SESSION_50);
  }
  if (progressData.totalSessions >= 100 && !progressData.unlockedAchievements.includes('session_100')) {
    unlockedAchievements.push(ACHIEVEMENTS.SESSION_100);
  }
  
  // Streak achievements
  if (progressData.currentStreak >= 3 && !progressData.unlockedAchievements.includes('streak_3')) {
    unlockedAchievements.push(ACHIEVEMENTS.STREAK_3);
  }
  if (progressData.currentStreak >= 7 && !progressData.unlockedAchievements.includes('streak_7')) {
    unlockedAchievements.push(ACHIEVEMENTS.STREAK_7);
  }
  if (progressData.currentStreak >= 30 && !progressData.unlockedAchievements.includes('streak_30')) {
    unlockedAchievements.push(ACHIEVEMENTS.STREAK_30);
  }
  if (progressData.currentStreak >= 100 && !progressData.unlockedAchievements.includes('streak_100')) {
    unlockedAchievements.push(ACHIEVEMENTS.STREAK_100);
  }
  
  // Time achievements (in hours)
  const hours = Math.floor(progressData.totalMinutes / 60);
  if (hours >= 1 && !progressData.unlockedAchievements.includes('hour_1')) {
    unlockedAchievements.push(ACHIEVEMENTS.HOUR_1);
  }
  if (hours >= 10 && !progressData.unlockedAchievements.includes('hour_10')) {
    unlockedAchievements.push(ACHIEVEMENTS.HOUR_10);
  }
  if (hours >= 50 && !progressData.unlockedAchievements.includes('hour_50')) {
    unlockedAchievements.push(ACHIEVEMENTS.HOUR_50);
  }
  if (hours >= 100 && !progressData.unlockedAchievements.includes('hour_100')) {
    unlockedAchievements.push(ACHIEVEMENTS.HOUR_100);
  }
  
  // Topic achievements
  if (progressData.totalTopics >= 3 && !progressData.unlockedAchievements.includes('multi_topic_3')) {
    unlockedAchievements.push(ACHIEVEMENTS.MULTI_TOPIC_3);
  }
  if (progressData.totalTopics >= 10 && !progressData.unlockedAchievements.includes('multi_topic_10')) {
    unlockedAchievements.push(ACHIEVEMENTS.MULTI_TOPIC_10);
  }
  if (progressData.totalTopics >= 25 && !progressData.unlockedAchievements.includes('multi_topic_25')) {
    unlockedAchievements.push(ACHIEVEMENTS.MULTI_TOPIC_25);
  }
  
  // Level achievements
  if (progressData.level >= 10 && !progressData.unlockedAchievements.includes('level_10')) {
    unlockedAchievements.push(ACHIEVEMENTS.LEVEL_10);
  }
  if (progressData.level >= 25 && !progressData.unlockedAchievements.includes('level_25')) {
    unlockedAchievements.push(ACHIEVEMENTS.LEVEL_25);
  }
  if (progressData.level >= 50 && !progressData.unlockedAchievements.includes('level_50')) {
    unlockedAchievements.push(ACHIEVEMENTS.LEVEL_50);
  }
  
  return unlockedAchievements;
};

export const getAchievementProgress = (achievementId, progressData) => {
  const achievement = Object.values(ACHIEVEMENTS).find(a => a.id === achievementId);
  if (!achievement) return null;
  
  // Calculate progress based on achievement type
  const { category } = achievement;
  
  if (category === 'sessions') {
    const target = parseInt(achievementId.split('_')[1]);
    return {
      current: progressData.totalSessions,
      target,
      percentage: Math.min(100, (progressData.totalSessions / target) * 100)
    };
  }
  
  if (category === 'streaks') {
    const target = parseInt(achievementId.split('_')[1]);
    return {
      current: progressData.currentStreak,
      target,
      percentage: Math.min(100, (progressData.currentStreak / target) * 100)
    };
  }
  
  if (category === 'time') {
    const target = parseInt(achievementId.split('_')[1]);
    const hours = Math.floor(progressData.totalMinutes / 60);
    return {
      current: hours,
      target,
      percentage: Math.min(100, (hours / target) * 100)
    };
  }
  
  return null;
};

export const triggerAchievement = (achievement) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('achievement-unlocked', { detail: achievement }));
  }
};

export default {
  ACHIEVEMENTS,
  ACHIEVEMENT_CATEGORIES,
  RARITY_CONFIG,
  checkAchievements,
  getAchievementProgress,
  triggerAchievement
};
