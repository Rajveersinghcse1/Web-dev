/**
 * Enhanced Hackathon Model
 * Improved with relationships, indexing, validation, and performance optimizations
 */

const mongoose = require('mongoose');

// Participant Schema for tracking registrations
const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  teamName: {
    type: String,
    trim: true,
    maxlength: [100, 'Team name cannot exceed 100 characters']
  },
  teamMembers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    role: {
      type: String,
      enum: ['leader', 'developer', 'designer', 'researcher', 'other'],
      default: 'developer'
    },
    skills: [String],
    experience: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    }
  }],
  registeredAt: {
    type: Date,
    default: Date.now
  },
  checkInTime: {
    type: Date
  },
  projectSubmitted: {
    type: Boolean,
    default: false
  },
  submissionUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Submission URL must be a valid URL'
    }
  },
  pitchVideoUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Pitch video URL must be a valid URL'
    }
  },
  githubRepo: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/(www\.)?github\.com\//.test(v);
      },
      message: 'Please enter a valid GitHub repository URL'
    }
  },
  status: {
    type: String,
    enum: ['registered', 'checked_in', 'submitted', 'disqualified'],
    default: 'registered'
  },
  dietary: {
    restrictions: [String],
    allergies: [String]
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  tshirtSize: {
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
  }
});

// Prize Schema for detailed prize information
const prizeSchema = new mongoose.Schema({
  place: {
    type: String,
    required: true,
    maxlength: [50, 'Prize place cannot exceed 50 characters']
  },
  amount: {
    type: String,
    required: true,
    maxlength: [50, 'Prize amount cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxlength: [200, 'Prize description cannot exceed 200 characters']
  },
  category: {
    type: String,
    enum: ['overall', 'track_specific', 'special', 'sponsor'],
    default: 'overall'
  },
  sponsor: {
    type: String,
    maxlength: [100, 'Sponsor name cannot exceed 100 characters']
  },
  eligibility: {
    type: String,
    maxlength: [300, 'Prize eligibility cannot exceed 300 characters']
  },
  deliveryMethod: {
    type: String,
    enum: ['cash', 'check', 'digital', 'physical', 'service'],
    default: 'cash'
  },
  winners: [{
    teamName: String,
    members: [String],
    projectUrl: String,
    announcedAt: {
      type: Date,
      default: Date.now
    }
  }]
});

// Schedule Item Schema for event timeline
const scheduleItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: [200, 'Schedule item title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Schedule item description cannot exceed 500 characters']
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  location: {
    type: String,
    maxlength: [200, 'Location cannot exceed 200 characters']
  },
  type: {
    type: String,
    enum: ['opening', 'workshop', 'meal', 'presentation', 'networking', 'judging', 'closing', 'other'],
    default: 'other'
  },
  speaker: {
    name: String,
    title: String,
    company: String,
    bio: String
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  capacity: {
    type: Number,
    min: 0
  },
  registrations: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }]
});

// Sponsor Schema for sponsor information
const sponsorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: [100, 'Sponsor name cannot exceed 100 characters']
  },
  logo: {
    type: String
  },
  website: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Website URL must be a valid URL'
    }
  },
  tier: {
    type: String,
    enum: ['title', 'presenting', 'gold', 'silver', 'bronze', 'in_kind', 'community'],
    required: true
  },
  description: {
    type: String,
    maxlength: [500, 'Sponsor description cannot exceed 500 characters']
  },
  benefits: [String],
  contactPerson: {
    name: String,
    email: String,
    phone: String
  },
  booth: {
    number: String,
    location: String,
    setup: String
  }
});

// Judge Schema for hackathon judges
const judgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: [100, 'Judge name cannot exceed 100 characters']
  },
  title: {
    type: String,
    maxlength: [100, 'Judge title cannot exceed 100 characters']
  },
  company: {
    type: String,
    maxlength: [100, 'Judge company cannot exceed 100 characters']
  },
  bio: {
    type: String,
    maxlength: [1000, 'Judge bio cannot exceed 1000 characters']
  },
  expertise: [String],
  photo: {
    type: String
  },
  linkedinUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/(www\.)?linkedin\.com\//.test(v);
      },
      message: 'Please enter a valid LinkedIn URL'
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
  phone: {
    type: String
  },
  assignedTracks: [String],
  availability: {
    start: Date,
    end: Date
  }
});

