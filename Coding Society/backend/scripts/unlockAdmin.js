const mongoose = require('mongoose');
require('dotenv').config();

async function unlock() {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/coding-society?authSource=admin';
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ Connected to MongoDB');

    const User = require('../models/User');
    const admin = await User.findOne({ email: 'admin@codingsociety.com' });
    if (!admin) {
      console.error('❌ Admin user not found');
      process.exit(1);
    }

    // Clear lock fields used by authentication logic
    if (!admin.security) admin.security = {};
    admin.security.loginAttempts = 0;
    admin.security.lockUntil = null;

    admin.failedLoginAttempts = 0;
    admin.lockUntil = null;

    await admin.save();
    console.log('🔓 Admin account unlocked');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error unlocking admin:', err);
    process.exit(1);
  }
}

unlock();
