const redis = require('redis');
const logger = require('../utils/logger');

let redisClient;

const connectRedis = async () => {
  try {
    const redisConfig = {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retry_strategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        logger.warn(`Redis reconnecting in ${delay}ms...`);
        return delay;
      }
    };

    logger.info('🔴 Connecting to Redis...');
    
    redisClient = redis.createClient({
      socket: {
        host: redisConfig.host,
        port: redisConfig.port,
        connectTimeout: 5000,
        lazyConnect: true
      },
      password: redisConfig.password
    });

    // Event handlers
    redisClient.on('connect', () => {
      logger.info('🔴 Redis connecting...');
    });

    redisClient.on('ready', () => {
      logger.info(`✅ Redis connected successfully to: ${redisConfig.host}:${redisConfig.port}`);
    });

    redisClient.on('error', (err) => {
      logger.error('❌ Redis connection error:', err.message);
      if (err.code === 'ECONNREFUSED') {
        logger.error('📡 Connection refused: Please check if Redis is running on localhost:6379');
        logger.error('🐳 Docker: Ensure coding-society-redis container is running');
      }
    });

    redisClient.on('end', () => {
      logger.warn('⚠️ Redis connection closed');
    });

    redisClient.on('reconnecting', () => {
      logger.info('🔄 Redis reconnecting...');
    });

    // Connect to Redis
    await redisClient.connect();
    global.redisClient = redisClient;
    
    // Test the connection
    await redisClient.ping();
    logger.info('🏓 Redis ping successful');
    
    return redisClient;
  } catch (error) {
    logger.error('❌ Redis connection failed:', error.message);
    
    // Don't throw error - allow app to continue without Redis
    logger.warn('⚠️ Continuing without Redis - caching will be disabled');
    return null;
  }
};

// Redis helper functions
const redisHelpers = {
  // Cache data with expiration
  async setCache(key, data, expireSeconds = 3600) {
    try {
      if (!redisClient || !redisClient.isReady) return false;
      
      const serializedData = JSON.stringify(data);
      await redisClient.setEx(key, expireSeconds, serializedData);
      return true;
    } catch (error) {
      logger.error('Redis setCache error:', error.message);
      return false;
    }
  },

  // Get cached data
  async getCache(key) {
    try {
      if (!redisClient || !redisClient.isReady) return null;
      
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      logger.error('Redis getCache error:', error.message);
      return null;
    }
  },

  // Delete cached data
  async deleteCache(key) {
    try {
      if (!redisClient || !redisClient.isReady) return false;
      
      await redisClient.del(key);
      return true;
    } catch (error) {
      logger.error('Redis deleteCache error:', error.message);
      return false;
    }
  },

  // Check if key exists
  async exists(key) {
    try {
      if (!redisClient || !redisClient.isReady) return false;
      
      const exists = await redisClient.exists(key);
      return exists === 1;
    } catch (error) {
      logger.error('Redis exists error:', error.message);
      return false;
    }
  },

  // Set with no expiration
  async set(key, data) {
    try {
      if (!redisClient || !redisClient.isReady) return false;
      
      const serializedData = JSON.stringify(data);
      await redisClient.set(key, serializedData);
      return true;
    } catch (error) {
      logger.error('Redis set error:', error.message);
      return false;
    }
  },

  // Increment counter
  async increment(key, amount = 1) {
    try {
      if (!redisClient || !redisClient.isReady) return 0;
      
      const result = await redisClient.incrBy(key, amount);
      return result;
    } catch (error) {
      logger.error('Redis increment error:', error.message);
      return 0;
    }
  }
};

// Health check for Redis
const checkRedisHealth = async () => {
  try {
    if (!redisClient || !redisClient.isReady) {
      return { status: 'disconnected', message: 'No connection' };
    }
    
    const pong = await redisClient.ping();
    return { 
      status: 'healthy',
      response: pong,
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379
    };
  } catch (error) {
    return { 
      status: 'error', 
      message: error.message 
    };
  }
};

module.exports = {
  connectRedis,
  checkRedisHealth,
  redisHelpers,
  getRedisClient: () => redisClient
};