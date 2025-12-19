/**
 * Internship Model for Admin-Managed Internship Opportunities
 * Handles internship postings with mentor details and applicant tracking
 */

const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Internship title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  company: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  logo: {
    type: String,
    default: '🏢'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Location & Type
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  remote: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['In-person', 'Remote', 'Hybrid'],
    default: 'In-person'
  },
  
  // Duration & Compensation
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true,
    maxlength: [50, 'Duration cannot exceed 50 characters']
    // e.g., "12 weeks", "3 months", "Summer 2024"
  },
  stipend: {
    type: String,
    required: [true, 'Stipend information is required'],
    trim: true,
    maxlength: [100, 'Stipend cannot exceed 100 characters']
    // e.g., "$8,500/month", "₹25,000/month", "Unpaid"
  },
  
  // CRITICAL: Mentor Information (Key Requirement)
  mentor: {
    name: {
      type: String,
      required: [true, 'Mentor name is required'],
      trim: true,
      maxlength: [100, 'Mentor name cannot exceed 100 characters']
    },
    phone: {
      type: String,
      required: [true, 'Mentor phone number is required'],
      trim: true,
      validate: {
        validator: function(v) {
          // Allow various phone number formats: +1-234-567-8900, (123) 456-7890, etc.
          return /^[\+]?[1-9][\d]{0,15}$|^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(v.replace(/[\s\-\(\)\.]/g, ''));
        },
        message: 'Please provide a valid phone number'
      }
    },
    email: {
      type: String,
      required: [true, 'Mentor email is required'],
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    designation: {
      type: String,
      trim: true,
      maxlength: [100, 'Designation cannot exceed 100 characters']
      // e.g., "Senior Software Engineer", "Product Manager", "CTO"
    },
    linkedIn: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true; // Allow empty
          return /^https?:\/\/(www\.)?linkedin\.com\/in\//.test(v);
        },
        message: 'LinkedIn URL must be a valid LinkedIn profile URL'
      }
    },
    bio: {
      type: String,
      maxlength: [500, 'Mentor bio cannot exceed 500 characters']
    }
  },
  
  // Guidance & Requirements
  guidanceDescription: {
    type: String,
    required: [true, 'Guidance description is required'],
    maxlength: [1000, 'Guidance description cannot exceed 1000 characters']
    // What kind of guidance/mentorship the mentor will provide
  },
  requirements: [{
    type: String,
    trim: true,
    maxlength: [200, 'Requirement cannot exceed 200 characters']
  }],
  skills: [{
    type: String,
    trim: true,
    maxlength: [50, 'Skill cannot exceed 50 characters']
  }],
  
  // Application Details
  level: {
    type: String,
    enum: ['Entry Level', 'Intermediate', 'Advanced', 'Expert'],
    default: 'Intermediate'
  },
  team: {
    type: String,
    trim: true,
    maxlength: [100, 'Team name cannot exceed 100 characters']
  },
  department: {
    type: String,
    trim: true,
    maxlength: [100, 'Department cannot exceed 100 characters']
  },
  
  // Capacity & Deadlines
  spots: {
    type: Number,
    required: [true, 'Total spots is required'],
    min: [1, 'Must have at least 1 spot'],
    max: [100, 'Cannot exceed 100 spots']
  },
  spotsAvailable: {
    type: Number,
    required: [true, 'Available spots is required'],
    min: [0, 'Available spots cannot be negative']
  },
  applicationDeadline: {
    type: Date,
    required: [true, 'Application deadline is required'],
    validate: {
      validator: function(v) {
        return v > new Date();
      },
      message: 'Application deadline must be in the future'
    }
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(v) {
        if (!v) return true; // Allow empty
        return v > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  
  // CRITICAL: Student Applications Tracking (Key Requirement)
  applicants: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required for applicant']
    },
    name: {
      type: String,
      required: [true, 'Applicant name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Applicant email is required'],
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    avatar: {
      type: String,
      default: '👨‍💻'
    },
    appliedDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewing', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected', 'withdrawn'],
      default: 'pending'
    },
    resume: {
      url: String,
      filename: String,
      originalName: String
    },
    coverLetter: {
      type: String,
      maxlength: [1000, 'Cover letter cannot exceed 1000 characters']
    },
    portfolio: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\//.test(v);
        },
        message: 'Portfolio URL must be a valid HTTP/HTTPS URL'
      }
    },
    interviewDate: {
      type: Date
    },
    feedback: {
      type: String,
      maxlength: [500, 'Feedback cannot exceed 500 characters']
    },
    rating: {
      type: Number,
      min: [1, 'Rating must be between 1 and 5'],
      max: [5, 'Rating must be between 1 and 5']
    }
  }],
  
  // Benefits & Perks
  benefits: [{
    type: String,
    trim: true,
    maxlength: [100, 'Benefit cannot exceed 100 characters']
  }],
  
  // Additional Information
  workingHours: {
    type: String,
    maxlength: [100, 'Working hours cannot exceed 100 characters']
    // e.g., "9 AM - 5 PM", "Flexible", "20 hours/week"
  },
  applicationProcess: [{
    step: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      maxlength: [200, 'Step description cannot exceed 200 characters']
    }
  }],
  
  // Visibility & Status
  featured: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'draft', 'paused'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Analytics & Tracking
  analytics: {
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative']
    },
    applications: {
      type: Number,
      default: 0,
      min: [0, 'Applications cannot be negative']
    },
    acceptanceRate: {
      type: Number,
      default: 0,
      min: [0, 'Acceptance rate cannot be negative'],
      max: [100, 'Acceptance rate cannot exceed 100']
    },
    averageRating: {
      type: Number,
      default: 0,
      min: [0, 'Average rating cannot be negative'],
      max: [5, 'Average rating cannot exceed 5']
    }
  },
  
  // Admin Control & Tracking
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Posted by reference is required']
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
internshipSchema.index({ company: 1, status: 1 });
internshipSchema.index({ location: 1, remote: 1 });
internshipSchema.index({ level: 1, type: 1 });
internshipSchema.index({ applicationDeadline: 1 });
internshipSchema.index({ startDate: 1 });
internshipSchema.index({ 'applicants.studentId': 1 });
internshipSchema.index({ 'applicants.status': 1 });
internshipSchema.index({ featured: -1, createdAt: -1 });
internshipSchema.index({ 'analytics.views': -1 });
internshipSchema.index({ skills: 1 });
internshipSchema.index({ title: 'text', description: 'text', company: 'text' });

