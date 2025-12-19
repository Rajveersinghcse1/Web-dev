const mongoose = require('mongoose');
const path = require('path');
// require('dotenv').config({ path: path.join(__dirname, '../.env') });
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/coding-society?authSource=admin';

const verifySetup = async () => {
  try {
    console.log('🔄 Connecting to MongoDB at:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully!');

    const adminEmail = 'admin@codingsociety.com';
    let adminUser = await User.findOne({ email: adminEmail });

    if (!adminUser) {
      console.log('⚠️ Admin user not found. Creating one...');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123456', salt);

      adminUser = new User({
        username: 'adminuser',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        status: 'active',
        profile: {
          firstName: 'Admin',
          lastName: 'User',
          bio: 'System Administrator'
        }
      });

      await adminUser.save();
      console.log('✅ Admin user created successfully!');
    } else {
      console.log('✅ Admin user found.');
      if (adminUser.role !== 'admin' && adminUser.role !== 'superadmin') {
        console.log('⚠️ User exists but is not admin. Updating role...');
        adminUser.role = 'admin';
        await adminUser.save();
        console.log('✅ User role updated to admin.');
      }
      if (adminUser.status !== 'active') {
        console.log('⚠️ User exists but is not active. Activating...');
        adminUser.status = 'active';
        await adminUser.save();
        console.log('✅ User activated.');
      }
    }

    console.log('\n🎉 Admin Panel Setup Verified!');
    console.log('---------------------------------------------------');
    console.log('Admin Credentials:');
    console.log(`Email: ${adminEmail}`);
    console.log('Password: Admin@123456');
    console.log('---------------------------------------------------');
    console.log('To access the Admin Panel:');
    console.log('1. Ensure your backend is running: cd backend && npm start');
    console.log('2. Ensure your frontend is running: npm run dev');
    console.log('3. Login with the credentials above.');
    console.log('4. Go to Profile -> Admin Panel');
    console.log('---------------------------------------------------');

  } catch (error) {
    console.error('❌ Error verifying setup:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

verifySetup();
