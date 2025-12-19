/**
 * Achievement Model for Gamified Learning System
 * Defines badges, milestones, and rewards for user progression
 */

const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  // Basic achievement information
  id: {
    type: String,
    required: [true, 'Achievement ID is required'],
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Achievement name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Achievement description is required'],
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  flavorText: {
    type: String,
    maxlength: [300, 'Flavor text cannot exceed 300 characters']
  },

  // Achievement classification
  category: {
    type: String,
    required: true,
    enum: [
      'progression', 'skill', 'social', 'challenge', 'exploration', 
      'consistency', 'mastery', 'creativity', 'collaboration', 'special'
    ]
  },
  type: {
    type: String,
    required: true,
    enum: ['milestone', 'progress', 'challenge', 'hidden', 'seasonal', 'legacy']
  },
  rarity: {
    type: String,
    required: true,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythical'],
    default: 'common'
  },

  // Visual elements
  icon: {
    type: String,
    required: true,
    default: '🏆'
  },
  badge: {
    shape: { type: String, enum: ['circle', 'shield', 'star', 'diamond', 'crown'], default: 'circle' },
    color: { type: String, default: '#FFD700' },
    gradient: { type: Boolean, default: false },
    animation: { type: String, enum: ['none', 'glow', 'pulse', 'sparkle'], default: 'none' }
  },

  // Requirements and conditions
  requirements: {
    type: { 
      type: String, 
      required: true,
      enum: [
        'quest_completion', 'level_reached', 'xp_earned', 'skill_unlocked',
        'battle_wins', 'daily_streak', 'code_executions', 'time_spent',
        'achievements_unlocked', 'social_interactions', 'custom'
      ]
    },
    target: { type: Number, required: true },
    conditions: [{
      field: { type: String, required: true },
      operator: { type: String, enum: ['eq', 'gte', 'lte', 'gt', 'lt', 'in'], default: 'gte' },
      value: { type: mongoose.Schema.Types.Mixed, required: true }
    }],
    metadata: { type: mongoose.Schema.Types.Mixed } // Additional conditions
  },

  // Rewards
  rewards: {
    xp: { type: Number, default: 0 },
    coins: { type: Number, default: 0 },
    gems: { type: Number, default: 0 },
    skillPoints: { type: Number, default: 0 },
    items: [{ 
      type: { type: String, enum: ['avatar', 'theme', 'badge', 'title'] },
      id: String,
      name: String
    }],
    titles: [{ type: String }],
    unlocks: [{ type: String }] // IDs of content unlocked by this achievement
  },

  // Achievement series and progression
  series: {
    name: { type: String },
    order: { type: Number },
    isPartOfSeries: { type: Boolean, default: false }
  },
  prerequisites: [{ type: String }], // Achievement IDs that must be unlocked first
  unlocks: [{ type: String }], // Achievement IDs that this unlocks

  // Tracking and analytics
  analytics: {
    totalUnlocked: { type: Number, default: 0 },
    unlockRate: { type: Number, default: 0 }, // Percentage of users who unlocked this
    averageTimeToUnlock: { type: Number, default: 0 }, // Days
    firstUnlockedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      date: { type: Date }
    },
    recentUnlocks: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      date: { type: Date, default: Date.now }
    }]
  },

  // Special properties
  properties: {
    isHidden: { type: Boolean, default: false }, // Hidden until unlocked
    isRetroactive: { type: Boolean, default: true }, // Can be earned for past actions
    isRepeatable: { type: Boolean, default: false }, // Can be earned multiple times
    isTimeLimited: { type: Boolean, default: false }, // Limited time availability
    expiresAt: { type: Date },
    maxUnlocks: { type: Number, default: 1 }
  },

  // Seasonal and event achievements
  event: {
    isEventAchievement: { type: Boolean, default: false },
    eventName: { type: String },
    startDate: { type: Date },
    endDate: { type: Date }
  },

  // Difficulty and effort
  difficulty: {
    type: String,
    enum: ['trivial', 'easy', 'medium', 'hard', 'extreme', 'legendary'],
    default: 'easy'
  },
  estimatedTime: { type: String }, // Human readable time estimate

  // Status and metadata
  status: {
    type: String,
    enum: ['draft', 'active', 'deprecated', 'seasonal_inactive'],
    default: 'active'
  },
  featured: { type: Boolean, default: false },
  
  // Author and versioning
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  version: { type: Number, default: 1 },
  changeLog: [{ 
    version: Number,
    changes: String,
    date: { type: Date, default: Date.now }
  }],

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Indexes for performance (id already indexed via unique: true)
achievementSchema.index({ category: 1, rarity: 1 });
achievementSchema.index({ status: 1, featured: -1 });
achievementSchema.index({ 'analytics.unlockRate': -1 });
achievementSchema.index({ 'requirements.type': 1 });
achievementSchema.index({ createdAt: -1 });

