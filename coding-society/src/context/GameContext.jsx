import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Game Context for Ultra-Advanced Gamified Learning
const GameContext = createContext();

// Game Configuration
const GAME_CONFIG = {
  maxLevel: 100,
  xpPerLevel: (level) => Math.floor(100 * Math.pow(1.5, level - 1)),
  skillCategories: [
    'frontend', 'backend', 'ai', 'mobile', 'devops', 'security', 'algorithms', 'databases'
  ],
  achievements: {
    'first_quest': { name: 'First Steps', description: 'Complete your first quest', xp: 50, icon: '🌟' },
    'code_warrior': { name: 'Code Warrior', description: 'Solve 10 coding challenges', xp: 200, icon: '⚔️' },
    'syntax_master': { name: 'Syntax Master', description: 'Write 100 lines of code', xp: 150, icon: '🎯' },
    'bug_hunter': { name: 'Bug Hunter', description: 'Fix 5 bugs in challenges', xp: 100, icon: '🐛' },
    'streak_keeper': { name: 'Streak Keeper', description: 'Code for 7 consecutive days', xp: 300, icon: '🔥' },
    'algorithm_sage': { name: 'Algorithm Sage', description: 'Master 5 algorithm patterns', xp: 500, icon: '🧠' },
    'team_player': { name: 'Team Player', description: 'Complete 3 collaborative quests', xp: 250, icon: '🤝' },
    'speed_demon': { name: 'Speed Demon', description: 'Solve a challenge in under 5 minutes', xp: 150, icon: '⚡' },
    'perfectionist': { name: 'Perfectionist', description: 'Get 100% test coverage on 5 solutions', xp: 400, icon: '💎' },
    'mentor': { name: 'Code Mentor', description: 'Help 10 other learners', xp: 600, icon: '👨‍🏫' }
  },
  characterClasses: {
    'frontend_wizard': {
      name: 'Frontend Wizard',
      description: 'Master of UI/UX and visual magic',
      bonuses: { frontend: 1.2, ui_design: 1.3 },
      unlockLevel: 1,
      icon: '🧙‍♂️'
    },
    'backend_knight': {
      name: 'Backend Knight',
      description: 'Defender of servers and databases',
      bonuses: { backend: 1.2, databases: 1.3 },
      unlockLevel: 10,
      icon: '🛡️'
    },
    'ai_sorcerer': {
      name: 'AI Sorcerer',
      description: 'Wielder of machine learning spells',
      bonuses: { ai: 1.5, algorithms: 1.2 },
      unlockLevel: 25,
      icon: '🔮'
    },
    'fullstack_paladin': {
      name: 'Full-Stack Paladin',
      description: 'Balanced warrior of all domains',
      bonuses: { frontend: 1.1, backend: 1.1, mobile: 1.1 },
      unlockLevel: 50,
      icon: '⚖️'
    }
  },
  questDifficulties: {
    'novice': { multiplier: 1, color: 'green', icon: '🟢' },
    'apprentice': { multiplier: 1.5, color: 'blue', icon: '🔵' },
    'expert': { multiplier: 2, color: 'purple', icon: '🟣' },
    'master': { multiplier: 3, color: 'orange', icon: '🟠' },
    'legendary': { multiplier: 5, color: 'red', icon: '🔴' }
  }
};

// Initial game state
const initialGameState = {
  player: {
    id: null,
    username: '',
    level: 1,
    xp: 0,
    totalXp: 0,
    characterClass: 'frontend_wizard',
    avatar: {
      head: 'default',
      body: 'default',
      accessory: 'none',
      theme: 'classic'
    },
    stats: {
      questsCompleted: 0,
      challengesSolved: 0,
      codeLines: 0,
      bugsFixed: 0,
      streakDays: 0,
      currentStreak: 0,
      lastActiveDate: null,
      timeSpent: 0
    }
  },
  skills: {
    frontend: { level: 1, xp: 0, points: 0 },
    backend: { level: 1, xp: 0, points: 0 },
    ai: { level: 1, xp: 0, points: 0 },
    mobile: { level: 1, xp: 0, points: 0 },
    devops: { level: 1, xp: 0, points: 0 },
    security: { level: 1, xp: 0, points: 0 },
    algorithms: { level: 1, xp: 0, points: 0 },
    databases: { level: 1, xp: 0, points: 0 }
  },
  achievements: {
    unlocked: [],
    inProgress: []
  },
  inventory: {
    items: [],
    themes: ['classic'],
    avatarParts: {
      heads: ['default'],
      bodies: ['default'],
      accessories: ['none']
    }
  },
  quests: {
    active: [],
    completed: [],
    available: []
  },
  battles: {
    wins: 0,
    losses: 0,
    currentRating: 1000,
    bestRating: 1000
  },
  preferences: {
    difficulty: 'apprentice',
    autoSave: true,
    notifications: true,
    soundEffects: true,
    animations: true
  }
};

