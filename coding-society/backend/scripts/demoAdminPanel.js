/**
 * Admin Panel Live Demo
 * Demonstrates all admin panel features with sample data
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Post = require('../models/Post');
const AdminAuditLog = require('../models/AdminAuditLog');
const SystemSettings = require('../models/SystemSettings');

async function runDemo() {
  try {
    console.log('\n🎬 ADMIN PANEL LIVE DEMO\n');
    console.log('━'.repeat(60));

    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/coding-society?authSource=admin');
    console.log('✅ Connected to MongoDB\n');

    // 1. User Statistics
    console.log('📊 USER STATISTICS');
    console.log('━'.repeat(60));
    
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ status: 'active' });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    console.log(`Total Users: ${totalUsers}`);
    console.log(`Active Users: ${activeUsers}`);
    console.log(`Admin Users: ${adminUsers}`);
    console.log('\nUsers by Role:');
    usersByRole.forEach(r => console.log(`  - ${r._id}: ${r.count}`));

    // 2. Content Statistics
    console.log('\n📚 CONTENT STATISTICS');
    console.log('━'.repeat(60));
    
    const totalPosts = await Post.countDocuments();
    const recentPosts = await Post.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });

    console.log(`Total Posts: ${totalPosts}`);
    console.log(`Posts (Last 7 Days): ${recentPosts}`);

    // 3. Engagement Metrics
    console.log('\n💬 ENGAGEMENT METRICS');
    console.log('━'.repeat(60));
    
    const postStats = await Post.aggregate([
      {
        $group: {
          _id: null,
          totalLikes: { $sum: { $size: '$likes' } },
          totalComments: { $sum: { $size: '$comments' } },
          totalShares: { $sum: { $size: '$shares' } }
        }
      }
    ]);

    if (postStats.length > 0) {
      console.log(`Total Likes: ${postStats[0].totalLikes}`);
      console.log(`Total Comments: ${postStats[0].totalComments}`);
      console.log(`Total Shares: ${postStats[0].totalShares}`);
    }

    // 4. Top Users
    console.log('\n🏆 TOP USERS BY XP');
    console.log('━'.repeat(60));
    
    const topUsers = await User.find()
      .select('username gameData.xp gameData.level')
      .sort({ 'gameData.xp': -1 })
      .limit(5);

    topUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.username} - Level ${user.gameData.level} (${user.gameData.xp} XP)`);
    });

    // 5. System Settings
    console.log('\n⚙️  SYSTEM SETTINGS');
    console.log('━'.repeat(60));
    
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
      console.log('✨ Created default system settings');
    }
    
    console.log(`Site Name: ${settings.siteName}`);
    console.log(`Maintenance Mode: ${settings.maintenanceMode ? '🔴 Enabled' : '🟢 Disabled'}`);
    console.log(`Allow Registration: ${settings.allowRegistration ? '✅ Yes' : '❌ No'}`);

    // 6. Create Sample Audit Log
    console.log('\n📝 AUDIT LOG DEMO');
    console.log('━'.repeat(60));
    
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      await AdminAuditLog.create({
        admin: adminUser._id,
        action: 'view',
        resourceType: 'user',
        details: { action: 'Demo view all users' },
        ipAddress: '127.0.0.1',
        userAgent: 'Admin Panel Demo Script',
        success: true
      });
      console.log('✅ Sample audit log created');
    }

    const auditCount = await AdminAuditLog.countDocuments();
    console.log(`Total Audit Logs: ${auditCount}`);

    // 7. Database Health
    console.log('\n🏥 DATABASE HEALTH');
    console.log('━'.repeat(60));
    
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`Total Collections: ${collections.length}`);
    
    const dbStats = await mongoose.connection.db.stats();
    console.log(`Database Size: ${(dbStats.dataSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Index Size: ${(dbStats.indexSize / 1024 / 1024).toFixed(2)} MB`);

    // 8. Analytics Summary
    console.log('\n📈 ANALYTICS SUMMARY');
    console.log('━'.repeat(60));
    
    const AdminAnalytics = require('../models/AdminAnalytics');
    const latestAnalytics = await AdminAnalytics.findOne().sort({ date: -1 });
    
    if (latestAnalytics) {
      console.log(`Last Analytics Date: ${latestAnalytics.date.toDateString()}`);
      console.log(`Period: ${latestAnalytics.period}`);
      console.log(`Analytics Records: ${await AdminAnalytics.countDocuments()}`);
    } else {
      console.log('⚠️  No analytics data found. Run: node scripts/initializeAnalytics.js');
    }

    console.log('\n━'.repeat(60));
    console.log('✅ DEMO COMPLETE!\n');
    console.log('🚀 Admin Panel Features:');
    console.log('   1. User Management - View, edit, delete users');
    console.log('   2. Analytics Dashboard - Charts and insights');
    console.log('   3. Settings Management - Configure system');
    console.log('   4. Audit Logging - Track all admin actions');
    console.log('   5. System Health - Monitor database status\n');
    console.log('📌 Access: http://localhost:3002/admin');
    console.log('🔐 Login: admin@codingsociety.com\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Demo Error:', error);
    process.exit(1);
  }
}

runDemo();
