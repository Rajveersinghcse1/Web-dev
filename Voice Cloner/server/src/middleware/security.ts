import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import compression from 'compression';
import morgan from 'morgan';
import { Request, Response, NextFunction } from 'express';

/**
 * Security Headers Middleware
 * Adds various security headers to protect against common attacks
 */
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow for audio processing
});

/**
 * Rate Limiting Middleware
 * Different limits for different types of endpoints
 */

// General API rate limiting
export const generalRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication rate limiting (stricter)
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
});

// Voice processing rate limiting (very strict due to resource intensity)
export const voiceRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 voice processing requests per hour
  message: {
    error: 'Voice processing rate limit exceeded. Please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Compression Middleware
 * Compresses response bodies for better performance
 */
export const compressionMiddleware = compression({
  filter: (req: Request, res: Response) => {
    // Don't compress responses if this request has a 'x-no-compression' header
    if (req.headers['x-no-compression']) {
      return false;
    }

    // Don't compress audio files (they're already compressed)
    const contentType = res.getHeader('content-type') as string;
    if (contentType && contentType.startsWith('audio/')) {
      return false;
    }

    // Use compression default filter function
    return compression.filter(req, res);
  },
  level: 6, // Compression level (1-9, 6 is default)
  threshold: 1024, // Only compress if response size is >= 1KB
});

/**
 * Request Logging Middleware
 * Logs HTTP requests for monitoring and debugging
 */
export const requestLogging = morgan('combined', {
  skip: (req: Request) => {
    // Skip logging for health checks and static assets
    return req.url === '/health' || req.url.startsWith('/static/');
  },
});

/**
 * Request Size Limiting Middleware
 * Prevents large request bodies that could cause DoS
 */
export const requestSizeLimit = (req: Request, res: Response, next: NextFunction): void => {
  const contentLength = parseInt(req.headers['content-length'] || '0', 10);
  const maxSize = 50 * 1024 * 1024; // 50MB max (for voice file uploads)

  if (contentLength > maxSize) {
    res.status(413).json({
      error: 'Request entity too large',
      maxSize: '50MB',
    });
    return;
  }

  next();
};

/**
 * CORS Configuration
 * Configured for production with specific origins
 */
export const corsOptions = {
  origin: function (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
    // Allow requests with no origin (like mobile apps, Postman)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://your-production-domain.com', // Replace with actual domain
    ];

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400, // 24 hours
};

/**
 * Security Response Headers
 * Additional security headers for API responses
 */
export const securityResponseHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Remove server information
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-API-Version', '1.0');
  res.setHeader('X-Response-Time', Date.now().toString());
  
  next();
};

/**
 * Production Error Handler Enhancement
 * Sanitizes error responses in production
 */
export const sanitizeErrors = (err: any, req: Request, res: Response, next: NextFunction) => {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Log full error details server-side
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Send sanitized error to client
  const errorResponse = {
    error: isProduction ? 'Internal server error' : err.message,
    ...(isProduction ? {} : { stack: err.stack }),
    requestId: req.headers['x-request-id'] || 'unknown',
  };

  res.status(err.statusCode || 500).json(errorResponse);
};

/**
 * Request ID Middleware
 * Adds unique request ID for tracking and debugging
 */
export const requestId = (req: Request, res: Response, next: NextFunction) => {
  const id = req.headers['x-request-id'] || 
             req.headers['x-correlation-id'] || 
             Math.random().toString(36).substring(2, 15);
  
  req.headers['x-request-id'] = id as string;
  res.setHeader('X-Request-ID', id);
  
  next();
};