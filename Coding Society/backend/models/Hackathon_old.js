/**
 * Hackathon Model for Admin-Managed Hackathon Events
 * Handles hackathon events with participant and team tracking
 */

const mongoose = require('mongoose');

const hackathonSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Hackathon title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  organizer: {
    type: String,
    required: [true, 'Organizer name is required'],
    trim: true,
    maxlength: [100, 'Organizer name cannot exceed 100 characters']
  },
  logo: {
    type: String,
    default: '🏆'
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
  type: {
    type: String,
    enum: ['In-person', 'Virtual', 'Hybrid'],
    default: 'In-person'
  },
  venue: {
    name: String,
    address: String,
    capacity: Number
  },
  
  // Duration & Timeline
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true,
    maxlength: [50, 'Duration cannot exceed 50 characters']
    // e.g., "48 hours", "3 days", "Weekend"
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required'],
    validate: {
      validator: function(v) {
        return v > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  registrationDeadline: {
    type: Date,
    required: [true, 'Registration deadline is required'],
    validate: {
      validator: function(v) {
        return v < this.startDate;
      },
      message: 'Registration deadline must be before start date'
    }
  },
  
  // Competition Details
  prizePool: {
    type: String,
    required: [true, 'Prize pool is required'],
    trim: true,
    maxlength: [100, 'Prize pool cannot exceed 100 characters']
    // e.g., "$100,000", "₹5,00,000"
  },
  prizes: [{
    place: {
      type: String,
      required: [true, 'Prize place is required'],
      trim: true
      // e.g., "1st", "2nd", "3rd", "Best Innovation", "People's Choice"
    },
    amount: {
      type: String,
      required: [true, 'Prize amount is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Prize description is required'],
      trim: true,
      maxlength: [200, 'Prize description cannot exceed 200 characters']
    },
    sponsored_by: {
      type: String,
      trim: true
    }
  }],
  
  // Themes & Categories
  themes: [{
    type: String,
    trim: true,
    maxlength: [100, 'Theme cannot exceed 100 characters']
    // e.g., "AI/ML", "Blockchain", "Healthcare", "Education"
  }],
  categories: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      maxlength: [300, 'Category description cannot exceed 300 characters']
    },
    prize: {
      type: String
    }
  }],
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'All Levels'],
    default: 'All Levels'
  },
  
  // Requirements & Rules
  requirements: [{
    type: String,
    trim: true,
    maxlength: [200, 'Requirement cannot exceed 200 characters']
  }],
  rules: [{
    type: String,
    trim: true,
    maxlength: [300, 'Rule cannot exceed 300 characters']
  }],
  eligibility: [{
    type: String,
    trim: true,
    maxlength: [200, 'Eligibility criteria cannot exceed 200 characters']
  }],
  
  // Capacity Management
  maxParticipants: {
    type: Number,
    required: [true, 'Maximum participants is required'],
    min: [1, 'Must allow at least 1 participant'],
    max: [10000, 'Cannot exceed 10,000 participants']
  },
  maxTeamSize: {
    type: Number,
    default: 4,
    min: [1, 'Team size must be at least 1'],
    max: [10, 'Team size cannot exceed 10']
  },
  minTeamSize: {
    type: Number,
    default: 1,
    min: [1, 'Minimum team size must be at least 1']
  },
  
  // CRITICAL: Participants Tracking (Similar to Innovation)
  participants: [{
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required for participant']
    },
    name: {
      type: String,
      required: [true, 'Participant name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Participant email is required'],
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
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HackathonTeam'
    },
    role: {
      type: String,
      enum: ['Team Leader', 'Developer', 'Designer', 'Data Scientist', 'Product Manager', 'Other'],
      default: 'Developer'
    },
    skills: [{
      type: String,
      trim: true
    }],
    experience: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      default: 'Intermediate'
    },
    registeredDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'checked_in', 'no_show', 'cancelled'],
      default: 'registered'
    },
    checkedInDate: {
      type: Date
    }
  }],
  
  // CRITICAL: Team Management (Similar to Innovation)
  teams: [{
    teamName: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      maxlength: [100, 'Team name cannot exceed 100 characters']
    },
    members: [{
      studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      role: {
        type: String,
        enum: ['Team Leader', 'Developer', 'Designer', 'Data Scientist', 'Product Manager', 'Other'],
        default: 'Developer'
      },
      joinedDate: {
        type: Date,
        default: Date.now
      }
    }],
    projectName: {
      type: String,
      trim: true,
      maxlength: [150, 'Project name cannot exceed 150 characters']
    },
    projectDescription: {
      type: String,
      maxlength: [1000, 'Project description cannot exceed 1000 characters']
    },
    category: {
      type: String,
      trim: true
    },
    technologies: [{
      type: String,
      trim: true
    }],
    githubRepo: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/(www\.)?github\.com\//.test(v);
        },
        message: 'GitHub URL must be a valid GitHub repository URL'
      }
    },
    demoUrl: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\//.test(v);
        },
        message: 'Demo URL must be a valid HTTP/HTTPS URL'
      }
    },
    presentationUrl: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\//.test(v);
        },
        message: 'Presentation URL must be a valid HTTP/HTTPS URL'
      }
    },
    status: {
      type: String,
      enum: ['forming', 'registered', 'working', 'submitted', 'disqualified', 'winner'],
      default: 'forming'
    },
    submissionDate: {
      type: Date
    },
    score: {
      technical: { type: Number, default: 0, min: 0, max: 100 },
      innovation: { type: Number, default: 0, min: 0, max: 100 },
      presentation: { type: Number, default: 0, min: 0, max: 100 },
      impact: { type: Number, default: 0, min: 0, max: 100 },
      total: { type: Number, default: 0, min: 0, max: 400 }
    },
    rank: {
      type: Number
    },
    feedback: {
      type: String,
      maxlength: [1000, 'Feedback cannot exceed 1000 characters']
    }
  }],
  
  // Sponsors & Partners
  sponsors: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    logo: {
      type: String
    },
    website: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\//.test(v);
        },
        message: 'Website URL must be a valid HTTP/HTTPS URL'
      }
    },
    tier: {
      type: String,
      enum: ['Title', 'Platinum', 'Gold', 'Silver', 'Bronze', 'Partner'],
      default: 'Partner'
    },
    contribution: {
      type: String,
      maxlength: [200, 'Contribution description cannot exceed 200 characters']
    }
  }],
  
  // Judges & Mentors
  judges: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    designation: {
      type: String,
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      maxlength: [500, 'Judge bio cannot exceed 500 characters']
    },
    avatar: {
      type: String,
      default: '👨‍💼'
    },
    linkedIn: {
      type: String,
      validate: {
        validator: function(v) {
          if (!v) return true;
          return /^https?:\/\/(www\.)?linkedin\.com\/in\//.test(v);
        },
        message: 'LinkedIn URL must be a valid LinkedIn profile URL'
      }
    }
  }],
  
  mentors: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    expertise: [{
      type: String,
      trim: true
    }],
    company: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      maxlength: [300, 'Mentor bio cannot exceed 300 characters']
    },
    avatar: {
      type: String,
      default: '👨‍🏫'
    },
    contactInfo: {
      email: String,
      phone: String,
      slack: String
    }
  }],
  
  // Schedule & Events
  schedule: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      maxlength: [300, 'Event description cannot exceed 300 characters']
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
      trim: true
    },
    type: {
      type: String,
      enum: ['Opening', 'Workshop', 'Mentoring', 'Judging', 'Break', 'Closing', 'Networking', 'Other'],
      default: 'Other'
    },
    mandatory: {
      type: Boolean,
      default: false
    }
  }],
  
  // Status & Visibility
  status: {
    type: String,
    enum: ['upcoming', 'registration_open', 'registration_closed', 'in_progress', 'judging', 'completed', 'cancelled'],
    default: 'upcoming'
  },
  featured: {
    type: Boolean,
    default: false
  },
  published: {
    type: Boolean,
    default: true
  },
  
  // Analytics & Tracking
  analytics: {
    views: {
      type: Number,
      default: 0,
      min: [0, 'Views cannot be negative']
    },
    registrations: {
      type: Number,
      default: 0,
      min: [0, 'Registrations cannot be negative']
    },
    teamsFormed: {
      type: Number,
      default: 0,
      min: [0, 'Teams formed cannot be negative']
    },
    projectsSubmitted: {
      type: Number,
      default: 0,
      min: [0, 'Projects submitted cannot be negative']
    },
    checkInRate: {
      type: Number,
      default: 0,
      min: [0, 'Check-in rate cannot be negative'],
      max: [100, 'Check-in rate cannot exceed 100']
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
hackathonSchema.index({ status: 1, featured: -1 });
hackathonSchema.index({ startDate: 1, endDate: 1 });
hackathonSchema.index({ registrationDeadline: 1 });
hackathonSchema.index({ 'participants.studentId': 1 });
hackathonSchema.index({ 'teams.members.studentId': 1 });
hackathonSchema.index({ themes: 1 });
hackathonSchema.index({ location: 1, type: 1 });
hackathonSchema.index({ 'analytics.views': -1 });
hackathonSchema.index({ createdAt: -1 });
hackathonSchema.index({ title: 'text', description: 'text', themes: 'text' });

// Virtual for registration status
hackathonSchema.virtual('registrationStatus').get(function() {
  const now = new Date();
  if (now > this.registrationDeadline) return 'closed';
  if (this.status === 'registration_open') return 'open';
  return 'not_open';
});

// Virtual for participants count
hackathonSchema.virtual('participantCount').get(function() {
  return this.participants ? this.participants.length : 0;
});

// Virtual for teams count
hackathonSchema.virtual('teamCount').get(function() {
  return this.teams ? this.teams.length : 0;
});

// Virtual for spots available
hackathonSchema.virtual('spotsAvailable').get(function() {
  return Math.max(0, this.maxParticipants - this.participantCount);
});

// Virtual for days until start
hackathonSchema.virtual('daysUntilStart').get(function() {
  const now = new Date();
  const diffTime = this.startDate - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for is registration open
hackathonSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date();
  return this.status === 'registration_open' && 
         now <= this.registrationDeadline && 
         this.spotsAvailable > 0;
});

// Pre-save middleware
hackathonSchema.pre('save', function(next) {
  // Update analytics
  if (this.participants) {
    this.analytics.registrations = this.participants.length;
    
    const checkedIn = this.participants.filter(p => p.status === 'checked_in').length;
    if (this.participants.length > 0) {
      this.analytics.checkInRate = Math.round((checkedIn / this.participants.length) * 100);
    }
  }
  
  if (this.teams) {
    this.analytics.teamsFormed = this.teams.length;
    this.analytics.projectsSubmitted = this.teams.filter(t => t.status === 'submitted').length;
  }
  
  // Update lastModified
  this.lastModified = new Date();
  
  next();
});

// Static methods
hackathonSchema.statics.findUpcoming = function() {
  const now = new Date();
  return this.find({
    startDate: { $gt: now },
    status: { $in: ['upcoming', 'registration_open'] },
    published: true,
    approvalStatus: 'approved'
  }).sort({ startDate: 1 });
};

hackathonSchema.statics.findActive = function() {
  return this.find({
    status: 'in_progress',
    published: true,
    approvalStatus: 'approved'
  }).sort({ startDate: -1 });
};

hackathonSchema.statics.findCompleted = function() {
  return this.find({
    status: 'completed',
    published: true,
    approvalStatus: 'approved'
  }).sort({ endDate: -1 });
};

hackathonSchema.statics.findOpenForRegistration = function() {
  const now = new Date();
  return this.find({
    status: 'registration_open',
    registrationDeadline: { $gt: now },
    published: true,
    approvalStatus: 'approved'
  }).sort({ registrationDeadline: 1 });
};

hackathonSchema.statics.findByTheme = function(theme) {
  return this.find({
    themes: { $in: [new RegExp(theme, 'i')] },
    published: true,
    approvalStatus: 'approved'
  }).sort({ startDate: 1 });
};

hackathonSchema.statics.findByParticipant = function(studentId) {
  return this.find({
    'participants.studentId': studentId,
    approvalStatus: 'approved'
  }).sort({ startDate: -1 });
};

hackathonSchema.statics.searchHackathons = function(searchTerm, filters = {}) {
  const query = {
    $and: [
      { published: true },
      { approvalStatus: 'approved' },
      {
        $or: [
          { title: { $regex: searchTerm, $options: 'i' } },
          { description: { $regex: searchTerm, $options: 'i' } },
          { themes: { $in: [new RegExp(searchTerm, 'i')] } },
          { organizer: { $regex: searchTerm, $options: 'i' } },
          { location: { $regex: searchTerm, $options: 'i' } }
        ]
      }
    ]
  };

  // Apply filters
  if (filters.status) query.$and.push({ status: filters.status });
  if (filters.type) query.$and.push({ type: filters.type });
  if (filters.difficulty) query.$and.push({ difficulty: filters.difficulty });
  if (filters.location) query.$and.push({ location: new RegExp(filters.location, 'i') });

  return this.find(query).sort({ startDate: 1 });
};

// Instance methods
hackathonSchema.methods.addParticipant = function(participantData) {
  // Check if user already registered
  const existingParticipant = this.participants.find(
    p => p.studentId.toString() === participantData.studentId.toString()
  );
  
  if (existingParticipant) {
    throw new Error('User is already registered for this hackathon');
  }
  
  // Check if registration is open
  if (!this.isRegistrationOpen) {
    throw new Error('Registration is not open for this hackathon');
  }
  
  // Check capacity
  if (this.spotsAvailable <= 0) {
    throw new Error('Hackathon is at maximum capacity');
  }
  
  this.participants.push(participantData);
  return this.save();
};

hackathonSchema.methods.removeParticipant = function(studentId) {
  this.participants = this.participants.filter(
    p => p.studentId.toString() !== studentId.toString()
  );
  
  // Also remove from any teams
  this.teams.forEach(team => {
    team.members = team.members.filter(
      m => m.studentId.toString() !== studentId.toString()
    );
  });
  
  return this.save();
};

hackathonSchema.methods.createTeam = function(teamData) {
  // Validate team size
  if (teamData.members.length < this.minTeamSize || teamData.members.length > this.maxTeamSize) {
    throw new Error(`Team size must be between ${this.minTeamSize} and ${this.maxTeamSize} members`);
  }
  
  // Check if all members are participants
  const participantIds = this.participants.map(p => p.studentId.toString());
  const allMembersRegistered = teamData.members.every(member => 
    participantIds.includes(member.studentId.toString())
  );
  
  if (!allMembersRegistered) {
    throw new Error('All team members must be registered participants');
  }
  
  this.teams.push(teamData);
  return this.save();
};

hackathonSchema.methods.updateTeam = function(teamId, updateData) {
  const team = this.teams.id(teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  
  Object.assign(team, updateData);
  return this.save();
};

hackathonSchema.methods.submitProject = function(teamId, projectData) {
  const team = this.teams.id(teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  
  Object.assign(team, projectData);
  team.status = 'submitted';
  team.submissionDate = new Date();
  
  return this.save();
};

hackathonSchema.methods.scoreTeam = function(teamId, scores) {
  const team = this.teams.id(teamId);
  if (!team) {
    throw new Error('Team not found');
  }
  
  team.score = {
    technical: scores.technical || 0,
    innovation: scores.innovation || 0,
    presentation: scores.presentation || 0,
    impact: scores.impact || 0,
    total: (scores.technical || 0) + (scores.innovation || 0) + 
           (scores.presentation || 0) + (scores.impact || 0)
  };
  
  return this.save();
};

hackathonSchema.methods.incrementViews = function() {
  this.analytics.views += 1;
  return this.save();
};

hackathonSchema.methods.checkInParticipant = function(studentId) {
  const participant = this.participants.find(
    p => p.studentId.toString() === studentId.toString()
  );
  
  if (!participant) {
    throw new Error('Participant not found');
  }
  
  participant.status = 'checked_in';
  participant.checkedInDate = new Date();
  
  return this.save();
};

const Hackathon = mongoose.model('Hackathon', hackathonSchema);

module.exports = Hackathon;