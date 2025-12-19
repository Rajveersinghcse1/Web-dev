'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * AI Recommendations Engine
 * Provides personalized coaching suggestions, learning paths, and adaptive content
 */

// Recommendations Store
export const useRecommendationsStore = create(
  persist(
    (set, get) => ({
      // User learning profile
      learningProfile: {
        preferredTopics: [],
        difficultTopics: [],
        masteredTopics: [],
        learningStyle: 'balanced', // visual, auditory, kinesthetic, reading, balanced
        pacePreference: 'medium', // slow, medium, fast
        sessionLength: 'medium', // short (10-15min), medium (15-30min), long (30-60min)
        bestTimeOfDay: null, // morning, afternoon, evening, night
        streak: 0,
        totalXP: 0,
        level: 1,
      },
      
      // Current recommendations
      recommendations: {
        nextTopics: [],
        reviewTopics: [],
        challengeTopics: [],
        dailyGoals: [],
        weeklyGoals: [],
        suggestedSessions: [],
      },
      
      // Learning paths
      learningPaths: [],
      activePath: null,
      
      // Interaction history
      interactions: [],
      
      // AI insights
      insights: {
        strengths: [],
        weaknesses: [],
        patterns: [],
        predictions: [],
      },
      
      // Actions
      addLearningPath: (path) => {
        set(state => {
          // Avoid duplicates
          if (state.learningPaths.some(p => p.id === path.id)) {
            return state;
          }
          return {
            learningPaths: [...state.learningPaths, path],
          };
        });
      },

      setActivePath: (pathId) => {
        set({ activePath: pathId });
      },

      updateLearningProfile: (updates) => {
        set(state => ({
          learningProfile: { ...state.learningProfile, ...updates },
        }));
        
        // Regenerate recommendations based on new profile
        get().generateRecommendations();
      },
      
      recordInteraction: (interaction) => {
        const newInteraction = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          ...interaction,
        };
        
        set(state => ({
          interactions: [...state.interactions, newInteraction].slice(-100), // Keep last 100
        }));
        
        // Update learning profile based on interaction
        get().analyzeInteraction(newInteraction);
      },
      
      analyzeInteraction: (interaction) => {
        const { learningProfile } = get();
        const updates = {};
        
        // Track topic performance
        if (interaction.topic) {
          if (interaction.success && interaction.difficulty === 'hard') {
            // Add to mastered if consistently succeeding at hard difficulty
            if (!learningProfile.masteredTopics.includes(interaction.topic)) {
              updates.masteredTopics = [...learningProfile.masteredTopics, interaction.topic];
            }
          } else if (!interaction.success) {
            // Add to difficult if struggling
            if (!learningProfile.difficultTopics.includes(interaction.topic)) {
              updates.difficultTopics = [...learningProfile.difficultTopics, interaction.topic];
            }
          }
        }
        
        // Update preferred topics based on engagement
        if (interaction.engagement > 0.8 && interaction.topic) {
          if (!learningProfile.preferredTopics.includes(interaction.topic)) {
            updates.preferredTopics = [...learningProfile.preferredTopics, interaction.topic];
          }
        }
        
        // Detect best time of day
        const hour = new Date(interaction.timestamp).getHours();
        let timeOfDay;
        if (hour < 12) timeOfDay = 'morning';
        else if (hour < 17) timeOfDay = 'afternoon';
        else if (hour < 21) timeOfDay = 'evening';
        else timeOfDay = 'night';
        
        // Track time-based performance
        if (interaction.success && !updates.bestTimeOfDay) {
          updates.bestTimeOfDay = timeOfDay;
        }
        
        if (Object.keys(updates).length > 0) {
          get().updateLearningProfile(updates);
        }
      },
      
      generateRecommendations: () => {
        const { learningProfile, interactions, learningPaths, activePath } = get();
        const recentInteractions = interactions.slice(-20);
        
        // Next topics to learn
        const nextTopics = [];
        const allTopics = ['communication', 'leadership', 'time-management', 'problem-solving', 
                          'creativity', 'critical-thinking', 'emotional-intelligence', 'decision-making'];
        
        // Recommend topics not yet mastered
        allTopics.forEach(topic => {
          if (!learningProfile.masteredTopics.includes(topic)) {
            const difficulty = learningProfile.difficultTopics.includes(topic) ? 'medium' : 'easy';
            const priority = learningProfile.preferredTopics.includes(topic) ? 'high' : 'medium';
            
            nextTopics.push({
              topic,
              difficulty,
              priority,
              reason: getPriorityReason(topic, learningProfile, recentInteractions),
            });
          }
        });
        
        // Sort by priority
        nextTopics.sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
        
        // Topics to review
        const reviewTopics = learningProfile.difficultTopics.map(topic => ({
          topic,
          lastReviewed: findLastInteraction(topic, interactions),
          importance: 'high',
          reason: 'Previous sessions showed difficulty - practice recommended',
        }));
        
        // Challenge topics
        const challengeTopics = learningProfile.masteredTopics.map(topic => ({
          topic,
          difficulty: 'hard',
          reward: calculateReward(topic, learningProfile.level),
          reason: 'You\'ve mastered the basics - ready for advanced challenges',
        }));
        
        // Daily goals
        const dailyGoals = generateDailyGoals(learningProfile, recentInteractions);
        
        // Weekly goals
        const weeklyGoals = generateWeeklyGoals(learningProfile, interactions);
        
        // Suggested sessions
        const suggestedSessions = generateSessionSuggestions(
          learningProfile, 
          nextTopics, 
          reviewTopics, 
          challengeTopics
        );
        
        set({
          recommendations: {
            nextTopics: nextTopics.slice(0, 5),
            reviewTopics: reviewTopics.slice(0, 3),
            challengeTopics: challengeTopics.slice(0, 3),
            dailyGoals,
            weeklyGoals,
            suggestedSessions,
          },
        });
        
        // Generate insights
        get().generateInsights();
      },
      
      generateInsights: () => {
        const { interactions, learningProfile } = get();
        const recentInteractions = interactions.slice(-30);
        
        // Analyze strengths
        const strengths = [];
        const topicSuccess = {};
        
        recentInteractions.forEach(int => {
          if (int.topic) {
            if (!topicSuccess[int.topic]) {
              topicSuccess[int.topic] = { success: 0, total: 0 };
            }
            topicSuccess[int.topic].total++;
            if (int.success) topicSuccess[int.topic].success++;
          }
        });
        
        Object.entries(topicSuccess).forEach(([topic, stats]) => {
          const successRate = stats.success / stats.total;
          if (successRate > 0.7) {
            strengths.push({
              topic,
              successRate,
              message: `Strong performance in ${topic} (${Math.round(successRate * 100)}% success rate)`,
            });
          }
        });
        
        // Analyze weaknesses
        const weaknesses = [];
        Object.entries(topicSuccess).forEach(([topic, stats]) => {
          const successRate = stats.success / stats.total;
          if (successRate < 0.5) {
            weaknesses.push({
              topic,
              successRate,
              message: `${topic} needs more practice (${Math.round(successRate * 100)}% success rate)`,
              suggestion: `Try easier difficulty or review fundamentals`,
            });
          }
        });
        
        // Analyze patterns
        const patterns = detectPatterns(interactions, learningProfile);
        
        // Generate predictions
        const predictions = generatePredictions(learningProfile, topicSuccess, patterns);
        
        set({
          insights: {
            strengths,
            weaknesses,
            patterns,
            predictions,
          },
        });
      },
      
      createLearningPath: (name, description, topics) => {
        const newPath = {
          id: Date.now().toString(),
          name,
          description,
          topics: topics.map((topic, index) => ({
            ...topic,
            order: index,
            completed: false,
            unlocked: index === 0,
          })),
          progress: 0,
          createdAt: new Date().toISOString(),
          estimatedDuration: topics.length * 20, // 20 min per topic
        };
        
        set(state => ({
          learningPaths: [...state.learningPaths, newPath],
        }));
        
        return newPath;
      },
      
      setActivePath: (pathId) => {
        set({ activePath: pathId });
      },
      
      updatePathProgress: (pathId, topicId, completed) => {
        set(state => ({
          learningPaths: state.learningPaths.map(path => {
            if (path.id !== pathId) return path;
            
            const updatedTopics = path.topics.map(topic => {
              if (topic.id === topicId) {
                return { ...topic, completed };
              }
              return topic;
            });
            
            // Unlock next topic
            const currentIndex = updatedTopics.findIndex(t => t.id === topicId);
            if (completed && currentIndex < updatedTopics.length - 1) {
              updatedTopics[currentIndex + 1].unlocked = true;
            }
            
            const completedCount = updatedTopics.filter(t => t.completed).length;
            const progress = (completedCount / updatedTopics.length) * 100;
            
            return {
              ...path,
              topics: updatedTopics,
              progress,
            };
          }),
        }));
      },
      
      getRecommendedDifficulty: (topic) => {
        const { learningProfile, interactions } = get();
        
        // Check mastery
        if (learningProfile.masteredTopics.includes(topic)) return 'hard';
        if (learningProfile.difficultTopics.includes(topic)) return 'easy';
        
        // Check recent performance
        const recentTopicInteractions = interactions
          .filter(i => i.topic === topic)
          .slice(-5);
        
        if (recentTopicInteractions.length === 0) return 'medium';
        
        const successRate = recentTopicInteractions.filter(i => i.success).length / recentTopicInteractions.length;
        
        if (successRate > 0.8) return 'hard';
        if (successRate < 0.4) return 'easy';
        return 'medium';
      },
      
      getSuggestedSessionDuration: () => {
        const { learningProfile } = get();
        const durations = {
          short: 15,
          medium: 25,
          long: 45,
        };
        return durations[learningProfile.sessionLength] || 25;
      },
    }),
    {
      name: 'ai-recommendations',
    }
  )
);

