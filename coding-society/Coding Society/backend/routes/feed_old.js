const express = require('express');
const multer = require('multer');
const { Client: MinioClient } = require('minio');
const Post = require('../models/Post');
const Story = require('../models/Story');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { body, validationResult, query } = require('express-validator');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// MinIO Configuration with fallback
let minioClient;
let minioAvailable = false;

try {
  minioClient = new MinioClient({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin123'
  });
} catch (error) {
  console.warn('⚠️ MinIO client initialization failed:', error.message);
}

// Test MinIO connection
const testMinIOConnection = async () => {
  try {
    if (minioClient) {
      await minioClient.listBuckets();
      minioAvailable = true;
      console.log('✅ MinIO connection successful');
    }
  } catch (error) {
    console.warn('⚠️ MinIO not available, using local storage:', error.message);
    minioAvailable = false;
  }
};

// Initialize connection test
testMinIOConnection();

// Create uploads directory for fallback storage
const uploadsDir = path.join(__dirname, '..', 'uploads');
const postsDir = path.join(uploadsDir, 'posts');
const storiesDir = path.join(uploadsDir, 'stories');

[uploadsDir, postsDir, storiesDir].forEach(dir => {
  if (!fsSync.existsSync(dir)) {
    fsSync.mkdirSync(dir, { recursive: true });
  }
});

// Ensure MinIO buckets exist
const createBucketsIfNotExist = async () => {
  if (!minioAvailable) return;
  
  const buckets = ['feed-images', 'feed-videos', 'feed-documents', 'feed-thumbnails'];
  
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
createBucketsIfNotExist();

// Multer configuration for file uploads (memory storage for MinIO)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit for videos
  },
  fileFilter: (req, file, cb) => {
    // Check file types
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype.startsWith('application/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image, video, and document files are allowed!'), false);
    }
  }
});

// Helper function to upload file to MinIO
const uploadToMinio = async (file, bucketName, fileName) => {
  try {
    await minioClient.putObject(bucketName, fileName, file.buffer, file.size, {
      'Content-Type': file.mimetype
    });
    
    const url = `http://${process.env.MINIO_ENDPOINT || '127.0.0.1'}:${process.env.MINIO_PORT || 9000}/${bucketName}/${fileName}`;
    return url;
  } catch (error) {
    console.error('MinIO upload error:', error);
    // Fallback to local storage
    const localPath = path.join(postsDir, fileName);
    fs.writeFileSync(localPath, file.buffer);
    return getFileUrl(fileName);
  }
};

// Helper function to get file URL
const getFileUrl = (filename, type = 'posts') => {
  return `${process.env.BASE_URL || 'http://localhost:5000'}/uploads/${type}/${filename}`;
};

// Validation middleware
const createPostValidation = [
  body('content').optional().isLength({ min: 1, max: 2000 }).withMessage('Content must be between 1 and 2000 characters'),
  body('type').isIn(['text', 'image', 'video', 'code', 'link', 'poll']).withMessage('Invalid post type'),
  body('privacy').isIn(['public', 'followers', 'friends', 'private']).withMessage('Invalid privacy setting'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
];

// GET /api/v1/feed - Get posts with filtering and pagination
router.get('/', auth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      filter = 'all',
      tags,
      search
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    let query = {};

    // Filter logic
    if (filter === 'following') {
      const user = await User.findById(req.user.id).select('following');
      query.author = { $in: [...user.following, req.user.id] };
    } else if (filter === 'bookmarked') {
      const user = await User.findById(req.user.id).select('bookmarks');
      query._id = { $in: user.bookmarks };
    } else if (filter === 'code') {
      query.type = 'code';
    } else if (filter === 'media') {
      query.type = { $in: ['image', 'video'] };
    }

    // Tags filter
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Search filter
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Privacy filter
    query.privacy = { $in: ['public'] };
    if (req.user) {
      // Add posts from followed users and own posts
      const user = await User.findById(req.user.id).select('following friends');
      query.$or = [
        { privacy: 'public' },
        { privacy: 'followers', author: { $in: user.following } },
        { privacy: 'friends', author: { $in: user.friends } },
        { author: req.user.id }
      ];
    }

    const posts = await Post.find(query)
      .populate('author', 'username avatar verified isOnline')
      .populate('comments.author', 'username avatar')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    const totalPosts = await Post.countDocuments(query);
    const hasNextPage = pageNum * limitNum < totalPosts;

    // Add user reaction and bookmark status
    const postsWithUserData = posts.map(post => {
      const userReaction = post.reactions?.find(r => r.user.toString() === req.user.id.toString());
      return {
        ...post,
        userReaction: userReaction?.type || null,
        bookmarked: req.user.bookmarks?.includes(post._id.toString()) || false,
        commentsCount: post.comments?.length || 0,
        sharesCount: post.shares?.length || 0
      };
    });

    res.json({
      success: true,
      posts: postsWithUserData,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalPosts / limitNum),
        hasNextPage,
        totalPosts
      }
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
});

