const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please provide a valid email address'
    ]
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  category: {
    type: String,
    enum: {
      values: ['general', 'technical', 'billing', 'feature-request', 'bug-report', 'account', 'other'],
      message: 'Please select a valid category'
    },
    default: 'general'
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'in-progress', 'resolved', 'closed'],
      message: 'Please select a valid status'
    },
    default: 'pending'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'urgent'],
      message: 'Please select a valid priority'
    },
    default: 'medium'
  },
  adminNotes: [{
    note: {
      type: String,
      maxlength: [500, 'Admin note cannot exceed 500 characters']
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolvedAt: {
    type: Date
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // Can be null for anonymous feedback
  },
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  },
  attachments: [{
    filename: String,
    originalName: String,
    path: String,
    size: Number,
    mimetype: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  lastContactedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
feedbackSchema.index({ email: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ priority: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ assignedTo: 1 });
feedbackSchema.index({ userId: 1 });

// Compound indexes
feedbackSchema.index({ status: 1, priority: -1, createdAt: -1 });
feedbackSchema.index({ category: 1, status: 1 });

// Text index for search functionality
feedbackSchema.index({
  subject: 'text',
  message: 'text',
  name: 'text'
});

// Virtual for response time calculation
feedbackSchema.virtual('responseTime').get(function() {
  if (this.resolvedAt && this.createdAt) {
    return Math.ceil((this.resolvedAt - this.createdAt) / (1000 * 60 * 60 * 24)); // Days
  }
  return null;
});

// Virtual for age of feedback
feedbackSchema.virtual('age').get(function() {
  return Math.ceil((new Date() - this.createdAt) / (1000 * 60 * 60 * 24)); // Days
});

// Pre-save middleware
feedbackSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'resolved' && !this.resolvedAt) {
    this.resolvedAt = new Date();
  }
  
  // Auto-assign priority based on keywords
  if (this.isNew && !this.priority) {
    const urgentKeywords = ['urgent', 'critical', 'emergency', 'broken', 'down'];
    const highKeywords = ['bug', 'error', 'issue', 'problem', 'not working'];
    
    const content = `${this.subject} ${this.message}`.toLowerCase();
    
    if (urgentKeywords.some(keyword => content.includes(keyword))) {
      this.priority = 'urgent';
    } else if (highKeywords.some(keyword => content.includes(keyword))) {
      this.priority = 'high';
    } else if (this.category === 'technical' || this.category === 'bug-report') {
      this.priority = 'high';
    }
  }
  
  next();
});

// Static methods
feedbackSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        pending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        },
        inProgress: {
          $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] }
        },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  
  return stats[0] || {
    total: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    avgRating: 0
  };
};

feedbackSchema.statics.getCategoryStats = async function() {
  return await this.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        pendingCount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Instance methods
feedbackSchema.methods.assignTo = function(adminId, note = '') {
  this.assignedTo = adminId;
  this.status = 'in-progress';
  
  if (note) {
    this.adminNotes.push({
      note: note,
      addedBy: adminId
    });
  }
  
  return this.save();
};

feedbackSchema.methods.addAdminNote = function(note, adminId) {
  this.adminNotes.push({
    note: note,
    addedBy: adminId
  });
  
  return this.save();
};

feedbackSchema.methods.markResolved = function(adminId, note = '') {
  this.status = 'resolved';
  this.resolvedAt = new Date();
  
  if (note) {
    this.adminNotes.push({
      note: note,
      addedBy: adminId
    });
  }
  
  return this.save();
};

feedbackSchema.methods.updatePriority = function(priority, adminId, reason = '') {
  const oldPriority = this.priority;
  this.priority = priority;
  
  if (reason) {
    this.adminNotes.push({
      note: `Priority changed from ${oldPriority} to ${priority}. Reason: ${reason}`,
      addedBy: adminId
    });
  }
  
  return this.save();
};

module.exports = mongoose.model('Feedback', feedbackSchema);