const mongoose = require('mongoose');

// Story Media Schema
const storyMediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String
  },
  duration: {
    type: Number // For videos in seconds
  },
  dimensions: {
    width: Number,
    height: Number
  }
});

// Story Schema
const storySchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  media: {
    type: storyMediaSchema,
    required: true
  },
  text: {
    content: {
      type: String,
      maxlength: 200
    },
    fontSize: {
      type: Number,
      default: 16
    },
    color: {
      type: String,
      default: '#FFFFFF'
    },
    backgroundColor: {
      type: String,
      default: 'transparent'
    },
    position: {
      x: {
        type: Number,
        default: 50
      },
      y: {
        type: Number,
        default: 50
      }
    }
  },
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  music: {
    title: String,
    artist: String,
    url: String
  },
  location: {
    name: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  privacy: {
    type: String,
    enum: ['public', 'followers', 'close_friends'],
    default: 'followers'
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
storySchema.virtual('viewsCount').get(function() {
  return this.views.length;
});

storySchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

storySchema.virtual('repliesCount').get(function() {
  return this.replies.length;
});

storySchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

// Indexes
storySchema.index({ author: 1, createdAt: -1 });
storySchema.index({ privacy: 1 });
storySchema.index({ isArchived: 1 });

// TTL index to automatically delete expired stories (only need one)
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Methods
storySchema.methods.hasUserViewed = function(userId) {
  return this.views.some(view => view.user.equals(userId));
};

storySchema.methods.hasUserLiked = function(userId) {
  return this.likes.some(like => like.user.equals(userId));
};

storySchema.methods.addView = function(userId) {
  if (!this.hasUserViewed(userId)) {
    this.views.push({ user: userId });
  }
};

module.exports = mongoose.model('Story', storySchema);