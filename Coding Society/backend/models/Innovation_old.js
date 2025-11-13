/**
 * Innovation Model for Admin-Managed Innovation Projects
 * Handles innovation PDFs with student collaboration tracking
 */

const mongoose = require('mongoose');

const innovationSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Innovation title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Categorization
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: {
      values: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Civil Engineering', 'Mathematics', 'Physics', 'Biotechnology', 'Other'],
      message: '{VALUE} is not a valid category'
    }
  },
  domain: {
    type: String,
    required: [true, 'Domain is required'],
    trim: true,
    maxlength: [100, 'Domain cannot exceed 100 characters']
    // Examples: AI, IoT, Robotics, Machine Learning, Web Development, etc.
  },
  
  // Files & Media
  innovationPDF: {
    url: {
      type: String,
      required: [true, 'Innovation PDF URL is required']
    },
    filename: {
      type: String,
      required: [true, 'PDF filename is required']
    },
    originalName: {
      type: String,
      required: [true, 'Original filename is required']
    },
    size: {
      type: String // e.g., "2.5 MB"
    }
  },
  thumbnail: {
    type: String,
    default: '💡'
  },
  images: [{
    url: String,
    filename: String,
    caption: String
  }],
  
  // Project Details
  status: {
    type: String,
    enum: ['planning', 'development', 'testing', 'completed', 'on-hold', 'cancelled'],
    default: 'planning'
  },
  progress: {
    type: Number,
    default: 0,
    min: [0, 'Progress cannot be negative'],
    max: [100, 'Progress cannot exceed 100']
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  
  // Team & Collaboration
  collaborators: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required for collaborator']
    },
    name: {
      type: String,
      required: [true, 'Collaborator name is required'],
      trim: true
    },
    email: {
      type: String,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    role: {
      type: String,
      required: [true, 'Collaborator role is required'],
      trim: true,
      maxlength: [50, 'Role cannot exceed 50 characters']
      // Examples: Frontend Developer, Data Scientist, UI/UX Designer, etc.
    },
    avatar: {
      type: String,
      default: '👨‍💻'
    },
    joinedDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'left'],
      default: 'active'
    },
    contribution: {
      type: String,
      maxlength: [500, 'Contribution description cannot exceed 500 characters']
    }
  }],
  teamSize: {
    type: Number,
    default: 0,
    min: [0, 'Team size cannot be negative']
  },
  maxTeamSize: {
    type: Number,
    default: 5,
    min: [1, 'Max team size must be at least 1'],
    max: [20, 'Max team size cannot exceed 20']
  },
  lookingForMembers: {
    type: Boolean,
    default: true
  },
  
  // Financial & Resources
  funding: {
    type: String // e.g., "$15,000", "₹50,000"
  },
  budget: {
    allocated: Number,
    used: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  sponsors: [{
    name: String,
    logo: String,
    website: String,
    contribution: String
  }],
  
  // Technical Details
  skills: [{
    type: String,
    trim: true,
    maxlength: [30, 'Skill cannot exceed 30 characters']
  }],
  technologies: [{
    type: String,
    trim: true,
    maxlength: [50, 'Technology cannot exceed 50 characters']
  }],
  frameworks: [{
    type: String,
    trim: true,
    maxlength: [50, 'Framework cannot exceed 50 characters']
  }],
  
  // Milestones & Progress Tracking
  milestones: [{
    title: {
      type: String,
      required: [true, 'Milestone title is required'],
      trim: true,
      maxlength: [100, 'Milestone title cannot exceed 100 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Milestone description cannot exceed 500 characters']
    },
    dueDate: {
      type: Date
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedDate: {
      type: Date
    },
    assignedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    }
  }],
  
  // Social Engagement
  likes: {
    type: Number,
    default: 0,
    min: [0, 'Likes cannot be negative']
  },
  comments: {
    type: Number,
    default: 0,
    min: [0, 'Comments cannot be negative']
  },
  views: {
    type: Number,
    default: 0,
    min: [0, 'Views cannot be negative']
  },
  bookmarks: {
    type: Number,
    default: 0,
    min: [0, 'Bookmarks cannot be negative']
  },
  
  // Discovery & Search
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  keywords: [{
    type: String,
    trim: true,
    maxlength: [50, 'Keyword cannot exceed 50 characters']
  }],
  featured: {
    type: Boolean,
    default: false
  },
  
  // External Links
  externalLinks: {
    github: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/(www\.)?github\.com\//.test(v);
        },
        message: 'GitHub URL must be a valid GitHub repository URL'
      }
    },
    demo: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\//.test(v);
        },
        message: 'Demo URL must be a valid HTTP/HTTPS URL'
      }
    },
    documentation: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\//.test(v);
        },
        message: 'Documentation URL must be a valid HTTP/HTTPS URL'
      }
    },
    presentation: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\//.test(v);
        },
        message: 'Presentation URL must be a valid HTTP/HTTPS URL'
      }
    }
  },
  
  // Admin Control & Tracking
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator reference is required']
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
innovationSchema.index({ category: 1, domain: 1 });
innovationSchema.index({ status: 1, featured: -1 });
innovationSchema.index({ views: -1, likes: -1 });
innovationSchema.index({ 'collaborators.studentId': 1 });
innovationSchema.index({ tags: 1 });
innovationSchema.index({ keywords: 1 });
innovationSchema.index({ createdAt: -1 });
innovationSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for completion percentage based on milestones
innovationSchema.virtual('milestoneCompletion').get(function() {
  if (!this.milestones || this.milestones.length === 0) return 0;
  const completed = this.milestones.filter(m => m.completed).length;
  return Math.round((completed / this.milestones.length) * 100);
});

