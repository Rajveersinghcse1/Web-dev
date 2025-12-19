/**
 * Create Real Admin User for Demo
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const User = require('../models/User');

async function createAdminUser() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    // Try with different connection options to handle auth issues
    const connectionOptions = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      authSource: 'admin' // Try admin auth source
    };
    
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-society', connectionOptions);
    } catch (authError) {
      // If auth fails, try without auth
      console.log('⚠️ Auth failed, trying without authentication...');
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-society', {
        useNewUrlParser: true,
        useUnifiedTopology: true
      });
    }
    console.log('✅ Connected to MongoDB');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@codingsociety.com' });
    
    if (existingAdmin) {
      console.log('👤 Admin user already exists');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Username:', existingAdmin.username);
      console.log('🆔 ID:', existingAdmin._id);
      return existingAdmin;
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash('Admin@123456', 12);
    
    const adminUser = new User({
      username: 'admin',
      email: 'admin@codingsociety.com',
      password: hashedPassword,
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        avatar: '👨‍💼',
        bio: 'System Administrator for Coding Society Platform',
        location: 'Digital Realm'
      },
      gameData: {
        level: 100,
        xp: 999999,
        coins: 50000,
        skillPoints: 1000,
        stats: {
          questsCompleted: 500,
          challengesSolved: 1000,
          dailyStreak: 365,
          longestStreak: 365,
          totalXpEarned: 999999,
          totalCoinsEarned: 50000,
          achievementsUnlocked: 50,
          battlesWon: 200,
          battlesLost: 50,
          projectsSubmitted: 100,
          codeReviews: 300,
          mentoringSessions: 150
        }
      },
      achievements: {
        unlocked: []
      },
      settings: {
        notifications: {
          email: true,
          push: true,
          achievements: true,
          quests: true,
          battles: true,
          mentions: true
        },
        privacy: {
          profileVisibility: 'public',
          showStats: true,
          showAchievements: true,
          showActivity: true
        },
        preferences: {
          theme: 'dark',
          language: 'en',
          timezone: 'UTC'
        }
      },
      isVerified: true
    });

    await adminUser.save();
    
    console.log('🎉 Admin user created successfully!');
    console.log('📧 Email: admin@codingsociety.com');
    console.log('🔑 Password: Admin@123456');
    console.log('👤 Username: admin');
    console.log('🆔 ID:', adminUser._id);
    console.log('🏆 Level:', adminUser.gameData.level);
    console.log('💰 Coins:', adminUser.gameData.coins);

    return adminUser;

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
if (require.main === module) {
  createAdminUser()
    .then(() => {
      console.log('✅ Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script failed:', error);
      process.exit(1);
    });
}

module.exports = createAdminUser;