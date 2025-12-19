const Minio = require('minio');
const logger = require('../utils/logger');

let minioClient;

const initMinIO = async () => {
  try {
    const minioConfig = {
      endPoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: parseInt(process.env.MINIO_PORT) || 9000,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
      secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
    };

    logger.info('📦 Initializing MinIO client...');
    
    minioClient = new Minio.Client(minioConfig);
    global.minioClient = minioClient;

    // Test connection by listing buckets
    try {
      await minioClient.listBuckets();
      logger.info(`✅ MinIO connected successfully to: ${minioConfig.endPoint}:${minioConfig.port}`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        logger.error('📡 Connection refused: Please check if MinIO is running on localhost:9000');
        logger.error('🐳 Docker: Ensure coding-society-minio container is running');
      }
      throw error;
    }

    // Create default bucket if it doesn't exist
    const bucketName = process.env.MINIO_BUCKET_NAME || 'coding-society';
    await createBucketIfNotExists(bucketName);
    
    return minioClient;
  } catch (error) {
    logger.error('❌ MinIO initialization failed:', error.message);
    logger.warn('⚠️ Continuing without MinIO - file uploads will be disabled');
    return null;
  }
};

const createBucketIfNotExists = async (bucketName) => {
  try {
    const exists = await minioClient.bucketExists(bucketName);
    
    if (!exists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      logger.info(`📦 Created MinIO bucket: ${bucketName}`);
      
      // Set bucket policy for public read access
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${bucketName}/*`]
          }
        ]
      };
      
      await minioClient.setBucketPolicy(bucketName, JSON.stringify(policy));
      logger.info(`🔓 Set public read policy for bucket: ${bucketName}`);
    } else {
      logger.info(`📦 MinIO bucket exists: ${bucketName}`);
    }
  } catch (error) {
    logger.error(`❌ Error with MinIO bucket ${bucketName}:`, error.message);
  }
};

// MinIO helper functions
const minioHelpers = {
  // Upload file
  async uploadFile(bucketName, objectName, filePath, metaData = {}) {
    try {
      if (!minioClient) throw new Error('MinIO client not initialized');
      
      const etag = await minioClient.fPutObject(bucketName, objectName, filePath, metaData);
      logger.info(`📤 File uploaded: ${objectName} (etag: ${etag})`);
      return etag;
    } catch (error) {
      logger.error('MinIO upload error:', error.message);
      throw error;
    }
  },

  // Upload from buffer
  async uploadBuffer(bucketName, objectName, buffer, size, metaData = {}) {
    try {
      if (!minioClient) throw new Error('MinIO client not initialized');
      
      const etag = await minioClient.putObject(bucketName, objectName, buffer, size, metaData);
      logger.info(`📤 Buffer uploaded: ${objectName} (etag: ${etag})`);
      return etag;
    } catch (error) {
      logger.error('MinIO upload buffer error:', error.message);
      throw error;
    }
  },

  // Get file URL
  async getFileUrl(bucketName, objectName, expiry = 24 * 60 * 60) {
    try {
      if (!minioClient) throw new Error('MinIO client not initialized');
      
      const url = await minioClient.presignedGetObject(bucketName, objectName, expiry);
      return url;
    } catch (error) {
      logger.error('MinIO get URL error:', error.message);
      throw error;
    }
  },

  // Delete file
  async deleteFile(bucketName, objectName) {
    try {
      if (!minioClient) throw new Error('MinIO client not initialized');
      
      await minioClient.removeObject(bucketName, objectName);
      logger.info(`🗑️ File deleted: ${objectName}`);
      return true;
    } catch (error) {
      logger.error('MinIO delete error:', error.message);
      throw error;
    }
  },

  // List files
  async listFiles(bucketName, prefix = '', recursive = false) {
    try {
      if (!minioClient) throw new Error('MinIO client not initialized');
      
      const files = [];
      const stream = minioClient.listObjects(bucketName, prefix, recursive);
      
      return new Promise((resolve, reject) => {
        stream.on('data', (obj) => files.push(obj));
        stream.on('end', () => resolve(files));
        stream.on('error', reject);
      });
    } catch (error) {
      logger.error('MinIO list files error:', error.message);
      throw error;
    }
  },

  // Check if file exists
  async fileExists(bucketName, objectName) {
    try {
      if (!minioClient) return false;
      
      await minioClient.statObject(bucketName, objectName);
      return true;
    } catch (error) {
      if (error.code === 'NotFound') {
        return false;
      }
      logger.error('MinIO file exists error:', error.message);
      return false;
    }
  },

  // Get file metadata
  async getFileMetadata(bucketName, objectName) {
    try {
      if (!minioClient) throw new Error('MinIO client not initialized');
      
      const stat = await minioClient.statObject(bucketName, objectName);
      return stat;
    } catch (error) {
      logger.error('MinIO get metadata error:', error.message);
      throw error;
    }
  }
};

// Health check for MinIO
const checkMinioHealth = async () => {
  try {
    if (!minioClient) {
      return { status: 'disconnected', message: 'Client not initialized' };
    }
    
    const buckets = await minioClient.listBuckets();
    return { 
      status: 'healthy',
      buckets: buckets.length,
      endpoint: process.env.MINIO_ENDPOINT || 'localhost',
      port: process.env.MINIO_PORT || 9000
    };
  } catch (error) {
    return { 
      status: 'error', 
      message: error.message 
    };
  }
};

module.exports = {
  initMinIO,
  checkMinioHealth,
  minioHelpers,
  getMinioClient: () => minioClient
};