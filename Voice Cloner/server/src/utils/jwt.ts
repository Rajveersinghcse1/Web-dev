import * as jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface JWTPayload {
  userId: string;
  email: string;
  subscriptionTier: string;
  type?: 'access' | 'refresh';
  jti?: string; // JWT ID for blacklisting
  iat?: number; // Issued at
  exp?: number; // Expiration time
}

/**
 * Generate a unique JWT ID
 */
function generateJwtId(): string {
  return crypto.randomUUID();
}

export const generateAccessToken = (payload: Omit<JWTPayload, 'type' | 'jti'>): string => {
  return jwt.sign(
    { ...payload, type: 'access', jti: generateJwtId() },
    process.env.JWT_SECRET as string,
    { 
      expiresIn: '7d',
      issuer: 'voice-cloner-api',
      audience: 'voice-cloner-client'
    }
  );
};

export const generateRefreshToken = (userId: string): string => {
  return jwt.sign(
    { userId, type: 'refresh', jti: generateJwtId() },
    process.env.JWT_SECRET as string,
    { 
      expiresIn: '30d',
      issuer: 'voice-cloner-api',
      audience: 'voice-cloner-client'
    }
  );
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string, {
      issuer: 'voice-cloner-api',
      audience: 'voice-cloner-client'
    }) as JWTPayload;
    
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

export const decodeToken = (token: string): JWTPayload | null => {
  try {
    return jwt.decode(token) as JWTPayload;
  } catch {
    return null;
  }
};