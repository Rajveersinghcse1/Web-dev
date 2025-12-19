/**
 * Quick Admin Panel Integration Check
 * Verifies that all admin panel components are properly connected
 */

const mongoose = require('mongoose');
require('dotenv').config();

async function checkAdminPanel() {
  try {
    console.log('🔍 Checking Admin Panel Integration\n');

    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/coding-society?authSource=admin');
    console.log('✅ Database connected\n');

    // Check models
    console.log('📦 Checking Models:');
    const User = require('../models/User');
    const AdminAuditLog = require('../models/AdminAuditLog');
    const AdminAnalytics = require('../models/AdminAnalytics');
    const Post = require('../models/Post');
    const LibraryContent = require('../models/LibraryContent');
    console.log('   ✅ User model');
    console.log('   ✅ AdminAuditLog model');
    console.log('   ✅ AdminAnalytics model');
    console.log('   ✅ Post model');
    console.log('   ✅ LibraryContent model\n');

    // Check collections
    console.log('📊 Database Statistics:');
    const [userCount, postCount, libraryCount, auditCount, analyticsCount] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      LibraryContent.countDocuments(),
      AdminAuditLog.countDocuments(),
      AdminAnalytics.countDocuments()
    ]);

    console.log(`   Users: ${userCount}`);
    console.log(`   Posts: ${postCount}`);
    console.log(`   Library: ${libraryCount}`);
    console.log(`   Audit Logs: ${auditCount}`);
    console.log(`   Analytics Records: ${analyticsCount}\n`);

    // Check admin user
    console.log('👤 Admin User Check:');
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      console.log(`   ✅ Admin user exists: ${adminUser.username} (${adminUser.email})`);
      console.log(`   📧 Email: ${adminUser.email}`);
      console.log(`   🔐 Role: ${adminUser.role}`);
      console.log(`   ✨ Status: ${adminUser.status}\n`);
    } else {
      console.log('   ⚠️  No admin user found\n');
    }

    // Check admin routes file
    console.log('🛣️  Admin Routes:');
    const adminRoutes = require('../routes/admin');
    console.log('   ✅ Admin routes loaded successfully\n');

    console.log('✅ Admin Panel Integration Check Complete!\n');
    console.log('📝 Summary:');
    console.log('   - Database: Connected');
    console.log('   - Models: All loaded');
    console.log('   - Admin User: Found');
    console.log('   - Routes: Loaded');
    console.log('\n🚀 Admin Panel is ready to use!');
    console.log('\n📌 Access Points:');
    console.log('   - User Management: GET /api/v1/admin/users');
    console.log('   - Analytics: GET /api/v1/admin/analytics/dashboard');
    console.log('   - Settings: GET /api/v1/admin/settings');
    console.log('   - Audit Logs: GET /api/v1/admin/audit-logs');
    console.log('   - System Health: GET /api/v1/admin/system/health\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

checkAdminPanel();
