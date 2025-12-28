import { prisma } from './database';

// In-memory token blacklist for quick access
// In production, use Redis for better performance
const tokenBlacklist = new Set<string>();

export class TokenBlacklistService {
  /**
   * Add a token to the blacklist
   */
  static async addToBlacklist(tokenId: string, expiresAt: Date): Promise<void> {
    try {
      // Add to database for persistence
      await prisma.tokenBlacklist.create({
        data: {
          tokenId,
          expiresAt,
        },
      });

      // Add to in-memory cache for quick lookup
      tokenBlacklist.add(tokenId);
    } catch (error) {
      console.error('Error adding token to blacklist:', error);
      // Still add to memory even if DB fails
      tokenBlacklist.add(tokenId);
    }
  }

  /**
   * Check if a token is blacklisted
   */
  static async isBlacklisted(tokenId: string): Promise<boolean> {
    // Quick check in memory first
    if (tokenBlacklist.has(tokenId)) {
      return true;
    }

    // Check database if not in memory
    try {
      const blacklistedToken = await prisma.tokenBlacklist.findUnique({
        where: { tokenId },
      });

      if (blacklistedToken) {
        // Add to memory cache for future quick access
        tokenBlacklist.add(tokenId);
        return true;
      }
    } catch (error) {
      console.error('Error checking token blacklist:', error);
    }

    return false;
  }

  /**
   * Clean up expired tokens from blacklist
   * This should be run periodically
   */
  static async cleanupExpiredTokens(): Promise<void> {
    try {
      const now = new Date();
      
      // Remove expired tokens from database
      const expired = await prisma.tokenBlacklist.findMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
        select: { tokenId: true },
      });

      // Remove from memory cache
      expired.forEach((token: { tokenId: string }) => tokenBlacklist.delete(token.tokenId));

      // Delete from database
      await prisma.tokenBlacklist.deleteMany({
        where: {
          expiresAt: {
            lt: now,
          },
        },
      });

      console.log(`Cleaned up ${expired.length} expired tokens from blacklist`);
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
    }
  }

  /**
   * Initialize the in-memory blacklist from database on startup
   */
  static async initialize(): Promise<void> {
    try {
      const now = new Date();
      const activeTokens = await prisma.tokenBlacklist.findMany({
        where: {
          expiresAt: {
            gt: now,
          },
        },
        select: { tokenId: true },
      });

      activeTokens.forEach((token: { tokenId: string }) => tokenBlacklist.add(token.tokenId));
      console.log(`Loaded ${activeTokens.length} blacklisted tokens into memory`);
    } catch (error) {
      console.error('Error initializing token blacklist:', error);
    }
  }
}

// Set up periodic cleanup (every hour)
setInterval(() => {
  TokenBlacklistService.cleanupExpiredTokens();
}, 60 * 60 * 1000);