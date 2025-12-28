import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import voiceRoutes from './routes/voice';
import userRoutes from './routes/user';
import healthRoutes from './routes/health';
import analyticsRoutes from './routes/analytics';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { logger, requestLogger } from './utils/logger';
import { setupWebSocket } from './services/websocket';
import { TokenBlacklistService } from './utils/tokenBlacklist';
import {
  securityHeaders,
  generalRateLimit,
  authRateLimit,
  voiceRateLimit,
  compressionMiddleware,
  requestLogging,
  requestSizeLimit,
  corsOptions,
  securityResponseHeaders,
  sanitizeErrors,
  requestId
} from './middleware/security';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server and Socket.IO instance
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.SOCKET_IO_CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Security middleware
app.use(requestId);
app.use(securityHeaders);
app.use(securityResponseHeaders);
app.use(compressionMiddleware);
app.use(requestSizeLimit);

// CORS configuration  
app.use(cors(corsOptions));

// Rate limiting - apply general rate limiting to all API routes
app.use('/api', generalRateLimit);

// Specific rate limiting for auth endpoints
app.use('/api/auth', authRateLimit);

// Specific rate limiting for voice processing endpoints
app.use('/api/voice', voiceRateLimit);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging
app.use(requestLogging);

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check endpoint
app.use('/health', healthRoutes);

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/voice', voiceRoutes);
app.use('/api/user', userRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// Error handling middleware (must be last)
app.use(sanitizeErrors);
app.use(errorHandler);

// Initialize WebSocket connections
setupWebSocket(io);

// Graceful shutdown handlers
const gracefulShutdown = () => {
  logger.info('Received shutdown signal, closing server gracefully...');
  
  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });

  // Force close after 30 seconds
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
const startServer = async () => {
  try {
    // Initialize token blacklist service
    await TokenBlacklistService.initialize();
    
    server.listen(PORT, () => {
      logger.info(`🚀 Voice Cloner Server is running on port ${PORT}`);
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 API Endpoint: http://localhost:${PORT}/api`);
      logger.info(`🌐 WebSocket Server: ws://localhost:${PORT}`);
      logger.info(`📝 Health Check: http://localhost:${PORT}/health`);
      logger.info(`🔐 JWT Authentication: Enabled`);
      logger.info(`🛡️ Security Middleware: Enabled`);
      logger.info(`⚡ Token Blacklist: Initialized`);
      logger.info(`📈 Analytics Endpoints: Enabled`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;