const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  originalName: {
    type: String,
    required: true
  },
  minioName: {
    type: String,
    required: true,
    unique: true
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Create text indexes for search functionality
fileSchema.index({ title: 'text', description: 'text', originalName: 'text' });

module.exports = mongoose.model('File', fileSchema);