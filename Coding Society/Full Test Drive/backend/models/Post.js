const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['project', 'tutorial', 'question', 'discussion', 'showcase', 'news', 'job'],
    default: 'discussion'
  },
  tags: [{
    type: String,
    lowercase: true,
    trim: true,
    maxlength: 30
  }],
  codeSnippets: [{
    language: String,
    code: String,
    description: String
  }],
  images: [{
    url: String,
    caption: String,
    alt: String
  }],
  attachments: [{
    filename: String,
    url: String,
    size: Number,
    mimeType: String
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
  comments: [{
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
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: Date,
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
      content: {
        type: String,
        required: true,
        maxlength: 1000
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  views: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'hidden'],
    default: 'published'
  },
  featured: {
    type: Boolean,
    default: false
  },
  pinned: {
    type: Boolean,
    default: false
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedReadTime: {
    type: Number, // in minutes
    default: 0
  },
  metadata: {
    lastEditedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    editHistory: [{
      editedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      editedAt: Date,
      reason: String
    }],
    reportCount: {
      type: Number,
      default: 0
    },
    reports: [{
      reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      reason: String,
      reportedAt: {
        type: Date,
        default: Date.now
      }
    }]
  }
}, {
  timestamps: true
});

// Indexes
postSchema.index({ author: 1 });
postSchema.index({ category: 1 });
postSchema.index({ tags: 1 });
postSchema.index({ status: 1 });
postSchema.index({ featured: 1 });
postSchema.index({ pinned: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ views: -1 });
postSchema.index({ 'likes': 1 });

// Compound indexes
postSchema.index({ status: 1, createdAt: -1 });
postSchema.index({ category: 1, createdAt: -1 });
postSchema.index({ featured: 1, pinned: 1, createdAt: -1 });

// Text index for search
postSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text'
}, {
  weights: {
    title: 10,
    tags: 5,
    content: 1
  },
  name: 'post_text_index'
});

// Virtual for like count
postSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual for comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Virtual for total engagement score
postSchema.virtual('engagementScore').get(function() {
  const likes = this.likeCount;
  const comments = this.commentCount;
  const views = this.views || 0;
  
  // Weighted engagement score
  return (likes * 3) + (comments * 5) + Math.floor(views / 10);
});

// Method to add like
postSchema.methods.addLike = async function(userId) {
  const existingLike = this.likes.find(like => 
    like.user.toString() === userId.toString()
  );
  
  if (!existingLike) {
    this.likes.push({ user: userId });
    await this.save();
    return true;
  }
  
  return false; // Already liked
};

// Method to remove like
postSchema.methods.removeLike = async function(userId) {
  const likeIndex = this.likes.findIndex(like => 
    like.user.toString() === userId.toString()
  );
  
  if (likeIndex > -1) {
    this.likes.splice(likeIndex, 1);
    await this.save();
    return true;
  }
  
  return false; // Like not found
};

// Method to add comment
postSchema.methods.addComment = async function(commentData) {
  this.comments.push(commentData);
  await this.save();
  return this.comments[this.comments.length - 1];
};

// Method to increment views
postSchema.methods.incrementViews = async function() {
  this.views = (this.views || 0) + 1;
  await this.save();
};

// Method to calculate estimated read time
postSchema.methods.calculateReadTime = function() {
  const wordsPerMinute = 200;
  const wordCount = this.content.split(/\s+/).length;
  this.estimatedReadTime = Math.ceil(wordCount / wordsPerMinute);
};

// Pre-save middleware
postSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    this.calculateReadTime();
  }
  next();
});

// Static methods
postSchema.statics.findByCategory = function(category, options = {}) {
  return this.find({ category, status: 'published' })
    .populate('author', 'username profile.firstName profile.lastName profile.avatar')
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 20)
    .skip(options.skip || 0);
};

postSchema.statics.findFeatured = function(limit = 5) {
  return this.find({ featured: true, status: 'published' })
    .populate('author', 'username profile.firstName profile.lastName profile.avatar')
    .sort({ createdAt: -1 })
    .limit(limit);
};

postSchema.statics.searchPosts = function(query, options = {}) {
  return this.find({
    $text: { $search: query },
    status: 'published'
  }, {
    score: { $meta: 'textScore' }
  })
  .populate('author', 'username profile.firstName profile.lastName profile.avatar')
  .sort({ score: { $meta: 'textScore' } })
  .limit(options.limit || 20);
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;