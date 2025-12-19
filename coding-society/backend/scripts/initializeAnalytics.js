/**
 * Initialize Admin Analytics Collection
 * Run this script to generate initial analytics data
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import all models first
const User = require('../models/User');
const Post = require('../models/Post');
const LibraryContent = require('../models/LibraryContent');
const Innovation = require('../models/Innovation');
const Internship = require('../models/Internship');
const Hackathon = require('../models/Hackathon');
const Quest = require('../models/Quest');
const Story = require('../models/Story');
const Feedback = require('../models/Feedback');
const AdminAnalytics = require('../models/AdminAnalytics');

async function initializeAnalytics() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/coding-society?authSource=admin');
    console.log('✅ Connected to MongoDB');

    // Generate analytics for the last 7 days
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      console.log(`Generating analytics for ${date.toDateString()}...`);
      await AdminAnalytics.generateDailyAnalytics(date);
    }

    console.log('✅ Analytics initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error initializing analytics:', error);
    process.exit(1);
  }
}

initializeAnalytics();
