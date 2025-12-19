const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/coding_society';
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    };

    logger.info('🍃 Connecting to MongoDB...');
    
    const connection = await mongoose.connect(mongoUri, options);
    global.mongoConnection = connection.connection;
    
    logger.info(`✅ MongoDB connected successfully to: ${connection.connection.host}:${connection.connection.port}`);
    logger.info(`📁 Database: ${connection.connection.name}`);
    
    // Connection event handlers
    mongoose.connection.on('connected', () => {
      logger.info('🍃 MongoDB connected');
    });
    
    mongoose.connection.on('error', (err) => {
      logger.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB disconnected');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      logger.info('🍃 MongoDB connection closed through app termination');
      process.exit(0);
    });
    
    return connection;
  } catch (error) {
    logger.error('❌ MongoDB connection failed:', error.message);
    
    // Log specific connection errors
    if (error.name === 'MongoNetworkError') {
      logger.error('📡 Network Error: Please check if MongoDB is running on localhost:27017');
      logger.error('🐳 Docker: Ensure coding-society-mongodb container is running');
    }
    
    throw error;
  }
};

// Health check for MongoDB
const checkMongoHealth = async () => {
  try {
    if (!mongoose.connection.readyState) {
      return { status: 'disconnected', message: 'No connection' };
    }
    
    await mongoose.connection.db.admin().ping();
    return { 
      status: 'healthy',
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      port: mongoose.connection.port,
      database: mongoose.connection.name
    };
  } catch (error) {
    return { 
      status: 'error', 
      message: error.message 
    };
  }
};

module.exports = {
  connectMongoDB,
  checkMongoHealth,
  mongoose
};