import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';
import { prisma } from '../utils/database';

const router = Router();

// Get user profile
router.get('/profile', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      subscriptionTier: true,
      emailVerified: true,
      createdAt: true,
      _count: {
        select: {
          voiceModels: true,
          voiceCloneJobs: true,
        }
      }
    }
  });

  res.json({
    success: true,
    data: user
  });
}));

// Get user usage stats
router.get('/stats', authenticateToken, asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.userId;

  const stats = await prisma.usageStats.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 30 // Last 30 days
  });

  const totalStats = await prisma.usageStats.aggregate({
    where: { userId },
    _sum: {
      voiceModelsCreated: true,
      synthesisTasksRun: true,
      audioMinutesProcessed: true,
      apiRequestsCount: true,
    }
  });

  res.json({
    success: true,
    data: {
      dailyStats: stats,
      totalStats: totalStats._sum,
    }
  });
}));

export default router;