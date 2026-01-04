/**
 * UserSubmission Model
 * Tracks all code submissions with detailed execution metrics
 * Enables progression tracking and performance analytics
 */

const mongoose = require('mongoose');

const testCaseResultSchema = new mongoose.Schema({
  testCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  passed: {
    type: Boolean,
    required: true
  },
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  actualOutput: {
    type: String,
    required: true
  },
  executionTime: {
    type: Number, // milliseconds
    required: true
  },
  memoryUsage: {
    type: Number, // MB
    required: true
  },
  error: {
    type: String,
    default: null
  }
}, { _id: false });

const submissionSchema = new mongoose.Schema({
  // Submission Identification
  submissionId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // User & Problem Reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingChallenge',
    required: true,
    index: true
  },

  // Submission Type
  submissionType: {
    type: String,
    enum: ['RUN', 'SUBMIT'], // RUN = test run, SUBMIT = final submission
    required: true,
    default: 'RUN'
  },

  // Code Details
  language: {
    type: String,
    enum: ['C', 'C++', 'Java', 'Python', 'JavaScript'],
    required: true
  },
  code: {
    type: String,
    required: true
  },
  codeLength: {
    type: Number,
    required: true
  },

  // Execution Results
  status: {
    type: String,
    enum: ['ACCEPTED', 'WRONG_ANSWER', 'TIME_LIMIT_EXCEEDED', 
           'MEMORY_LIMIT_EXCEEDED', 'RUNTIME_ERROR', 'COMPILATION_ERROR'],
    required: true,
    index: true
  },

  // Test Case Results
  testCaseResults: [testCaseResultSchema],
  
  // Aggregated Metrics
  totalTestCases: {
    type: Number,
    required: true
  },
  passedTestCases: {
    type: Number,
    required: true
  },
  failedTestCases: {
    type: Number,
    required: true
  },

  // Performance Metrics
  totalExecutionTime: {
    type: Number, // milliseconds
    required: true
  },
  peakMemoryUsage: {
    type: Number, // MB
    required: true
  },

  // Compiler Output
  compilerOutput: {
    type: String,
    default: ''
  },
  compilerError: {
    type: String,
    default: ''
  },

  // Execution Environment
  executionEnvironment: {
    compilerId: { type: String },
    runtimeVersion: { type: String },
    sandboxId: { type: String }
  },

  // Score & Points
  score: {
    type: Number, // 0-100
    required: true,
    default: 0
  },
  earnedPoints: {
    type: Number,
    default: 0
  },

  // Time Spent (from frontend tracking)
  timeSpentCoding: {
    type: Number, // seconds
    default: 0
  },

  // Submission Metadata
  attemptNumber: {
    type: Number,
    required: true,
    default: 1
  },
  isFirstAccepted: {
    type: Boolean,
    default: false
  },

  // IP & User Agent (Security)
  ipAddress: {
    type: String,
    default: null
  },
  userAgent: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for queries
submissionSchema.index({ userId: 1, challengeId: 1 });
submissionSchema.index({ userId: 1, status: 1 });
submissionSchema.index({ challengeId: 1, status: 1 });
submissionSchema.index({ createdAt: -1 });
submissionSchema.index({ submissionType: 1, status: 1 });

// Virtual for acceptance rate
submissionSchema.virtual('acceptanceRate').get(function() {
  if (this.totalTestCases === 0) return 0;
  return (this.passedTestCases / this.totalTestCases) * 100;
});

// Virtual for time complexity indicator
submissionSchema.virtual('timeComplexityRating').get(function() {
  // Simple rating based on execution time
  if (this.totalExecutionTime < 100) return 'Excellent';
  if (this.totalExecutionTime < 500) return 'Good';
  if (this.totalExecutionTime < 2000) return 'Average';
  return 'Slow';
});

// Method to check if submission is accepted
submissionSchema.methods.isAccepted = function() {
  return this.status === 'ACCEPTED' && 
         this.passedTestCases === this.totalTestCases;
};

// Static method to get user's submission count for a challenge
submissionSchema.statics.getUserSubmissionCount = async function(userId, challengeId) {
  return await this.countDocuments({ 
    userId, 
    challengeId,
    submissionType: 'SUBMIT'
  });
};

// Static method to check if user has solved a challenge
submissionSchema.statics.hasUserSolved = async function(userId, challengeId) {
  const submission = await this.findOne({ 
    userId, 
    challengeId,
    status: 'ACCEPTED',
    submissionType: 'SUBMIT'
  });
  return !!submission;
};

// Static method to get user's best submission for a challenge
submissionSchema.statics.getUserBestSubmission = async function(userId, challengeId) {
  return await this.findOne({ 
    userId, 
    challengeId,
    submissionType: 'SUBMIT'
  })
  .sort({ score: -1, totalExecutionTime: 1 })
  .limit(1);
};

// Pre-save hook to calculate derived fields
submissionSchema.pre('save', function(next) {
  // Calculate code length
  if (this.isModified('code')) {
    this.codeLength = this.code.length;
  }

  // Calculate failed test cases
  this.failedTestCases = this.totalTestCases - this.passedTestCases;

  // Calculate score
  if (this.totalTestCases > 0) {
    this.score = Math.round((this.passedTestCases / this.totalTestCases) * 100);
  }

  next();
});

const UserSubmission = mongoose.model('UserSubmission', submissionSchema);

module.exports = UserSubmission;
