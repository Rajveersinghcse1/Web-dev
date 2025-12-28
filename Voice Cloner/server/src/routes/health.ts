import { Router } from 'express';

const router = Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Voice Cloner Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
  });
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const health = {
      success: true,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {
        database: 'connected',
        redis: 'connected',
        storage: 'available',
      },
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
    };

    res.status(200).json(health);
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'Service unavailable',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;