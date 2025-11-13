const express = require('express');
const multer = require('multer');
const { Client: MinioClient } = require('minio');
const Story = require('../models/Story');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { body, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// MinIO Configuration
const minioClient = new MinioClient({
  endPoint: process.env.MINIO_ENDPOINT || '127.0.0.1',
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
});

// Create uploads directory for fallback
const uploadsDir = path.join(__dirname, '..', 'uploads');
const storiesDir = path.join(uploadsDir, 'stories');

[uploadsDir, storiesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Ensure MinIO buckets exist
const createStoryBucketsIfNotExist = async () => {
  const buckets = ['story-images', 'story-videos'];
  
  for (const bucket of buckets) {
    try {
      const exists = await minioClient.bucketExists(bucket);
      if (!exists) {
        await minioClient.makeBucket(bucket, 'us-east-1');
        console.log(`✅ Created MinIO bucket: ${bucket}`);
      }
    } catch (error) {
      console.warn(`⚠️ MinIO bucket creation warning for ${bucket}:`, error.message);
    }
  }
};

// Initialize buckets
createStoryBucketsIfNotExist();

// Multer configuration for story uploads (memory storage for MinIO)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB for videos
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'video/mp4', 'video/webm', 'video/quicktime'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images and videos are allowed for stories'), false);
    }
  }
});

// Helper function to upload story file to MinIO
const uploadStoryToMinio = async (file, bucketName, fileName) => {
  try {
    await minioClient.putObject(bucketName, fileName, file.buffer, file.size, {
      'Content-Type': file.mimetype
    });
    
    const url = `http://${process.env.MINIO_ENDPOINT || '127.0.0.1'}:${process.env.MINIO_PORT || 9000}/${bucketName}/${fileName}`;
    return url;
  } catch (error) {
    console.error('MinIO story upload error:', error);
    // Fallback to local storage
    const localPath = path.join(storiesDir, fileName);
    fs.writeFileSync(localPath, file.buffer);
    return getFileUrl(fileName);
  }
};

// Helper function to get file URL
const getFileUrl = (filename) => {
  return `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/stories/${filename}`;
};

// Validation middleware
const createStoryValidation = [
  body('content').optional().isLength({ min: 1, max: 500 }).withMessage('Content must be between 1 and 500 characters'),
  body('type').isIn(['image', 'video', 'text']).withMessage('Invalid story type'),
  body('visibility').optional().isIn(['public', 'followers', 'close_friends']).withMessage('Invalid visibility setting'),
];

// GET /api/v1/stories - Get all active stories
router.get('/', auth, async (req, res) => {
  try {
    const stories = await Story.find({
      expiryDate: { $gt: new Date() } // Only get non-expired stories
    })
    .populate('author', 'username avatar verified')
    .sort({ createdAt: -1 })
    .lean();

    // Group stories by author
    const groupedStories = {};
    stories.forEach(story => {
      const authorId = story.author._id.toString();
      if (!groupedStories[authorId]) {
        groupedStories[authorId] = {
          author: story.author,
          stories: []
        };
      }
      groupedStories[authorId].stories.push(story);
    });

    const storyGroups = Object.values(groupedStories);

    res.json({
      success: true,
      stories: storyGroups
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stories',
      error: error.message
    });
  }
});

// POST /api/v1/stories - Create new story
router.post('/', auth, upload.single('media'), createStoryValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { content, type, visibility = 'public' } = req.body;

    let media = null;
    if (req.file) {
      try {
        const fileName = `${uuidv4()}-${req.file.originalname}`;
        const bucketName = req.file.mimetype.startsWith('image/') ? 'story-images' : 'story-videos';
        
        const url = await uploadStoryToMinio(req.file, bucketName, fileName);
        
        media = {
          type: req.file.mimetype.startsWith('image/') ? 'image' : 'video',
          url,
          filename: fileName,
          originalName: req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype
        };
      } catch (uploadError) {
        console.error('Story upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: `Failed to upload story media: ${req.file.originalname}`,
          error: uploadError.message
        });
      }
    }

    // Calculate expiry date (24 hours from now)
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + 24);

    const newStory = new Story({
      content: content || '',
      type,
      visibility,
      media,
      author: req.user.id,
      expiryDate,
      views: [],
      reactions: []
    });

    const savedStory = await newStory.save();
    
    // Populate author information
    await savedStory.populate('author', 'username avatar verified');

    // Emit real-time update if socket.io is available
    if (req.io) {
      req.io.emit('newStory', savedStory);
    }

    res.status(201).json({
      success: true,
      message: 'Story created successfully',
      story: savedStory
    });
  } catch (error) {
    console.error('Error creating story:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create story',
      error: error.message
    });
  }
});

