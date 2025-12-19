/**
 * Library Content Model for Admin-Managed Study Materials
 * Handles study notes, exam papers, reference books with categorization
 */

const mongoose = require('mongoose');

const libraryContentSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  
  // Categorization
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: {
      values: ['Programming', 'Computer Science', 'AI/ML', 'DevOps', 'Mathematics', 'Physics', 'Other'],
      message: '{VALUE} is not a valid subject'
    }
  },
  type: {
    type: String,
    required: [true, 'Content type is required'],
    enum: {
      values: ['Study Notes', 'Exam Paper', 'Reference Book', 'Tutorial', 'Video Lecture', 'Practice Problems'],
      message: '{VALUE} is not a valid content type'
    }
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Programming', 'Computer Science', 'AI/ML', 'DevOps', 'Mathematics', 'Physics', 'Other'],
      message: '{VALUE} is not a valid category'
    }
  },
  
  // File Information
  file: {
    url: {
      type: String,
      required: [true, 'File URL is required']
    },
    filename: {
      type: String,
      required: [true, 'Filename is required']
    },
    originalName: {
      type: String,
      required: [true, 'Original filename is required']
    },
    format: {
      type: String,
      enum: ['PDF', 'DOC', 'DOCX', 'PPT', 'PPTX', 'VIDEO', 'AUDIO'],
      required: [true, 'File format is required']
    },
    size: {
      type: String // e.g., "4.2 MB"
    },
    pages: {
      type: Number,
      min: [1, 'Page count must be at least 1']
    }
  },
  
  // Metadata
  author: {
    type: String,
    required: [true, 'Author name is required'],
    maxlength: [100, 'Author name cannot exceed 100 characters']
  },
  authorType: {
    type: String,
    enum: ['Professor', 'TA', 'Student', 'External', 'Industry Expert'],
    default: 'Professor'
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  
  // Media
  thumbnail: {
    type: String,
    default: '📚'
  },
  hasVideo: {
    type: Boolean,
    default: false
  },
  hasAudio: {
    type: Boolean,
    default: false
  },
  videoUrl: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        return /^https?:\/\//.test(v);
      },
      message: 'Video URL must be a valid HTTP/HTTPS URL'
    }
  },
  audioUrl: {
    type: String,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        return /^https?:\/\//.test(v);
      },
      message: 'Audio URL must be a valid HTTP/HTTPS URL'
    }
  },
  
  // Premium Features
  isPremium: {
    type: Boolean,
    default: false
  },
  
  // AI & Learning Features
  aiSummary: {
    type: String,
    maxlength: [500, 'AI summary cannot exceed 500 characters']
  },
  estimatedTime: {
    type: String // e.g., "6 hours", "2 days"
  },
  prerequisites: [{
    type: String,
    trim: true,
    maxlength: [100, 'Prerequisite cannot exceed 100 characters']
  }],
  learningOutcomes: [{
    type: String,
    trim: true,
    maxlength: [200, 'Learning outcome cannot exceed 200 characters']
  }],
  
  // Analytics
  analytics: {
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative']
    },
    downloads: {
      type: Number,
      default: 0,
      min: [0, 'Downloads cannot be negative']
    },
    rating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    totalRatings: {
      type: Number,
      default: 0,
      min: [0, 'Total ratings cannot be negative']
    },
    completionRate: {
      type: Number,
      default: 0,
      min: [0, 'Completion rate cannot be negative'],
      max: [100, 'Completion rate cannot exceed 100']
    }
  },
  
  // Status & Visibility
  status: {
    type: String,
    enum: ['draft', 'published', 'archived', 'under_review'],
    default: 'published'
  },
  featured: {
    type: Boolean,
    default: false
  },
  
  // Tracking
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Uploader reference is required']
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  publishedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
libraryContentSchema.index({ subject: 1, category: 1 });
libraryContentSchema.index({ type: 1, difficulty: 1 });
libraryContentSchema.index({ status: 1, featured: -1 });
libraryContentSchema.index({ 'analytics.views': -1 });
libraryContentSchema.index({ 'analytics.downloads': -1 });
libraryContentSchema.index({ 'analytics.rating': -1 });
libraryContentSchema.index({ tags: 1 });
libraryContentSchema.index({ createdAt: -1 });
libraryContentSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for average rating calculation
libraryContentSchema.virtual('averageRating').get(function() {
  if (this.analytics.totalRatings === 0) return 0;
  return Math.round((this.analytics.rating / this.analytics.totalRatings) * 10) / 10;
});

// Virtual for file size in bytes (if needed)
libraryContentSchema.virtual('fileSizeBytes').get(function() {
  if (!this.file.size) return 0;
  const sizeStr = this.file.size.toLowerCase();
  const size = parseFloat(sizeStr);
  if (sizeStr.includes('gb')) return size * 1024 * 1024 * 1024;
  if (sizeStr.includes('mb')) return size * 1024 * 1024;
  if (sizeStr.includes('kb')) return size * 1024;
  return size;
});

// Pre-save middleware
libraryContentSchema.pre('save', function(next) {
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Update lastModified
  this.lastModified = new Date();
  
  next();
});

// Static methods
libraryContentSchema.statics.findBySubject = function(subject) {
  return this.find({ subject, status: 'published' }).sort({ createdAt: -1 });
};

libraryContentSchema.statics.findByType = function(type) {
  return this.find({ type, status: 'published' }).sort({ createdAt: -1 });
};

libraryContentSchema.statics.findFeatured = function() {
  return this.find({ featured: true, status: 'published' }).sort({ createdAt: -1 });
};

libraryContentSchema.statics.findPopular = function(limit = 10) {
  return this.find({ status: 'published' })
    .sort({ 'analytics.views': -1, 'analytics.downloads': -1 })
    .limit(limit);
};

libraryContentSchema.statics.searchContent = function(searchTerm, filters = {}) {
  const query = {
    $and: [
      { status: 'published' },
      {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } },
          { author: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ]
  };

  // Apply filters
  if (filters.subject) query.$and.push({ subject: filters.subject });
  if (filters.type) query.$and.push({ type: filters.type });
  if (filters.category) query.$and.push({ category: filters.category });
  if (filters.difficulty) query.$and.push({ difficulty: filters.difficulty });

  return this.find(query).sort({ 'analytics.views': -1 });
};

// Instance methods
libraryContentSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save();
};

libraryContentSchema.methods.incrementDownloads = function() {
  this.analytics.downloads += 1;
  return this.save();
};

libraryContentSchema.methods.updateRating = function(newRating) {
  this.analytics.rating += newRating;
  this.analytics.totalRatings += 1;
  return this.save();
};

const LibraryContent = mongoose.model('LibraryContent', libraryContentSchema);

module.exports = LibraryContent;