// Virtual for applications count
internshipSchema.virtual('applicationCount').get(function() {
  return this.applicants ? this.applicants.length : 0;
});

// Virtual for accepted applications count
internshipSchema.virtual('acceptedCount').get(function() {
  if (!this.applicants) return 0;
  return this.applicants.filter(app => app.status === 'accepted').length;
});

// Virtual for pending applications count
internshipSchema.virtual('pendingCount').get(function() {
  if (!this.applicants) return 0;
  return this.applicants.filter(app => app.status === 'pending').length;
});

// Virtual for days until deadline
internshipSchema.virtual('daysUntilDeadline').get(function() {
  if (!this.applicationDeadline) return null;
  const now = new Date();
  const diffTime = this.applicationDeadline - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for is deadline passed
internshipSchema.virtual('isDeadlinePassed').get(function() {
  if (!this.applicationDeadline) return false;
  return this.applicationDeadline < new Date();
});

// Pre-save middleware
internshipSchema.pre('save', function(next) {
  // Update analytics
  if (this.applicants) {
    this.analytics.applications = this.applicants.length;
    
    const acceptedApps = this.applicants.filter(app => app.status === 'accepted').length;
    if (this.applicants.length > 0) {
      this.analytics.acceptanceRate = Math.round((acceptedApps / this.applicants.length) * 100);
    }
    
    // Calculate average rating
    const ratingsApps = this.applicants.filter(app => app.rating);
    if (ratingsApps.length > 0) {
      const totalRating = ratingsApps.reduce((sum, app) => sum + app.rating, 0);
      this.analytics.averageRating = Math.round((totalRating / ratingsApps.length) * 10) / 10;
    }
  }
  
  // Update available spots
  const acceptedCount = this.acceptedCount;
  this.spotsAvailable = Math.max(0, this.spots - acceptedCount);
  
  // Auto-close if no spots available
  if (this.spotsAvailable === 0 && this.status === 'active') {
    this.status = 'closed';
  }
  
  // Update lastModified
  this.lastModified = new Date();
  
  next();
});

// Static methods
internshipSchema.statics.findActive = function() {
  return this.find({ 
    status: 'active', 
    approvalStatus: 'approved',
    applicationDeadline: { $gt: new Date() }
  }).sort({ featured: -1, createdAt: -1 });
};

internshipSchema.statics.findByCompany = function(company) {
  return this.find({ 
    company: new RegExp(company, 'i'), 
    status: 'active',
    approvalStatus: 'approved'
  }).sort({ createdAt: -1 });
};

internshipSchema.statics.findByLocation = function(location) {
  return this.find({ 
    location: new RegExp(location, 'i'), 
    status: 'active',
    approvalStatus: 'approved'
  }).sort({ createdAt: -1 });
};

internshipSchema.statics.findByLevel = function(level) {
  return this.find({ 
    level, 
    status: 'active',
    approvalStatus: 'approved'
  }).sort({ createdAt: -1 });
};

internshipSchema.statics.findRemote = function() {
  return this.find({ 
    $or: [{ remote: true }, { type: 'Remote' }, { type: 'Hybrid' }],
    status: 'active',
    approvalStatus: 'approved'
  }).sort({ createdAt: -1 });
};

internshipSchema.statics.findFeatured = function() {
  return this.find({ 
    featured: true, 
    status: 'active',
    approvalStatus: 'approved'
  }).sort({ createdAt: -1 });
};

internshipSchema.statics.findByStudent = function(studentId) {
  return this.find({
    'applicants.studentId': studentId,
    approvalStatus: 'approved'
  }).sort({ createdAt: -1 });
};

internshipSchema.statics.searchInternships = function(searchTerm, filters = {}) {
  const query = {
    $and: [
      { status: 'active' },
      { approvalStatus: 'approved' },
      { applicationDeadline: { $gt: new Date() } },
      {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { company: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { skills: { $in: [new RegExp(searchTerm, 'i')] } },
          { location: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ]
  };

  // Apply filters
  if (filters.level) query.$and.push({ level: filters.level });
  if (filters.type) query.$and.push({ type: filters.type });
  if (filters.remote !== undefined) query.$and.push({ remote: filters.remote });
  if (filters.company) query.$and.push({ company: new RegExp(filters.company, 'i') });

  return this.find(query).sort({ featured: -1, 'analytics.views': -1 });
};

// Instance methods
internshipSchema.methods.addApplicant = function(applicantData) {
  // Check if user already applied
  const existingApplication = this.applicants.find(
    app => app.studentId.toString() === applicantData.studentId.toString()
  );
  
  if (existingApplication) {
    throw new Error('User has already applied for this internship');
  }
  
  // Check if spots available
  if (this.spotsAvailable <= 0) {
    throw new Error('No spots available for this internship');
  }
  
  // Check if deadline passed
  if (this.isDeadlinePassed) {
    throw new Error('Application deadline has passed');
  }
  
  this.applicants.push(applicantData);
  return this.save();
};

internshipSchema.methods.updateApplicationStatus = function(studentId, status, feedback = '') {
  const application = this.applicants.find(
    app => app.studentId.toString() === studentId.toString()
  );
  
  if (!application) {
    throw new Error('Application not found');
  }
  
  application.status = status;
  if (feedback) application.feedback = feedback;
  
  return this.save();
};

internshipSchema.methods.removeApplication = function(studentId) {
  this.applicants = this.applicants.filter(
    app => app.studentId.toString() !== studentId.toString()
  );
  return this.save();
};

internshipSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save();
};

internshipSchema.methods.getApplicationsByStatus = function(status) {
  return this.applicants.filter(app => app.status === status);
};

internshipSchema.methods.scheduleInterview = function(studentId, interviewDate) {
  const application = this.applicants.find(
    app => app.studentId.toString() === studentId.toString()
  );
  
  if (!application) {
    throw new Error('Application not found');
  }
  
  application.status = 'interview_scheduled';
  application.interviewDate = interviewDate;
  
  return this.save();
};

const Internship = mongoose.model('Internship', internshipSchema);

module.exports = Internship;