/**
 * Helper Functions
 */

const getPriorityReason = (topic, profile, interactions) => {
  if (profile.preferredTopics.includes(topic)) {
    return 'Matches your interests';
  }
  
  const recentTopics = interactions.slice(-10).map(i => i.topic);
  if (!recentTopics.includes(topic)) {
    return 'Haven\'t practiced recently';
  }
  
  if (profile.difficultTopics.includes(topic)) {
    return 'Could use more practice';
  }
  
  return 'Good next step in your learning journey';
};

const findLastInteraction = (topic, interactions) => {
  const topicInteractions = interactions.filter(i => i.topic === topic);
  if (topicInteractions.length === 0) return null;
  
  const last = topicInteractions[topicInteractions.length - 1];
  return last.timestamp;
};

const calculateReward = (topic, level) => {
  const baseXP = 100;
  const multiplier = 1 + (level * 0.1);
  return Math.round(baseXP * multiplier);
};

const generateDailyGoals = (profile, recentInteractions) => {
  const goals = [];
  const today = new Date().toISOString().split('T')[0];
  const todayInteractions = recentInteractions.filter(i => 
    i.timestamp.startsWith(today)
  );
  
  // Session goal
  if (todayInteractions.length < 3) {
    goals.push({
      id: 'daily-sessions',
      type: 'sessions',
      target: 3,
      current: todayInteractions.length,
      reward: 50,
      description: 'Complete 3 coaching sessions today',
    });
  }
  
  // XP goal
  const todayXP = todayInteractions.reduce((acc, i) => acc + (i.xpEarned || 0), 0);
  if (todayXP < 300) {
    goals.push({
      id: 'daily-xp',
      type: 'xp',
      target: 300,
      current: todayXP,
      reward: 30,
      description: 'Earn 300 XP today',
    });
  }
  
  // Topic diversity
  const uniqueTopics = new Set(todayInteractions.map(i => i.topic));
  if (uniqueTopics.size < 3) {
    goals.push({
      id: 'daily-diversity',
      type: 'diversity',
      target: 3,
      current: uniqueTopics.size,
      reward: 40,
      description: 'Practice 3 different topics today',
    });
  }
  
  return goals;
};

