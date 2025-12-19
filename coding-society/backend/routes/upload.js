/**
 * File Upload Routes with MinIO Integration
 * Handles file uploads for different content types
 */

const express = require('express');
const multer = require('multer');
const { auth } = require('../middleware/auth');
const { 
  uploadFile, 
  BUCKETS, 
  generateUniqueFilename, 
  validateFileType,
  formatFileSize,
  checkHealth
} = require('../config/minio');

const router = express.Router();

// Configure multer for memory storage (files will be uploaded to MinIO)
const storage = multer.memoryStorage();

// File filter function with dynamic type checking
const createFileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    console.log('📁 File upload attempt:', {
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      endpoint: req.originalUrl
    });

    if (validateFileType(file.originalname, allowedTypes)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`), false);
    }
  };
};

// Default file filter for general uploads
const defaultFileFilter = createFileFilter(['.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif', '.zip', '.rar']);

// Specific file filters
const imageFileFilter = createFileFilter(['.jpg', '.jpeg', '.png', '.gif', '.webp']);
const videoFileFilter = createFileFilter(['.mp4', '.mov', '.avi', '.mkv', '.webm']);
const pdfFileFilter = createFileFilter(['.pdf']);

// Configure multer instances for different file types
const uploadGeneral = multer({
  storage,
  fileFilter: defaultFileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 5 // Maximum 5 files per request
  }
});

const uploadImages = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for images
    files: 5
  }
});

const uploadVideos = multer({
  storage,
  fileFilter: videoFileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
    files: 3
  }
});

const uploadPDF = multer({
  storage,
  fileFilter: pdfFileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB limit for PDFs
    files: 1
  }
});

// Backward compatibility
const upload = uploadGeneral;

// Helper function to handle file upload
const handleFileUpload = async (req, res, bucketName, pathPrefix = '') => {
  try {
    if (!req.file && !req.files) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const files = req.files ? req.files : [req.file];
    const uploadResults = [];

    for (const file of files) {
      try {
        // Generate unique filename
        const uniqueFilename = generateUniqueFilename(file.originalname, pathPrefix);
        
        // Prepare metadata
        const metadata = {
          'Content-Type': file.mimetype,
          'Original-Name': file.originalname,
          'Upload-Date': new Date().toISOString(),
          'Uploaded-By': req.user?.id || 'anonymous',
          'File-Size': file.size.toString()
        };

        console.log(`🔄 Uploading to MinIO: ${bucketName}/${uniqueFilename}`);
        console.log(`📊 File info: ${formatFileSize(file.size)}, ${file.mimetype}`);

        // Upload to MinIO
        const result = await uploadFile(bucketName, uniqueFilename, file.buffer, metadata);

        uploadResults.push({
          originalName: file.originalname,
          filename: uniqueFilename,
          size: file.size,
          formattedSize: formatFileSize(file.size),
          mimetype: file.mimetype,
          url: result.url,
          bucket: bucketName,
          etag: result.etag
        });

        console.log(`✅ Upload successful: ${uniqueFilename}`);
      } catch (error) {
        console.error(`❌ Upload failed for ${file.originalname}:`, error);
        uploadResults.push({
          originalName: file.originalname,
          error: error.message,
          success: false
        });
      }
    }

    // Check if any uploads were successful
    const successfulUploads = uploadResults.filter(r => !r.error);
    const failedUploads = uploadResults.filter(r => r.error);

    res.status(successfulUploads.length > 0 ? 200 : 400).json({
      success: successfulUploads.length > 0,
      message: `${successfulUploads.length} file(s) uploaded successfully${failedUploads.length > 0 ? `, ${failedUploads.length} failed` : ''}`,
      files: uploadResults,
      summary: {
        total: uploadResults.length,
        successful: successfulUploads.length,
        failed: failedUploads.length
      }
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
};

// @desc    Upload library content files
// @route   POST /api/v1/admin/upload/library
// @access  Private (Admin)
router.post('/library', auth, upload.array('files', 5), async (req, res) => {
  await handleFileUpload(req, res, BUCKETS.LIBRARY, 'library');
});

// @desc    Upload single library file
// @route   POST /api/v1/admin/upload/library/single
// @access  Private (Admin)
router.post('/library/single', auth, upload.single('file'), async (req, res) => {
  await handleFileUpload(req, res, BUCKETS.LIBRARY, 'library');
});

// @desc    Upload innovation project files
// @route   POST /api/v1/admin/upload/innovation
// @access  Private (Admin)
router.post('/innovation', auth, upload.array('files', 5), async (req, res) => {
  await handleFileUpload(req, res, BUCKETS.INNOVATION, 'innovation');
});

// @desc    Upload single innovation file
// @route   POST /api/v1/admin/upload/innovation/single
// @access  Private (Admin)
router.post('/innovation/single', auth, upload.single('file'), async (req, res) => {
  await handleFileUpload(req, res, BUCKETS.INNOVATION, 'innovation');
});

// @desc    Upload internship documents
// @route   POST /api/v1/admin/upload/internship
// @access  Private (Admin)
router.post('/internship', auth, upload.array('files', 5), async (req, res) => {
  await handleFileUpload(req, res, BUCKETS.INTERNSHIP, 'internship');
});

// @desc    Upload single internship file
// @route   POST /api/v1/admin/upload/internship/single
// @access  Private (Admin)
router.post('/internship/single', auth, upload.single('file'), async (req, res) => {
  await handleFileUpload(req, res, BUCKETS.INTERNSHIP, 'internship');
});

// @desc    Upload hackathon files
// @route   POST /api/v1/admin/upload/hackathon
// @access  Private (Admin)
router.post('/hackathon', auth, upload.array('files', 5), async (req, res) => {
  await handleFileUpload(req, res, BUCKETS.HACKATHON, 'hackathon');
});

// @desc    Upload single hackathon file
// @route   POST /api/v1/admin/upload/hackathon/single
// @access  Private (Admin)
router.post('/hackathon/single', auth, upload.single('file'), async (req, res) => {
  await handleFileUpload(req, res, BUCKETS.HACKATHON, 'hackathon');
});

// @desc    Upload user avatars
// @route   POST /api/v1/admin/upload/avatar
// @access  Private
router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  await handleFileUpload(req, res, BUCKETS.AVATARS, 'avatar');
});

// @desc    General file upload
// @route   POST /api/v1/admin/upload/general
// @access  Private (Admin)
router.post('/general', auth, upload.array('files', 10), async (req, res) => {
  await handleFileUpload(req, res, BUCKETS.GENERAL, 'general');
});

// @desc    Upload feed images
// @route   POST /api/v1/upload/feed/images
// @access  Private
router.post('/feed/images', auth, uploadImages.array('images', 5), async (req, res) => {
  await handleFileUpload(req, res, BUCKETS.FEED_IMAGES, 'feed/images');
});

// @desc    Upload single feed image
// @route   POST /api/v1/upload/feed/image
// @access  Private
router.post('/feed/image', auth, uploadImages.single('image'), async (req, res) => {
  await handleFileUpload(req, res, BUCKETS.FEED_IMAGES, 'feed/images');
});

// @desc    Upload feed videos
// @route   POST /api/v1/upload/feed/videos
// @access  Private
router.post('/feed/videos', auth, uploadVideos.array('videos', 3), async (req, res) => {
  await handleFileUpload(req, res, BUCKETS.FEED_VIDEOS, 'feed/videos');
});

// @desc    Upload single feed video
// @route   POST /api/v1/upload/feed/video
// @access  Private
router.post('/feed/video', auth, uploadVideos.single('video'), async (req, res) => {
  await handleFileUpload(req, res, BUCKETS.FEED_VIDEOS, 'feed/videos');
});

// @desc    Upload library PDFs
// @route   POST /api/v1/upload/library/pdf
// @access  Private
router.post('/library/pdf', auth, uploadPDF.single('pdf'), async (req, res) => {
  await handleFileUpload(req, res, BUCKETS.LIBRARY, 'library/pdf');
});

// @desc    Upload innovation PDFs
// @route   POST /api/v1/upload/innovation/pdf
// @access  Private
router.post('/innovation/pdf', auth, uploadPDF.single('pdf'), async (req, res) => {
  await handleFileUpload(req, res, BUCKETS.INNOVATION, 'innovation/pdf');
});

// @desc    Check MinIO health
// @route   GET /api/v1/admin/upload/health
// @access  Private (Admin)
router.get('/health', auth, async (req, res) => {
  try {
    const health = await checkHealth();
    
    res.status(health.status === 'healthy' ? 200 : 503).json({
      success: health.status === 'healthy',
      message: `MinIO is ${health.status}`,
      health,
      buckets: Object.values(BUCKETS),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      success: false,
      message: 'MinIO health check failed',
      error: error.message
    });
  }
});

// @desc    Test upload endpoint
// @route   POST /api/v1/admin/upload/test
// @access  Private (Admin)
router.post('/test', auth, upload.single('testfile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No test file provided'
      });
    }

    // Create a simple test file upload
    const testContent = `Test file uploaded at ${new Date().toISOString()}\nOriginal file: ${req.file.originalname}\nSize: ${formatFileSize(req.file.size)}`;
    const testBuffer = Buffer.from(testContent, 'utf8');
    
    const uniqueFilename = generateUniqueFilename('test-upload.txt', 'test');
    
    const result = await uploadFile(BUCKETS.GENERAL, uniqueFilename, testBuffer, {
      'Content-Type': 'text/plain',
      'Test-Upload': 'true',
      'Original-File': req.file.originalname
    });

    res.json({
      success: true,
      message: 'Test upload successful',
      originalFile: {
        name: req.file.originalname,
        size: formatFileSize(req.file.size),
        mimetype: req.file.mimetype
      },
      testFile: {
        name: uniqueFilename,
        url: result.url,
        bucket: BUCKETS.GENERAL
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Test upload failed:', error);
    res.status(500).json({
      success: false,
      message: 'Test upload failed',
      error: error.message
    });
  }
});

// Error handler for multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    let message = 'File upload error';
    
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        message = 'File too large. Maximum size is 50MB';
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files. Maximum is 5 files per request';
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        break;
      default:
        message = error.message;
    }
    
    return res.status(400).json({
      success: false,
      message,
      code: error.code
    });
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
  
  next(error);
});

module.exports = router;