// GET /api/v1/stories/:id - Get single story
router.get('/:id', auth, async (req, res) => {
  try {
    const storyId = req.params.id;

    const story = await Story.findById(storyId)
      .populate('author', 'username avatar verified')
      .populate('reactions.user', 'username avatar')
      .lean();

    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check if story has expired
    if (new Date() > story.expiryDate) {
      return res.status(410).json({
        success: false,
        message: 'Story has expired'
      });
    }

    // Add view if not already viewed by this user
    if (!story.views.includes(req.user.id)) {
      await Story.findByIdAndUpdate(storyId, {
        $addToSet: { views: req.user.id }
      });
    }

    // Add user reaction status
    const userReaction = story.reactions?.find(r => r.user._id.toString() === req.user.id);
    const storyWithUserData = {
      ...story,
      userReaction: userReaction?.type || null,
      viewsCount: story.views?.length || 0,
      reactionsCount: story.reactions?.length || 0
    };

    res.json({
      success: true,
      story: storyWithUserData
    });
  } catch (error) {
    console.error('Error fetching story:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch story',
      error: error.message
    });
  }
});

// POST /api/v1/stories/:id/react - React to a story
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { reactionType } = req.body;
    const storyId = req.params.id;

    if (!['like', 'love', 'laugh', 'wow', 'sad', 'angry'].includes(reactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reaction type'
      });
    }

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check if story has expired
    if (new Date() > story.expiryDate) {
      return res.status(410).json({
        success: false,
        message: 'Story has expired'
      });
    }

    // Check if user already reacted
    const existingReactionIndex = story.reactions.findIndex(
      r => r.user.toString() === req.user.id
    );

    if (existingReactionIndex > -1) {
      // Update existing reaction or remove if same type
      if (story.reactions[existingReactionIndex].type === reactionType) {
        story.reactions.splice(existingReactionIndex, 1);
      } else {
        story.reactions[existingReactionIndex].type = reactionType;
      }
    } else {
      // Add new reaction
      story.reactions.push({
        user: req.user.id,
        type: reactionType
      });
    }

    await story.save();

    // Calculate reaction counts
    const reactionCounts = {};
    story.reactions.forEach(reaction => {
      reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
    });

    const userReaction = story.reactions.find(r => r.user.toString() === req.user.id);

    res.json({
      success: true,
      reactions: reactionCounts,
      userReaction: userReaction?.type || null
    });
  } catch (error) {
    console.error('Error reacting to story:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to react to story',
      error: error.message
    });
  }
});

// DELETE /api/v1/stories/:id - Delete a story
router.delete('/:id', auth, async (req, res) => {
  try {
    const storyId = req.params.id;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    // Check if user owns the story
    if (story.author.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own stories'
      });
    }

    // Delete associated media file
    if (story.media && story.media.filename) {
      const filePath = path.join(storiesDir, story.media.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Story.findByIdAndDelete(storyId);

    // Emit real-time update
    if (req.io) {
      req.io.emit('storyDeleted', storyId);
    }

    res.json({
      success: true,
      message: 'Story deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete story',
      error: error.message
    });
  }
});

// GET /api/v1/stories/user/:userId - Get stories by specific user
router.get('/user/:userId', auth, async (req, res) => {
  try {
    const { userId } = req.params;

    const stories = await Story.find({
      author: userId,
      expiryDate: { $gt: new Date() }
    })
    .populate('author', 'username avatar verified')
    .sort({ createdAt: -1 })
    .lean();

    res.json({
      success: true,
      stories
    });
  } catch (error) {
    console.error('Error fetching user stories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user stories',
      error: error.message
    });
  }
});

module.exports = router;