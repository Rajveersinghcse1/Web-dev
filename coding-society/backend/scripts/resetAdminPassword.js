const mongoose = require('mongoose');
require('dotenv').config();

async function resetAdminPassword() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/coding-society?authSource=admin';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');

    const User = require('../models/User');
    
    const admin = await User.findOne({ email: 'admin@codingsociety.com' });
    if (!admin) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }

    const newPassword = 'Admin@123';
    // Set plain password so pre-save middleware hashes it exactly once
    admin.password = newPassword;
    // Also clear any lock fields
    if (!admin.security) admin.security = {};
    admin.security.loginAttempts = 0;
    admin.security.lockUntil = null;
    admin.failedLoginAttempts = 0;
    admin.lockUntil = null;

    await admin.save();

    console.log('✅ Admin password reset successfully');
    console.log('\nCredentials:');
    console.log('  Email: admin@codingsociety.com');
    console.log('  Password: Admin@123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetAdminPassword();
