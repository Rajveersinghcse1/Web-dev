/**
 * Coding Society - Ultra-Advanced Gamified Learning Platform Backend
 * 
 * Main server file with Express.js, MongoDB, and comprehensive API endpoints
 * Features:
 * - User authentication and authorization
 * - Gamified learning system (XP, levels, achievements)
 * - Quest management with real-time code execution
 * - Skill tree progression tracking
 * - Battle arena for competitive coding
 * - Character customization and avatar system
 * - Real-time notifications and chat
 * - Analytics and progress tracking
 */

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const gameRoutes = require('./routes/game');
const questRoutes = require('./routes/quests');
const achievementRoutes = require('./routes/achievements');
const skillTreeRoutes = require('./routes/skillTrees');
const battleRoutes = require('./routes/battles');
const avatarRoutes = require('./routes/avatars');
const analyticsRoutes = require('./routes/analytics');
const feedRoutes = require('./routes/feed');
const storiesRoutes = require('./routes/stories');
const adminRoutes = require('./routes/admin');
const uploadRoutes = require('./routes/upload');
const filesRoutes = require('./routes/files');
const feedbackRoutes = require('./routes/feedback');
const resumeRoutes = require('./routes/resume');
const internshipRoutes = require('./routes/internships');
const hackathonRoutes = require('./routes/hackathons');
const innovationRoutes = require('./routes/innovation');
const libraryRoutes = require('./routes/library');

// Import MinIO configuration
const { initializeBuckets } = require('./config/minio');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const { auth: authMiddleware } = require('./middleware/auth');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api', limiter);

