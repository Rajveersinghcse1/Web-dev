const express = require('express');
const multer = require('multer');
const path = require('path');
const { minioHelpers } = require('../config/minio');
const logger = require('../utils/logger');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 
      'image/jpeg,image/png,image/gif,application/pdf,text/plain').split(',');
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`), false);
    }
  }
});

/**
 * @swagger
 * /api/v1/files/upload:
 *   post:
 *     summary: Upload a file
 *     tags: [Files]
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: file
 *         type: file
 *         required: true
 *         description: File to upload
 *       - in: formData
 *         name: category
 *         type: string
 *         description: File category (avatars, posts, documents)
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *       400:
 *         description: No file provided or invalid file
 *       500:
 *         description: Upload failed
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided'
      });
    }

    const { category = 'general' } = req.body;
    const bucketName = process.env.MINIO_BUCKET_NAME || 'coding-society';
    
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2);
    const extension = path.extname(req.file.originalname);
    const filename = `${category}/${timestamp}-${randomString}${extension}`;

    // Upload to MinIO
    const etag = await minioHelpers.uploadBuffer(
      bucketName,
      filename,
      req.file.buffer,
      req.file.size,
      {
        'Content-Type': req.file.mimetype,
        'Original-Name': req.file.originalname
      }
    );

    // Get file URL
    const fileUrl = await minioHelpers.getFileUrl(bucketName, filename);

    logger.logFile('upload', filename, {
      size: req.file.size,
      mimetype: req.file.mimetype,
      category,
      etag
    });

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype,
        category,
        url: fileUrl,
        etag
      }
    });
  } catch (error) {
    logger.error('Error uploading file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload file',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/files:
 *   get:
 *     summary: List files
 *     tags: [Files]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: List of files
 */
router.get('/', async (req, res) => {
  try {
    const { category, limit = 50 } = req.query;
    const bucketName = process.env.MINIO_BUCKET_NAME || 'coding-society';
    
    const prefix = category ? `${category}/` : '';
    const files = await minioHelpers.listFiles(bucketName, prefix);
    
    // Limit results and add URLs
    const limitedFiles = files.slice(0, parseInt(limit));
    const filesWithUrls = await Promise.all(
      limitedFiles.map(async (file) => ({
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        etag: file.etag,
        url: await minioHelpers.getFileUrl(bucketName, file.name)
      }))
    );

    logger.logFile('list', `${files.length} files`, { category, prefix });

    res.json({
      success: true,
      data: filesWithUrls,
      total: files.length,
      category: category || 'all'
    });
  } catch (error) {
    logger.error('Error listing files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list files',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/files/{filename}:
 *   get:
 *     summary: Get file URL
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: File name to get URL for
 *     responses:
 *       200:
 *         description: File URL retrieved
 *       404:
 *         description: File not found
 */
router.get('/:filename(*)', async (req, res) => {
  try {
    const filename = req.params.filename;
    const bucketName = process.env.MINIO_BUCKET_NAME || 'coding-society';
    
    // Check if file exists
    const exists = await minioHelpers.fileExists(bucketName, filename);
    
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Get file metadata and URL
    const [metadata, url] = await Promise.all([
      minioHelpers.getFileMetadata(bucketName, filename),
      minioHelpers.getFileUrl(bucketName, filename)
    ]);

    logger.logFile('access', filename);

    res.json({
      success: true,
      data: {
        filename,
        size: metadata.size,
        lastModified: metadata.lastModified,
        contentType: metadata.metaData['content-type'],
        url
      }
    });
  } catch (error) {
    logger.error('Error accessing file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to access file',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/files/{filename}:
 *   delete:
 *     summary: Delete file
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 */
router.delete('/:filename(*)', async (req, res) => {
  try {
    const filename = req.params.filename;
    const bucketName = process.env.MINIO_BUCKET_NAME || 'coding-society';
    
    // Check if file exists first
    const exists = await minioHelpers.fileExists(bucketName, filename);
    
    if (!exists) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Delete file
    await minioHelpers.deleteFile(bucketName, filename);

    logger.logFile('delete', filename);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting file:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete file',
      message: error.message
    });
  }
});

// Multiple file upload
router.post('/upload-multiple', upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided'
      });
    }

    const { category = 'general' } = req.body;
    const bucketName = process.env.MINIO_BUCKET_NAME || 'coding-society';
    
    const uploadPromises = req.files.map(async (file) => {
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2);
      const extension = path.extname(file.originalname);
      const filename = `${category}/${timestamp}-${randomString}${extension}`;

      const etag = await minioHelpers.uploadBuffer(
        bucketName,
        filename,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
          'Original-Name': file.originalname
        }
      );

      const url = await minioHelpers.getFileUrl(bucketName, filename);

      return {
        filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url,
        etag
      };
    });

    const results = await Promise.all(uploadPromises);

    logger.logFile('upload-multiple', `${req.files.length} files`, { category });

    res.json({
      success: true,
      message: `${req.files.length} files uploaded successfully`,
      data: results
    });
  } catch (error) {
    logger.error('Error uploading multiple files:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to upload files',
      message: error.message
    });
  }
});

// Error handler for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large',
        message: `Maximum file size is ${process.env.MAX_FILE_SIZE || '10MB'}`
      });
    }
    
    return res.status(400).json({
      success: false,
      error: 'File upload error',
      message: error.message
    });
  }
  
  if (error.message.includes('File type')) {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type',
      message: error.message
    });
  }
  
  next(error);
});

module.exports = router;