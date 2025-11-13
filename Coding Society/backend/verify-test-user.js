/**
 * Script to verify test user exists and test password matching
 */

const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function verifyTestUser() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-society');
    console.log('✅ Connected to MongoDB');

    // Find the test user
    const user = await User.findOne({ email: 'test@example.com' }).select('+password');
    
    if (!user) {
      console.log('❌ Test user not found in database');
      return;
    }

    console.log('✅ Test user found:');
    console.log('📧 Email:', user.email);
    console.log('👤 Username:', user.username);
    console.log('🆔 User ID:', user._id);
    console.log('🔐 Password Hash:', user.password ? 'Present' : 'Missing');
    console.log('📊 Status:', user.status);

    // Test password comparison
    const isMatch = await user.comparePassword('password123');
    console.log('🔑 Password Test:', isMatch ? '✅ MATCH' : '❌ NO MATCH');

    if (!isMatch) {
      console.log('🔄 Testing direct password comparison...');
      const bcrypt = require('bcryptjs');
      const directMatch = await bcrypt.compare('password123', user.password);
      console.log('🔑 Direct bcrypt test:', directMatch ? '✅ MATCH' : '❌ NO MATCH');
    }

  } catch (error) {
    console.error('❌ Error verifying test user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
  }
}

verifyTestUser();