// CORS configuration
app.use(cors({
  origin: [
    process.env.CORS_ORIGIN || 'http://localhost:3002',
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:5173'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// General middleware
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/coding-society')
.then(async () => {
  console.log('🚀 Connected to MongoDB successfully!');
  console.log(`📊 Database: ${mongoose.connection.name}`);
  
  // Initialize MinIO buckets
  try {
    await initializeBuckets();
    console.log('✅ MinIO buckets initialized successfully!');
  } catch (error) {
    console.warn('⚠️ MinIO initialization failed, using local storage fallback:', error.message);
  }
})
.catch((error) => {
  console.error('❌ MongoDB connection error:', error);
  process.exit(1);
});

// Socket.io for real-time features
io.on('connection', (socket) => {
  console.log(`👤 User connected: ${socket.id}`);

  // Join user to their personal room
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });

  // Handle battle arena connections
  socket.on('join-battle', (battleId) => {
    socket.join(`battle-${battleId}`);
    socket.to(`battle-${battleId}`).emit('user-joined-battle', socket.id);
  });

  // Handle code execution updates
  socket.on('code-execution', (data) => {
    socket.to(`battle-${data.battleId}`).emit('code-execution-update', data);
  });

  // Handle achievement unlocks
  socket.on('achievement-unlocked', (data) => {
    io.to(`user-${data.userId}`).emit('achievement-notification', data);
  });

  // Handle level ups
  socket.on('level-up', (data) => {
    io.to(`user-${data.userId}`).emit('level-up-notification', data);
  });

  socket.on('disconnect', () => {
    console.log(`👤 User disconnected: ${socket.id}`);
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API routes
const apiPrefix = process.env.API_PREFIX || '/api/v1';

// Pass io instance to routes that need real-time features
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(`${apiPrefix}/auth`, authRoutes);
app.use(`${apiPrefix}/users`, authMiddleware, userRoutes);
app.use(`${apiPrefix}/game`, authMiddleware, gameRoutes);
app.use(`${apiPrefix}/quests`, authMiddleware, questRoutes);
app.use(`${apiPrefix}/achievements`, authMiddleware, achievementRoutes);
app.use(`${apiPrefix}/skill-trees`, authMiddleware, skillTreeRoutes);
app.use(`${apiPrefix}/battles`, authMiddleware, battleRoutes);
app.use(`${apiPrefix}/avatars`, authMiddleware, avatarRoutes);
app.use(`${apiPrefix}/analytics`, authMiddleware, analyticsRoutes);
app.use(`${apiPrefix}/feed`, feedRoutes);
app.use(`${apiPrefix}/stories`, storiesRoutes);
app.use(`${apiPrefix}/feedback`, feedbackRoutes);
app.use(`${apiPrefix}/internships`, internshipRoutes);
app.use(`${apiPrefix}/hackathons`, hackathonRoutes);
app.use(`${apiPrefix}/innovation`, innovationRoutes);
app.use(`${apiPrefix}/library`, libraryRoutes);
app.use(`${apiPrefix}/admin`, adminRoutes);
app.use(`${apiPrefix}/admin/upload`, uploadRoutes);
app.use(`${apiPrefix}/upload`, uploadRoutes);  // General upload endpoint
app.use(`${apiPrefix}/files`, filesRoutes);
app.use('/api/files', filesRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/resume', resumeRoutes);

// Welcome endpoint
app.get('/', (req, res) => {
  res.json({
    message: '🎮 Welcome to Coding Society - Ultra-Advanced Gamified Learning Platform!',
    version: '1.0.0',
    features: [
      '🎯 Interactive Quest System',
      '🌳 Skill Tree Progression',
      '🏆 Achievement System',
      '⚔️ Battle Arena',
      '👤 Character Customization',
      '📚 Interactive Tutorials',
      '📊 Real-time Analytics',
      '🔄 Live Updates'
    ],
    endpoints: {
      health: '/health',
      api: apiPrefix,
      auth: `${apiPrefix}/auth`,
      users: `${apiPrefix}/users`,
      game: `${apiPrefix}/game`,
      quests: `${apiPrefix}/quests`,
      achievements: `${apiPrefix}/achievements`,
      skillTrees: `${apiPrefix}/skill-trees`,
      battles: `${apiPrefix}/battles`,
      avatars: `${apiPrefix}/avatars`,
      analytics: `${apiPrefix}/analytics`,
      feed: `${apiPrefix}/feed`,
      stories: `${apiPrefix}/stories`,
      admin: `${apiPrefix}/admin`,
      files: `${apiPrefix}/files`
    }
  });
});

// API base endpoint - provides API information
app.get(apiPrefix, (req, res) => {
  res.json({
    name: 'Coding Society API',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: `${apiPrefix}/auth`,
      users: `${apiPrefix}/users`,
      game: `${apiPrefix}/game`,
      quests: `${apiPrefix}/quests`,
      achievements: `${apiPrefix}/achievements`,
      skillTrees: `${apiPrefix}/skill-trees`,
      battles: `${apiPrefix}/battles`,
      avatars: `${apiPrefix}/avatars`,
      analytics: `${apiPrefix}/analytics`,
      admin: `${apiPrefix}/admin`,
      files: `${apiPrefix}/files`
    },
    documentation: `${apiPrefix}/docs`,
    health: '/health'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist.`,
    availableEndpoints: [
      '/',
      '/health',
      `${apiPrefix}/auth`,
      `${apiPrefix}/users`,
      `${apiPrefix}/game`,
      `${apiPrefix}/quests`,
      `${apiPrefix}/achievements`,
      `${apiPrefix}/skill-trees`,
      `${apiPrefix}/battles`,
      `${apiPrefix}/avatars`,
      `${apiPrefix}/analytics`,
      `${apiPrefix}/admin`,
      `${apiPrefix}/files`
    ]
  });
});

// Error handling middleware
app.use(errorHandler);

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received');
  console.log('🔄 Closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received');
  console.log('🔄 Closing HTTP server');
  server.close(() => {
    console.log('✅ HTTP server closed');
    mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('🎮 ================================');
  console.log('🚀 CODING SOCIETY BACKEND STARTED');
  console.log('🎮 ================================');
  console.log(`🌐 Server running on port ${PORT}`);
  console.log(`🔗 Environment: ${process.env.NODE_ENV}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}${apiPrefix}`);
  console.log(`🔄 Socket.io enabled for real-time features`);
  console.log('🎯 Ultra-Advanced Gamified Learning Platform Ready!');
  console.log('🎮 ================================');
});

module.exports = { app, server, io };