/**
 * Script to create a test user for login testing
 */

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createTestUser() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-society');
    console.log('✅ Connected to MongoDB');

    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('🎯 Test user already exists');
      console.log('📧 Email: test@example.com');
      console.log('🔑 Password: password123');
      return;
    }

    // Create test user
    const testUser = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'student',
      profile: {
        firstName: 'Test',
        lastName: 'User',
        bio: 'Test user for authentication testing'
      },
      favoriteLanguage: 'javascript',
      gameData: {
        level: 1,
        xp: 0,
        totalXP: 0,
        skillPoints: 3,
        coins: 100,
        gems: 10,
        characterClass: 'novice_coder',
        stats: {
          dailyStreak: 1,
          lastActiveDate: new Date()
        }
      }
    });

    console.log('🎉 Test user created successfully!');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: password123');
    console.log('👤 Username:', testUser.username);
    console.log('🆔 User ID:', testUser._id);

  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

createTestUser();