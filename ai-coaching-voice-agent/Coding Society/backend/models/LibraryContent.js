/**
 * Enhanced Library Content Model
 * Improved with relationships, indexing, validation, and performance optimizations
 */

const mongoose = require('mongoose');

// Content Rating Schema for user feedback
const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  review: {
    type: String,
    maxlength: [500, 'Review cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// View History Schema for analytics
const viewSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  viewedAt: {
    type: Date,
    default: Date.now
  },
  duration: {
    type: Number, // in seconds
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  }
});

// Enhanced Library Content Schema
const libraryContentSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    index: true // Text search optimization
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  summary: {
    type: String,
    maxlength: [300, 'Summary cannot exceed 300 characters']
  },
  
  // Enhanced Categorization
  type: {
    type: String,
    required: [true, 'Content type is required'],
    enum: {
      values: [
        'book', 'article', 'tutorial', 'video', 'course', 
        'study_notes', 'exam_paper', 'reference', 'practice_problems',
        'documentation', 'guide', 'cheatsheet'
      ],
      message: '{VALUE} is not a valid content type'
    },
    index: true
  },
  
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: [
        'programming', 'computer_science', 'ai_ml', 'data_science',
        'web_development', 'mobile_development', 'devops', 'cybersecurity',
        'algorithms', 'databases', 'networking', 'mathematics', 'other'
      ],
      message: '{VALUE} is not a valid category'
    },
    index: true
  },
  
  subcategory: {
    type: String,
    maxlength: [100, 'Subcategory cannot exceed 100 characters']
  },
  
  difficulty: {
    type: String,
    required: [true, 'Difficulty level is required'],
    enum: {
      values: ['beginner', 'intermediate', 'advanced', 'expert'],
      message: '{VALUE} is not a valid difficulty level'
    },
    index: true
  },
  
  // Author and Source Information
  author: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Author name cannot exceed 100 characters']
    },
    email: {
      type: String,
      lowercase: true,
      validate: {
        validator: function(v) {
          return !v || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },
    bio: {
      type: String,
      maxlength: [500, 'Author bio cannot exceed 500 characters']
    }
  },
  
  publisher: {
    type: String,
    trim: true,
    maxlength: [100, 'Publisher cannot exceed 100 characters']
  },
  
  publicationDate: {
    type: Date
  },
  
  // File and URL Information
  fileUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v) || v.startsWith('/uploads/');
      },
      message: 'File URL must be a valid URL or local path'
    }
  },

  files: [{
    originalName: String,
    filename: String,
    url: String,
    size: Number,
    mimetype: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  externalUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'External URL must be a valid URL'
    }
  },
  
  thumbnailUrl: {
    type: String
  },
  
  // File Metadata
  fileMetadata: {
    originalName: String,
    mimeType: String,
    size: Number, // in bytes
    pages: Number, // for PDFs
    duration: Number, // for videos in seconds
    checksum: String // for file integrity
  },
  
  // Access Control and Pricing
  accessLevel: {
    type: String,
    required: true,
    enum: {
      values: ['free', 'premium', 'subscriber_only', 'admin_only'],
      message: '{VALUE} is not a valid access level'
    },
    default: 'free',
    index: true
  },
  
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
    default: 0
  },
  
  currency: {
    type: String,
    default: 'USD',
    maxlength: [3, 'Currency code cannot exceed 3 characters']
  },
  
  // Content Organization
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Status and Visibility
  status: {
    type: String,
    required: true,
    enum: {
      values: ['draft', 'published', 'archived', 'private', 'under_review'],
      message: '{VALUE} is not a valid status'
    },
    default: 'draft',
    index: true
  },
  
  featured: {
    type: Boolean,
    default: false,
    index: true
  },
  
  trending: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Analytics and Engagement
  views: {
    total: {
      type: Number,
      default: 0,
      min: 0
    },
    unique: {
      type: Number,
      default: 0,
      min: 0
    },
    thisMonth: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  
  downloads: {
    type: Number,
    default: 0,
    min: 0
  },
  
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  
  ratings: [ratingSchema],
  
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  
  viewHistory: [viewSchema],
  
  // Learning Path Integration
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LibraryContent'
  }],
  
  relatedContent: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LibraryContent'
  }],
  
  learningPath: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPath'
  },
  
  estimatedReadTime: {
    type: Number, // in minutes
    min: 0
  },
  
  // Administrative Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  approvedAt: {
    type: Date
  },
  
  // Versioning
  version: {
    type: Number,
    default: 1,
    min: 1
  },
  
  changelog: [{
    version: Number,
    changes: String,
    modifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    modifiedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  publishedAt: {
    type: Date,
    index: true
  },
  
  // Soft Delete
  isDeleted: {
    type: Boolean,
    default: false,
    index: true
  },
  
  deletedAt: {
    type: Date
  },
  
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for Performance Optimization
libraryContentSchema.index({ title: 'text', description: 'text', tags: 'text' });
libraryContentSchema.index({ category: 1, difficulty: 1, featured: 1 });
libraryContentSchema.index({ status: 1, accessLevel: 1, publishedAt: -1 });
libraryContentSchema.index({ 'views.total': -1, 'averageRating': -1 });
libraryContentSchema.index({ createdBy: 1, createdAt: -1 });
libraryContentSchema.index({ featured: 1, trending: 1, publishedAt: -1 });
libraryContentSchema.index({ isDeleted: 1, status: 1 });

// Virtual Properties
libraryContentSchema.virtual('ratingCount').get(function() {
  return this.ratings.length;
});

libraryContentSchema.virtual('isPopular').get(function() {
  return this.views.total > 1000 || this.averageRating > 4.0;
});

libraryContentSchema.virtual('url').get(function() {
  return `/library/${this.slug || this._id}`;
});

// Pre-save Middleware
libraryContentSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  if (this.isModified('ratings')) {
    if (this.ratings.length > 0) {
      const total = this.ratings.reduce((sum, rating) => sum + rating.rating, 0);
      this.averageRating = Math.round((total / this.ratings.length) * 10) / 10;
    } else {
      this.averageRating = 0;
    }
  }
  
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  this.updatedAt = new Date();
  next();
});

// Static Methods
libraryContentSchema.statics.findPublished = function() {
  return this.find({ 
    status: 'published', 
    isDeleted: false 
  }).sort({ publishedAt: -1 });
};

libraryContentSchema.statics.findFeatured = function() {
  return this.find({ 
    featured: true, 
    status: 'published', 
    isDeleted: false 
  }).sort({ publishedAt: -1 });
};

libraryContentSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category, 
    status: 'published', 
    isDeleted: false 
  }).sort({ featured: -1, publishedAt: -1 });
};

libraryContentSchema.statics.searchContent = function(query) {
  return this.find({
    $text: { $search: query },
    status: 'published',
    isDeleted: false
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

// Instance Methods
libraryContentSchema.methods.incrementViews = function(userId = null) {
  this.views.total += 1;
  this.views.thisMonth += 1;
  
  if (userId) {
    this.viewHistory.push({ userId });
    // Update unique views if this is a new user
    const uniqueViewers = new Set(this.viewHistory.map(v => v.userId?.toString()));
    this.views.unique = uniqueViewers.size;
  }
  
  return this.save();
};

libraryContentSchema.methods.addRating = function(userId, rating, review = '') {
  // Remove existing rating from this user
  this.ratings = this.ratings.filter(r => r.userId.toString() !== userId.toString());
  
  // Add new rating
  this.ratings.push({ userId, rating, review });
  
  return this.save();
};

libraryContentSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

libraryContentSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

module.exports = mongoose.model('LibraryContent', libraryContentSchema);