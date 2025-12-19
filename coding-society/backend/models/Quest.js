/**
 * Quest Model for Gamified Learning System
 * Defines coding challenges with storylines and progression
 */

const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  // Basic quest information
  title: {
    type: String,
    required: [true, 'Quest title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Quest description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  shortDescription: {
    type: String,
    required: true,
    maxlength: [200, 'Short description cannot exceed 200 characters']
  },

  // Quest classification
  category: {
    type: String,
    required: true,
    enum: ['frontend', 'backend', 'ai', 'mobile', 'devops', 'security', 'algorithms', 'databases', 'general']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced', 'expert']
  },
  tags: [{ type: String, trim: true }],

  // Story and theme
  story: {
    introduction: { type: String, required: true },
    background: { type: String },
    objective: { type: String, required: true },
    conclusion: { type: String }
  },
  theme: {
    type: String,
    enum: ['fantasy', 'sci-fi', 'modern', 'historical', 'mystery', 'adventure'],
    default: 'modern'
  },

  // Technical requirements
  programmingLanguage: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'java', 'cpp', 'csharp', 'go', 'rust', 'typescript']
  },
  frameworks: [{ type: String }],
  libraries: [{ type: String }],

  // Challenge details
  challenge: {
    problem: { type: String, required: true },
    constraints: [{ type: String }],
    examples: [{
      input: { type: String, required: true },
      output: { type: String, required: true },
      explanation: { type: String }
    }],
    hints: [{
      text: { type: String, required: true },
      cost: { type: Number, default: 0 }, // XP cost for hint
      unlockAfter: { type: Number, default: 0 } // Minutes before hint is available
    }],
    starterCode: { type: String },
    solutionTemplate: { type: String },
    testCases: [{
      input: { type: String, required: true },
      expectedOutput: { type: String, required: true },
      isHidden: { type: Boolean, default: false },
      weight: { type: Number, default: 1 }
    }]
  },

  // Rewards and progression
  rewards: {
    xp: { type: Number, required: true, min: 1 },
    coins: { type: Number, default: 0 },
    gems: { type: Number, default: 0 },
    skillPoints: { type: Number, default: 0 },
    unlockedContent: [{ type: String }], // IDs of unlocked quests, skills, etc.
    badge: {
      id: String,
      name: String,
      description: String,
      rarity: { type: String, enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'] }
    }
  },

  // Prerequisites and progression
  prerequisites: [{
    type: { type: String, enum: ['quest', 'level', 'skill', 'achievement'] },
    id: { type: String, required: true },
    description: { type: String }
  }],
  unlocks: [{ type: String }], // Quest IDs that this quest unlocks

  // Quest settings
  settings: {
    timeLimit: { type: Number }, // in minutes
    allowMultipleAttempts: { type: Boolean, default: true },
    maxAttempts: { type: Number, default: 5 },
    showSolution: { type: Boolean, default: true },
    collaborative: { type: Boolean, default: false },
    autoGrade: { type: Boolean, default: true }
  },

  // Analytics and statistics
  analytics: {
    totalAttempts: { type: Number, default: 0 },
    totalCompletions: { type: Number, default: 0 },
    averageCompletionTime: { type: Number, default: 0 }, // in minutes
    averageAttempts: { type: Number, default: 0 },
    difficulty_rating: { type: Number, default: 0 }, // User-rated difficulty
    ratings: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      rating: { type: Number, min: 1, max: 5 },
      difficulty: { type: Number, min: 1, max: 5 },
      feedback: { type: String, maxlength: 500 },
      createdAt: { type: Date, default: Date.now }
    }]
  },

  // Content and media
  media: {
    thumbnail: { type: String },
    images: [{ type: String }],
    videos: [{ 
      url: String,
      title: String,
      duration: Number
    }],
    diagrams: [{ type: String }]
  },

  // Status and metadata
  status: {
    type: String,
    enum: ['draft', 'review', 'published', 'archived'],
    default: 'draft'
  },
  featured: { type: Boolean, default: false },
  seasonal: {
    isSeasonalQuest: { type: Boolean, default: false },
    season: { type: String },
    startDate: { type: Date },
    endDate: { type: Date }
  },

  // Author and versioning
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  version: { type: Number, default: 1 },
  lastModified: { type: Date, default: Date.now },

  // Timestamps
  createdAt: { type: Date, default: Date.now },
  publishedAt: { type: Date }
}, {
  timestamps: true
});

