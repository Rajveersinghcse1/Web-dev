const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-society');
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }
};

const debugUser = async () => {
  await connectDB();

  try {
    const email = 'admin@codingsociety.com';
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      console.log('User not found');
    } else {
      console.log('User found:');
      console.log('_id:', user._id);
      console.log('id:', user.id);
      console.log('username:', user.username);
      console.log('role:', user.role);
      console.log('Full object:', user);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
  }
};

debugUser();