// Enhanced Hackathon Schema
const hackathonSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Hackathon title is required'],
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
    required: [true, 'Hackathon description is required'],
    maxlength: [3000, 'Description cannot exceed 3000 characters']
  },
  
  summary: {
    type: String,
    maxlength: [300, 'Summary cannot exceed 300 characters']
  },
  
  tagline: {
    type: String,
    maxlength: [100, 'Tagline cannot exceed 100 characters']
  },
  
  // Organizer Information
  organizer: {
    name: {
      type: String,
      required: [true, 'Organizer name is required'],
      trim: true,
      maxlength: [200, 'Organizer name cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [1000, 'Organizer description cannot exceed 1000 characters']
    },
    website: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Organizer website must be a valid URL'
      }
    },
    logo: {
      type: String
    },
    email: {
      type: String,
      required: true,
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
      validate: {
        validator: function(v) {
          return !v || /^\+?[\d\s\-\(\)]{10,}$/.test(v);
        },
        message: 'Please enter a valid phone number'
      }
    },
    socialMedia: {
      twitter: String,
      linkedin: String,
      facebook: String,
      instagram: String
    }
  },
  
  // Event Classification
  type: {
    type: String,
    required: true,
    enum: {
      values: [
        'general', 'ai_ml', 'web_development', 'mobile_development',
        'blockchain', 'cybersecurity', 'fintech', 'healthtech',
        'edtech', 'gaming', 'social_good', 'sustainability',
        'iot', 'ar_vr', 'data_science', 'other'
      ],
      message: '{VALUE} is not a valid hackathon type'
    },
    index: true
  },
  
  category: {
    type: String,
    enum: ['student', 'professional', 'mixed', 'corporate', 'university'],
    default: 'mixed'
  },
  
  difficulty: {
    type: String,
    required: true,
    enum: {
      values: ['beginner', 'intermediate', 'advanced', 'mixed'],
      message: '{VALUE} is not a valid difficulty level'
    },
    default: 'mixed'
  },
  
  // Event Format and Location
  eventFormat: {
    type: String,
    required: true,
    enum: {
      values: ['in_person', 'virtual', 'hybrid'],
      message: '{VALUE} is not a valid event format'
    },
    index: true
  },
  
  location: {
    venue: {
      name: {
        type: String,
        maxlength: [200, 'Venue name cannot exceed 200 characters']
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
      coordinates: {
        latitude: {
          type: Number,
          min: -90,
          max: 90
        },
        longitude: {
          type: Number,
          min: -180,
          max: 180
        }
      },
      capacity: {
        type: Number,
        min: 1
      },
      facilities: [String],
      parking: {
        available: Boolean,
        cost: String,
        instructions: String
      },
      accessibility: {
        wheelchairAccessible: Boolean,
        notes: String
      }
    },
    virtual: {
      platform: {
        type: String,
        enum: ['zoom', 'teams', 'discord', 'slack', 'custom', 'other']
      },
      link: {
        type: String,
        validate: {
          validator: function(v) {
            return !v || /^https?:\/\/.+/.test(v);
          },
          message: 'Virtual link must be a valid URL'
        }
      },
      password: String,
      instructions: String
    },
    timezone: {
      type: String,
      maxlength: [50, 'Timezone cannot exceed 50 characters']
    }
  },
  
  // Event Timeline
  timeline: {
    registrationStart: {
      type: Date,
      required: true,
      index: true
    },
    registrationEnd: {
      type: Date,
      required: true,
      index: true
    },
    eventStart: {
      type: Date,
      required: true,
      index: true
    },
    eventEnd: {
      type: Date,
      required: true,
      index: true
    },
    submissionDeadline: {
      type: Date,
      required: true
    },
    judgingStart: {
      type: Date
    },
    judgingEnd: {
      type: Date
    },
    resultsAnnouncement: {
      type: Date
    }
  },
  
  duration: {
    hours: {
      type: Number,
      required: true,
      min: 1
    },
    description: {
      type: String,
      maxlength: [100, 'Duration description cannot exceed 100 characters']
    }
  },
  
  // Participation Details
  participation: {
    maxParticipants: {
      type: Number,
      min: 1,
      index: true
    },
    currentParticipants: {
      type: Number,
      min: 0,
      default: 0
    },
    teamSize: {
      min: {
        type: Number,
        min: 1,
        default: 1
      },
      max: {
        type: Number,
        min: 1,
        default: 6
      }
    },
    eligibility: {
      education: {
        type: String,
        enum: ['any', 'high_school', 'undergraduate', 'graduate', 'professional'],
        default: 'any'
      },
      experience: {
        type: String,
        enum: ['any', 'beginner', 'intermediate', 'advanced'],
        default: 'any'
      },
      age: {
        min: {
          type: Number,
          min: 13
        },
        max: {
          type: Number,
          max: 100
        }
      },
      geographic: [String],
      other: [String]
    },
    registrationFee: {
      amount: {
        type: Number,
        min: 0,
        default: 0
      },
      currency: {
        type: String,
        default: 'USD'
      },
      description: String,
      refundPolicy: String
    }
  },
  
  // Registration and Applications
  registrationUrl: {
    type: String,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Registration URL must be a valid URL'
    }
  },
  
  participants: [participantSchema],
  
  // Event Content and Structure
  themes: [{
    type: String,
    trim: true,
    maxlength: [100, 'Theme cannot exceed 100 characters']
  }],
  
  tracks: [{
    name: {
      type: String,
      required: true,
      maxlength: [100, 'Track name cannot exceed 100 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Track description cannot exceed 500 characters']
    },
    sponsor: String,
    prizePool: String,
    judges: [String],
    requirements: [String]
  }],
  
  challenges: [{
    title: {
      type: String,
      required: true,
      maxlength: [200, 'Challenge title cannot exceed 200 characters']
    },
    description: {
      type: String,
      required: true,
      maxlength: [1000, 'Challenge description cannot exceed 1000 characters']
    },
    sponsor: String,
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'intermediate'
    },
    prize: String,
    resources: [String],
    apis: [String],
    datasets: [String]
  }],
  
  // Schedule and Events
  schedule: [scheduleItemSchema],
  
  // Resources and Support
  resources: [{
    title: {
      type: String,
      required: true,
      maxlength: [200, 'Resource title cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [500, 'Resource description cannot exceed 500 characters']
    },
    type: {
      type: String,
      enum: ['api', 'dataset', 'tool', 'tutorial', 'template', 'documentation', 'other'],
      required: true
    },
    url: {
      type: String,
      validate: {
        validator: function(v) {
          return !v || /^https?:\/\/.+/.test(v);
        },
        message: 'Resource URL must be a valid URL'
      }
    },
    provider: String,
    tags: [String]
  }],
  
  // Prizes and Awards
  prizePool: {
    total: {
      type: String,
      maxlength: [50, 'Total prize pool cannot exceed 50 characters']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    description: String
  },
  
  prizes: [prizeSchema],
  
  // People
  sponsors: [sponsorSchema],
  judges: [judgeSchema],
  
  mentors: [{
    name: {
      type: String,
      required: true,
      maxlength: [100, 'Mentor name cannot exceed 100 characters']
    },
    title: String,
    company: String,
    expertise: [String],
    bio: {
      type: String,
      maxlength: [500, 'Mentor bio cannot exceed 500 characters']
    },
    photo: String,
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
    linkedinUrl: String,
    availability: {
      start: Date,
      end: Date,
      hours: String
    }
  }],
  
  // Additional Information
  requirements: [{
    type: String,
    trim: true,
    maxlength: [200, 'Requirement cannot exceed 200 characters']
  }],
  
  rules: [{
    title: {
      type: String,
      required: true,
      maxlength: [100, 'Rule title cannot exceed 100 characters']
    },
    description: {
      type: String,
      required: true,
      maxlength: [500, 'Rule description cannot exceed 500 characters']
    },
    category: {
      type: String,
      enum: ['participation', 'submission', 'conduct', 'judging', 'prizes', 'other'],
      default: 'other'
    }
  }],
  
  // Files and Media
  files: [{
    originalName: String,
    filename: String,
    url: String,
    size: Number,
    mimetype: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  fileUrl: {
    type: String
  },
  
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String,
    type: {
      type: String,
      enum: ['cover', 'venue', 'sponsor', 'team', 'other'],
      default: 'other'
    }
  }],
  
  videos: [{
    url: {
      type: String,
      required: true,
      validate: {
        validator: function(v) {
          return /^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//.test(v);
        },
        message: 'Please enter a valid video URL'
      }
    },
    title: String,
    type: {
      type: String,
      enum: ['promo', 'recap', 'tutorial', 'presentation', 'other'],
      default: 'other'
    }
  }],
  
  // Communication
  communication: {
    discord: String,
    slack: String,
    email: String,
    announcements: [{
      title: {
        type: String,
        required: true
      },
      content: {
        type: String,
        required: true
      },
      author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      sentAt: {
        type: Date,
        default: Date.now
      },
      urgent: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Status and Visibility
  status: {
    type: String,
    required: true,
    enum: {
      values: ['draft', 'upcoming', 'registration_open', 'registration_closed', 'in_progress', 'judging', 'completed', 'cancelled'],
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
  
  visibility: {
    type: String,
    enum: ['public', 'private', 'invitation_only'],
    default: 'public',
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
    register: {
      type: Number,
      default: 0,
      min: 0
    },
    sponsor: {
      type: Number,
      default: 0,
      min: 0
    },
    resource: {
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
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for Performance Optimization
hackathonSchema.index({ title: 'text', description: 'text', 'organizer.name': 'text', tags: 'text' });
hackathonSchema.index({ type: 1, eventFormat: 1, status: 1 });
hackathonSchema.index({ 'timeline.registrationStart': 1, 'timeline.registrationEnd': 1 });
hackathonSchema.index({ 'timeline.eventStart': 1, 'timeline.eventEnd': 1 });
hackathonSchema.index({ featured: 1, trending: 1, publishedAt: -1 });
hackathonSchema.index({ 'location.venue.address.country': 1, eventFormat: 1 });
hackathonSchema.index({ createdBy: 1, createdAt: -1 });
hackathonSchema.index({ isDeleted: 1, status: 1, visibility: 1 });
hackathonSchema.index({ 'views.total': -1, 'participation.currentParticipants': -1 });

// Virtual Properties
hackathonSchema.virtual('availableSpots').get(function() {
  if (!this.participation.maxParticipants) return null;
  return this.participation.maxParticipants - this.participation.currentParticipants;
});

hackathonSchema.virtual('registrationOpen').get(function() {
  const now = new Date();
  return now >= this.timeline.registrationStart && now <= this.timeline.registrationEnd;
});

hackathonSchema.virtual('isUpcoming').get(function() {
  return new Date() < this.timeline.eventStart;
});

hackathonSchema.virtual('isOngoing').get(function() {
  const now = new Date();
  return now >= this.timeline.eventStart && now <= this.timeline.eventEnd;
});

hackathonSchema.virtual('isCompleted').get(function() {
  return new Date() > this.timeline.eventEnd;
});

hackathonSchema.virtual('daysUntilStart').get(function() {
  if (!this.isUpcoming) return 0;
  
  const now = new Date();
  const start = new Date(this.timeline.eventStart);
  const diffTime = start - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

hackathonSchema.virtual('url').get(function() {
  return `/hackathons/${this.slug || this._id}`;
});

// Pre-save Middleware
hackathonSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }
  
  // Update participant count
  this.participation.currentParticipants = this.participants.length;
  
  // Auto-update status based on timeline
  const now = new Date();
  
  if (this.status === 'upcoming' && now >= this.timeline.registrationStart) {
    this.status = 'registration_open';
  }
  
  if (this.status === 'registration_open' && now > this.timeline.registrationEnd) {
    this.status = 'registration_closed';
  }
  
  if ((this.status === 'registration_closed' || this.status === 'registration_open') && now >= this.timeline.eventStart) {
    this.status = 'in_progress';
  }
  
  if (this.status === 'in_progress' && now > this.timeline.eventEnd) {
    this.status = 'judging';
  }
  
  if (this.status === 'judging' && this.timeline.resultsAnnouncement && now > this.timeline.resultsAnnouncement) {
    this.status = 'completed';
  }
  
  if (this.isModified('status') && ['registration_open', 'upcoming'].includes(this.status) && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  this.updatedAt = new Date();
  next();
});

// Static Methods
hackathonSchema.statics.findActive = function() {
  return this.find({
    status: { $in: ['upcoming', 'registration_open', 'registration_closed', 'in_progress'] },
    visibility: 'public',
    isDeleted: false
  }).sort({ featured: -1, 'timeline.eventStart': 1 });
};

hackathonSchema.statics.findUpcoming = function() {
  return this.find({
    'timeline.eventStart': { $gt: new Date() },
    status: { $in: ['upcoming', 'registration_open', 'registration_closed'] },
    visibility: 'public',
    isDeleted: false
  }).sort({ 'timeline.eventStart': 1 });
};

hackathonSchema.statics.findFeatured = function() {
  return this.find({
    featured: true,
    visibility: 'public',
    isDeleted: false
  }).sort({ 'timeline.eventStart': 1 });
};

hackathonSchema.statics.findByType = function(type) {
  return this.find({
    type,
    visibility: 'public',
    isDeleted: false
  }).sort({ featured: -1, 'timeline.eventStart': 1 });
};

hackathonSchema.statics.findRegistrationOpen = function() {
  const now = new Date();
  return this.find({
    'timeline.registrationStart': { $lte: now },
    'timeline.registrationEnd': { $gte: now },
    status: 'registration_open',
    visibility: 'public',
    isDeleted: false
  }).sort({ 'timeline.eventStart': 1 });
};

hackathonSchema.statics.searchHackathons = function(query) {
  return this.find({
    $text: { $search: query },
    visibility: 'public',
    isDeleted: false
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

// Instance Methods
hackathonSchema.methods.incrementViews = function(userId = null) {
  this.views.total += 1;
  this.views.thisMonth += 1;
  
  if (userId) {
    this.views.unique += 1;
  }
  
  return this.save();
};

hackathonSchema.methods.addParticipant = function(participantData) {
  // Check if user already registered
  const existingParticipant = this.participants.find(p => 
    p.userId.toString() === participantData.userId.toString()
  );
  
  if (existingParticipant) {
    throw new Error('User is already registered for this hackathon');
  }
  
  if (!this.registrationOpen) {
    throw new Error('Registration is not open for this hackathon');
  }
  
  if (this.participation.maxParticipants && this.participation.currentParticipants >= this.participation.maxParticipants) {
    throw new Error('Hackathon is full');
  }
  
  this.participants.push(participantData);
  return this.save();
};

hackathonSchema.methods.removeParticipant = function(userId) {
  this.participants = this.participants.filter(p => 
    p.userId.toString() !== userId.toString()
  );
  return this.save();
};

hackathonSchema.methods.updateParticipantStatus = function(userId, status, additionalData = {}) {
  const participant = this.participants.find(p => 
    p.userId.toString() === userId.toString()
  );
  
  if (!participant) {
    throw new Error('Participant not found');
  }
  
  participant.status = status;
  
  if (additionalData.checkInTime) participant.checkInTime = additionalData.checkInTime;
  if (additionalData.submissionUrl) participant.submissionUrl = additionalData.submissionUrl;
  if (additionalData.githubRepo) participant.githubRepo = additionalData.githubRepo;
  if (additionalData.pitchVideoUrl) participant.pitchVideoUrl = additionalData.pitchVideoUrl;
  
  if (status === 'submitted') {
    participant.projectSubmitted = true;
  }
  
  return this.save();
};

hackathonSchema.methods.addAnnouncement = function(announcementData) {
  this.communication.announcements.push(announcementData);
  return this.save();
};

hackathonSchema.methods.softDelete = function(deletedBy) {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

hackathonSchema.methods.restore = function() {
  this.isDeleted = false;
  this.deletedAt = undefined;
  this.deletedBy = undefined;
  return this.save();
};

module.exports = mongoose.model('Hackathon', hackathonSchema);