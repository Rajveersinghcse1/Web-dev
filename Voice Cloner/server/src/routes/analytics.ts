import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getRealTimeAnalytics,
  getDashboardStats,
  getEmotionDistribution,
  getVoiceQualityMetrics,
  storeVoiceAnalytics,
  generateAIInsights,
  exportAnalyticsReport,
} from '../controllers/analyticsController';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// GET /api/analytics/realtime - Get real-time voice analytics
router.get('/realtime', getRealTimeAnalytics);

// GET /api/analytics/dashboard - Get dashboard statistics
router.get('/dashboard', getDashboardStats);

// GET /api/analytics/emotions - Get emotion distribution data
router.get('/emotions', getEmotionDistribution);

// GET /api/analytics/quality - Get voice quality metrics
router.get('/quality', getVoiceQualityMetrics);

// POST /api/analytics/store - Store voice analytics data
router.post('/store', storeVoiceAnalytics);

// GET /api/analytics/insights - Generate AI insights
router.get('/insights', generateAIInsights);

// GET /api/analytics/export - Export analytics report
router.get('/export', exportAnalyticsReport);

export default router;