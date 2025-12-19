/**
 * Global State Management Store (Zustand)
 * =========================================
 * Centralized state for the entire application
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ==================== User Progress Store ====================
export const useProgressStore = create(
  persist(
    (set, get) => ({
      // XP & Level System (with demo data)
      totalXP: 2450,
      level: 5,
      currentLevelXP: 150,
      nextLevelXP: 500,
      
      // Streaks (with demo data)
      currentStreak: 7,
      longestStreak: 12,
      lastSessionDate: new Date().toDateString(),
      
      // Session Stats (with demo data)
      totalSessions: 23,
      totalMinutes: 420,
      totalTopics: 15,
      
      // Achievements (with demo data)
      unlockedAchievements: ['first_session', 'week_warrior', 'fast_learner'],
      newAchievements: [],
      
      // Actions
      addXP: (amount) => {
        const { currentLevelXP, nextLevelXP, level, totalXP } = get();
        const newTotalXP = totalXP + amount;
        const newCurrentXP = currentLevelXP + amount;
        
        if (newCurrentXP >= nextLevelXP) {
          // Level up!
          const newLevel = level + 1;
          const overflow = newCurrentXP - nextLevelXP;
          const newNextLevelXP = Math.floor(nextLevelXP * 1.5);
          
          set({
            level: newLevel,
            totalXP: newTotalXP,
            currentLevelXP: overflow,
            nextLevelXP: newNextLevelXP,
          });
          
          return { leveledUp: true, newLevel };
        }
        
        set({ 
          totalXP: newTotalXP,
          currentLevelXP: newCurrentXP 
        });
        
        return { leveledUp: false };
      },
      
      updateStreak: () => {
        const { lastSessionDate, currentStreak, longestStreak } = get();
        const today = new Date().toDateString();
        
        if (!lastSessionDate) {
          // First session
          set({ 
            currentStreak: 1, 
            longestStreak: Math.max(1, longestStreak),
            lastSessionDate: today 
          });
          return { streakContinued: true, currentStreak: 1 };
        }
        
        const lastDate = new Date(lastSessionDate);
        const now = new Date();
        const diffDays = Math.floor((now - lastDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
          // Same day - no change
          return { streakContinued: false, currentStreak };
        } else if (diffDays === 1) {
          // Consecutive day - streak continues!
          const newStreak = currentStreak + 1;
          set({
            currentStreak: newStreak,
            longestStreak: Math.max(newStreak, longestStreak),
            lastSessionDate: today
          });
          return { streakContinued: true, currentStreak: newStreak };
        } else {
          // Streak broken
          set({ 
            currentStreak: 1, 
            lastSessionDate: today 
          });
          return { streakBroken: true, currentStreak: 1 };
        }
      },
      
      incrementSession: (durationMinutes, topic) => {
        const { totalSessions, totalMinutes, totalTopics } = get();
        set({
          totalSessions: totalSessions + 1,
          totalMinutes: totalMinutes + (durationMinutes || 0),
          totalTopics: totalTopics + (topic ? 1 : 0)
        });
      },
      
      unlockAchievement: (achievementId) => {
        const { unlockedAchievements, newAchievements } = get();
        if (!unlockedAchievements.includes(achievementId)) {
          set({
            unlockedAchievements: [...unlockedAchievements, achievementId],
            newAchievements: [...newAchievements, achievementId]
          });
          return true;
        }
        return false;
      },
      
      clearNewAchievements: () => set({ newAchievements: [] }),
      
      resetProgress: () => set({
        totalXP: 0,
        level: 1,
        currentLevelXP: 0,
        nextLevelXP: 100,
        currentStreak: 0,
        longestStreak: 0,
        lastSessionDate: null,
        totalSessions: 0,
        totalMinutes: 0,
        totalTopics: 0,
        unlockedAchievements: [],
        newAchievements: []
      })
    }),
    {
      name: 'progress-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ==================== UI State Store ====================
export const useUIStore = create((set) => ({
  // Theme
  theme: 'system',
  setTheme: (theme) => set({ theme }),
  
  // Sidebar
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  // Modals
  activeModal: null,
  modalData: null,
  openModal: (modal, data = null) => set({ activeModal: modal, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: null }),
  
  // Notifications
  notifications: [],
  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { id: Date.now(), ...notification }]
  })),
  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),
  clearNotifications: () => set({ notifications: [] }),
  
  // Loading states
  globalLoading: false,
  setGlobalLoading: (loading) => set({ globalLoading: loading }),
  
  // Search
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // Filters
  activeFilters: {},
  setFilter: (key, value) => set((state) => ({
    activeFilters: { ...state.activeFilters, [key]: value }
  })),
  clearFilters: () => set({ activeFilters: {} }),
}));

// ==================== Session State Store ====================
export const useSessionStore = create((set, get) => ({
  // Current session
  activeSession: null,
  sessionStartTime: null,
  sessionDuration: 0,
  isRecording: false,
  isPaused: false,
  
  // Session data
  currentTranscript: '',
  bookmarks: [],
  quickNotes: [],
  
  // Actions
  startSession: (sessionData) => set({
    activeSession: sessionData,
    sessionStartTime: Date.now(),
    sessionDuration: 0,
    isRecording: false,
    isPaused: false,
    currentTranscript: '',
    bookmarks: [],
    quickNotes: []
  }),
  
  endSession: () => {
    const { sessionStartTime } = get();
    const duration = sessionStartTime ? Math.floor((Date.now() - sessionStartTime) / 60000) : 0;
    
    set({
      activeSession: null,
      sessionStartTime: null,
      sessionDuration: 0,
      isRecording: false,
      isPaused: false
    });
    
    return duration;
  },
  
  toggleRecording: () => set((state) => ({ isRecording: !state.isRecording })),
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
  
  updateTranscript: (text) => set({ currentTranscript: text }),
  
  addBookmark: (timestamp, label) => set((state) => ({
    bookmarks: [...state.bookmarks, { timestamp, label, id: Date.now() }]
  })),
  
  addQuickNote: (note) => set((state) => ({
    quickNotes: [...state.quickNotes, { note, timestamp: Date.now(), id: Date.now() }]
  })),
  
  updateSessionDuration: () => {
    const { sessionStartTime } = get();
    if (sessionStartTime) {
      const duration = Math.floor((Date.now() - sessionStartTime) / 1000);
      set({ sessionDuration: duration });
    }
  }
}));

// ==================== Analytics Store ====================
export const useAnalyticsStore = create(
  persist(
    (set, get) => ({
      // Session history
      sessionHistory: [],
      
      // Topic analytics
      topicStats: {},
      
      // Time analytics
      dailyMinutes: {},
      weeklyStats: {},
      
      // Performance metrics
      averageSessionQuality: 0,
      improvementRate: 0,
      
      // Actions
      addSessionRecord: (session) => {
        const { sessionHistory, topicStats, dailyMinutes } = get();
        const today = new Date().toDateString();
        
        // Add to history
        const newHistory = [session, ...sessionHistory].slice(0, 100);
        
        // Update topic stats
        const topic = session.topic;
        const newTopicStats = {
          ...topicStats,
          [topic]: {
            sessions: (topicStats[topic]?.sessions || 0) + 1,
            totalMinutes: (topicStats[topic]?.totalMinutes || 0) + (session.duration || 0),
            lastSessionDate: today,
            averageQuality: session.quality || 0
          }
        };
        
        // Update daily minutes
        const newDailyMinutes = {
          ...dailyMinutes,
          [today]: (dailyMinutes[today] || 0) + (session.duration || 0)
        };
        
        set({
          sessionHistory: newHistory,
          topicStats: newTopicStats,
          dailyMinutes: newDailyMinutes
        });
      },
      
      getTopicInsights: (topic) => {
        const { topicStats } = get();
        return topicStats[topic] || null;
      },
      
      getDailyActivity: (days = 30) => {
        const { dailyMinutes } = get();
        const result = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(date.getDate() - i);
          const dateStr = date.toDateString();
          result.push({
            date: dateStr,
            minutes: dailyMinutes[dateStr] || 0
          });
        }
        
        return result;
      },
      
      clearAnalytics: () => set({
        sessionHistory: [],
        topicStats: {},
        dailyMinutes: {},
        weeklyStats: {},
        averageSessionQuality: 0,
        improvementRate: 0
      })
    }),
    {
      name: 'analytics-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// ==================== Preferences Store ====================
export const usePreferencesStore = create(
  persist(
    (set) => ({
      // Voice preferences
      voiceEnabled: true,
      voiceSpeed: 1.0,
      voiceVolume: 1.0,
      preferredVoice: null,
      
      // UI preferences
      compactMode: false,
      animationsEnabled: true,
      soundEffectsEnabled: true,
      autoSaveEnabled: true,
      
      // Accessibility
      highContrast: false,
      reducedMotion: false,
      fontSize: 'medium',
      
      // Notifications
      emailNotifications: true,
      pushNotifications: true,
      reminderNotifications: true,
      achievementNotifications: true,
      
      // Privacy
      shareProgress: true,
      showOnLeaderboard: true,
      
      // Actions
      updateVoicePreferences: (prefs) => set((state) => ({
        ...state,
        ...prefs
      })),
      
      updateUIPreferences: (prefs) => set((state) => ({
        ...state,
        ...prefs
      })),
      
      togglePreference: (key) => set((state) => ({
        [key]: !state[key]
      }))
    }),
    {
      name: 'preferences-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default {
  useProgressStore,
  useUIStore,
  useSessionStore,
  useAnalyticsStore,
  usePreferencesStore
};
