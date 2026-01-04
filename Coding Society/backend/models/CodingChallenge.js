/**
 * CodingChallenge Model
 * Professional coding challenge platform comparable to LeetCode/GeeksforGeeks
 * Focus: Deterministic evaluation, scalable test execution, progression tracking
 */

const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  expectedOutput: {
    type: String,
    required: true
  },
  explanation: {
    type: String,
    default: ''
  },
  isHidden: {
    type: Boolean,
    default: false // Hidden test cases are not visible to users
  },
  weight: {
    type: Number,
    default: 1,
    min: 1,
    max: 10
  },
  timeLimit: {
    type: Number, // milliseconds
    default: 5000
  },
  memoryLimit: {
    type: Number, // MB
    default: 128
  }
}, { _id: true });

const codingChallengeSchema = new mongoose.Schema({
  // Problem Identification
  problemId: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  // Difficulty Classification
  difficulty: {
    type: String,
    required: true,
    enum: ['Easy', 'Medium', 'Hard'],
    index: true
  },

  // Problem Statement Structure
  problemStatement: {
    description: {
      type: String,
      required: true
    },
    inputFormat: {
      type: String,
      required: true
    },
    outputFormat: {
      type: String,
      required: true
    },
    constraints: [{
      type: String,
      required: true
    }],
    exampleTestCases: [{
      input: { type: String, required: true },
      output: { type: String, required: true },
      explanation: { type: String }
    }]
  },

  // Test Case Management
  testCases: {
    type: [testCaseSchema],
    required: true,
    validate: {
      validator: function(testCases) {
        return testCases && testCases.length >= 3;
      },
      message: 'At least 3 test cases are required'
    }
  },

  // Language Support
  supportedLanguages: [{
    type: String,
    enum: ['C', 'C++', 'Java', 'Python', 'JavaScript'],
    required: true
  }],

  // Code Templates
  starterCode: {
    C: { type: String, default: '' },
    'C++': { type: String, default: '' },
    Java: { type: String, default: '' },
    Python: { type: String, default: '' },
    JavaScript: { type: String, default: '' }
  },

  // Solution & Editorial (Admin Only)
  solution: {
    approach: { type: String },
    code: {
      C: { type: String },
      'C++': { type: String },
      Java: { type: String },
      Python: { type: String },
      JavaScript: { type: String }
    },
    timeComplexity: { type: String },
    spaceComplexity: { type: String }
  },

  // Execution Constraints
  executionLimits: {
    defaultTimeLimit: {
      type: Number,
      default: 5000, // 5 seconds
      min: 1000,
      max: 30000
    },
    defaultMemoryLimit: {
      type: Number,
      default: 128, // 128 MB
      min: 64,
      max: 512
    }
  },

  // Categorization & Tagging
  category: {
    type: String,
    enum: ['Array', 'String', 'LinkedList', 'Tree', 'Graph', 'DynamicProgramming', 
           'Sorting', 'Searching', 'Recursion', 'Backtracking', 'Greedy', 
           'Stack', 'Queue', 'Hashing', 'Math', 'BitManipulation'],
    required: true,
    index: true
  },
  tags: [{
    type: String,
    trim: true
  }],

  // Statistics & Metrics
  statistics: {
    totalAttempts: { type: Number, default: 0 },
    totalSolved: { type: Number, default: 0 },
    acceptanceRate: { type: Number, default: 0 }, // Percentage
    averageTime: { type: Number, default: 0 }, // milliseconds
    averageMemory: { type: Number, default: 0 } // MB
  },

  // Company Tags (For Interview Prep)
  companies: [{
    type: String,
    trim: true
  }],

  // Problem Status
  isActive: {
    type: Boolean,
    default: true,
    index: true
  },
  isPremium: {
    type: Boolean,
    default: false
  },

  // Hints System
  hints: [{
    text: { type: String, required: true },
    order: { type: Number, required: true }
  }],

  // Related Problems
  relatedProblems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingChallenge'
  }],

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
codingChallengeSchema.index({ difficulty: 1, category: 1 });
codingChallengeSchema.index({ slug: 1 });
codingChallengeSchema.index({ problemId: 1 });
codingChallengeSchema.index({ isActive: 1 });
codingChallengeSchema.index({ 'statistics.acceptanceRate': -1 });

// Virtual for visible test cases count
codingChallengeSchema.virtual('visibleTestCasesCount').get(function() {
  return this.testCases.filter(tc => !tc.isHidden).length;
});

// Virtual for hidden test cases count
codingChallengeSchema.virtual('hiddenTestCasesCount').get(function() {
  return this.testCases.filter(tc => tc.isHidden).length;
});

// Method to get sanitized challenge (without hidden test cases and solution)
codingChallengeSchema.methods.getSanitizedChallenge = function() {
  const challenge = this.toObject();
  
  // Remove hidden test cases
  challenge.testCases = challenge.testCases.filter(tc => !tc.isHidden);
  
  // Remove solution
  delete challenge.solution;
  
  return challenge;
};

// Method to update statistics after submission
codingChallengeSchema.methods.updateStatistics = function(passed, executionTime, memoryUsed) {
  this.statistics.totalAttempts += 1;
  if (passed) {
    this.statistics.totalSolved += 1;
  }
  
  // Calculate acceptance rate
  this.statistics.acceptanceRate = 
    (this.statistics.totalSolved / this.statistics.totalAttempts) * 100;
  
  // Update average time and memory (running average)
  if (passed) {
    const n = this.statistics.totalSolved;
    this.statistics.averageTime = 
      ((this.statistics.averageTime * (n - 1)) + executionTime) / n;
    this.statistics.averageMemory = 
      ((this.statistics.averageMemory * (n - 1)) + memoryUsed) / n;
  }
  
  return this.save();
};

// Pre-save hook to generate slug
codingChallengeSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

const CodingChallenge = mongoose.model('CodingChallenge', codingChallengeSchema);

module.exports = CodingChallenge;