const generateWeeklyGoals = (profile, interactions) => {
  const goals = [];
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  
  const weekInteractions = interactions.filter(i => 
    new Date(i.timestamp) > weekAgo
  );
  
  // Streak goal
  if (profile.streak < 7) {
    goals.push({
      id: 'weekly-streak',
      type: 'streak',
      target: 7,
      current: profile.streak,
      reward: 200,
      description: 'Maintain a 7-day streak',
    });
  }
  
  // Total sessions
  if (weekInteractions.length < 15) {
    goals.push({
      id: 'weekly-sessions',
      type: 'sessions',
      target: 15,
      current: weekInteractions.length,
      reward: 150,
      description: 'Complete 15 sessions this week',
    });
  }
  
  // Master a topic
  const notMastered = 8 - profile.masteredTopics.length;
  if (notMastered > 0) {
    goals.push({
      id: 'weekly-mastery',
      type: 'mastery',
      target: 1,
      current: 0,
      reward: 300,
      description: 'Master a new topic this week',
    });
  }
  
  return goals;
};

const generateSessionSuggestions = (profile, nextTopics, reviewTopics, challengeTopics) => {
  const suggestions = [];
  const now = new Date().getHours();
  
  // Time-based suggestions
  let timeMessage = '';
  if (now < 12) timeMessage = 'Good morning! Start your day with a focused session.';
  else if (now < 17) timeMessage = 'Afternoon learning session - perfect timing!';
  else if (now < 21) timeMessage = 'Evening session to unwind and learn.';
  else timeMessage = 'Late night session for night owls!';
  
  // Quick review session
  if (reviewTopics.length > 0) {
    suggestions.push({
      id: 'quick-review',
      title: 'Quick Review Session',
      description: `Review ${reviewTopics[0].topic} - 15 minutes`,
      duration: 15,
      topics: [reviewTopics[0].topic],
      difficulty: 'easy',
      xpReward: 75,
      reason: timeMessage,
      recommended: true,
    });
  }
  
  // Focused learning
  if (nextTopics.length > 0) {
    suggestions.push({
      id: 'focused-learning',
      title: 'Focused Learning Session',
      description: `Deep dive into ${nextTopics[0].topic}`,
      duration: profile.sessionLength === 'short' ? 15 : 25,
      topics: [nextTopics[0].topic],
      difficulty: 'medium',
      xpReward: 150,
      reason: nextTopics[0].reason,
      recommended: nextTopics[0].priority === 'high',
    });
  }
  
  // Challenge mode
  if (challengeTopics.length > 0) {
    suggestions.push({
      id: 'challenge-mode',
      title: 'Challenge Mode',
      description: `Advanced ${challengeTopics[0].topic} challenges`,
      duration: 30,
      topics: [challengeTopics[0].topic],
      difficulty: 'hard',
      xpReward: challengeTopics[0].reward,
      reason: challengeTopics[0].reason,
      recommended: false,
    });
  }
  
  // Mixed practice
  if (nextTopics.length > 1) {
    suggestions.push({
      id: 'mixed-practice',
      title: 'Mixed Practice Session',
      description: 'Practice multiple topics for variety',
      duration: 30,
      topics: nextTopics.slice(0, 3).map(t => t.topic),
      difficulty: 'medium',
      xpReward: 200,
      reason: 'Variety helps retention and keeps learning engaging',
      recommended: false,
    });
  }
  
  return suggestions;
};

