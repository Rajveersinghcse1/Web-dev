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

      // Learning paths with pre-defined paths
      learningPaths: [
        {
          id: 'path-communication',
          name: 'Communication Mastery',
          description: 'Master verbal and written communication for professional success',
          icon: '💬',
          category: 'soft-skills',
          difficulty: 'beginner',
          estimatedHours: 20,
          totalXp: 2500,
          progress: 0,
          topics: [
            { id: 'comm-1', name: 'Active Listening', completed: false, unlocked: true, difficulty: 'easy', xpReward: 100, phase: 'Foundation' },
            { id: 'comm-2', name: 'Clear Articulation', completed: false, unlocked: false, difficulty: 'easy', xpReward: 100, phase: 'Foundation' },
            { id: 'comm-3', name: 'Non-verbal Communication', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Foundation' },
            { id: 'comm-4', name: 'Persuasive Speaking', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Advanced' },
            { id: 'comm-5', name: 'Conflict Resolution', completed: false, unlocked: false, difficulty: 'hard', xpReward: 200, phase: 'Advanced' },
            { id: 'comm-6', name: 'Professional Presentations', completed: false, unlocked: false, difficulty: 'hard', xpReward: 250, phase: 'Mastery' },
          ]
        },
        {
          id: 'path-leadership',
          name: 'Leadership Excellence',
          description: 'Develop essential leadership skills to inspire and guide teams',
          icon: '👑',
          category: 'soft-skills',
          difficulty: 'intermediate',
          estimatedHours: 30,
          totalXp: 3500,
          progress: 0,
          topics: [
            { id: 'lead-1', name: 'Self-Leadership', completed: false, unlocked: true, difficulty: 'easy', xpReward: 100, phase: 'Foundation' },
            { id: 'lead-2', name: 'Team Motivation', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Foundation' },
            { id: 'lead-3', name: 'Decision Making', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Core Skills' },
            { id: 'lead-4', name: 'Delegation Strategies', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Core Skills' },
            { id: 'lead-5', name: 'Emotional Intelligence', completed: false, unlocked: false, difficulty: 'hard', xpReward: 200, phase: 'Advanced' },
            { id: 'lead-6', name: 'Crisis Management', completed: false, unlocked: false, difficulty: 'hard', xpReward: 250, phase: 'Advanced' },
            { id: 'lead-7', name: 'Strategic Vision', completed: false, unlocked: false, difficulty: 'hard', xpReward: 300, phase: 'Mastery' },
          ]
        },
        {
          id: 'path-tech-interview',
          name: 'Tech Interview Prep',
          description: 'Ace your technical interviews with comprehensive preparation',
          icon: '💻',
          category: 'tech',
          difficulty: 'intermediate',
          estimatedHours: 40,
          totalXp: 4000,
          progress: 0,
          topics: [
            { id: 'tech-1', name: 'Data Structures Basics', completed: false, unlocked: true, difficulty: 'easy', xpReward: 100, phase: 'Fundamentals' },
            { id: 'tech-2', name: 'Algorithm Patterns', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Fundamentals' },
            { id: 'tech-3', name: 'Problem Solving Approach', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Core Skills' },
            { id: 'tech-4', name: 'System Design Basics', completed: false, unlocked: false, difficulty: 'hard', xpReward: 200, phase: 'Core Skills' },
            { id: 'tech-5', name: 'Behavioral Questions', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Interview Skills' },
            { id: 'tech-6', name: 'Mock Interview Practice', completed: false, unlocked: false, difficulty: 'hard', xpReward: 250, phase: 'Interview Skills' },
            { id: 'tech-7', name: 'Salary Negotiation', completed: false, unlocked: false, difficulty: 'hard', xpReward: 200, phase: 'Career' },
          ]
        },
        {
          id: 'path-public-speaking',
          name: 'Public Speaking Pro',
          description: 'Overcome fear and become a confident, engaging speaker',
          icon: '🎤',
          category: 'soft-skills',
          difficulty: 'beginner',
          estimatedHours: 25,
          totalXp: 3000,
          progress: 0,
          topics: [
            { id: 'speak-1', name: 'Overcoming Stage Fright', completed: false, unlocked: true, difficulty: 'easy', xpReward: 100, phase: 'Foundation' },
            { id: 'speak-2', name: 'Voice Modulation', completed: false, unlocked: false, difficulty: 'easy', xpReward: 100, phase: 'Foundation' },
            { id: 'speak-3', name: 'Storytelling Techniques', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Engagement' },
            { id: 'speak-4', name: 'Audience Engagement', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Engagement' },
            { id: 'speak-5', name: 'Impromptu Speaking', completed: false, unlocked: false, difficulty: 'hard', xpReward: 200, phase: 'Advanced' },
            { id: 'speak-6', name: 'TED-style Presentations', completed: false, unlocked: false, difficulty: 'hard', xpReward: 250, phase: 'Mastery' },
          ]
        },
        // NEW TECH PATHS
        {
          id: 'path-python',
          name: 'Python Mastery',
          description: 'Master Python programming from basics to advanced concepts',
          icon: '🐍',
          category: 'tech',
          difficulty: 'beginner',
          estimatedHours: 35,
          totalXp: 4500,
          progress: 0,
          topics: [
            { id: 'py-1', name: 'Python Basics & Syntax', completed: false, unlocked: true, difficulty: 'easy', xpReward: 100, phase: 'Foundation' },
            { id: 'py-2', name: 'Data Types & Variables', completed: false, unlocked: false, difficulty: 'easy', xpReward: 100, phase: 'Foundation' },
            { id: 'py-3', name: 'Control Flow & Loops', completed: false, unlocked: false, difficulty: 'easy', xpReward: 100, phase: 'Foundation' },
            { id: 'py-4', name: 'Functions & Modules', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Core Concepts' },
            { id: 'py-5', name: 'Object-Oriented Programming', completed: false, unlocked: false, difficulty: 'medium', xpReward: 200, phase: 'Core Concepts' },
            { id: 'py-6', name: 'File Handling & APIs', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Practical Skills' },
            { id: 'py-7', name: 'Error Handling & Debugging', completed: false, unlocked: false, difficulty: 'hard', xpReward: 200, phase: 'Advanced' },
            { id: 'py-8', name: 'Python Projects & Best Practices', completed: false, unlocked: false, difficulty: 'hard', xpReward: 300, phase: 'Mastery' },
          ]
        },
        {
          id: 'path-react',
          name: 'React Development',
          description: 'Build modern web applications with React and its ecosystem',
          icon: '⚛️',
          category: 'tech',
          difficulty: 'intermediate',
          estimatedHours: 45,
          totalXp: 5000,
          progress: 0,
          topics: [
            { id: 'react-1', name: 'React Fundamentals & JSX', completed: false, unlocked: true, difficulty: 'easy', xpReward: 100, phase: 'Foundation' },
            { id: 'react-2', name: 'Components & Props', completed: false, unlocked: false, difficulty: 'easy', xpReward: 100, phase: 'Foundation' },
            { id: 'react-3', name: 'State & Lifecycle', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Core Concepts' },
            { id: 'react-4', name: 'Hooks Deep Dive', completed: false, unlocked: false, difficulty: 'medium', xpReward: 200, phase: 'Core Concepts' },
            { id: 'react-5', name: 'Context & State Management', completed: false, unlocked: false, difficulty: 'hard', xpReward: 250, phase: 'Advanced' },
            { id: 'react-6', name: 'React Router & Navigation', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Practical Skills' },
            { id: 'react-7', name: 'Performance Optimization', completed: false, unlocked: false, difficulty: 'hard', xpReward: 300, phase: 'Mastery' },
          ]
        },
        {
          id: 'path-data-science',
          name: 'Data Science Fundamentals',
          description: 'Learn data analysis, visualization, and machine learning basics',
          icon: '📊',
          category: 'tech',
          difficulty: 'intermediate',
          estimatedHours: 50,
          totalXp: 5500,
          progress: 0,
          topics: [
            { id: 'ds-1', name: 'Introduction to Data Science', completed: false, unlocked: true, difficulty: 'easy', xpReward: 100, phase: 'Foundation' },
            { id: 'ds-2', name: 'Statistics & Probability', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Foundation' },
            { id: 'ds-3', name: 'Data Cleaning & Preprocessing', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Data Handling' },
            { id: 'ds-4', name: 'Data Visualization', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Data Handling' },
            { id: 'ds-5', name: 'Exploratory Data Analysis', completed: false, unlocked: false, difficulty: 'medium', xpReward: 200, phase: 'Analysis' },
            { id: 'ds-6', name: 'Machine Learning Basics', completed: false, unlocked: false, difficulty: 'hard', xpReward: 250, phase: 'ML' },
            { id: 'ds-7', name: 'Model Evaluation & Tuning', completed: false, unlocked: false, difficulty: 'hard', xpReward: 250, phase: 'ML' },
            { id: 'ds-8', name: 'Real-world Data Projects', completed: false, unlocked: false, difficulty: 'hard', xpReward: 350, phase: 'Mastery' },
          ]
        },
        {
          id: 'path-cybersecurity',
          name: 'Cybersecurity Basics',
          description: 'Learn fundamental security concepts and protect digital assets',
          icon: '🔐',
          category: 'tech',
          difficulty: 'beginner',
          estimatedHours: 30,
          totalXp: 3500,
          progress: 0,
          topics: [
            { id: 'cyber-1', name: 'Security Fundamentals', completed: false, unlocked: true, difficulty: 'easy', xpReward: 100, phase: 'Foundation' },
            { id: 'cyber-2', name: 'Network Security Basics', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Foundation' },
            { id: 'cyber-3', name: 'Common Threats & Attacks', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Threats' },
            { id: 'cyber-4', name: 'Encryption & Cryptography', completed: false, unlocked: false, difficulty: 'hard', xpReward: 200, phase: 'Defense' },
            { id: 'cyber-5', name: 'Security Best Practices', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Defense' },
            { id: 'cyber-6', name: 'Ethical Hacking Intro', completed: false, unlocked: false, difficulty: 'hard', xpReward: 300, phase: 'Advanced' },
          ]
        },
        // NEW SOFT SKILLS PATHS
        {
          id: 'path-time-management',
          name: 'Time Management Mastery',
          description: 'Maximize productivity and achieve work-life balance',
          icon: '⏰',
          category: 'soft-skills',
          difficulty: 'beginner',
          estimatedHours: 15,
          totalXp: 2000,
          progress: 0,
          topics: [
            { id: 'time-1', name: 'Understanding Time Wasters', completed: false, unlocked: true, difficulty: 'easy', xpReward: 100, phase: 'Foundation' },
            { id: 'time-2', name: 'Goal Setting & Prioritization', completed: false, unlocked: false, difficulty: 'easy', xpReward: 100, phase: 'Foundation' },
            { id: 'time-3', name: 'The Pomodoro Technique', completed: false, unlocked: false, difficulty: 'easy', xpReward: 100, phase: 'Techniques' },
            { id: 'time-4', name: 'Calendar Blocking & Planning', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Techniques' },
            { id: 'time-5', name: 'Beating Procrastination', completed: false, unlocked: false, difficulty: 'hard', xpReward: 200, phase: 'Mastery' },
          ]
        },
        {
          id: 'path-critical-thinking',
          name: 'Critical Thinking',
          description: 'Develop analytical skills for better decision making',
          icon: '🧠',
          category: 'soft-skills',
          difficulty: 'intermediate',
          estimatedHours: 25,
          totalXp: 3000,
          progress: 0,
          topics: [
            { id: 'think-1', name: 'What is Critical Thinking?', completed: false, unlocked: true, difficulty: 'easy', xpReward: 100, phase: 'Foundation' },
            { id: 'think-2', name: 'Identifying Logical Fallacies', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Foundation' },
            { id: 'think-3', name: 'Evaluating Evidence', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Analysis' },
            { id: 'think-4', name: 'Problem-Solving Frameworks', completed: false, unlocked: false, difficulty: 'medium', xpReward: 200, phase: 'Analysis' },
            { id: 'think-5', name: 'Decision Making Under Uncertainty', completed: false, unlocked: false, difficulty: 'hard', xpReward: 250, phase: 'Advanced' },
            { id: 'think-6', name: 'Creative Problem Solving', completed: false, unlocked: false, difficulty: 'hard', xpReward: 250, phase: 'Mastery' },
          ]
        },
        // NEW LANGUAGE PATHS
        {
          id: 'path-english-fluency',
          name: 'English Fluency',
          description: 'Improve your English speaking and comprehension skills',
          icon: '🗣️',
          category: 'languages',
          difficulty: 'beginner',
          estimatedHours: 40,
          totalXp: 4000,
          progress: 0,
          topics: [
            { id: 'eng-1', name: 'Pronunciation Fundamentals', completed: false, unlocked: true, difficulty: 'easy', xpReward: 100, phase: 'Foundation' },
            { id: 'eng-2', name: 'Common Vocabulary Building', completed: false, unlocked: false, difficulty: 'easy', xpReward: 100, phase: 'Foundation' },
            { id: 'eng-3', name: 'Grammar Essentials', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Structure' },
            { id: 'eng-4', name: 'Listening Comprehension', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Skills' },
            { id: 'eng-5', name: 'Conversational English', completed: false, unlocked: false, difficulty: 'medium', xpReward: 200, phase: 'Skills' },
            { id: 'eng-6', name: 'Advanced Fluency & Idioms', completed: false, unlocked: false, difficulty: 'hard', xpReward: 300, phase: 'Mastery' },
          ]
        },
        {
          id: 'path-business-communication',
          name: 'Business Communication',
          description: 'Master professional communication for the workplace',
          icon: '💼',
          category: 'languages',
          difficulty: 'intermediate',
          estimatedHours: 20,
          totalXp: 2500,
          progress: 0,
          topics: [
            { id: 'biz-1', name: 'Professional Email Writing', completed: false, unlocked: true, difficulty: 'easy', xpReward: 100, phase: 'Written' },
            { id: 'biz-2', name: 'Meeting Communication', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Verbal' },
            { id: 'biz-3', name: 'Presentation Skills', completed: false, unlocked: false, difficulty: 'medium', xpReward: 150, phase: 'Verbal' },
            { id: 'biz-4', name: 'Negotiation Tactics', completed: false, unlocked: false, difficulty: 'hard', xpReward: 200, phase: 'Advanced' },
            { id: 'biz-5', name: 'Cross-cultural Communication', completed: false, unlocked: false, difficulty: 'hard', xpReward: 250, phase: 'Mastery' },
          ]
        },
      ],
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

      // Complete a topic in a learning path
      completeTopicInPath: (pathId, topicId) => {
        set(state => {
          const pathIndex = state.learningPaths.findIndex(p => p.id === pathId);
          if (pathIndex === -1) return state;

          const path = { ...state.learningPaths[pathIndex] };
          const topics = [...path.topics];
          const topicIndex = topics.findIndex(t => t.id === topicId);

          if (topicIndex === -1) return state;

          // Mark topic as completed
          topics[topicIndex] = { ...topics[topicIndex], completed: true };

          // Unlock the next topic if exists
          if (topicIndex + 1 < topics.length) {
            topics[topicIndex + 1] = { ...topics[topicIndex + 1], unlocked: true };
          }

          // Calculate new progress
          const completedCount = topics.filter(t => t.completed).length;
          const progress = Math.round((completedCount / topics.length) * 100);

          // Update path
          path.topics = topics;
          path.progress = progress;

          // Update paths array
          const newPaths = [...state.learningPaths];
          newPaths[pathIndex] = path;

          return { learningPaths: newPaths };
        });
      },

      // Reset path progress
      resetPathProgress: (pathId) => {
        set(state => {
          const pathIndex = state.learningPaths.findIndex(p => p.id === pathId);
          if (pathIndex === -1) return state;

          const path = { ...state.learningPaths[pathIndex] };
          const topics = path.topics.map((topic, index) => ({
            ...topic,
            completed: false,
            unlocked: index === 0, // Only first topic unlocked
          }));

          path.topics = topics;
          path.progress = 0;

          const newPaths = [...state.learningPaths];
          newPaths[pathIndex] = path;

          return { learningPaths: newPaths };
        });
      },

      // Get path statistics
      getPathStats: (pathId) => {
        const { learningPaths } = get();
        const path = learningPaths.find(p => p.id === pathId);

        if (!path) return null;

        const completedTopics = path.topics.filter(t => t.completed);
        const earnedXp = completedTopics.reduce((sum, t) => sum + (t.xpReward || 0), 0);
        const remainingXp = path.totalXp - earnedXp;
        const nextTopic = path.topics.find(t => !t.completed && t.unlocked);

        return {
          totalTopics: path.topics.length,
          completedTopics: completedTopics.length,
          progress: path.progress,
          earnedXp,
          remainingXp,
          totalXp: path.totalXp,
          nextTopic,
          isCompleted: path.progress === 100,
        };
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