// Indexes for performance
questSchema.index({ category: 1, difficulty: 1 });
questSchema.index({ status: 1, featured: -1 });
questSchema.index({ programmingLanguage: 1 });
questSchema.index({ 'analytics.totalCompletions': -1 });
questSchema.index({ 'analytics.difficulty_rating': 1 });
questSchema.index({ tags: 1 });
questSchema.index({ createdAt: -1 });

// Virtual for completion rate
questSchema.virtual('completionRate').get(function() {
  if (this.analytics.totalAttempts === 0) return 0;
  return ((this.analytics.totalCompletions / this.analytics.totalAttempts) * 100).toFixed(1);
});

// Virtual for average rating
questSchema.virtual('averageRating').get(function() {
  if (this.analytics.ratings.length === 0) return 0;
  const sum = this.analytics.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return (sum / this.analytics.ratings.length).toFixed(1);
});

// Pre-save middleware
questSchema.pre('save', function(next) {
  this.lastModified = Date.now();
  
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = Date.now();
  }
  
  next();
});

// Static method to find quests by user level
questSchema.statics.findByUserLevel = function(userLevel, category = null) {
  let difficulty;
  
  if (userLevel <= 5) difficulty = 'beginner';
  else if (userLevel <= 15) difficulty = ['beginner', 'intermediate'];
  else if (userLevel <= 30) difficulty = ['intermediate', 'advanced'];
  else difficulty = ['advanced', 'expert'];

  const query = {
    status: 'published',
    difficulty: Array.isArray(difficulty) ? { $in: difficulty } : difficulty
  };

  if (category) {
    query.category = category;
  }

  return this.find(query).sort({ featured: -1, 'analytics.totalCompletions': -1 });
};

// Static method to find recommended quests
questSchema.statics.findRecommended = function(user) {
  const userCategories = user.preferences.programmingLanguages || [];
  const userLevel = user.gameData.level;
  
  return this.aggregate([
    {
      $match: {
        status: 'published',
        $or: [
          { category: { $in: userCategories } },
          { programmingLanguage: { $in: userCategories } },
          { featured: true }
        ]
      }
    },
    {
      $addFields: {
        relevanceScore: {
          $sum: [
            { $cond: [{ $in: ['$category', userCategories] }, 3, 0] },
            { $cond: [{ $in: ['$programmingLanguage', userCategories] }, 2, 0] },
            { $cond: ['$featured', 1, 0] }
          ]
        }
      }
    },
    { $sort: { relevanceScore: -1, 'analytics.totalCompletions': -1 } },
    { $limit: 10 }
  ]);
};

// Method to add user rating
questSchema.methods.addRating = function(userId, rating, difficulty, feedback = '') {
  // Remove existing rating from this user
  this.analytics.ratings = this.analytics.ratings.filter(
    r => r.userId.toString() !== userId.toString()
  );
  
  // Add new rating
  this.analytics.ratings.push({
    userId,
    rating,
    difficulty,
    feedback,
    createdAt: new Date()
  });
  
  // Update average difficulty rating
  const avgDifficulty = this.analytics.ratings.reduce((acc, r) => acc + r.difficulty, 0) / this.analytics.ratings.length;
  this.analytics.difficulty_rating = avgDifficulty;
};

// Method to record completion
questSchema.methods.recordCompletion = function(completionTime, attempts = 1) {
  this.analytics.totalCompletions++;
  this.analytics.totalAttempts += attempts;
  
  // Update average completion time
  const totalTime = (this.analytics.averageCompletionTime * (this.analytics.totalCompletions - 1)) + completionTime;
  this.analytics.averageCompletionTime = totalTime / this.analytics.totalCompletions;
  
  // Update average attempts
  this.analytics.averageAttempts = this.analytics.totalAttempts / this.analytics.totalCompletions;
};

module.exports = mongoose.model('Quest', questSchema);