/**
 * Enhanced Innovation Model
 * Improved with relationships, indexing, validation, and performance optimizations
 */

const mongoose = require('mongoose');

// Team Member Schema
const teamMemberSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
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
  role: {
    type: String,
    required: true,
    enum: ['leader', 'developer', 'designer', 'researcher', 'marketing', 'other']
  },
  skills: [{
    type: String,
    trim: true
  }],
  linkedinUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/(www\.)?linkedin\.com\//.test(v);
      },
      message: 'Please enter a valid LinkedIn URL'
    }
  },
  githubUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/(www\.)?github\.com\//.test(v);
      },
      message: 'Please enter a valid GitHub URL'
    }
  },
  contribution: {
    type: String,
    maxlength: [500, 'Contribution description cannot exceed 500 characters']
  },
  joinedAt: {
    type: Date,
    default: Date.now
  }
});

// Timeline Milestone Schema
const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Milestone title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [1000, 'Milestone description cannot exceed 1000 characters']
  },
  dueDate: {
    type: Date
  },
  completedDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'overdue'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  assignedTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  }
});

// Project Update Schema
const updateSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Update title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: true,
    maxlength: [2000, 'Update content cannot exceed 2000 characters']
  },
  type: {
    type: String,
    enum: ['progress', 'milestone', 'blocker', 'announcement', 'demo'],
    default: 'progress'
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attachments: [{
    name: String,
    url: String,
    type: String,
    size: Number
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  likes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
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
      maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Enhanced Innovation Schema
const innovationSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Project title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    index: true
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    index: true
  },
  
  description: {
    type: String,
    required: [true, 'Project description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  summary: {
    type: String,
    maxlength: [300, 'Summary cannot exceed 300 characters']
  },
  
  problemStatement: {
    type: String,
    maxlength: [1000, 'Problem statement cannot exceed 1000 characters']
  },
  
  solution: {
    type: String,
    maxlength: [1000, 'Solution cannot exceed 1000 characters']
  },
  
  // Project Classification
  category: {
    type: String,
    required: true,
    enum: {
      values: [
        'web_application', 'mobile_app', 'ai_ml', 'blockchain', 'iot',
        'cybersecurity', 'fintech', 'healthtech', 'edtech', 'gaming',
        'social_impact', 'sustainability', 'productivity', 'entertainment', 'other'
      ],
      message: '{VALUE} is not a valid category'
    },
    index: true
  },
  
  subcategory: {
    type: String,
    maxlength: [100, 'Subcategory cannot exceed 100 characters']
  },
  
  type: {
    type: String,
    required: true,
    enum: {
      values: ['prototype', 'mvp', 'full_product', 'research', 'concept'],
      message: '{VALUE} is not a valid project type'
    }
  },
  
  difficulty: {
    type: String,
    required: true,
    enum: {
      values: ['beginner', 'intermediate', 'advanced', 'expert'],
      message: '{VALUE} is not a valid difficulty level'
    },
    index: true
  },
  
  // Team Information
  teamMembers: [teamMemberSchema],
  
  teamSize: {
    min: {
      type: Number,
      min: 1,
      default: 1
    },
    max: {
      type: Number,
      min: 1,
      default: 10
    },
    current: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  
  lookingForMembers: {
    type: Boolean,
    default: false
  },
  
  requiredSkills: [{
    skill: {
      type: String,
      required: true,
      trim: true
    },
    level: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    priority: {
      type: String,
      enum: ['nice_to_have', 'preferred', 'required'],
      default: 'preferred'
    }
  }],
  
  // Technology Stack
  techStack: {
    frontend: [{
      type: String,
      trim: true
    }],
    backend: [{
      type: String,
      trim: true
    }],
    database: [{
      type: String,
      trim: true
    }],
    mobile: [{
      type: String,
      trim: true
    }],
    cloud: [{
      type: String,
      trim: true
    }],
    ai_ml: [{
      type: String,
      trim: true
    }],
    other: [{
      type: String,
      trim: true
    }]
  },
  
  // Project Timeline
  timeline: {
    startDate: {
      type: Date,
      index: true
    },
    endDate: {
      type: Date
    },
    estimatedDuration: {
      type: Number, // in weeks
      min: 1
    },
    actualDuration: {
      type: Number // in weeks
    }
  },
  
  milestones: [milestoneSchema],
  
  // Project Status and Progress
  status: {
    type: String,
    required: true,
    enum: {
      values: [
        'idea', 'planning', 'in_progress', 'testing', 
        'completed', 'deployed', 'maintenance', 'paused', 'cancelled'
      ],
      message: '{VALUE} is not a valid status'
    },
    default: 'idea',
    index: true
  },
  
  progress: {
    percentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Links and Resources
  repositoryUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/(www\.)?(github\.com|gitlab\.com|bitbucket\.org)\//.test(v);
      },
      message: 'Please enter a valid repository URL'
    }
  },
  
  demoUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Demo URL must be a valid URL'
    }
  },
  
  documentationUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Documentation URL must be a valid URL'
    }
  },
  
  imageUrl: {
    type: String
  },
  
  videoUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(v);
      },
      message: 'Please enter a valid video URL'
    }
  },
  
  // File Attachments
  attachments: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['document', 'image', 'video', 'code', 'other']
    },
    size: Number,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  files: [{
    originalName: String,
    filename: String,
    url: String,
    size: Number,
    mimetype: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Mentor Information
  mentor: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Mentor name cannot exceed 100 characters']
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
    phone: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^\+?[\d\s\-\(\)]{10,}$/.test(v);
        },
        message: 'Please enter a valid phone number'
      }
    },
    expertise: [{
      type: String,
      trim: true
    }],
    linkedinUrl: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?linkedin\.com\//.test(v);
        },
        message: 'Please enter a valid LinkedIn URL'
      }
    },
    assignedDate: {
      type: Date,
      default: Date.now
    }
  },
  
  // Project Updates and Communication
  updates: [updateSchema],
  
  // Business and Impact
  businessModel: {
    type: String,
    maxlength: [1000, 'Business model cannot exceed 1000 characters']
  },
  
  targetAudience: {
    type: String,
    maxlength: [500, 'Target audience cannot exceed 500 characters']
  },
  
  marketSize: {
    type: String,
    maxlength: [300, 'Market size cannot exceed 300 characters']
  },
  
  competitiveAdvantage: {
    type: String,
    maxlength: [1000, 'Competitive advantage cannot exceed 1000 characters']
  },
  
  socialImpact: {
    type: String,
    maxlength: [1000, 'Social impact cannot exceed 1000 characters']
  },
  
  // Funding and Resources
  fundingStatus: {
    type: String,
    enum: ['self_funded', 'seeking_funding', 'funded', 'not_required'],
    default: 'not_required'
  },
  
  fundingAmount: {
    requested: {
      type: Number,
      min: 0
    },
    raised: {
      type: Number,
      min: 0,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  investors: [{
    name: String,
    type: {
      type: String,
      enum: ['angel', 'vc', 'accelerator', 'grant', 'crowdfunding', 'other']
    },
    amount: Number,
    date: Date
  }],
  
  // Recognition and Awards
  awards: [{
    name: {
      type: String,
      required: true
    },
    organization: String,
    date: Date,
    description: String,
    certificateUrl: String
  }],
  
  competitions: [{
    name: {
      type: String,
      required: true
    },
    rank: Number,
    prize: String,
    date: Date,
    certificateUrl: String
  }],
  
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
  
  likes: {
    type: Number,
    default: 0,
    min: 0
  },
  
  stars: {
    type: Number,
    default: 0,
    min: 0
  },
  
  forks: {
    type: Number,
    default: 0,
    min: 0
  },
  
  downloads: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Tags and Keywords
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
  
  // Visibility and Access
  visibility: {
    type: String,
    required: true,
    enum: {
      values: ['public', 'private', 'team_only', 'mentors_only'],
      message: '{VALUE} is not a valid visibility level'
    },
    default: 'public',
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
  
  // Administrative Information
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
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
innovationSchema.index({ title: 'text', description: 'text', tags: 'text' });
innovationSchema.index({ category: 1, difficulty: 1, featured: 1 });
innovationSchema.index({ status: 1, visibility: 1, createdAt: -1 });
innovationSchema.index({ 'views.total': -1, likes: -1, stars: -1 });
innovationSchema.index({ createdBy: 1, createdAt: -1 });
innovationSchema.index({ featured: 1, trending: 1, createdAt: -1 });
innovationSchema.index({ isDeleted: 1, status: 1 });
innovationSchema.index({ 'timeline.startDate': 1, 'timeline.endDate': 1 });
innovationSchema.index({ lookingForMembers: 1, 'teamSize.current': 1, 'teamSize.max': 1 });

// Virtual Properties
innovationSchema.virtual('isRecruiting').get(function() {
  return this.lookingForMembers && this.teamSize.current < this.teamSize.max;
});

innovationSchema.virtual('completionPercentage').get(function() {
  if (this.milestones.length === 0) return this.progress.percentage;
  
  const completedMilestones = this.milestones.filter(m => m.status === 'completed').length;
  return Math.round((completedMilestones / this.milestones.length) * 100);
});

innovationSchema.virtual('daysRemaining').get(function() {
  if (!this.timeline.endDate) return null;
  
  const now = new Date();
  const endDate = new Date(this.timeline.endDate);
  const diffTime = endDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

innovationSchema.virtual('url').get(function() {
  return `/innovation/${this.slug || this._id}`;
});

// Pre-save Middleware
innovationSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Update team size current count
  this.teamSize.current = this.teamMembers.length;
  
  // Update progress based on milestones
  if (this.milestones.length > 0) {
    const completedMilestones = this.milestones.filter(m => m.status === 'completed').length;
    this.progress.percentage = Math.round((completedMilestones / this.milestones.length) * 100);
  }
  
  // Auto-update status based on progress
  if (this.progress.percentage === 100 && this.status === 'in_progress') {
    this.status = 'completed';
  }
  
  this.updatedAt = new Date();
  next();
});

// Static Methods
innovationSchema.statics.findPublic = function() {
  return this.find({ 
    visibility: 'public',
    isDeleted: false 
  }).sort({ featured: -1, createdAt: -1 });
};

innovationSchema.statics.findFeatured = function() {
  return this.find({ 
    featured: true, 
    visibility: 'public',
    isDeleted: false 
  }).sort({ createdAt: -1 });
};

innovationSchema.statics.findByCategory = function(category) {
  return this.find({ 
    category, 
    visibility: 'public',
    isDeleted: false 
  }).sort({ featured: -1, createdAt: -1 });
};

innovationSchema.statics.findRecruiting = function() {
  return this.find({
    lookingForMembers: true,
    $expr: { $lt: ['$teamSize.current', '$teamSize.max'] },
    visibility: 'public',
    isDeleted: false
  }).sort({ createdAt: -1 });
};

innovationSchema.statics.searchProjects = function(query) {
  return this.find({
    $text: { $search: query },
    visibility: 'public',
    isDeleted: false
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

// Instance Methods
innovationSchema.methods.incrementViews = function(userId = null) {
  this.views.total += 1;
  this.views.thisMonth += 1;
  
  if (userId) {
    // Logic to track unique views can be implemented here
    // For now, just increment unique views
    this.views.unique += 1;
  }
  
  return this.save();
};

innovationSchema.methods.addTeamMember = function(memberData) {
  // Check if user is already a team member
  const existingMember = this.teamMembers.find(m => 
    m.userId && m.userId.toString() === memberData.userId?.toString()
  );
  
  if (existingMember) {
    throw new Error('User is already a team member');
  }
  
  if (this.teamSize.current >= this.teamSize.max) {
    throw new Error('Team is full');
  }
  
  this.teamMembers.push(memberData);
  return this.save();
};

innovationSchema.methods.removeTeamMember = function(userId) {
  this.teamMembers = this.teamMembers.filter(m => 
    !m.userId || m.userId.toString() !== userId.toString()
  );
  return this.save();
};

innovationSchema.methods.addUpdate = function(updateData) {
  this.updates.push(updateData);
  this.progress.lastUpdated = new Date();
  return this.save();
};

innovationSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

innovationSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

module.exports = mongoose.model('Innovation', innovationSchema);