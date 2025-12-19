/**
 * Enhanced Internship Model
 * Improved with relationships, indexing, validation, and performance optimizations
 */

const mongoose = require('mongoose');

// Application Schema for tracking student applications
const applicationSchema = new mongoose.Schema({
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['applied', 'under_review', 'shortlisted', 'interviewed', 'selected', 'rejected', 'withdrawn'],
    default: 'applied'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  resumeUrl: {
    type: String
  },
  coverLetter: {
    type: String,
    maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
  },
  portfolioUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Portfolio URL must be a valid URL'
    }
  },
  expectedStipend: {
    type: Number,
    min: 0
  },
  availableStartDate: {
    type: Date
  },
  preferredLocation: {
    type: String,
    maxlength: [100, 'Preferred location cannot exceed 100 characters']
  },
  additionalInfo: {
    type: String,
    maxlength: [1000, 'Additional information cannot exceed 1000 characters']
  },
  interviewScheduled: {
    type: Date
  },
  interviewNotes: {
    type: String,
    maxlength: [1000, 'Interview notes cannot exceed 1000 characters']
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot exceed 1000 characters']
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  }
});

// Requirement Schema for internship requirements
const requirementSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ['education', 'skills', 'experience', 'certification', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: [200, 'Requirement description cannot exceed 200 characters']
  },
  priority: {
    type: String,
    enum: ['must_have', 'preferred', 'nice_to_have'],
    default: 'preferred'
  },
  level: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  }
});

// Benefit Schema for internship benefits
const benefitSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['monetary', 'learning', 'networking', 'certification', 'mentorship', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: [200, 'Benefit description cannot exceed 200 characters']
  },
  value: {
    type: String,
    maxlength: [100, 'Benefit value cannot exceed 100 characters']
  }
});

