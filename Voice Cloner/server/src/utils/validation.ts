import { body, query, param, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { createError } from '../middleware/errorHandler';

/**
 * Common validation patterns and utilities
 */

// Common regex patterns
const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  filename: /^[a-zA-Z0-9._-]+$/,
  language: /^[a-z]{2}(-[A-Z]{2})?$/, // e.g., en, en-US
  subscriptionTier: /^(FREE|PREMIUM|ENTERPRISE)$/,
  gender: /^(MALE|FEMALE|NEUTRAL)$/,
  voiceQuality: /^(LOW|MEDIUM|HIGH|ULTRA)$/,
};

// Sanitization helpers
export const sanitizers = {
  trim: (value: string) => value.trim(),
  lowercase: (value: string) => value.toLowerCase(),
  uppercase: (value: string) => value.toUpperCase(),
  removeHtml: (value: string) => value.replace(/<[^>]*>/g, ''),
  alphanumeric: (value: string) => value.replace(/[^a-zA-Z0-9]/g, ''),
};

/**
 * Validation middleware that checks for validation errors
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined,
    }));
    
    throw createError(`Validation failed: ${errorMessages.map(e => e.message).join(', ')}`, 400);
  }
  next();
};

/**
 * Authentication validation schemas
 */
export const authValidation = {
  register: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(patterns.password)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('name')
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('Name can only contain letters, spaces, apostrophes, and hyphens'),
  ],

  login: [
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
    
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],

  refresh: [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required')
      .isJWT()
      .withMessage('Invalid refresh token format'),
  ],
};

/**
 * Voice processing validation schemas
 */
export const voiceValidation = {
  createModel: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Voice model name must be between 1 and 100 characters')
      .matches(/^[a-zA-Z0-9\s-_]+$/)
      .withMessage('Voice model name can only contain letters, numbers, spaces, hyphens, and underscores'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
      .customSanitizer(sanitizers.removeHtml),
    
    body('language')
      .matches(patterns.language)
      .withMessage('Language must be in ISO 639-1 format (e.g., en, es, fr)'),
    
    body('gender')
      .matches(patterns.gender)
      .withMessage('Gender must be MALE, FEMALE, or NEUTRAL'),
    
    body('quality')
      .matches(patterns.voiceQuality)
      .withMessage('Quality must be LOW, MEDIUM, HIGH, or ULTRA'),
    
    body('tags')
      .optional()
      .isArray({ max: 10 })
      .withMessage('Tags must be an array with maximum 10 items'),
    
    body('tags.*')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Each tag must be between 1 and 50 characters')
      .matches(/^[a-zA-Z0-9\s-]+$/)
      .withMessage('Tags can only contain letters, numbers, spaces, and hyphens'),
  ],

  synthesize: [
    body('text')
      .trim()
      .isLength({ min: 1, max: 5000 })
      .withMessage('Text must be between 1 and 5000 characters')
      .customSanitizer(sanitizers.removeHtml),
    
    body('voiceModelId')
      .matches(patterns.uuid)
      .withMessage('Invalid voice model ID format'),
    
    body('speed')
      .optional()
      .isFloat({ min: 0.5, max: 2.0 })
      .withMessage('Speed must be between 0.5 and 2.0'),
    
    body('pitch')
      .optional()
      .isFloat({ min: 0.5, max: 2.0 })
      .withMessage('Pitch must be between 0.5 and 2.0'),
    
    body('emotion')
      .optional()
      .isIn(['neutral', 'happy', 'sad', 'angry', 'excited', 'calm'])
      .withMessage('Emotion must be one of: neutral, happy, sad, angry, excited, calm'),
  ],

  uploadAudio: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name must be between 1 and 100 characters'),
    
    body('description')
      .optional()
      .trim()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters')
      .customSanitizer(sanitizers.removeHtml),
  ],
};

/**
 * User management validation schemas
 */
export const userValidation = {
  updateProfile: [
    body('name')
      .optional()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters')
      .matches(/^[a-zA-Z\s'-]+$/)
      .withMessage('Name can only contain letters, spaces, apostrophes, and hyphens'),
    
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Please provide a valid email address'),
  ],

  changePassword: [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    
    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(patterns.password)
      .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Password confirmation does not match new password');
        }
        return true;
      }),
  ],
};

/**
 * Query parameter validation
 */
export const queryValidation = {
  pagination: [
    query('page')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Page must be a positive integer between 1 and 1000')
      .toInt(),
    
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be a positive integer between 1 and 100')
      .toInt(),
    
    query('sort')
      .optional()
      .isIn(['createdAt', 'updatedAt', 'name', 'email'])
      .withMessage('Sort field must be one of: createdAt, updatedAt, name, email'),
    
    query('order')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Order must be either asc or desc'),
  ],

  search: [
    query('q')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters')
      .customSanitizer(sanitizers.removeHtml),
    
    query('category')
      .optional()
      .isIn(['voice-models', 'synthesis-tasks', 'users'])
      .withMessage('Category must be one of: voice-models, synthesis-tasks, users'),
  ],
};

/**
 * URL parameter validation
 */
export const paramValidation = {
  id: [
    param('id')
      .matches(patterns.uuid)
      .withMessage('Invalid ID format'),
  ],

  userId: [
    param('userId')
      .matches(patterns.uuid)
      .withMessage('Invalid user ID format'),
  ],

  modelId: [
    param('modelId')
      .matches(patterns.uuid)
      .withMessage('Invalid model ID format'),
  ],
};

/**
 * File upload validation
 */
export const fileValidation = {
  audioFile: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedMimes: [
      'audio/mpeg',
      'audio/wav',
      'audio/wave',
      'audio/x-wav',
      'audio/flac',
      'audio/mp4',
      'audio/aac',
      'audio/ogg',
      'audio/webm',
    ],
    maxDuration: 300, // 5 minutes in seconds
  },
};

/**
 * Custom validation helpers
 */
export const customValidators = {
  isValidAudioFile: (file: Express.Multer.File | undefined) => {
    if (!file) {
      throw new Error('Audio file is required');
    }
    
    if (!fileValidation.audioFile.allowedMimes.includes(file.mimetype)) {
      throw new Error('Invalid audio file format');
    }
    
    if (file.size > fileValidation.audioFile.maxSize) {
      throw new Error('Audio file too large (max 50MB)');
    }
    
    return true;
  },

  isValidSubscriptionAction: (action: string, currentTier: string) => {
    const validActions = ['upgrade', 'downgrade', 'cancel'];
    if (!validActions.includes(action)) {
      throw new Error('Invalid subscription action');
    }
    
    // Add business logic validation here
    return true;
  },
};