// Virtual for rarity points (for sorting/ranking)
achievementSchema.virtual('rarityPoints').get(function() {
  const rarityPoints = {
    'common': 1,
    'uncommon': 2,
    'rare': 5,
    'epic': 10,
    'legendary': 25,
    'mythical': 50
  };
  return rarityPoints[this.rarity] || 1;
});

// Virtual for unlock percentage
achievementSchema.virtual('unlockPercentage').get(function() {
  return this.analytics.unlockRate.toFixed(2);
});

// Pre-save middleware
achievementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to check if user meets achievement requirements
achievementSchema.statics.checkUserEligibility = function(achievementId, user) {
  return this.findOne({ id: achievementId, status: 'active' }).then(achievement => {
    if (!achievement) return false;
    
    // Check if already unlocked (and not repeatable)
    const alreadyUnlocked = user.gameData.achievements.unlocked.some(a => a.id === achievementId);
    if (alreadyUnlocked && !achievement.properties.isRepeatable) return false;
    
    // Check prerequisites
    for (const prereq of achievement.prerequisites) {
      const hasPrereq = user.gameData.achievements.unlocked.some(a => a.id === prereq);
      if (!hasPrereq) return false;
    }
    
    // Check time limits
    if (achievement.properties.isTimeLimited && achievement.properties.expiresAt < new Date()) {
      return false;
    }
    
    // Check specific requirements
    return this.evaluateRequirements(achievement.requirements, user);
  });
};

// Static method to evaluate achievement requirements
achievementSchema.statics.evaluateRequirements = function(requirements, user) {
  const { type, target, conditions } = requirements;
  
  switch (type) {
    case 'quest_completion':
      return user.gameData.stats.totalQuestsCompleted >= target;
    
    case 'level_reached':
      return user.gameData.level >= target;
    
    case 'xp_earned':
      return user.gameData.totalXP >= target;
    
    case 'battle_wins':
      return user.gameData.battleStats.wins >= target;
    
    case 'daily_streak':
      return user.gameData.stats.dailyStreak >= target;
    
    case 'code_executions':
      return user.gameData.stats.totalCodeExecutions >= target;
    
    case 'achievements_unlocked':
      return user.gameData.achievements.unlocked.length >= target;
    
    case 'custom':
      // Evaluate custom conditions
      return conditions.every(condition => {
        const userValue = this.getNestedValue(user, condition.field);
        return this.evaluateCondition(userValue, condition.operator, condition.value);
      });
    
    default:
      return false;
  }
};

// Helper method to get nested object values
achievementSchema.statics.getNestedValue = function(obj, path) {
  return path.split('.').reduce((current, key) => current?.[key], obj);
};

// Helper method to evaluate conditions
achievementSchema.statics.evaluateCondition = function(userValue, operator, targetValue) {
  switch (operator) {
    case 'eq': return userValue === targetValue;
    case 'gte': return userValue >= targetValue;
    case 'lte': return userValue <= targetValue;
    case 'gt': return userValue > targetValue;
    case 'lt': return userValue < targetValue;
    case 'in': return Array.isArray(targetValue) && targetValue.includes(userValue);
    default: return false;
  }
};

// Method to record unlock
achievementSchema.methods.recordUnlock = function(userId) {
  this.analytics.totalUnlocked++;
  this.analytics.recentUnlocks.push({
    userId,
    date: new Date()
  });
  
  // Keep only last 10 recent unlocks
  if (this.analytics.recentUnlocks.length > 10) {
    this.analytics.recentUnlocks = this.analytics.recentUnlocks.slice(-10);
  }
  
  // Set first unlock if this is the first
  if (!this.analytics.firstUnlockedBy.userId) {
    this.analytics.firstUnlockedBy = {
      userId,
      date: new Date()
    };
  }
};

// Static method to get achievements by category
achievementSchema.statics.getByCategory = function(category, includeHidden = false) {
  const query = { 
    category, 
    status: 'active' 
  };
  
  if (!includeHidden) {
    query['properties.isHidden'] = false;
  }
  
  return this.find(query).sort({ rarity: 1, 'series.order': 1 });
};

// Static method to get featured achievements
achievementSchema.statics.getFeatured = function() {
  return this.find({ 
    featured: true, 
    status: 'active',
    'properties.isHidden': false 
  }).sort({ rarity: -1, createdAt: -1 }).limit(5);
};

module.exports = mongoose.model('Achievement', achievementSchema);