const detectPatterns = (interactions, profile) => {
  const patterns = [];
  
  // Time-based patterns
  const timeDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  interactions.forEach(int => {
    const hour = new Date(int.timestamp).getHours();
    if (hour < 12) timeDistribution.morning++;
    else if (hour < 17) timeDistribution.afternoon++;
    else if (hour < 21) timeDistribution.evening++;
    else timeDistribution.night++;
  });
  
  const maxTime = Object.entries(timeDistribution).reduce((a, b) => a[1] > b[1] ? a : b);
  if (maxTime[1] > interactions.length * 0.4) {
    patterns.push({
      type: 'time-preference',
      message: `You're most active in the ${maxTime[0]}`,
      data: timeDistribution,
    });
  }
  
  // Streak patterns
  if (profile.streak > 5) {
    patterns.push({
      type: 'consistency',
      message: `${profile.streak}-day streak! You're building a strong habit.`,
      data: { streak: profile.streak },
    });
  }
  
  // Performance patterns
  const avgSuccess = interactions.filter(i => i.success).length / interactions.length;
  if (avgSuccess > 0.75) {
    patterns.push({
      type: 'high-performer',
      message: `${Math.round(avgSuccess * 100)}% success rate - excellent performance!`,
      data: { successRate: avgSuccess },
    });
  }
  
  return patterns;
};

const generatePredictions = (profile, topicSuccess, patterns) => {
  const predictions = [];
  
  // Level up prediction
  const xpToNextLevel = (profile.level * 1000) - profile.totalXP;
  if (xpToNextLevel < 500) {
    predictions.push({
      type: 'level-up',
      message: `You're close to level ${profile.level + 1}!`,
      confidence: 0.9,
      data: { xpNeeded: xpToNextLevel },
    });
  }
  
  // Topic mastery prediction
  Object.entries(topicSuccess).forEach(([topic, stats]) => {
    const successRate = stats.success / stats.total;
    if (successRate > 0.7 && !profile.masteredTopics.includes(topic)) {
      predictions.push({
        type: 'mastery-soon',
        message: `You're close to mastering ${topic}`,
        confidence: successRate,
        data: { topic, successRate },
      });
    }
  });
  
  // Streak prediction
  if (profile.streak > 3) {
    predictions.push({
      type: 'streak-milestone',
      message: `Keep going - ${7 - profile.streak} more days to a week streak!`,
      confidence: 0.8,
      data: { daysToMilestone: 7 - profile.streak },
    });
  }
  
  return predictions;
};

/**
 * React Hooks
 */

// Get current recommendations
export const useCurrentRecommendations = () => {
  return useRecommendationsStore(state => state.recommendations);
};

// Get insights
export const useAIInsights = () => {
  return useRecommendationsStore(state => state.insights);
};

// Get learning profile
export const useLearningProfile = () => {
  return useRecommendationsStore(state => state.learningProfile);
};

// Get active learning path
export const useActiveLearningPath = () => {
  const pathId = useRecommendationsStore(state => state.activePath);
  const paths = useRecommendationsStore(state => state.learningPaths);
  return paths.find(p => p.id === pathId) || null;
};
