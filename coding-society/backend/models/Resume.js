const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // One resume per user for now, can be expanded later
  },
  personalInfo: {
    fullName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    location: { type: String, default: '' },
    linkedIn: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    photo: { type: String, default: '' }
  },
  objective: { type: String, default: '' },
  education: [{
    degree: String,
    institution: String,
    location: String,
    graduationDate: String,
    gpa: String,
    relevantCoursework: String,
    id: String
  }],
  skills: {
    technical: [String],
    languages: [String],
    tools: [String]
  },
  projects: [{
    title: String,
    description: String,
    technologies: String,
    link: String,
    duration: String,
    id: String
  }],
  internships: [{
    title: String,
    company: String,
    location: String,
    duration: String,
    description: String,
    id: String
  }],
  achievements: [{
    title: String,
    description: String,
    date: String,
    id: String
  }],
  settings: {
    accentColor: { type: String, default: '#2563eb' },
    fontFamily: { type: String, default: 'font-sans' },
    templateId: { type: String, default: 'professional' },
    fontSize: { type: String, default: 'medium' },
    lineSpacing: { type: String, default: 'normal' },
    margins: { type: String, default: 'normal' }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