// Enhanced Internship Schema
const internshipSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Internship title is required'],
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
    required: [true, 'Internship description is required'],
    maxlength: [3000, 'Description cannot exceed 3000 characters']
  },
  
  summary: {
    type: String,
    maxlength: [300, 'Summary cannot exceed 300 characters']
  },
  
  // Company Information
  company: {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [200, 'Company name cannot exceed 200 characters'],
      index: true
    },
    description: {
      type: String,
      maxlength: [1000, 'Company description cannot exceed 1000 characters']
    },
    website: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Company website must be a valid URL'
      }
    },
    logo: {
      type: String
    },
    industry: {
      type: String,
      required: true,
      enum: {
        values: [
          'technology', 'finance', 'healthcare', 'education', 'retail',
          'manufacturing', 'consulting', 'media', 'telecommunications',
          'automotive', 'aerospace', 'biotechnology', 'energy', 'government',
          'non_profit', 'startup', 'other'
        ],
        message: '{VALUE} is not a valid industry'
      },
      index: true
    },
    size: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+', 'undisclosed'],
      default: 'undisclosed'
    },
    founded: {
      type: Number,
      min: 1800,
      max: new Date().getFullYear()
    },
    headquarters: {
      city: {
        type: String,
        maxlength: [100, 'City cannot exceed 100 characters']
      },
      state: {
        type: String,
        maxlength: [100, 'State cannot exceed 100 characters']
      },
      country: {
        type: String,
        maxlength: [100, 'Country cannot exceed 100 characters'],
        index: true
      }
    },
    linkedinUrl: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/(www\.)?linkedin\.com\//.test(v);
        },
        message: 'Please enter a valid LinkedIn URL'
      }
    }
  },
  
  // Position Details
  department: {
    type: String,
    required: true,
    enum: {
      values: [
        'engineering', 'product', 'design', 'marketing', 'sales',
        'data_science', 'research', 'operations', 'hr', 'finance',
        'business_development', 'customer_success', 'content',
        'legal', 'quality_assurance', 'other'
      ],
      message: '{VALUE} is not a valid department'
    },
    index: true
  },
  
  role: {
    type: String,
    required: true,
    maxlength: [100, 'Role cannot exceed 100 characters']
  },
  
  level: {
    type: String,
    required: true,
    enum: {
      values: ['entry', 'junior', 'mid', 'senior'],
      message: '{VALUE} is not a valid level'
    },
    default: 'entry'
  },
  
  // Location and Work Arrangement
  location: {
    type: {
      type: String,
      enum: ['remote', 'on_site', 'hybrid'],
      required: true,
      index: true
    },
    address: {
      street: String,
      city: {
        type: String,
        maxlength: [100, 'City cannot exceed 100 characters']
      },
      state: {
        type: String,
        maxlength: [100, 'State cannot exceed 100 characters']
      },
      country: {
        type: String,
        maxlength: [100, 'Country cannot exceed 100 characters'],
        index: true
      },
      zipCode: {
        type: String,
        maxlength: [20, 'Zip code cannot exceed 20 characters']
      }
    },
    timezone: {
      type: String,
      maxlength: [50, 'Timezone cannot exceed 50 characters']
    }
  },
  
  // Duration and Schedule
  duration: {
    type: {
      type: String,
      enum: ['fixed', 'flexible', 'project_based'],
      default: 'fixed'
    },
    value: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      enum: ['weeks', 'months'],
      required: true
    },
    extendable: {
      type: Boolean,
      default: false
    }
  },
  
  schedule: {
    hoursPerWeek: {
      type: Number,
      min: 1,
      max: 40,
      default: 40
    },
    flexibility: {
      type: String,
      enum: ['fixed', 'flexible', 'very_flexible'],
      default: 'flexible'
    },
    workingDays: [{
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    }],
    startTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    },
    endTime: {
      type: String,
      match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    }
  },
  
  // Compensation
  stipend: {
    amount: {
      type: Number,
      min: 0
    },
    currency: {
      type: String,
      default: 'USD',
      maxlength: [3, 'Currency code cannot exceed 3 characters']
    },
    frequency: {
      type: String,
      enum: ['hourly', 'weekly', 'monthly', 'lump_sum', 'unpaid'],
      default: 'monthly'
    },
    negotiable: {
      type: Boolean,
      default: false
    }
  },
  
  benefits: [benefitSchema],
  
  // Requirements
  requirements: [requirementSchema],
  
  skills: {
    required: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'intermediate'
      }
    }],
    preferred: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'intermediate'
      }
    }]
  },
  
  // Eligibility
  eligibility: {
    education: {
      level: {
        type: String,
        enum: ['high_school', 'undergraduate', 'graduate', 'phd', 'any'],
        default: 'undergraduate'
      },
      fields: [{
        type: String,
        trim: true
      }],
      gpaRequirement: {
        type: Number,
        min: 0,
        max: 4
      }
    },
    year: {
      type: String,
      enum: ['freshman', 'sophomore', 'junior', 'senior', 'graduate', 'any'],
      default: 'any'
    },
    citizenship: {
      required: {
        type: Boolean,
        default: false
      },
      countries: [{
        type: String,
        maxlength: [100, 'Country cannot exceed 100 characters']
      }]
    },
    ageRange: {
      min: {
        type: Number,
        min: 16
      },
      max: {
        type: Number,
        max: 100
      }
    }
  },
  
  // Application Process
  application: {
    url: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Application URL must be a valid URL'
      }
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
    deadline: {
      type: Date,
      required: true,
      index: true
    },
    startDate: {
      type: Date,
      required: true,
      index: true
    },
    endDate: {
      type: Date,
      index: true
    },
    process: [{
      step: {
        type: String,
        required: true,
        enum: ['application', 'screening', 'interview', 'assessment', 'reference_check', 'offer']
      },
      description: {
        type: String,
        maxlength: [300, 'Process description cannot exceed 300 characters']
      },
      duration: {
        type: String,
        maxlength: [50, 'Duration cannot exceed 50 characters']
      }
    }],
    requirements: {
      resume: {
        type: Boolean,
        default: true
      },
      coverLetter: {
        type: Boolean,
        default: false
      },
      portfolio: {
        type: Boolean,
        default: false
      },
      transcript: {
        type: Boolean,
        default: false
      },
      references: {
        type: Number,
        min: 0,
        max: 10,
        default: 0
      }
    }
  },
  
  // Mentor Information
  mentor: {
    name: {
      type: String,
      required: [true, 'Mentor name is required'],
      trim: true,
      maxlength: [100, 'Mentor name cannot exceed 100 characters']
    },
    title: {
      type: String,
      maxlength: [100, 'Mentor title cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Mentor email is required'],
      lowercase: true,
      validate: {
        validator: function(v) {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: 'Please enter a valid email address'
      }
    },
    phone: {
      type: String,
      required: [true, 'Mentor phone is required'],
      validate: {
        validator: function(v) {
          return /^\+?[\d\s\-\(\)]{10,}$/.test(v);
        },
        message: 'Please enter a valid phone number'
      }
    },
    bio: {
      type: String,
      maxlength: [500, 'Mentor bio cannot exceed 500 characters']
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
    experience: {
      type: Number,
      min: 0
    }
  },
  
  // Supervisor Information
  supervisor: {
    name: {
      type: String,
      trim: true,
      maxlength: [100, 'Supervisor name cannot exceed 100 characters']
    },
    title: {
      type: String,
      maxlength: [100, 'Supervisor title cannot exceed 100 characters']
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
    }
  },
  
  // File Attachments
  fileUrl: {
    type: String
  },
  
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
      enum: ['job_description', 'company_brochure', 'application_form', 'other']
    },
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Applications Management
  applications: [applicationSchema],
  
  openings: {
    total: {
      type: Number,
      required: true,
      min: 1,
      default: 1
    },
    filled: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  
  // Status and Visibility
  status: {
    type: String,
    required: true,
    enum: {
      values: ['draft', 'open', 'paused', 'closed', 'filled', 'expired', 'cancelled'],
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
  
  urgent: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Analytics
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
  
  clicks: {
    apply: {
      type: Number,
      default: 0,
      min: 0
    },
    company: {
      type: Number,
      default: 0,
      min: 0
    },
    mentor: {
      type: Number,
      default: 0,
      min: 0
    }
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
  },
  
  files: [{
    originalName: String,
    filename: String,
    url: String,
    size: Number,
    mimetype: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for Performance Optimization
internshipSchema.index({ title: 'text', description: 'text', 'company.name': 'text', tags: 'text' });
internshipSchema.index({ department: 1, 'location.type': 1, status: 1 });
internshipSchema.index({ 'company.industry': 1, featured: 1, publishedAt: -1 });
internshipSchema.index({ 'application.deadline': 1, status: 1 });
internshipSchema.index({ 'application.startDate': 1, 'application.endDate': 1 });
internshipSchema.index({ 'stipend.amount': -1, 'stipend.frequency': 1 });
internshipSchema.index({ createdBy: 1, createdAt: -1 });
internshipSchema.index({ featured: 1, urgent: 1, publishedAt: -1 });
internshipSchema.index({ isDeleted: 1, status: 1 });
internshipSchema.index({ 'views.total': -1, 'applications.length': -1 });

// Virtual Properties
internshipSchema.virtual('availableSpots').get(function() {
  return this.openings.total - this.openings.filled;
});

internshipSchema.virtual('applicationCount').get(function() {
  return this.applications.length;
});

internshipSchema.virtual('isExpired').get(function() {
  return new Date() > this.application.deadline;
});

internshipSchema.virtual('isActive').get(function() {
  return this.status === 'open' && !this.isExpired && this.availableSpots > 0;
});

internshipSchema.virtual('daysUntilDeadline').get(function() {
  if (this.isExpired) return 0;
  
  const now = new Date();
  const deadline = new Date(this.application.deadline);
  const diffTime = deadline - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

internshipSchema.virtual('url').get(function() {
  return `/internships/${this.slug || this._id}`;
});

// Pre-save Middleware
internshipSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Auto-expire if past deadline
  if (this.application.deadline && new Date() > this.application.deadline && this.status === 'open') {
    this.status = 'expired';
  }
  
  // Auto-close if all spots filled
  if (this.openings.filled >= this.openings.total && this.status === 'open') {
    this.status = 'filled';
  }
  
  if (this.isModified('status') && this.status === 'open' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  this.updatedAt = new Date();
  next();
});

// Static Methods
internshipSchema.statics.findActive = function() {
  return this.find({
    status: 'open',
    'application.deadline': { $gt: new Date() },
    $expr: { $gt: ['$openings.total', '$openings.filled'] },
    isDeleted: false
  }).sort({ featured: -1, urgent: -1, publishedAt: -1 });
};

internshipSchema.statics.findFeatured = function() {
  return this.find({
    featured: true,
    status: 'open',
    isDeleted: false
  }).sort({ publishedAt: -1 });
};

internshipSchema.statics.findByCompany = function(companyName) {
  return this.find({
    'company.name': new RegExp(companyName, 'i'),
    status: 'open',
    isDeleted: false
  }).sort({ publishedAt: -1 });
};

internshipSchema.statics.findByLocation = function(locationType, country = null) {
  const query = {
    'location.type': locationType,
    status: 'open',
    isDeleted: false
  };
  
  if (country) {
    query['location.address.country'] = new RegExp(country, 'i');
  }
  
  return this.find(query).sort({ publishedAt: -1 });
};

internshipSchema.statics.searchInternships = function(query) {
  return this.find({
    $text: { $search: query },
    status: 'open',
    isDeleted: false
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

// Instance Methods
internshipSchema.methods.incrementViews = function(userId = null) {
  this.views.total += 1;
  this.views.thisMonth += 1;
  
  if (userId) {
    // Logic to track unique views
    this.views.unique += 1;
  }
  
  return this.save();
};

internshipSchema.methods.addApplication = function(applicationData) {
  // Check if user already applied
  const existingApplication = this.applications.find(app => 
    app.applicantId.toString() === applicationData.applicantId.toString()
  );
  
  if (existingApplication) {
    throw new Error('User has already applied for this internship');
  }
  
  if (!this.isActive) {
    throw new Error('This internship is not accepting applications');
  }
  
  this.applications.push(applicationData);
  return this.save();
};

internshipSchema.methods.updateApplicationStatus = function(applicantId, status, reviewData = {}) {
  const application = this.applications.find(app => 
    app.applicantId.toString() === applicantId.toString()
  );
  
  if (!application) {
    throw new Error('Application not found');
  }
  
  application.status = status;
  if (reviewData.reviewedBy) application.reviewedBy = reviewData.reviewedBy;
  if (reviewData.feedback) application.feedback = reviewData.feedback;
  if (reviewData.interviewNotes) application.interviewNotes = reviewData.interviewNotes;
  application.reviewedAt = new Date();
  
  // Update filled count if selected
  if (status === 'selected') {
    this.openings.filled += 1;
  }
  
  return this.save();
};

internshipSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

internshipSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

module.exports = mongoose.model('Internship', internshipSchema);