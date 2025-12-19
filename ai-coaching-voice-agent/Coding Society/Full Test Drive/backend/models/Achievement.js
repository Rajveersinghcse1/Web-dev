const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 500
  },
  icon: {
    type: String,
    default: 'trophy'
  },
  category: {
    type: String,
    enum: ['coding', 'community', 'learning', 'contribution', 'milestone', 'special'],
    default: 'milestone'
  },
  points: {
    type: Number,
    required: true,
    min: 0,
    max: 10000
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  requirements: {
    type: {
      type: String,
      enum: ['posts', 'likes', 'comments', 'streak', 'custom'],
      required: true
    },
    count: Number,
    customLogic: String // For complex achievements
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  badge: {
    backgroundColor: String,
    textColor: String,
    borderColor: String
  },
  earnedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
achievementSchema.index({ category: 1 });
achievementSchema.index({ rarity: 1 });
achievementSchema.index({ isActive: 1 });
achievementSchema.index({ points: -1 });

// Virtual for earned count
achievementSchema.virtual('earnedCount').get(function() {
  return this.earnedBy ? this.earnedBy.length : 0;
});

// Static method to check and award achievements
achievementSchema.statics.checkUserAchievements = async function(userId, userStats) {
  const achievements = await this.find({ isActive: true });
  const awardedAchievements = [];
  
  for (const achievement of achievements) {
    const alreadyEarned = achievement.earnedBy.some(
      earned => earned.user.toString() === userId.toString()
    );
    
    if (!alreadyEarned && this.meetsRequirements(achievement, userStats)) {
      achievement.earnedBy.push({ user: userId });
      await achievement.save();
      awardedAchievements.push(achievement);
    }
  }
  
  return awardedAchievements;
};

// Helper method to check requirements
achievementSchema.statics.meetsRequirements = function(achievement, userStats) {
  const { type, count } = achievement.requirements;
  
  switch (type) {
    case 'posts':
      return userStats.postsCount >= count;
    case 'likes':
      return userStats.likesReceived >= count;
    case 'comments':
      return userStats.commentsCount >= count;
    case 'streak':
      return userStats.streak >= count;
    default:
      return false;
  }
};

const Achievement = mongoose.model('Achievement', achievementSchema);

module.exports = Achievement;