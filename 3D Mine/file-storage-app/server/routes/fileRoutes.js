const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const { minioClient, bucketName } = require('../utils/minioClient');
const File = require('../models/fileModel');

// Configure multer storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Generate a unique file name for MinIO
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const extension = originalName.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};

// Upload a file
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const { title, description } = req.body;
    
    if (!title) {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    
    // Generate a unique file name for MinIO
    const minioFileName = generateUniqueFileName(req.file.originalname);
    
    // Upload file to MinIO
    await minioClient.putObject(
      bucketName,
      minioFileName,
      req.file.buffer,
      {
        'Content-Type': req.file.mimetype,
      }
    );
    
    // Store file information in MongoDB
    const newFile = new File({
      title,
      description: description || '',
      originalName: req.file.originalname,
      minioName: minioFileName,
      mimeType: req.file.mimetype,
      size: req.file.size
    });
    
    await newFile.save();
    
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: newFile
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get all files
router.get('/files', async (req, res) => {
  try {
    const files = await File.find().sort({ uploadedAt: -1 });
    res.status(200).json({ success: true, files });
  } catch (error) {
    console.error('Error retrieving files:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Search files
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }
    
    const files = await File.find(
      { $text: { $search: q } },
      { score: { $meta: 'textScore' } }
    ).sort({ score: { $meta: 'textScore' } });
    
    res.status(200).json({ success: true, files });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Download a file
router.get('/files/:id/download', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    
    // Create a download stream from MinIO
    minioClient.getObject(bucketName, file.minioName, (err, dataStream) => {
      if (err) {
        console.error('MinIO download error:', err);
        return res.status(500).json({ success: false, message: 'Error downloading file' });
      }
      
      // Set content headers
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      
      // Pipe the stream to the response
      dataStream.pipe(res);
    });
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Get a specific file
router.get('/files/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    
    res.status(200).json({ success: true, file });
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// Delete a file
router.delete('/files/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    
    // Delete file from MinIO
    await minioClient.removeObject(bucketName, file.minioName);
    
    // Delete file document from MongoDB
    await File.findByIdAndDelete(req.params.id);
    
    res.status(200).json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

module.exports = router;