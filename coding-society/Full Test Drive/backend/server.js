const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
require('dotenv').config();

const logger = require('./utils/logger');
const { connectMongoDB } = require('./config/database');
const { connectRedis } = require('./config/redis');
const { initMinIO } = require('./config/minio');

// Import routes
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');
const achievementRoutes = require('./routes/achievements');
const questRoutes = require('./routes/quests');
const storyRoutes = require('./routes/stories');
const feedbackRoutes = require('./routes/feedback');
const hackathonRoutes = require('./routes/hackathons');
const innovationRoutes = require('./routes/innovations');
const internshipRoutes = require('./routes/internships');
const libraryRoutes = require('./routes/library');
const fileRoutes = require('./routes/files');

const app = express();
const PORT = process.env.PORT || 5000;
const API_PREFIX = process.env.API_PREFIX || '/api/v1';

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Coding Society API',
      version: '1.0.0',
      description: 'Enhanced API for Coding Society platform with Docker integration',
    },
    servers: [
      {
        url: `http://localhost:${PORT}${API_PREFIX}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version || '1.0.0',
    services: {
      mongodb: global.mongoConnection?.readyState === 1 ? 'connected' : 'disconnected',
      redis: global.redisClient?.isReady ? 'connected' : 'disconnected',
      minio: global.minioClient ? 'configured' : 'not configured'
    }
  });
});

app.get(`${API_PREFIX}/health`, (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    api_version: 'v1',
    services: {
      mongodb: global.mongoConnection?.readyState === 1 ? 'connected' : 'disconnected',
      redis: global.redisClient?.isReady ? 'connected' : 'disconnected',
      minio: global.minioClient ? 'configured' : 'not configured'
    }
  });
});

// API Routes
app.use(`${API_PREFIX}/admin/users`, userRoutes);
app.use(`${API_PREFIX}/feed`, postRoutes);
app.use(`${API_PREFIX}/admin/achievements`, achievementRoutes);
app.use(`${API_PREFIX}/admin/quests`, questRoutes);
app.use(`${API_PREFIX}/admin/stories`, storyRoutes);
app.use(`${API_PREFIX}/admin/feedback`, feedbackRoutes);
app.use(`${API_PREFIX}/admin/hackathons`, hackathonRoutes);
app.use(`${API_PREFIX}/admin/innovations`, innovationRoutes);
app.use(`${API_PREFIX}/admin/internships`, internshipRoutes);
app.use(`${API_PREFIX}/admin/library`, libraryRoutes);
app.use(`${API_PREFIX}/files`, fileRoutes);

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: '🚀 Coding Society Backend API',
    version: '1.0.0',
    documentation: `/api-docs`,
    health: `/health`,
    api_base: API_PREFIX,
    endpoints: {
      users: `${API_PREFIX}/admin/users`,
      posts: `${API_PREFIX}/feed`,
      achievements: `${API_PREFIX}/admin/achievements`,
      quests: `${API_PREFIX}/admin/quests`,
      stories: `${API_PREFIX}/admin/stories`,
      feedback: `${API_PREFIX}/admin/feedback`,
      hackathons: `${API_PREFIX}/admin/hackathons`,
      innovations: `${API_PREFIX}/admin/innovations`,
      internships: `${API_PREFIX}/admin/internships`,
      library: `${API_PREFIX}/admin/library`,
      files: `${API_PREFIX}/files`
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

// Initialize connections and start server
async function startServer() {
  try {
    logger.info('🚀 Starting Coding Society Backend Server...');
    
    // Connect to databases and services
    await connectMongoDB();
    await connectRedis();
    await initMinIO();
    
    // Start the server
    const server = app.listen(PORT, () => {
      logger.info(`✅ Server is running on port ${PORT}`);
      logger.info(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      logger.info(`🩺 Health Check: http://localhost:${PORT}/health`);
      logger.info(`🌐 API Base URL: http://localhost:${PORT}${API_PREFIX}`);
      console.log(`
╔═══════════════════════════════════════════════════════════════╗
║                   🚀 CODING SOCIETY BACKEND                  ║
╠═══════════════════════════════════════════════════════════════╣
║ Server:      http://localhost:${PORT}                             ║
║ API Docs:    http://localhost:${PORT}/api-docs                    ║
║ Health:      http://localhost:${PORT}/health                      ║
║ Environment: ${process.env.NODE_ENV || 'development'}                                      ║
╠═══════════════════════════════════════════════════════════════╣
║ Services:                                                     ║
║ 🍃 MongoDB:  localhost:27017 (coding-society-mongodb)        ║
║ 🔴 Redis:    localhost:6379 (coding-society-redis)           ║
║ 📦 MinIO:    localhost:9000 (coding-society-minio)           ║
╚═══════════════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', async () => {
      logger.info('SIGINT received, shutting down gracefully');
      server.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = app;