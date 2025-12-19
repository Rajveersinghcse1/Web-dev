'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Adaptive Difficulty System
 * Dynamically adjusts coaching difficulty based on performance
 */

// Adaptive Difficulty Store
export const useAdaptiveDifficultyStore = create(
  persist(
    (set, get) => ({
      // Difficulty settings per topic
      topicDifficulties: {},
      
      // Performance history
      performanceHistory: [],
      
      // Adaptation settings
      adaptationSettings: {
        sensitivity: 0.5, // 0 = slow adaptation, 1 = fast adaptation
        minDifficulty: 1,
        maxDifficulty: 10,
        targetSuccessRate: 0.7, // Aim for 70% success rate
        adaptationThreshold: 3, // Adapt after N attempts
      },
      
      // Current difficulty levels
      difficulties: {
        easy: { min: 1, max: 3, label: 'Easy', color: 'green' },
        medium: { min: 4, max: 7, label: 'Medium', color: 'yellow' },
        hard: { min: 8, max: 10, label: 'Hard', color: 'red' },
      },
      
      // Actions
      recordPerformance: (topic, difficulty, success, timeSpent, engagement) => {
        const performance = {
          id: Date.now().toString(),
          topic,
          difficulty,
          success,
          timeSpent,
          engagement,
          timestamp: new Date().toISOString(),
        };
        
        set(state => ({
          performanceHistory: [...state.performanceHistory, performance].slice(-200),
        }));
        
        // Trigger adaptation
        get().adaptDifficulty(topic);
      },
      
      adaptDifficulty: (topic) => {
        const { performanceHistory, adaptationSettings, topicDifficulties } = get();
        
        // Get recent performances for this topic
        const recentPerformances = performanceHistory
          .filter(p => p.topic === topic)
          .slice(-adaptationSettings.adaptationThreshold);
        
        if (recentPerformances.length < adaptationSettings.adaptationThreshold) {
          return; // Not enough data yet
        }
        
        // Calculate metrics
        const successRate = recentPerformances.filter(p => p.success).length / recentPerformances.length;
        const avgEngagement = recentPerformances.reduce((acc, p) => acc + p.engagement, 0) / recentPerformances.length;
        const avgTimeSpent = recentPerformances.reduce((acc, p) => acc + p.timeSpent, 0) / recentPerformances.length;
        
        // Current difficulty
        const currentDifficulty = topicDifficulties[topic] || 5;
        
        // Calculate adjustment
        let adjustment = 0;
        const sensitivity = adaptationSettings.sensitivity;
        
        // Success rate based adjustment
        if (successRate > adaptationSettings.targetSuccessRate + 0.1) {
          // Too easy - increase difficulty
          adjustment = sensitivity * 2;
        } else if (successRate < adaptationSettings.targetSuccessRate - 0.1) {
          // Too hard - decrease difficulty
          adjustment = -sensitivity * 2;
        }
        
        // Engagement based adjustment
        if (avgEngagement < 0.5) {
          // Low engagement - might be too hard or too easy
          if (successRate < 0.5) {
            adjustment -= sensitivity; // Too hard
          } else {
            adjustment += sensitivity; // Too easy
          }
        }
        
        // Time based adjustment
        const expectedTime = get().getExpectedTime(currentDifficulty);
        if (avgTimeSpent < expectedTime * 0.5 && successRate > 0.8) {
          // Finishing too quickly with high success - increase difficulty
          adjustment += sensitivity;
        }
        
        // Apply adjustment
        const newDifficulty = Math.max(
          adaptationSettings.minDifficulty,
          Math.min(
            adaptationSettings.maxDifficulty,
            Math.round(currentDifficulty + adjustment)
          )
        );
        
        if (newDifficulty !== currentDifficulty) {
          set(state => ({
            topicDifficulties: {
              ...state.topicDifficulties,
              [topic]: newDifficulty,
            },
          }));
          
          // Log adaptation
          console.log(`Difficulty adapted for ${topic}: ${currentDifficulty} → ${newDifficulty}`);
        }
      },
      
      getDifficultyLevel: (topic) => {
        const numericDifficulty = get().topicDifficulties[topic] || 5;
        const { difficulties } = get();
        
        for (const [level, range] of Object.entries(difficulties)) {
          if (numericDifficulty >= range.min && numericDifficulty <= range.max) {
            return level;
          }
        }
        
        return 'medium';
      },
      
      getNumericDifficulty: (topic) => {
        return get().topicDifficulties[topic] || 5;
      },
      
      setTopicDifficulty: (topic, difficulty) => {
        set(state => ({
          topicDifficulties: {
            ...state.topicDifficulties,
            [topic]: difficulty,
          },
        }));
      },
      
      resetTopicDifficulty: (topic) => {
        set(state => {
          const { [topic]: removed, ...rest } = state.topicDifficulties;
          return { topicDifficulties: rest };
        });
      },
      
      updateAdaptationSettings: (settings) => {
        set(state => ({
          adaptationSettings: { ...state.adaptationSettings, ...settings },
        }));
      },
      
      getExpectedTime: (difficulty) => {
        // Expected time in seconds based on difficulty
        const baseTime = 120; // 2 minutes
        return baseTime + (difficulty * 30); // +30 seconds per difficulty level
      },
      
      getAdaptationInsights: (topic) => {
        const { performanceHistory, topicDifficulties } = get();
        const recentPerformances = performanceHistory
          .filter(p => p.topic === topic)
          .slice(-10);
        
        if (recentPerformances.length === 0) {
          return {
            message: 'No performance data yet',
            recommendation: 'Start with medium difficulty',
            currentDifficulty: 5,
          };
        }
        
        const successRate = recentPerformances.filter(p => p.success).length / recentPerformances.length;
        const currentDifficulty = topicDifficulties[topic] || 5;
        const trend = get().calculateTrend(recentPerformances);
        
        let message = '';
        let recommendation = '';
        
        if (successRate > 0.8) {
          message = 'You\'re performing excellently!';
          recommendation = 'Consider increasing difficulty for more challenge';
        } else if (successRate > 0.6) {
          message = 'You\'re doing well!';
          recommendation = 'Current difficulty is optimal for learning';
        } else if (successRate > 0.4) {
          message = 'You\'re making progress';
          recommendation = 'Keep practicing at this level or reduce difficulty';
        } else {
          message = 'This is challenging for you';
          recommendation = 'Consider reducing difficulty to build confidence';
        }
        
        return {
          message,
          recommendation,
          currentDifficulty,
          successRate,
          trend,
          performanceCount: recentPerformances.length,
        };
      },
      
      calculateTrend: (performances) => {
        if (performances.length < 3) return 'stable';
        
        const recent = performances.slice(-3);
        const older = performances.slice(-6, -3);
        
        if (older.length === 0) return 'stable';
        
        const recentSuccess = recent.filter(p => p.success).length / recent.length;
        const olderSuccess = older.filter(p => p.success).length / older.length;
        
        if (recentSuccess > olderSuccess + 0.2) return 'improving';
        if (recentSuccess < olderSuccess - 0.2) return 'declining';
        return 'stable';
      },
      
      generateQuestionDifficulty: (topic, questionType) => {
        const baseDifficulty = get().getNumericDifficulty(topic);
        
        // Adjust based on question type
        const typeMultipliers = {
          'multiple-choice': 0.8,
          'true-false': 0.7,
          'short-answer': 1.0,
          'scenario': 1.2,
          'problem-solving': 1.3,
        };
        
        const multiplier = typeMultipliers[questionType] || 1.0;
        const adjustedDifficulty = baseDifficulty * multiplier;
        
        return {
          numeric: Math.round(adjustedDifficulty),
          level: get().getDifficultyLevel(topic),
          questionType,
          parameters: get().getDifficultyParameters(Math.round(adjustedDifficulty)),
        };
      },
      
      getDifficultyParameters: (numericDifficulty) => {
        // Return parameters for content generation based on difficulty
        return {
          vocabularyLevel: Math.min(10, Math.floor(numericDifficulty * 1.2)),
          conceptComplexity: numericDifficulty,
          timeLimit: Math.max(30, 180 - (numericDifficulty * 15)), // seconds
          hintsAvailable: Math.max(0, 5 - numericDifficulty),
          multipleSteps: numericDifficulty > 5,
          requiresCriticalThinking: numericDifficulty > 6,
          requiresCreativity: numericDifficulty > 7,
        };
      },
      
      getPerformanceStats: (topic) => {
        const { performanceHistory } = get();
        const topicPerformances = performanceHistory.filter(p => p.topic === topic);
        
        if (topicPerformances.length === 0) {
          return {
            totalAttempts: 0,
            successRate: 0,
            averageTime: 0,
            averageEngagement: 0,
            difficultyProgression: [],
          };
        }
        
        const successRate = topicPerformances.filter(p => p.success).length / topicPerformances.length;
        const averageTime = topicPerformances.reduce((acc, p) => acc + p.timeSpent, 0) / topicPerformances.length;
        const averageEngagement = topicPerformances.reduce((acc, p) => acc + p.engagement, 0) / topicPerformances.length;
        
        // Track difficulty progression
        const difficultyProgression = topicPerformances.map((p, i) => ({
          attempt: i + 1,
          difficulty: p.difficulty,
          success: p.success,
        }));
        
        return {
          totalAttempts: topicPerformances.length,
          successRate,
          averageTime: Math.round(averageTime),
          averageEngagement: Math.round(averageEngagement * 100) / 100,
          difficultyProgression,
        };
      },
      
      // Get recommended difficulty for new user
      getDefaultDifficulty: (userProfile) => {
        // Start based on user's stated experience level
        const experienceLevels = {
          beginner: 3,
          intermediate: 5,
          advanced: 7,
          expert: 9,
        };
        
        return experienceLevels[userProfile?.experienceLevel] || 5;
      },
      
      // Export performance data
      exportPerformanceData: (topic) => {
        const { performanceHistory, topicDifficulties } = get();
        const stats = get().getPerformanceStats(topic);
        const insights = get().getAdaptationInsights(topic);
        
        return {
          topic,
          currentDifficulty: topicDifficulties[topic] || 5,
          stats,
          insights,
          history: performanceHistory.filter(p => p.topic === topic),
          exportedAt: new Date().toISOString(),
        };
      },
    }),
    {
      name: 'adaptive-difficulty',
    }
  )
);

