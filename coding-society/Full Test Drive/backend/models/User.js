const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 30
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  profile: {
    firstName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 50
    },
    bio: {
      type: String,
      maxlength: 500
    },
    avatar: {
      type: String // URL to avatar image
    },
    location: {
      type: String,
      maxlength: 100
    },
    website: {
      type: String,
      maxlength: 200
    },
    github: {
      type: String,
      maxlength: 100
    },
    linkedin: {
      type: String,
      maxlength: 200
    },
    skills: [{
      type: String,
      maxlength: 30
    }],
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced', 'expert'],
      default: 'beginner'
    }
  },
  role: {
    type: String,
    enum: ['USER', 'MODERATOR', 'ADMIN'],
    default: 'USER'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  achievements: [{
    achievement: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],
  stats: {
    postsCount: {
      type: Number,
      default: 0
    },
    likesReceived: {
      type: Number,
      default: 0
    },
    commentsCount: {
      type: Number,
      default: 0
    },
    points: {
      type: Number,
      default: 0
    },
    level: {
      type: Number,
      default: 1
    },
    streak: {
      type: Number,
      default: 0
    },
    lastActivityDate: {
      type: Date
    }
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      mentions: { type: Boolean, default: true },
      comments: { type: Boolean, default: true }
    },
    privacy: {
      showEmail: { type: Boolean, default: false },
      showProfile: { type: Boolean, default: true }
    }
  },
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true
});

// Indexes
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ 'profile.skills': 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Virtual for full name
userSchema.virtual('profile.fullName').get(function() {
  if (this.profile.firstName && this.profile.lastName) {
    return `${this.profile.firstName} ${this.profile.lastName}`;
  }
  return this.profile.firstName || this.profile.lastName || this.username;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
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

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = async function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // If we've reached max attempts and it's not locked already, lock account
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 hours
  }
  
  return this.updateOne(updates);
};

// Static method to get login failures
userSchema.statics.getAuthenticated = async function(username, password) {
  const user = await this.findOne({
    $or: [{ email: username }, { username: username }]
  });
  
  if (!user) {
    throw new Error('Invalid username or password');
  }
  
  // Check if account is locked
  if (user.isLocked) {
    await user.incLoginAttempts();
    throw new Error('Account is temporarily locked');
  }
  
  // Check password
  const isMatch = await user.comparePassword(password);
  
  if (isMatch) {
    // Reset login attempts on successful login
    if (user.loginAttempts || user.lockUntil) {
      await user.updateOne({
        $unset: { loginAttempts: 1, lockUntil: 1 },
        $set: { lastLogin: new Date() }
      });
    }
    return user;
  } else {
    await user.incLoginAttempts();
    throw new Error('Invalid username or password');
  }
};

// Method to add achievement
userSchema.methods.addAchievement = async function(achievementId) {
  const hasAchievement = this.achievements.some(
    a => a.achievement.toString() === achievementId.toString()
  );
  
  if (!hasAchievement) {
    this.achievements.push({ achievement: achievementId });
    await this.save();
  }
};

// Method to update stats
userSchema.methods.updateStats = async function(updates) {
  Object.assign(this.stats, updates);
  this.stats.lastActivityDate = new Date();
  await this.save();
};

// Transform toJSON to remove sensitive data
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.loginAttempts;
  delete userObject.lockUntil;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;