/**
 * Ultra-Advanced Gamified Learning Provider
 * Features:
 * - RPG-style leveling and experience system
 * - Skill trees with branching paths
 * - Achievement system with badges and rewards
 * - Character classes with unique bonuses
 * - Quest system with storylines
 * - Inventory and customization
 * - Battle arena for competitive coding
 * - Progress tracking and analytics
 */
export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState(initialGameState);
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // Load game state from localStorage on mount
  useEffect(() => {
    loadGameState();
    checkDailyStreak();
  }, []);

  // Auto-save game state when it changes
  useEffect(() => {
    if (!isLoading && gameState.preferences.autoSave) {
      saveGameState();
    }
  }, [gameState, isLoading]);

  /**
   * Load game state from localStorage
   */
  const loadGameState = () => {
    try {
      const savedState = localStorage.getItem('gamifiedLearning_state');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        
        // Ensure achievements structure exists even if loading old state
        const mergedState = {
          ...initialGameState,
          ...parsedState,
          achievements: {
            ...initialGameState.achievements,
            ...(parsedState.achievements || {}),
            unlocked: parsedState.achievements?.unlocked || [],
            inProgress: parsedState.achievements?.inProgress || []
          }
        };
        
        setGameState(mergedState);
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save game state to localStorage
   */
  const saveGameState = () => {
    try {
      localStorage.setItem('gamifiedLearning_state', JSON.stringify(gameState));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  };

  /**
   * Check and update daily streak
   */
  const checkDailyStreak = () => {
    const today = new Date().toDateString();
    const lastActive = gameState.player.stats.lastActiveDate;
    
    if (lastActive === today) {
      return; // Already active today
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastActive === yesterday.toDateString()) {
      // Continue streak
      updatePlayerStats({ 
        currentStreak: gameState.player.stats.currentStreak + 1,
        lastActiveDate: today
      });
    } else {
      // Reset streak
      updatePlayerStats({ 
        currentStreak: 1,
        lastActiveDate: today
      });
    }
    
    // Check streak achievements
    if (gameState.player.stats.currentStreak >= 7) {
      unlockAchievement('streak_keeper');
    }
  };

  /**
   * Initialize player profile
   */
  const initializePlayer = (username, selectedClass = 'frontend_wizard') => {
    const newGameState = {
      ...gameState,
      player: {
        ...gameState.player,
        id: Date.now().toString(),
        username,
        characterClass: selectedClass
      }
    };
    
    setGameState(newGameState);
    generateInitialQuests();
    
    showNotification({
      type: 'success',
      title: 'Welcome, Hero!',
      message: `${username}, your coding adventure begins!`,
      xp: 50
    });
    
    return newGameState;
  };

  /**
   * Award experience points with level up handling
   */
  const awardXP = (amount, skill = null, reason = 'Quest Completion') => {
    const xpWithBonus = calculateXPWithBonuses(amount, skill);
    const newTotalXp = gameState.player.totalXp + xpWithBonus;
    const newLevel = calculateLevel(newTotalXp);
    const leveledUp = newLevel > gameState.player.level;
    
    // Update player XP and level
    const updatedPlayer = {
      ...gameState.player,
      xp: gameState.player.xp + xpWithBonus,
      totalXp: newTotalXp,
      level: newLevel
    };
    
    // Update skill XP if specified
    let updatedSkills = { ...gameState.skills };
    if (skill && updatedSkills[skill]) {
      const skillXP = Math.floor(xpWithBonus * 0.5);
      updatedSkills[skill] = {
        ...updatedSkills[skill],
        xp: updatedSkills[skill].xp + skillXP,
        level: calculateSkillLevel(updatedSkills[skill].xp + skillXP)
      };
    }
    
    setGameState(prev => ({
      ...prev,
      player: updatedPlayer,
      skills: updatedSkills
    }));
    
    // Show notifications
    showNotification({
      type: 'xp',
      title: reason,
      message: `+${xpWithBonus} XP${skill ? ` (${skill})` : ''}`,
      xp: xpWithBonus
    });
    
    if (leveledUp) {
      handleLevelUp(newLevel);
    }
    
    return xpWithBonus;
  };

  /**
   * Calculate XP with class bonuses
   */
  const calculateXPWithBonuses = (baseXP, skill) => {
    const characterClass = GAME_CONFIG.characterClasses[gameState.player.characterClass];
    let multiplier = 1;
    
    if (skill && characterClass.bonuses[skill]) {
      multiplier = characterClass.bonuses[skill];
    }
    
    return Math.floor(baseXP * multiplier);
  };

  /**
   * Calculate level from total XP
   */
  const calculateLevel = (totalXP) => {
    let level = 1;
    let xpRequired = 0;
    
    while (level < GAME_CONFIG.maxLevel) {
      xpRequired += GAME_CONFIG.xpPerLevel(level);
      if (totalXP < xpRequired) break;
      level++;
    }
    
    return level;
  };

  /**
   * Calculate skill level from skill XP
   */
  const calculateSkillLevel = (skillXP) => {
    return Math.floor(skillXP / 200) + 1;
  };

  /**
   * Handle level up rewards and notifications
   */
  const handleLevelUp = (newLevel) => {
    const rewards = calculateLevelRewards(newLevel);
    
    showNotification({
      type: 'levelup',
      title: '🎉 LEVEL UP!',
      message: `You reached Level ${newLevel}!`,
      rewards
    });
    
    // Unlock new character classes
    Object.entries(GAME_CONFIG.characterClasses).forEach(([classKey, classData]) => {
      if (classData.unlockLevel === newLevel) {
        showNotification({
          type: 'unlock',
          title: 'New Class Unlocked!',
          message: `${classData.name} is now available!`,
          icon: classData.icon
        });
      }
    });
    
    // Award skill points
    awardSkillPoints(Math.floor(newLevel / 5) + 1);
  };

  /**
   * Calculate rewards for leveling up
   */
  const calculateLevelRewards = (level) => {
    const rewards = [];
    
    if (level % 5 === 0) {
      rewards.push({ type: 'theme', item: `level_${level}_theme` });
    }
    
    if (level % 10 === 0) {
      rewards.push({ type: 'avatar', item: `milestone_${level}_accessory` });
    }
    
    rewards.push({ type: 'skillPoints', amount: Math.floor(level / 5) + 1 });
    
    return rewards;
  };

  /**
   * Award skill points for the skill tree
   */
  const awardSkillPoints = (amount) => {
    setGameState(prev => ({
      ...prev,
      skills: Object.fromEntries(
        Object.entries(prev.skills).map(([key, skill]) => [
          key,
          { ...skill, points: skill.points + amount }
        ])
      )
    }));
    
    showNotification({
      type: 'success',
      title: 'Skill Points Earned!',
      message: `+${amount} skill points to spend`,
      icon: '⭐'
    });
  };

  /**
   * Unlock achievement
   */
  const unlockAchievement = (achievementKey) => {
    if (gameState.achievements[achievementKey]) {
      return; // Already unlocked
    }
    
    const achievement = GAME_CONFIG.achievements[achievementKey];
    if (!achievement) return;
    
    setGameState(prev => ({
      ...prev,
      achievements: {
        ...prev.achievements,
        [achievementKey]: {
          ...achievement,
          unlockedAt: new Date().toISOString()
        }
      }
    }));
    
    awardXP(achievement.xp, null, `Achievement: ${achievement.name}`);
    
    showNotification({
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      xp: achievement.xp
    });
  };

  /**
   * Complete a quest
   */
  const completeQuest = (questId) => {
    const quest = gameState.quests.active.find(q => q.id === questId);
    if (!quest) return;
    
    // Move quest from active to completed
    setGameState(prev => ({
      ...prev,
      quests: {
        ...prev.quests,
        active: prev.quests.active.filter(q => q.id !== questId),
        completed: [...prev.quests.completed, { ...quest, completedAt: new Date().toISOString() }]
      }
    }));
    
    // Award rewards
    awardXP(quest.xpReward, quest.skill, `Quest: ${quest.title}`);
    updatePlayerStats({ questsCompleted: gameState.player.stats.questsCompleted + 1 });
    
    // Check for quest-related achievements
    if (gameState.player.stats.questsCompleted === 0) {
      unlockAchievement('first_quest');
    }
    
    // Unlock quest rewards
    if (quest.rewards) {
      quest.rewards.forEach(reward => {
        unlockReward(reward);
      });
    }
    
    showNotification({
      type: 'questComplete',
      title: 'Quest Complete!',
      message: quest.title,
      xp: quest.xpReward
    });
  };

  /**
   * Start a new quest
   */
  const startQuest = (quest) => {
    setGameState(prev => ({
      ...prev,
      quests: {
        ...prev.quests,
        active: [...prev.quests.active, { ...quest, startedAt: new Date().toISOString() }],
        available: prev.quests.available.filter(q => q.id !== quest.id)
      }
    }));
    
    showNotification({
      type: 'info',
      title: 'Quest Started!',
      message: quest.title,
      icon: '🎯'
    });
  };

  /**
   * Update player statistics
   */
  const updatePlayerStats = (updates) => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        stats: {
          ...prev.player.stats,
          ...updates
        }
      }
    }));
  };

  /**
   * Change character class
   */
  const changeCharacterClass = (newClass) => {
    if (!GAME_CONFIG.characterClasses[newClass]) return;
    
    const classData = GAME_CONFIG.characterClasses[newClass];
    if (classData.unlockLevel > gameState.player.level) {
      showNotification({
        type: 'error',
        title: 'Class Locked',
        message: `Reach level ${classData.unlockLevel} to unlock ${classData.name}`
      });
      return;
    }
    
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        characterClass: newClass
      }
    }));
    
    showNotification({
      type: 'success',
      title: 'Class Changed!',
      message: `You are now a ${classData.name}`,
      icon: classData.icon
    });
  };

  /**
   * Customize avatar
   */
  const customizeAvatar = (part, value) => {
    setGameState(prev => ({
      ...prev,
      player: {
        ...prev.player,
        avatar: {
          ...prev.player.avatar,
          [part]: value
        }
      }
    }));
  };

  /**
   * Unlock reward (theme, avatar part, etc.)
   */
  const unlockReward = (reward) => {
    switch (reward.type) {
      case 'theme':
        setGameState(prev => ({
          ...prev,
          inventory: {
            ...prev.inventory,
            themes: [...prev.inventory.themes, reward.item]
          }
        }));
        break;
      case 'avatar':
        const [category] = reward.item.split('_');
        const categoryMap = {
          head: 'heads',
          body: 'bodies',
          accessory: 'accessories'
        };
        const inventoryCategory = categoryMap[category] || 'accessories';
        
        setGameState(prev => ({
          ...prev,
          inventory: {
            ...prev.inventory,
            avatarParts: {
              ...prev.inventory.avatarParts,
              [inventoryCategory]: [...prev.inventory.avatarParts[inventoryCategory], reward.item]
            }
          }
        }));
        break;
    }
  };

  /**
   * Generate initial quests for new players
   */
  const generateInitialQuests = () => {
    const initialQuests = [
      {
        id: 'welcome_quest',
        title: 'Welcome to Coding Society',
        description: 'Complete your first coding challenge to begin your journey',
        difficulty: 'novice',
        skill: 'frontend',
        xpReward: 100,
        objectives: ['Complete the HTML basics tutorial', 'Write your first JavaScript function'],
        story: 'Every great coder starts with a single line of code...'
      },
      {
        id: 'syntax_explorer',
        title: 'Syntax Explorer',
        description: 'Learn the basics of different programming languages',
        difficulty: 'apprentice',
        skill: 'algorithms',
        xpReward: 150,
        objectives: ['Try Python syntax', 'Compare with JavaScript', 'Solve a simple algorithm'],
        story: 'The ancient scrolls contain knowledge of many programming tongues...'
      }
    ];
    
    setGameState(prev => ({
      ...prev,
      quests: {
        ...prev.quests,
        available: initialQuests
      }
    }));
  };

  /**
   * Show notification to user
   */
  const showNotification = (notification) => {
    const id = Date.now();
    const newNotification = { ...notification, id, timestamp: new Date() };
    
    setNotifications(prev => [newNotification, ...prev.slice(0, 4)]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
    
    // Show toast for important notifications
    if (notification.type === 'achievement' || notification.type === 'levelup') {
      toast.success(notification.message, {
        icon: notification.icon || '🎉',
        duration: 3000
      });
    }
  };

  /**
   * Get next level progress
   */
  const getNextLevelProgress = () => {
    const currentLevel = gameState.player.level;
    const currentXP = gameState.player.totalXp;
    
    let xpForCurrentLevel = 0;
    for (let i = 1; i < currentLevel; i++) {
      xpForCurrentLevel += GAME_CONFIG.xpPerLevel(i);
    }
    
    const xpForNextLevel = GAME_CONFIG.xpPerLevel(currentLevel);
    const xpInCurrentLevel = currentXP - xpForCurrentLevel;
    const progress = (xpInCurrentLevel / xpForNextLevel) * 100;
    
    return {
      current: xpInCurrentLevel,
      required: xpForNextLevel,
      progress: Math.min(progress, 100)
    };
  };

  /**
   * Reset game progress (for testing or new profile)
   */
  const resetGameProgress = () => {
    setGameState(initialGameState);
    localStorage.removeItem('gamifiedLearning_state');
    showNotification({
      type: 'info',
      title: 'Game Reset',
      message: 'Your progress has been reset'
    });
  };

  const value = {
    // Game State
    gameState,
    isLoading,
    notifications,
    
    // Player Actions
    initializePlayer,
    awardXP,
    updatePlayerStats,
    changeCharacterClass,
    customizeAvatar,
    
    // Quest System
    startQuest,
    completeQuest,
    
    // Achievement System
    unlockAchievement,
    
    // Utility Functions
    getNextLevelProgress,
    showNotification,
    resetGameProgress,
    
    // Configuration
    GAME_CONFIG
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Custom hook to use game context
export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};

export default GameContext;