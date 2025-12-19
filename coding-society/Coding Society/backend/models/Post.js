const mongoose = require('mongoose');

// Comment Schema
const commentSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  replies: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Media Schema
const mediaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['image', 'video', 'document', 'code'],
    required: true
  },
  url: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String // For videos and documents
  },
  duration: {
    type: Number // For videos in seconds
  },
  dimensions: {
    width: Number,
    height: Number
  }
});

// Code Snippet Schema
const codeSnippetSchema = new mongoose.Schema({
  language: {
    type: String,
    required: true,
    enum: ['javascript', 'python', 'java', 'cpp', 'c', 'go', 'rust', 'php', 'ruby', 'kotlin', 'swift', 'typescript']
  },
  code: {
    type: String,
    required: true
  },
  title: {
    type: String,
    maxlength: 100
  },
  description: {
    type: String,
    maxlength: 500
  }
});

// Poll Schema
const pollSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    maxlength: 200
  },
  options: [{
    text: {
      type: String,
      required: true,
      maxlength: 100
    },
    votes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  allowMultiple: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date
  }
});

// Post Schema
const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'code', 'poll', 'article'],
    default: 'text'
  },
  media: [mediaSchema],
  codeSnippet: codeSnippetSchema,
  poll: pollSchema,
  tags: [{
    type: String,
    maxlength: 30
  }],
  mentions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reaction: {
      type: String,
      enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry'],
      default: 'like'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [commentSchema],
  shares: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    caption: {
      type: String,
      maxlength: 500
    }
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    },
    duration: {
      type: Number // in seconds
    }
  }],
  isEdited: {
    type: Boolean,
    default: false
  },
  editHistory: [{
    content: String,
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  privacy: {
    type: String,
    enum: ['public', 'followers', 'friends', 'private'],
    default: 'public'
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  location: {
    name: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
postSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

postSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

postSchema.virtual('sharesCount').get(function() {
  return this.shares.length;
});

postSchema.virtual('bookmarksCount').get(function() {
  return this.bookmarks.length;
});

postSchema.virtual('viewsCount').get(function() {
  return this.views.length;
});

// Indexes for better performance
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ tags: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ 'likes.user': 1 });
postSchema.index({ privacy: 1 });
postSchema.index({ isArchived: 1 });

// Pre-save middleware
postSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Methods
postSchema.methods.hasUserLiked = function(userId) {
  return this.likes.some(like => like.user.equals(userId));
};

postSchema.methods.hasUserBookmarked = function(userId) {
  return this.bookmarks.some(bookmark => bookmark.equals(userId));
};

postSchema.methods.hasUserShared = function(userId) {
  return this.shares.some(share => share.user.equals(userId));
};

postSchema.methods.getUserReaction = function(userId) {
  const like = this.likes.find(like => like.user.equals(userId));
  return like ? like.reaction : null;
};

module.exports = mongoose.model('Post', postSchema);