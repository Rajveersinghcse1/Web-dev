/**
 * Authentication Routes for Coding Society Platform
 * Handles user registration, login, logout, and account management
 */

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { asyncHandler, CustomError } = require('../middleware/errorHandler');
const { auth, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Helper function to generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Helper function to generate refresh token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRE
  });
};

// @desc    Register new user
// @route   POST /api/v1/auth/register
// @access  Public
router.post('/register', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['student', 'instructor', 'admin'])
    .withMessage('Invalid role specified'),
  body('bio')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Bio must be less than 500 characters'),
  body('location')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Location must be less than 100 characters'),
  body('favoriteLanguage')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Favorite language must be less than 50 characters')
], asyncHandler(async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { name, email, password, role = 'student', bio, location, favoriteLanguage } = req.body;

  // Generate username from name (remove spaces, convert to lowercase, add numbers if needed)
  let baseUsername = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  let username = baseUsername;
  let counter = 1;
  
  // Ensure username is unique
  while (await User.findOne({ username })) {
    username = `${baseUsername}${counter}`;
    counter++;
  }

  // Check if user already exists with this email
  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'User with this email already exists'
    });
  }

  // Split name into first and last name
  const nameParts = name.trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  // Prepare profile data
  const profileData = {
    firstName,
    lastName
  };

  // Add optional fields if provided
  if (bio && bio.trim()) {
    profileData.bio = bio.trim();
  }
  if (location && location.trim()) {
    profileData.location = location.trim();
  }

  // Create user
  const user = await User.create({
    username,
    email: email.toLowerCase(),
    password,
    role,
    profile: profileData,
    favoriteLanguage: favoriteLanguage || 'javascript',
    gameData: {
      level: 1,
      xp: 0,
      totalXP: 0,
      skillPoints: 3, // Starting skill points
      coins: 100,
      gems: 10,
      characterClass: 'novice_coder',
      stats: {
        dailyStreak: 1,
        lastActiveDate: new Date()
      }
    }
  });

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.status(201).json({
    success: true,
    message: 'User registered successfully! Welcome to Coding Society! 🎮',
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      profile: user.profile,
      gameData: user.gameData,
      role: user.role,
      favoriteLanguage: user.favoriteLanguage,
      createdAt: user.createdAt
    },
    token,
    refreshToken
  });
}));

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
router.post('/login', [
  body('identifier')
    .notEmpty()
    .withMessage('Email or username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], asyncHandler(async (req, res) => {
  console.log('🚀 LOGIN ATTEMPT:', { 
    body: req.body, 
    identifier: req.body.identifier, 
    passwordLength: req.body.password?.length 
  });

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log('❌ VALIDATION ERRORS:', errors.array());
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { identifier, password } = req.body;

  // Auto-create admin user if it doesn't exist and admin credentials are used
  if (identifier === 'admin@codingsociety.com' && password === 'Admin@123456') {
    let adminUser = await User.findOne({ email: 'admin@codingsociety.com' });
    
    if (!adminUser) {
      console.log('🎯 Creating admin user automatically...');
      adminUser = await User.create({
        username: 'admin',
        email: 'admin@codingsociety.com',
        password: 'Admin@123456', // Let the User model hash this automatically
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
        isVerified: true,
        status: 'active'
      });
      console.log('✅ Admin user created with ID:', adminUser._id);
    }
  }

  // Find user by email or username
  const user = await User.findOne({
    $or: [
      { email: identifier.toLowerCase() },
      { username: identifier.toLowerCase() }
    ]
  }).select('+password');

  console.log('🔍 USER SEARCH RESULT:', { 
    found: !!user, 
    email: user?.email, 
    username: user?.username,
    status: user?.status 
  });

  if (!user) {
    console.log('❌ USER NOT FOUND');
    return res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }

  // Check account status
  if (user.status !== 'active') {
    console.log('❌ ACCOUNT NOT ACTIVE:', user.status);
    return res.status(401).json({
      success: false,
      message: 'Account is not active. Please contact support.'
    });
  }

  // Check password
  console.log('🔑 COMPARING PASSWORDS...');
  const isMatch = await user.comparePassword(password);
  console.log('🔑 PASSWORD MATCH RESULT:', isMatch);
  
  if (!isMatch) {
    // Increment login attempts
    user.security.loginAttempts = (user.security.loginAttempts || 0) + 1;
    
    // Lock account after 5 failed attempts
    if (user.security.loginAttempts >= 5) {
      user.security.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
      await user.save();
      
      return res.status(401).json({
        success: false,
        message: 'Account locked due to too many failed login attempts. Try again in 30 minutes.'
      });
    }
    
    await user.save();
    return res.status(401).json({
      success: false,
      message: `Invalid credentials. ${5 - user.security.loginAttempts} attempts remaining.`
    });
  }

  // Check if account is locked
  if (user.security.lockUntil && user.security.lockUntil > new Date()) {
    return res.status(401).json({
      success: false,
      message: 'Account is locked. Please try again later.'
    });
  }

  // Reset login attempts on successful login
  user.security.loginAttempts = 0;
  user.security.lockUntil = undefined;
  user.security.lastLogin = new Date();
  
  // Update daily streak
  user.updateDailyStreak();
  
  await user.save();

  // Generate tokens
  const token = generateToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  res.json({
    success: true,
    message: `Welcome back, ${user.profile.firstName || user.username}! 🎮`,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      profile: user.profile,
      gameData: user.gameData,
      role: user.role,
      lastLogin: user.security.lastLogin
    },
    token,
    refreshToken
  });
}));

