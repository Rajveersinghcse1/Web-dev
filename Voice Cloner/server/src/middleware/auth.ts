import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';
import { prisma } from '../utils/database';
import { verifyToken } from '../utils/jwt';
import { TokenBlacklistService } from '../utils/tokenBlacklist';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    name: string;
    subscriptionTier: string;
  };
}

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw createError('Access token required', 401);
    }

    const decoded = verifyToken(token);
    
    // Verify it's an access token
    if (decoded.type !== 'access') {
      throw createError('Invalid token type', 401);
    }

    // Check if token is blacklisted
    if (decoded.jti && await TokenBlacklistService.isBlacklisted(decoded.jti)) {
      throw createError('Token has been revoked', 401);
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        subscriptionTier: true,
        isActive: true,
      }
    });

    if (!user || !user.isActive) {
      throw createError('Invalid or inactive user', 401);
    }

    req.user = {
      userId: user.id,
      email: user.email,
      name: user.name,
      subscriptionTier: user.subscriptionTier,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(createError('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

export const requireSubscription = (tiers: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(createError('Authentication required', 401));
    }

    if (!tiers.includes(req.user.subscriptionTier)) {
      return next(createError('Subscription upgrade required', 403));
    }

    next();
  };
};