/**
 * Utility Functions
 */

// Calculate optimal difficulty for user
export const calculateOptimalDifficulty = (performances, currentDifficulty) => {
  if (performances.length < 3) return currentDifficulty;
  
  const recent = performances.slice(-5);
  const successRate = recent.filter(p => p.success).length / recent.length;
  
  if (successRate > 0.85) return Math.min(10, currentDifficulty + 1);
  if (successRate < 0.55) return Math.max(1, currentDifficulty - 1);
  return currentDifficulty;
};

// Get difficulty color
export const getDifficultyColor = (level) => {
  const colors = {
    easy: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', border: 'border-green-300' },
    medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-300' },
    hard: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300', border: 'border-red-300' },
  };
  return colors[level] || colors.medium;
};

// Format difficulty for display
export const formatDifficulty = (numericDifficulty) => {
  if (numericDifficulty <= 3) return { level: 'easy', label: 'Easy', emoji: '😊' };
  if (numericDifficulty <= 7) return { level: 'medium', label: 'Medium', emoji: '🤔' };
  return { level: 'hard', label: 'Hard', emoji: '💪' };
};

/**
 * React Hooks
 */

// Get current difficulty for topic
export const useTopicDifficulty = (topic) => {
  const getDifficultyLevel = useAdaptiveDifficultyStore(state => state.getDifficultyLevel);
  const getNumericDifficulty = useAdaptiveDifficultyStore(state => state.getNumericDifficulty);
  
  return {
    level: getDifficultyLevel(topic),
    numeric: getNumericDifficulty(topic),
  };
};

// Get adaptation insights
export const useAdaptationInsights = (topic) => {
  const getInsights = useAdaptiveDifficultyStore(state => state.getAdaptationInsights);
  return getInsights(topic);
};

// Get performance stats
export const usePerformanceStats = (topic) => {
  const getStats = useAdaptiveDifficultyStore(state => state.getPerformanceStats);
  return getStats(topic);
};