// POST /api/v1/feed - Create new post
router.post('/', auth, upload.array('media', 5), createPostValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { content, type, privacy, tags, codeSnippet } = req.body;

    // Parse JSON fields
    let parsedTags = [];
    let parsedCodeSnippet = null;

    try {
      if (tags) parsedTags = JSON.parse(tags);
      if (codeSnippet) parsedCodeSnippet = JSON.parse(codeSnippet);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON in tags or codeSnippet fields'
      });
    }

    // Process uploaded media with MinIO
    let media = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const fileName = `${uuidv4()}-${file.originalname}`;
          let bucketName = 'feed-documents';
          
          if (file.mimetype.startsWith('image/')) {
            bucketName = 'feed-images';
          } else if (file.mimetype.startsWith('video/')) {
            bucketName = 'feed-videos';
          }

          const url = await uploadToMinio(file, bucketName, fileName);
          
          media.push({
            type: file.mimetype.startsWith('image/') ? 'image' : 
                  file.mimetype.startsWith('video/') ? 'video' : 'document',
            url,
            filename: fileName,
            originalName: file.originalname,
            size: file.size,
            mimeType: file.mimetype
          });
        } catch (uploadError) {
          console.error('File upload error:', uploadError);
          return res.status(500).json({
            success: false,
            message: `Failed to upload file: ${file.originalname}`,
            error: uploadError.message
          });
        }
      }
    }

    // Create new post
    const newPost = new Post({
      content: content || '',
      type,
      privacy,
      tags: parsedTags,
      media,
      codeSnippet: parsedCodeSnippet,
      author: req.user.id,
      reactions: [],
      comments: [],
      shares: []
    });

    const savedPost = await newPost.save();
    
    // Populate author information
    await savedPost.populate('author', 'username avatar verified isOnline');

    // Emit real-time update if socket.io is available
    if (req.io) {
      req.io.emit('newPost', savedPost);
    }

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post: savedPost
    });
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
});

// POST /api/v1/feed/:id/react - React to a post
router.post('/:id/react', auth, async (req, res) => {
  try {
    const { reactionType } = req.body;
    const postId = req.params.id;

    if (!['like', 'love', 'laugh', 'wow', 'sad', 'angry', 'fire', 'genius'].includes(reactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reaction type'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already reacted
    const existingReactionIndex = post.reactions.findIndex(
      r => r.user.toString() === req.user.id.toString()
    );

    if (existingReactionIndex > -1) {
      // Update existing reaction or remove if same type
      if (post.reactions[existingReactionIndex].type === reactionType) {
        post.reactions.splice(existingReactionIndex, 1);
      } else {
        post.reactions[existingReactionIndex].type = reactionType;
      }
    } else {
      // Add new reaction
      post.reactions.push({
        user: req.user.id,
        type: reactionType
      });
    }

    await post.save();

    // Calculate reaction counts
    const reactionCounts = {};
    post.reactions.forEach(reaction => {
      reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
    });

    const userReaction = post.reactions.find(r => r.user.toString() === req.user.id.toString());

    res.json({
      success: true,
      reactions: reactionCounts,
      userReaction: userReaction?.type || null
    });
  } catch (error) {
    console.error('Error reacting to post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to react to post',
      error: error.message
    });
  }
});

// POST /api/v1/feed/:id/comment - Comment on a post
router.post('/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    const postId = req.params.id;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const newComment = {
      author: req.user.id,
      content: content.trim(),
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the new comment with author info
    await post.populate('comments.author', 'username avatar');

    res.json({
      success: true,
      comments: post.comments,
      commentsCount: post.comments.length
    });
  } catch (error) {
    console.error('Error commenting on post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to comment on post',
      error: error.message
    });
  }
});

// POST /api/v1/feed/:id/bookmark - Bookmark a post
router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const user = await User.findById(req.user.id);
    const bookmarkIndex = user.bookmarks.indexOf(postId);

    if (bookmarkIndex > -1) {
      // Remove bookmark
      user.bookmarks.splice(bookmarkIndex, 1);
    } else {
      // Add bookmark
      user.bookmarks.push(postId);
    }

    await user.save();

    res.json({
      success: true,
      bookmarked: bookmarkIndex === -1,
      message: bookmarkIndex === -1 ? 'Post bookmarked' : 'Bookmark removed'
    });
  } catch (error) {
    console.error('Error bookmarking post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bookmark post',
      error: error.message
    });
  }
});

// DELETE /api/v1/feed/:id - Delete a post
router.delete('/:id', auth, async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user owns the post
    if (post.author.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own posts'
      });
    }

    // Delete associated media files
    if (post.media && post.media.length > 0) {
      post.media.forEach(mediaItem => {
        const filePath = path.join(postsDir, mediaItem.filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
    }

    await Post.findByIdAndDelete(postId);

    // Emit real-time update
    if (req.io) {
      req.io.emit('postDeleted', postId);
    }

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
});

// GET /api/v1/feed/:id - Get single post
router.get('/:id', auth, async (req, res) => {
  try {
    const postId = req.params.id;

    const post = await Post.findById(postId)
      .populate('author', 'username avatar verified isOnline')
      .populate('comments.author', 'username avatar')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Add user reaction and bookmark status
    const userReaction = post.reactions?.find(r => r.user.toString() === req.user.id.toString());
    const postWithUserData = {
      ...post,
      userReaction: userReaction?.type || null,
      bookmarked: req.user.bookmarks?.includes(post._id.toString()) || false,
      commentsCount: post.comments?.length || 0,
      sharesCount: post.shares?.length || 0
    };

    res.json({
      success: true,
      post: postWithUserData
    });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
      error: error.message
    });
  }
});

module.exports = router;