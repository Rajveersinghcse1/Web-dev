/**
 * MinIO Configuration and Setup
 * Handles S3-compatible object storage for file uploads
 */

const { Client } = require('minio');
const path = require('path');
const fs = require('fs');

// MinIO client configuration
const minioClient = new Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true' || false,
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

// Test connection and fallback if MinIO is not available
let minioAvailable = false;

const testMinIOConnection = async () => {
  try {
    await minioClient.listBuckets();
    minioAvailable = true;
    console.log('✅ MinIO connection successful');
    return true;
  } catch (error) {
    console.warn('⚠️ MinIO not available, using local file storage:', error.message);
    minioAvailable = false;
    return false;
  }
};

// Bucket names for different content types
const BUCKETS = {
  LIBRARY: 'library-content',
  INNOVATION: 'innovation-projects',
  INTERNSHIP: 'internship-documents',
  HACKATHON: 'hackathon-files',
  AVATARS: 'user-avatars',
  GENERAL: 'general-uploads',
  FEED_IMAGES: 'feed-images',
  FEED_VIDEOS: 'feed-videos',
  FEED_DOCUMENTS: 'feed-documents',
  STORY_IMAGES: 'story-images',
  STORY_VIDEOS: 'story-videos'
};

/**
 * Initialize MinIO buckets
 */
const initializeBuckets = async () => {
  try {
    console.log('🔄 Initializing MinIO buckets...');
    
    for (const [key, bucketName] of Object.entries(BUCKETS)) {
      try {
        // Check if bucket exists
        const bucketExists = await minioClient.bucketExists(bucketName);
        
        if (!bucketExists) {
          // Create bucket
          await minioClient.makeBucket(bucketName, 'us-east-1');
          console.log(`✅ Created bucket: ${bucketName}`);
          
          // Set bucket policy for public read access (if needed)
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
          console.log(`✅ Set policy for bucket: ${bucketName}`);
        } else {
          console.log(`✅ Bucket already exists: ${bucketName}`);
        }
      } catch (error) {
        console.error(`❌ Error with bucket ${bucketName}:`, error.message);
      }
    }
    
    console.log('✅ MinIO buckets initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ MinIO initialization failed:', error);
    return false;
  }
};

/**
 * Upload file to MinIO
 * @param {string} bucketName - Target bucket
 * @param {string} objectName - Object name in bucket
 * @param {Buffer|Stream} data - File data
 * @param {Object} metadata - File metadata
 */
const uploadFile = async (bucketName, objectName, data, metadata = {}) => {
  try {
    console.log(`🔄 Uploading file to MinIO: ${bucketName}/${objectName}`);
    
    // Ensure bucket exists
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName, 'us-east-1');
      console.log(`✅ Created bucket on-demand: ${bucketName}`);
    }
    
    // Upload file
    const result = await minioClient.putObject(bucketName, objectName, data, metadata);
    
    console.log(`✅ File uploaded successfully: ${result.etag}`);
    
    // Generate public URL
    const publicUrl = await getPublicUrl(bucketName, objectName);
    
    return {
      success: true,
      bucket: bucketName,
      objectName,
      etag: result.etag,
      url: publicUrl,
      metadata
    };
  } catch (error) {
    console.error('❌ MinIO upload failed:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }
};

/**
 * Get public URL for an object
 * @param {string} bucketName - Bucket name
 * @param {string} objectName - Object name
 */
const getPublicUrl = async (bucketName, objectName) => {
  try {
    // For public access, construct direct URL
    const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
    const port = process.env.MINIO_PORT || 9000;
    const protocol = process.env.MINIO_USE_SSL === 'true' ? 'https' : 'http';
    
    return `${protocol}://${endpoint}:${port}/${bucketName}/${objectName}`;
  } catch (error) {
    console.error('❌ Failed to get public URL:', error);
    return null;
  }
};

/**
 * Get presigned URL for secure access
 * @param {string} bucketName - Bucket name
 * @param {string} objectName - Object name
 * @param {number} expiry - URL expiry in seconds (default: 7 days)
 */
const getPresignedUrl = async (bucketName, objectName, expiry = 7 * 24 * 60 * 60) => {
  try {
    const url = await minioClient.presignedGetObject(bucketName, objectName, expiry);
    return url;
  } catch (error) {
    console.error('❌ Failed to get presigned URL:', error);
    throw new Error(`Failed to generate presigned URL: ${error.message}`);
  }
};

/**
 * Delete file from MinIO
 * @param {string} bucketName - Bucket name
 * @param {string} objectName - Object name
 */
const deleteFile = async (bucketName, objectName) => {
  try {
    await minioClient.removeObject(bucketName, objectName);
    console.log(`✅ File deleted: ${bucketName}/${objectName}`);
    return true;
  } catch (error) {
    console.error('❌ MinIO delete failed:', error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
};

/**
 * List files in bucket
 * @param {string} bucketName - Bucket name
 * @param {string} prefix - Object prefix filter
 */
const listFiles = async (bucketName, prefix = '') => {
  try {
    const files = [];
    const stream = minioClient.listObjects(bucketName, prefix, true);
    
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => {
        files.push({
          name: obj.name,
          size: obj.size,
          lastModified: obj.lastModified,
          etag: obj.etag
        });
      });
      
      stream.on('end', () => {
        resolve(files);
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error('❌ MinIO list failed:', error);
    throw new Error(`Failed to list files: ${error.message}`);
  }
};

/**
 * Check MinIO connection health
 */
const checkHealth = async () => {
  try {
    // Simple health check by listing buckets
    await minioClient.listBuckets();
    return { status: 'healthy', timestamp: new Date() };
  } catch (error) {
    console.error('❌ MinIO health check failed:', error);
    return { status: 'unhealthy', error: error.message, timestamp: new Date() };
  }
};

/**
 * Get file metadata
 * @param {string} bucketName - Bucket name
 * @param {string} objectName - Object name
 */
const getFileInfo = async (bucketName, objectName) => {
  try {
    const stat = await minioClient.statObject(bucketName, objectName);
    return {
      size: stat.size,
      lastModified: stat.lastModified,
      etag: stat.etag,
      contentType: stat.metaData['content-type'],
      metadata: stat.metaData
    };
  } catch (error) {
    console.error('❌ Failed to get file info:', error);
    throw new Error(`Failed to get file info: ${error.message}`);
  }
};

/**
 * Generate unique filename to prevent conflicts
 * @param {string} originalName - Original filename
 * @param {string} prefix - Optional prefix
 */
const generateUniqueFilename = (originalName, prefix = '') => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = path.extname(originalName);
  const name = path.basename(originalName, extension);
  
  return `${prefix}${prefix ? '_' : ''}${timestamp}_${random}_${name}${extension}`;
};

/**
 * Validate file type
 * @param {string} filename - File name
 * @param {Array} allowedTypes - Allowed file extensions
 */
const validateFileType = (filename, allowedTypes = ['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif']) => {
  const extension = path.extname(filename).toLowerCase();
  return allowedTypes.includes(extension);
};

/**
 * Get file size in human readable format
 * @param {number} bytes - File size in bytes
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

module.exports = {
  minioClient,
  BUCKETS,
  initializeBuckets,
  uploadFile,
  getPublicUrl,
  getPresignedUrl,
  deleteFile,
  listFiles,
  checkHealth,
  getFileInfo,
  generateUniqueFilename,
  validateFileType,
  formatFileSize
};