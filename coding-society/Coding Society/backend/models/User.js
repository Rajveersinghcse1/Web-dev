/**
 * User Model for Coding Society Platform
 * Comprehensive user schema with gaming features
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic user information
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },

  // User Role and Status
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  
  // Profile information
  profile: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    avatar: { type: String, default: '👨‍💻' },
    bio: { type: String, maxlength: 500 },
    location: { type: String, trim: true },
    website: { type: String, trim: true },
    socialLinks: {
      github: String,
      linkedin: String,
      twitter: String,
      portfolio: String
    }
  },

  // Gaming system
  gameData: {
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 },
    totalXP: { type: Number, default: 0 },
    skillPoints: { type: Number, default: 0 },
    coins: { type: Number, default: 100 },
    gems: { type: Number, default: 10 },
    
    // Character class and progression
    characterClass: {
      type: String,
      enum: ['novice_coder', 'frontend_wizard', 'backend_knight', 'ai_sorcerer', 'fullstack_paladin'],
      default: 'novice_coder'
    },
    
    // Statistics
    stats: {
      dailyStreak: { type: Number, default: 0 },
      longestStreak: { type: Number, default: 0 },
      lastActiveDate: { type: Date, default: Date.now },
      totalQuestsCompleted: { type: Number, default: 0 },
      totalBattlesWon: { type: Number, default: 0 },
      totalBattlesLost: { type: Number, default: 0 },
      totalCodeExecutions: { type: Number, default: 0 },
      totalLinesOfCode: { type: Number, default: 0 },
      favoriteLanguage: { type: String, default: 'javascript' }
    },

    // Skill tree progression
    skillTrees: {
      frontend: {
        unlockedSkills: [{ type: String }],
        skillPoints: { type: Number, default: 0 }
      },
      backend: {
        unlockedSkills: [{ type: String }],
        skillPoints: { type: Number, default: 0 }
      },
      ai: {
        unlockedSkills: [{ type: String }],
        skillPoints: { type: Number, default: 0 }
      },
      mobile: {
        unlockedSkills: [{ type: String }],
        skillPoints: { type: Number, default: 0 }
      },
      devops: {
        unlockedSkills: [{ type: String }],
        skillPoints: { type: Number, default: 0 }
      },
      security: {
        unlockedSkills: [{ type: String }],
        skillPoints: { type: Number, default: 0 }
      },
      algorithms: {
        unlockedSkills: [{ type: String }],
        skillPoints: { type: Number, default: 0 }
      },
      databases: {
        unlockedSkills: [{ type: String }],
        skillPoints: { type: Number, default: 0 }
      }
    },

    // Avatar customization
    avatar: {
      theme: { type: String, default: 'default' },
      accessories: [{ type: String }],
      unlockedThemes: [{ type: String, default: ['default'] }],
      unlockedAccessories: [{ type: String }]
    },

    // Achievements
    achievements: {
      unlocked: [{
        id: String,
        name: String,
        description: String,
        rarity: { type: String, enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical'] },
        unlockedAt: { type: Date, default: Date.now },
        xpReward: Number
      }],
      progress: [{
        achievementId: String,
        currentProgress: { type: Number, default: 0 },
        targetProgress: Number
      }]
    },

    // Quest progress
    quests: {
      completed: [{
        questId: String,
        title: String,
        difficulty: String,
        completedAt: { type: Date, default: Date.now },
        xpEarned: Number,
        timeSpent: Number
      }],
      current: [{
        questId: String,
        title: String,
        startedAt: { type: Date, default: Date.now },
        progress: { type: Number, default: 0 },
        hintsUsed: { type: Number, default: 0 }
      }]
    },

    // Battle arena
    battleStats: {
      eloRating: { type: Number, default: 1200 },
      rank: { type: String, default: 'Bronze' },
      wins: { type: Number, default: 0 },
      losses: { type: Number, default: 0 },
      draws: { type: Number, default: 0 },
      winStreak: { type: Number, default: 0 },
      bestWinStreak: { type: Number, default: 0 },
      totalBattles: { type: Number, default: 0 },
      averageCompletionTime: { type: Number, default: 0 },
      favoriteLanguage: { type: String, default: 'javascript' }
    }
  },

  // Learning preferences
  preferences: {
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    programmingLanguages: [{ type: String }],
    learningGoals: [{ type: String }],
    studyTime: { type: String, enum: ['15min', '30min', '1hour', '2hours'], default: '30min' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      achievements: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true }
    }
  },

  // Security features
  security: {
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, select: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    emailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, select: false },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    lastLogin: { type: Date },
    lastPasswordChange: { type: Date, default: Date.now }
  },

  // Account status
  status: {
    type: String,
    enum: ['active', 'suspended', 'banned', 'pending'],
    default: 'active'
  },
  role: {
    type: String,
    enum: ['student', 'instructor', 'mentor', 'admin', 'superadmin'],
    default: 'student'
  },

  // Password reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastActiveAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for performance (email and username already indexed via unique: true)
userSchema.index({ 'gameData.level': -1 });
userSchema.index({ 'gameData.xp': -1 });
userSchema.index({ 'gameData.battleStats.eloRating': -1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.profile.firstName || ''} ${this.profile.lastName || ''}`.trim() || this.username;
});

// Virtual for XP to next level
userSchema.virtual('xpToNextLevel').get(function() {
  const baseXP = 100;
  const xpForNextLevel = Math.floor(baseXP * Math.pow(1.5, this.gameData.level));
  const currentLevelXP = this.gameData.level > 1 ? Math.floor(baseXP * Math.pow(1.5, this.gameData.level - 1)) : 0;
  return xpForNextLevel - (this.gameData.xp - currentLevelXP);
});

// Virtual for battle win rate
userSchema.virtual('winRate').get(function() {
  const total = this.gameData.battleStats.totalBattles;
  return total > 0 ? ((this.gameData.battleStats.wins / total) * 100).toFixed(1) : 0;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Pre-save middleware to update timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to add XP and handle level ups
userSchema.methods.addXP = function(amount) {
  this.gameData.xp += amount;
  this.gameData.totalXP += amount;
  
  // Check for level up
  const baseXP = 100;
  let newLevel = 1;
  let totalXPForLevel = 0;
  
  while (totalXPForLevel <= this.gameData.xp) {
    totalXPForLevel += Math.floor(baseXP * Math.pow(1.5, newLevel - 1));
    newLevel++;
  }
  newLevel--;
  
  if (newLevel > this.gameData.level) {
    const levelsGained = newLevel - this.gameData.level;
    this.gameData.level = newLevel;
    this.gameData.skillPoints += levelsGained;
    return { leveledUp: true, newLevel, levelsGained, skillPointsGained: levelsGained };
  }
  
  return { leveledUp: false };
};

// Method to unlock achievement
userSchema.methods.unlockAchievement = function(achievement) {
  const alreadyUnlocked = this.gameData.achievements.unlocked.some(
    a => a.id === achievement.id
  );
  
  if (!alreadyUnlocked) {
    this.gameData.achievements.unlocked.push({
      ...achievement,
      unlockedAt: new Date()
    });
    
    if (achievement.xpReward) {
      return this.addXP(achievement.xpReward);
    }
  }
  
  return { leveledUp: false };
};

// Method to update daily streak
userSchema.methods.updateDailyStreak = function() {
  const today = new Date();
  const lastActive = new Date(this.gameData.stats.lastActiveDate);
  const daysDiff = Math.floor((today - lastActive) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 1) {
    // Consecutive day
    this.gameData.stats.dailyStreak++;
    if (this.gameData.stats.dailyStreak > this.gameData.stats.longestStreak) {
      this.gameData.stats.longestStreak = this.gameData.stats.dailyStreak;
    }
  } else if (daysDiff > 1) {
    // Streak broken
    this.gameData.stats.dailyStreak = 1;
  }
  // If daysDiff === 0, it's the same day, no change needed
  
  this.gameData.stats.lastActiveDate = today;
};

module.exports = mongoose.model('User', userSchema);