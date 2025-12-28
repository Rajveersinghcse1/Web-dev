import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../utils/database';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import { generateAccessToken, generateRefreshToken, verifyToken, decodeToken } from '../utils/jwt';
import { TokenBlacklistService } from '../utils/tokenBlacklist';
import { authValidation, validateRequest } from '../utils/validation';

const router = Router();

// Register endpoint
router.post('/register', 
  authValidation.register,
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {

  const { email, password, name } = req.body;

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw createError('User already exists', 409);
  }

  // Hash password
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  const passwordHash = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      name: true,
      subscriptionTier: true,
      createdAt: true,
    }
  });

  // Generate JWT tokens
  const token = generateAccessToken({
    userId: user.id,
    email: user.email,
    subscriptionTier: user.subscriptionTier
  });

  const refreshToken = generateRefreshToken(user.id);

  logger.info(`User registered: ${email}`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token,
      refreshToken,
    }
  });
}));

// Login endpoint
router.post('/login', 
  authValidation.login,
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {

  const { email, password } = req.body;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
      subscriptionTier: true,
      isActive: true,
      createdAt: true,
    }
  });

  if (!user || !user.isActive) {
    throw createError('Invalid credentials', 401);
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);
  if (!isValidPassword) {
    throw createError('Invalid credentials', 401);
  }

  // Generate JWT tokens
  const token = generateAccessToken({
    userId: user.id,
    email: user.email,
    subscriptionTier: user.subscriptionTier
  });

  const refreshToken = generateRefreshToken(user.id);

  logger.info(`User logged in: ${email}`);

  // Remove password hash from response
  const { passwordHash, ...userWithoutPassword } = user;

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: userWithoutPassword,
      token,
      refreshToken,
    }
  });
}));

// Logout endpoint - properly blacklist tokens
router.post('/logout', asyncHandler(async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader && authHeader.split(' ')[1];
  const { refreshToken } = req.body;

  try {
    // Blacklist access token if provided
    if (accessToken) {
      const decodedAccess = decodeToken(accessToken);
      if (decodedAccess?.jti && decodedAccess.exp) {
        await TokenBlacklistService.addToBlacklist(
          decodedAccess.jti,
          new Date(decodedAccess.exp * 1000)
        );
      }
    }

    // Blacklist refresh token if provided
    if (refreshToken) {
      const decodedRefresh = decodeToken(refreshToken);
      if (decodedRefresh?.jti && decodedRefresh.exp) {
        await TokenBlacklistService.addToBlacklist(
          decodedRefresh.jti,
          new Date(decodedRefresh.exp * 1000)
        );
      }
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    // Even if blacklisting fails, still return success
    // since the client will discard the tokens anyway
    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  }
}));

// Token refresh endpoint
router.post('/refresh', 
  authValidation.refresh,
  validateRequest,
  asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  try {
    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      throw createError('Invalid token type', 401);
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

    // Generate new tokens
    const newToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      subscriptionTier: user.subscriptionTier
    });

    const newRefreshToken = generateRefreshToken(user.id);

    res.json({
      success: true,
      data: { 
        token: newToken,
        refreshToken: newRefreshToken 
      }
    });
  } catch (error) {
    throw createError('Invalid or expired refresh token', 401);
  }
}));

export default router;