// Virtual for active collaborators count
innovationSchema.virtual('activeCollaborators').get(function() {
  if (!this.collaborators) return 0;
  return this.collaborators.filter(c => c.status === 'active').length;
});

// Virtual for overdue milestones
innovationSchema.virtual('overdueMilestones').get(function() {
  if (!this.milestones) return [];
  const now = new Date();
  return this.milestones.filter(m => !m.completed && m.dueDate && m.dueDate < now);
});

// Pre-save middleware
innovationSchema.pre('save', function(next) {
  // Update team size based on active collaborators
  this.teamSize = this.collaborators ? this.collaborators.filter(c => c.status === 'active').length : 0;
  
  // Update lastModified
  this.lastModified = new Date();
  
  // Set completion date for completed milestones
  if (this.milestones) {
    this.milestones.forEach(milestone => {
      if (milestone.completed && !milestone.completedDate) {
        milestone.completedDate = new Date();
      }
    });
  }
  
  next();
});

// Static methods
innovationSchema.statics.findByCategory = function(category) {
  return this.find({ category, approvalStatus: 'approved' }).sort({ createdAt: -1 });
};

innovationSchema.statics.findByDomain = function(domain) {
  return this.find({ domain, approvalStatus: 'approved' }).sort({ createdAt: -1 });
};

innovationSchema.statics.findByStatus = function(status) {
  return this.find({ status, approvalStatus: 'approved' }).sort({ createdAt: -1 });
};

innovationSchema.statics.findFeatured = function() {
  return this.find({ featured: true, approvalStatus: 'approved' }).sort({ createdAt: -1 });
};

innovationSchema.statics.findPopular = function(limit = 10) {
  return this.find({ approvalStatus: 'approved' })
    .sort({ views: -1, likes: -1 })
    .limit(limit);
};

innovationSchema.statics.findByCollaborator = function(userId) {
  return this.find({
    'collaborators.studentId': userId,
    'collaborators.status': 'active',
    approvalStatus: 'approved'
  }).sort({ createdAt: -1 });
};

innovationSchema.statics.searchInnovations = function(searchTerm, filters = {}) {
  const query = {
    $and: [
      { approvalStatus: 'approved' },
      {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { tags: { $in: [new RegExp(searchTerm, 'i')] } },
          { keywords: { $in: [new RegExp(searchTerm, 'i')] } },
          { domain: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ]
  };

  // Apply filters
  if (filters.category) query.$and.push({ category: filters.category });
  if (filters.domain) query.$and.push({ domain: filters.domain });
  if (filters.status) query.$and.push({ status: filters.status });
  if (filters.difficulty) query.$and.push({ difficulty: filters.difficulty });

  return this.find(query).sort({ views: -1 });
};

// Instance methods
innovationSchema.methods.addCollaborator = function(collaboratorData) {
  // Check if user is already a collaborator
  const existingCollaborator = this.collaborators.find(
    c => c.studentId.toString() === collaboratorData.studentId.toString()
  );
  
  if (existingCollaborator) {
    throw new Error('User is already a collaborator');
  }
  
  // Check team size limit
  if (this.activeCollaborators >= this.maxTeamSize) {
    throw new Error('Team is already at maximum capacity');
  }
  
  this.collaborators.push(collaboratorData);
  return this.save();
};

innovationSchema.methods.removeCollaborator = function(studentId) {
  this.collaborators = this.collaborators.filter(
    c => c.studentId.toString() !== studentId.toString()
  );
  return this.save();
};

innovationSchema.methods.updateCollaboratorStatus = function(studentId, status) {
  const collaborator = this.collaborators.find(
    c => c.studentId.toString() === studentId.toString()
  );
  
  if (!collaborator) {
    throw new Error('Collaborator not found');
  }
  
  collaborator.status = status;
  return this.save();
};

innovationSchema.methods.addMilestone = function(milestoneData) {
  this.milestones.push(milestoneData);
  return this.save();
};

innovationSchema.methods.updateMilestone = function(milestoneId, updateData) {
  const milestone = this.milestones.id(milestoneId);
  if (!milestone) {
    throw new Error('Milestone not found');
  }
  
  Object.assign(milestone, updateData);
  return this.save();
};

innovationSchema.methods.completeMilestone = function(milestoneId) {
  const milestone = this.milestones.id(milestoneId);
  if (!milestone) {
    throw new Error('Milestone not found');
  }
  
  milestone.completed = true;
  milestone.completedDate = new Date();
  return this.save();
};

innovationSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

innovationSchema.methods.incrementLikes = function() {
  this.likes += 1;
  return this.save();
};

innovationSchema.methods.incrementBookmarks = function() {
  this.bookmarks += 1;
  return this.save();
};

const Innovation = mongoose.model('Innovation', innovationSchema);

module.exports = Innovation;