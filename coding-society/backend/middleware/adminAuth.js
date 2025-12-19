/**
 * Admin Authentication Middleware
 * Handles role-based access control for admin panel
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verify JWT token and extract user
 */
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '') || 
                  req.cookies?.token || 
                  req.header('x-auth-token');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Get user from database
    const user = await User.findById(decoded.id).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is not valid. User not found.'
      });
    }

    // Check if user account is active
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        message: 'Account is not active.'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Authentication failed.'
    });
  }
};

/**
 * Check if user has admin role
 */
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  const adminRoles = ['admin', 'superadmin'];
  if (!adminRoles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
      userRole: req.user.role,
      requiredRoles: adminRoles
    });
  }

  next();
};

/**
 * Check if user has super admin role
 */
const isSuperAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.',
      userRole: req.user.role,
      requiredRole: 'superadmin'
    });
  }

  next();
};

/**
 * Dynamic permission checker
 * @param {string|Array} allowedRoles - Single role or array of roles
 * @param {Object} options - Additional options
 */
const checkPermissions = (allowedRoles, options = {}) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Normalize to array
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
    // Check if user has required role
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`,
        userRole: req.user.role,
        requiredRoles: roles
      });
    }

    // Additional permission checks
    if (options.requireActive && req.user.status !== 'active') {
      return res.status(403).json({
        success: false,
        message: 'Account must be active.'
      });
    }

    if (options.requireEmailVerified && !req.user.security.emailVerified) {
      return res.status(403).json({
        success: false,
        message: 'Email verification required.'
      });
    }

    next();
  };
};

/**
 * Resource ownership checker
 * For operations where users can only modify their own content
 */
const checkOwnership = (resourceField = 'userId') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Super admins can access everything
    if (req.user.role === 'superadmin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceField] || req.body[resourceField];
    
    if (resourceUserId && resourceUserId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only access your own resources.'
      });
    }

    next();
  };
};

/**
 * API rate limiting for admin operations
 */
const adminRateLimit = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const requests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user._id.toString();
    const now = Date.now();
    const windowStart = now - windowMs;

    // Clean old requests
    if (requests.has(userId)) {
      const userRequests = requests.get(userId).filter(time => time > windowStart);
      requests.set(userId, userRequests);
    } else {
      requests.set(userId, []);
    }

    const userRequests = requests.get(userId);

    // Check if user exceeded rate limit
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((userRequests[0] + windowMs - now) / 1000)
      });
    }

    // Add current request
    userRequests.push(now);
    next();
  };
};

/**
 * Audit logging middleware
 * Logs admin actions for security and compliance
 */
const auditLog = (action) => {
  return (req, res, next) => {
    // Store audit info in request for later logging
    req.auditInfo = {
      action,
      userId: req.user?._id,
      userRole: req.user?.role,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      timestamp: new Date(),
      method: req.method,
      url: req.originalUrl,
      body: req.method !== 'GET' ? req.body : undefined
    };

    // Override res.json to capture response data
    const originalJson = res.json;
    res.json = function(data) {
      req.auditInfo.response = {
        statusCode: res.statusCode,
        success: data.success,
        message: data.message
      };

      // Log the action (in production, send to logging service)
      console.log('AUDIT LOG:', JSON.stringify(req.auditInfo, null, 2));

      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Content moderation permissions
 * Different levels of content management access
 */
const contentPermissions = {
  READ: 'read',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  MODERATE: 'moderate'
};

const checkContentPermission = (permission, contentType = 'general') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    const userRole = req.user.role;

    // Super admins have all permissions
    if (userRole === 'superadmin') {
      return next();
    }

    // Define role permissions
    const rolePermissions = {
      admin: {
        library: ['read', 'create', 'update', 'delete'],
        innovation: ['read', 'create', 'update', 'delete'],
        internship: ['read', 'create', 'update', 'delete'],
        hackathon: ['read', 'create', 'update', 'delete'],
        general: ['read', 'create', 'update', 'moderate']
      },
      mentor: {
        library: ['read', 'create'],
        innovation: ['read', 'create'],
        internship: ['read', 'create', 'update'],
        hackathon: ['read'],
        general: ['read']
      },
      instructor: {
        library: ['read', 'create', 'update'],
        innovation: ['read'],
        internship: ['read'],
        hackathon: ['read'],
        general: ['read']
      }
    };

    const userPermissions = rolePermissions[userRole];
    if (!userPermissions) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions.',
        userRole
      });
    }

    const contentPermissions = userPermissions[contentType] || userPermissions.general;
    if (!contentPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: `Permission denied. Required: ${permission} on ${contentType}`,
        userRole,
        userPermissions: contentPermissions
      });
    }

    next();
  };
};

module.exports = {
  authenticate,
  isAdmin,
  isSuperAdmin,
  checkPermissions,
  checkOwnership,
  adminRateLimit,
  auditLog,
  contentPermissions,
  checkContentPermission
};