// @desc    Get current user
// @route   GET /api/v1/auth/me
// @access  Private
router.get('/me', auth, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: req.user._id,
        username: req.user.username,
        email: req.user.email,
        profile: req.user.profile,
        gameData: req.user.gameData,
        preferences: req.user.preferences,
        role: req.user.role,
        status: req.user.status,
        createdAt: req.user.createdAt,
        lastActiveAt: req.user.lastActiveAt
      }
    }
  });
}));

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
router.put('/profile', auth, [
  body('profile.firstName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('profile.lastName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('profile.bio')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Bio cannot exceed 500 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const allowedFields = ['profile', 'preferences'];
  const updates = {};

  allowedFields.forEach(field => {
    if (req.body[field]) {
      updates[field] = { ...req.user[field], ...req.body[field] };
    }
  });

  const user = await User.findByIdAndUpdate(
    req.user._id,
    updates,
    { new: true, runValidators: true }
  );

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { user }
  });
}));

// @desc    Change password
// @route   PUT /api/v1/auth/password
// @access  Private
router.put('/password', auth, [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Check current password
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  user.security.lastPasswordChange = new Date();
  await user.save();

  res.json({
    success: true,
    message: 'Password updated successfully'
  });
}));

// @desc    Refresh access token
// @route   POST /api/v1/auth/refresh
// @access  Public
router.post('/refresh', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { refreshToken } = req.body;

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Get user
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new CustomError('User not found', 404);
    }

    // Generate new access token
    const newToken = generateToken(user._id);

    res.json({
      success: true,
      data: { token: newToken }
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
}));

// @desc    Logout user
// @route   POST /api/v1/auth/logout
// @access  Private
router.post('/logout', auth, asyncHandler(async (req, res) => {
  // In a more sophisticated setup, you might want to blacklist the token
  // For now, we'll just send a success response
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
}));

// @desc    Delete account
// @route   DELETE /api/v1/auth/account
// @access  Private
router.delete('/account', auth, [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { password } = req.body;

  // Get user with password
  const user = await User.findById(req.user._id).select('+password');

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(400).json({
      success: false,
      message: 'Password is incorrect'
    });
  }

  // Delete user
  await User.findByIdAndDelete(req.user._id);

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
}));

// @desc    Forgot password
// @route   POST /api/v1/auth/forgot-password
// @access  Public
router.post('/forgot-password', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email')
], asyncHandler(async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email } = req.body;

  // Find user
  const user = await User.findOne({ email: email.toLowerCase() });
  
  if (!user) {
    // Don't reveal whether user exists or not for security
    return res.json({
      success: true,
      message: 'If an account with that email exists, we have sent password reset instructions'
    });
  }

  // Generate reset token
  const crypto = require('crypto');
  const resetToken = crypto.randomBytes(32).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  // Set expire time (10 minutes)
  const resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  
  // Save token to user
  await User.findByIdAndUpdate(user._id, {
    resetPasswordToken,
    resetPasswordExpire
  });

  // Create reset URL
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  // For development, we'll just return the reset token
  // In production, you would send an email with the reset link
  if (process.env.NODE_ENV === 'development') {
    return res.json({
      success: true,
      message: 'Password reset token generated',
      resetToken: resetToken, // Only for development
      resetUrl: resetUrl // Only for development
    });
  }

  // TODO: Send email with reset link
  // For now, just return success message
  res.json({
    success: true,
    message: 'If an account with that email exists, we have sent password reset instructions'
  });
}));

// @desc    Reset password
// @route   POST /api/v1/auth/reset-password/:token
// @access  Public
router.post('/reset-password/:token', [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], asyncHandler(async (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { password } = req.body;
  const { token } = req.params;

  // Hash the token from URL
  const crypto = require('crypto');
  const resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find user by token and check if not expired
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() }
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: 'Invalid or expired password reset token'
    });
  }

  // Set new password
  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  // Generate new JWT token
  const jwtToken = generateToken(user._id);

  res.json({
    success: true,
    message: 'Password reset successfully',
    token: jwtToken,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      profile: user.profile,
      gameData: user.gameData
    }
  });
}));

module.exports = router;