/**
 * File Upload Configuration
 * Handles secure file uploads for admin panel content
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { 
  minioClient, 
  BUCKETS, 
  uploadFile, 
  getPublicUrl, 
  deleteFile 
} = require('../config/minio');

// Ensure upload directories exist (fallback for local storage)
const uploadDirs = {
  library: path.join(__dirname, '../uploads/library'),
  innovation: path.join(__dirname, '../uploads/innovation'),
  internship: path.join(__dirname, '../uploads/internship'),
  hackathon: path.join(__dirname, '../uploads/hackathon'),
  temp: path.join(__dirname, '../uploads/temp')
};

// Create directories if they don't exist
Object.values(uploadDirs).forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Map content types to MinIO buckets
const bucketMap = {
  library: BUCKETS.LIBRARY,
  innovation: BUCKETS.INNOVATION,
  internship: BUCKETS.INTERNSHIP,
  hackathon: BUCKETS.HACKATHON,
  temp: BUCKETS.GENERAL
};

// File type configurations
const fileTypes = {
  documents: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain'
    ],
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt'],
    maxSize: 10 * 1024 * 1024 // 10MB
  },
  images: {
    mimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/svg+xml'
    ],
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    maxSize: 5 * 1024 * 1024 // 5MB
  },
  code: {
    mimeTypes: [
      'text/plain',
      'application/javascript',
      'text/html',
      'text/css',
      'application/json',
      'application/xml'
    ],
    extensions: ['.js', '.html', '.css', '.json', '.xml', '.py', '.java', '.cpp', '.c'],
    maxSize: 2 * 1024 * 1024 // 2MB
  }
};

/**
 * Generate unique filename
 */
