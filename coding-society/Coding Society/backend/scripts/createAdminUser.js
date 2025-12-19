/**
 * Create Admin User Script
 * Creates a proper admin user with encrypted password and admin role
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');

// Database connection
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/coding-society?authSource=admin';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create admin user function
const createAdminUser = async () => {
  try {
    console.log('🔄 Creating admin user...');

    // Check if admin user already exists
    const existingAdmin = await User.findOne({ email: 'admin@codingsociety.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists with email: admin@codingsociety.com');
      
      // Update existing user to ensure admin role
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      await existingAdmin.save();
      console.log('✅ Updated existing user to admin role');
      return existingAdmin;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Admin@123456', salt);

    // Create admin user
    const adminUser = new User({
      username: 'adminuser',
      email: 'admin@codingsociety.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      isActive: true,
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        bio: 'System Administrator',
        location: 'Coding Society HQ',
        skills: ['System Administration', 'Database Management', 'Content Management'],
        socialLinks: {
          github: 'https://github.com/coding-society',
          linkedin: 'https://linkedin.com/company/coding-society'
        }
      },
      preferences: {
        emailNotifications: true,
        theme: 'light',
        language: 'en'
      },
      isEmailVerified: true,
      emailVerifiedAt: new Date()
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@codingsociety.com');
    console.log('🔑 Password: Admin@123456');
    console.log('👤 Role: admin');

    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
};

// Create test user function
const createTestUser = async () => {
  try {
    console.log('🔄 Creating test user...');

    // Check if test user already exists
    const existingTest = await User.findOne({ email: 'test@example.com' });
    if (existingTest) {
      console.log('⚠️ Test user already exists with email: test@example.com');
      return existingTest;
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    // Create test user
    const testUser = new User({
      username: 'testuser',
      email: 'test@example.com',
      password: hashedPassword,
      role: 'student',
      status: 'active',
      isActive: true,
      profile: {
        firstName: 'Test',
        lastName: 'User',
        bio: 'Test user for development',
        location: 'Test City',
        skills: ['JavaScript', 'React', 'Node.js'],
        education: {
          degree: 'Bachelor of Computer Science',
          institution: 'Test University',
          graduationYear: 2024
        }
      },
      preferences: {
        emailNotifications: false,
        theme: 'light',
        language: 'en'
      },
      isEmailVerified: true,
      emailVerifiedAt: new Date()
    });

    await testUser.save();
    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@example.com');
    console.log('🔑 Password: password123');
    console.log('👤 Role: student');

    return testUser;
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
};

// Main execution function
const main = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Starting user creation process...\n');
    
    const adminUser = await createAdminUser();
    console.log('');
    
    const testUser = await createTestUser();
    console.log('');
    
    console.log('🎉 User creation completed successfully!');
    console.log('\n📋 Login Credentials Summary:');
    console.log('=' .repeat(50));
    console.log('🔐 ADMIN LOGIN:');
    console.log('   Email: admin@codingsociety.com');
    console.log('   Password: Admin@123456');
    console.log('   Role: admin');
    console.log('');
    console.log('🔐 TEST USER LOGIN:');
    console.log('   Email: test@example.com');
    console.log('   Password: password123');
    console.log('   Role: student');
    console.log('=' .repeat(50));
    
  } catch (error) {
    console.error('❌ Script execution failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
    process.exit(0);
  }
};

// Run the script
main();