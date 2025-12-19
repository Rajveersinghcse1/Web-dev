/**
 * Create a fresh test user to resolve 401 authentication issues
 */

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function createFreshTestUser() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27019/coding-society');
    console.log('✅ Connected to MongoDB');

    // Delete existing test user
    console.log('🗑️ Removing existing test user...');
    const deleteResult = await User.deleteOne({ email: 'test@example.com' });
    console.log('🗑️ Deleted users:', deleteResult.deletedCount);

    // Create fresh test user  
    console.log('🎉 Creating fresh test user...');
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      role: 'student',
      profile: {
        firstName: 'Test',
        lastName: 'User',
        bio: 'Fresh test user for authentication testing'
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

    console.log('🎉 Fresh test user created successfully!');
    console.log('📧 Email:', user.email);
    console.log('🔑 Password: password123');
    console.log('👤 Username:', user.username);
    console.log('🆔 User ID:', user._id);
    console.log('📊 Status:', user.status);

    // Test password immediately
    const isMatch = await user.comparePassword('password123');
    console.log('🔑 Password Test:', isMatch ? '✅ WORKS' : '❌ FAILS');

  } catch (error) {
    console.error('❌ Error creating fresh test user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

createFreshTestUser();