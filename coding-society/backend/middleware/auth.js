/**
 * Authentication Middleware for Coding Society Platform
 * Handles JWT token verification and user authentication
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Main authentication middleware
const auth = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization header provided'
      });
    }

    // Check if token follows Bearer format
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format. Use: Bearer <token>'
      });
    }

    // Extract token
    const token = authHeader.substring(7);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is valid but user no longer exists'
      });
    }

    // Check if user account is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'User account is not active'
      });
    }

    // Check if password was changed after token was issued
    if (user.security.lastPasswordChange && decoded.iat * 1000 < user.security.lastPasswordChange.getTime()) {
      return res.status(401).json({
        success: false,
        message: 'Password was changed recently. Please log in again.'
      });
    }

    // Update last active time
    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false });

    // Add user to request object
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during authentication'
    });
  }
};

// Optional auth middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (user && user.status === 'active') {
      req.user = user;
      user.lastActiveAt = new Date();
      await user.save({ validateBeforeSave: false });
    } else {
      req.user = null;
    }

    next();

  } catch (error) {
    req.user = null;
    next();
  }
};

// Role-based authorization middleware
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`
      });
    }

    next();
  };
};

// Admin only middleware
const adminOnly = (req, res, next) => {
  if (!req.user || !['admin', 'superadmin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
  next();
};

// Check if user owns resource or is admin
const resourceOwnerOrAdmin = (resourceUserField = 'userId') => {
  return (req, res, next) => {
    const resourceUserId = req.params[resourceUserField] || req.body[resourceUserField];
    
    if (req.user._id.toString() === resourceUserId || ['admin', 'superadmin'].includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'You can only access your own resources'
    });
  };
};

// Rate limiting for specific user actions
const userActionLimit = (maxActions = 100, windowMs = 15 * 60 * 1000) => {
  const userActions = new Map();

  return (req, res, next) => {
    if (!req.user) return next();

    const userId = req.user._id.toString();
    const now = Date.now();
    
    if (!userActions.has(userId)) {
      userActions.set(userId, { count: 1, resetTime: now + windowMs });
      return next();
    }

    const userAction = userActions.get(userId);
    
    if (now > userAction.resetTime) {
      userAction.count = 1;
      userAction.resetTime = now + windowMs;
      return next();
    }

    if (userAction.count >= maxActions) {
      return res.status(429).json({
        success: false,
        message: `Too many actions. Limit: ${maxActions} per ${windowMs / 1000} seconds`
      });
    }

    userAction.count++;
    next();
  };
};

// Game session validation
const validateGameSession = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    // Update daily streak if needed
    req.user.updateDailyStreak();
    await req.user.save({ validateBeforeSave: false });

    next();
  } catch (error) {
    console.error('Game session validation error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error validating game session'
    });
  }
};

module.exports = {
  auth,
  optionalAuth,
  authorize,
  adminOnly,
  resourceOwnerOrAdmin,
  userActionLimit,
  validateGameSession
};