const generateFilename = (originalname, userId) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = path.extname(originalname);
  const baseName = path.basename(originalname, extension).replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${userId}_${timestamp}_${randomString}_${baseName}${extension}`;
};

/**
 * File filter function
 */
const createFileFilter = (allowedTypes = ['documents']) => {
  return (req, file, cb) => {
    try {
      // Check if file type is allowed
      const isAllowed = allowedTypes.some(type => {
        const config = fileTypes[type];
        return config.mimeTypes.includes(file.mimetype) || 
               config.extensions.includes(path.extname(file.originalname).toLowerCase());
      });

      if (!isAllowed) {
        const allowedExtensions = allowedTypes.flatMap(type => fileTypes[type].extensions);
        return cb(new Error(`Invalid file type. Allowed: ${allowedExtensions.join(', ')}`), false);
      }

      // Additional security checks
      if (file.originalname.includes('..') || file.originalname.includes('/') || file.originalname.includes('\\')) {
        return cb(new Error('Invalid filename'), false);
      }

      cb(null, true);
    } catch (error) {
      cb(error, false);
    }
  };
};

/**
 * Storage configuration
 * Uses memory storage to allow processing before saving (to MinIO or Disk)
 */
const storage = multer.memoryStorage();

/**
 * Create multer upload configurations
 */
const uploadConfigs = {
  library: multer({
    storage: storage,
    fileFilter: createFileFilter(['documents', 'images']),
    limits: {
      fileSize: fileTypes.documents.maxSize,
      files: 5
    }
  }),
  
  innovation: multer({
    storage: storage,
    fileFilter: createFileFilter(['documents', 'images', 'code']),
    limits: {
      fileSize: fileTypes.documents.maxSize,
      files: 10
    }
  }),
  
  internship: multer({
    storage: storage,
    fileFilter: createFileFilter(['documents', 'images']),
    limits: {
      fileSize: fileTypes.documents.maxSize,
      files: 3
    }
  }),
  
  hackathon: multer({
    storage: storage,
    fileFilter: createFileFilter(['documents', 'images']),
    limits: {
      fileSize: fileTypes.documents.maxSize,
      files: 8
    }
  }),
  
  general: multer({
    storage: storage,
    fileFilter: createFileFilter(['documents', 'images']),
    limits: {
      fileSize: fileTypes.documents.maxSize,
      files: 5
    }
  })
};

/**
 * File upload middleware with error handling and MinIO integration
 */
const handleUpload = (contentType, fieldName = 'files') => {
  const upload = uploadConfigs[contentType] || uploadConfigs.general;
  const bucketName = bucketMap[contentType] || BUCKETS.GENERAL;
  
  return (req, res, next) => {
    upload.array(fieldName)(req, res, async (err) => {
      if (err) {
        console.error('File upload error:', err);
        
        // Handle specific multer errors
        if (err instanceof multer.MulterError) {
          switch (err.code) {
            case 'LIMIT_FILE_SIZE':
              return res.status(400).json({
                success: false,
                message: 'File too large',
                maxSize: `${Math.round(fileTypes.documents.maxSize / 1024 / 1024)}MB`
              });
            case 'LIMIT_FILE_COUNT':
              return res.status(400).json({
                success: false,
                message: 'Too many files',
                maxFiles: upload.options.limits.files
              });
            case 'LIMIT_UNEXPECTED_FILE':
              return res.status(400).json({
                success: false,
                message: 'Unexpected field name'
              });
            default:
              return res.status(400).json({
                success: false,
                message: 'Upload error',
                error: err.message
              });
          }
        }
        
        // Handle custom errors
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed'
        });
      }
      
      // Process uploaded files
      if (req.files && req.files.length > 0) {
        try {
          const processedFiles = [];
          const userId = req.user?._id?.toString() || 'anonymous';

          for (const file of req.files) {
            const filename = generateFilename(file.originalname, userId);
            let fileUrl;
            let storageType;

            try {
              // Try uploading to MinIO
              await uploadFile(bucketName, filename, file.buffer, file.mimetype);
              fileUrl = await getPublicUrl(bucketName, filename);
              storageType = 'minio';
            } catch (minioError) {
              console.warn('MinIO upload failed, falling back to local storage:', minioError.message);
              
              // Fallback to local storage
              const uploadDir = uploadDirs[contentType] || uploadDirs.temp;
              const filePath = path.join(uploadDir, filename);
              fs.writeFileSync(filePath, file.buffer);
              fileUrl = `/api/v1/files/${contentType}/${filename}`;
              storageType = 'local';
            }

            processedFiles.push({
              originalName: file.originalname,
              filename: filename,
              url: fileUrl,
              path: fileUrl, // For backward compatibility
              size: file.size,
              mimetype: file.mimetype,
              storageType: storageType,
              bucket: bucketName,
              uploadedAt: new Date()
            });
          }

          req.uploadedFiles = processedFiles;
          next();
        } catch (processError) {
          console.error('File processing error:', processError);
          res.status(500).json({
            success: false,
            message: 'File processing failed'
          });
        }
      } else {
        next();
      }
    });
  };
};

/**
 * File validation middleware
 */
const validateFiles = async (req, res, next) => {
  // If no files were uploaded/processed, skip
  if (!req.uploadedFiles || req.uploadedFiles.length === 0) {
    return next();
  }

  try {
    // Additional file validation
    for (const file of req.uploadedFiles) {
      // Check file size again (though multer limits should catch this)
      if (file.size > fileTypes.documents.maxSize) {
        await cleanupFiles(req.uploadedFiles);
        return res.status(400).json({
          success: false,
          message: `File ${file.originalName} is too large`
        });
      }

      // Validate file extension matches mime type
      const extension = path.extname(file.originalName).toLowerCase();
      const mimeTypeValid = Object.values(fileTypes).some(type => 
        type.mimeTypes.includes(file.mimetype) && type.extensions.includes(extension)
      );

      if (!mimeTypeValid) {
        await cleanupFiles(req.uploadedFiles);
        return res.status(400).json({
          success: false,
          message: `Invalid file type: ${file.originalName}`
        });
      }
    }

    next();
  } catch (error) {
    console.error('File validation error:', error);
    
    // Clean up any uploaded files
    await cleanupFiles(req.uploadedFiles);
    
    res.status(500).json({
      success: false,
      message: 'File validation failed'
    });
  }
};

/**
 * File cleanup utility
 */
const cleanupFiles = async (files) => {
  if (!files) return;
  
  const fileList = Array.isArray(files) ? files : [files];

  for (const file of fileList) {
    try {
      if (file.storageType === 'minio') {
        await deleteFile(file.bucket, file.filename);
        console.log(`Cleaned up MinIO file: ${file.filename}`);
      } else if (file.path && fs.existsSync(file.path)) {
        // Check if it's a local file path (not a URL)
        if (!file.path.startsWith('http') && !file.path.startsWith('/')) {
           fs.unlinkSync(file.path);
           console.log(`Cleaned up local file: ${file.path}`);
        }
      }
    } catch (error) {
      console.error(`Failed to cleanup file ${file.filename || 'unknown'}:`, error);
    }
  }
};

/**
 * Get file URL for serving
 */
const getFileUrl = (filename, contentType) => {
  // This is mainly for local files. MinIO files will have their URL generated at upload time.
  return `/api/v1/files/${contentType}/${filename}`;
};

/**
 * File serving middleware
 */
const serveFile = (req, res, next) => {
  try {
    const { contentType, filename } = req.params;
    const uploadDir = uploadDirs[contentType];
    
    if (!uploadDir) {
      return res.status(404).json({
        success: false,
        message: 'Invalid content type'
      });
    }

    const filePath = path.join(uploadDir, filename);
    
    // Security check - ensure file is within upload directory
    const resolvedPath = path.resolve(filePath);
    const resolvedUploadDir = path.resolve(uploadDir);
    
    if (!resolvedPath.startsWith(resolvedUploadDir)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Serve the file
    res.sendFile(resolvedPath);
  } catch (error) {
    console.error('File serving error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to serve file'
    });
  }
};

module.exports = {
  uploadConfigs,
  handleUpload,
  validateFiles,
  cleanupFiles,
  getFileUrl,
  serveFile,
  fileTypes,
  uploadDirs
};