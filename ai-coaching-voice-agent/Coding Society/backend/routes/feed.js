const express = require('express');
const router = express.Router();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;
const Post = require('../models/Post');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

// MinIO Configuration
let minioClient = null;
try {
  const { Client } = require('minio');
  minioClient = new Client({
    endPoint: process.env.MINIO_ENDPOINT || 'localhost',
    port: parseInt(process.env.MINIO_PORT) || 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
    secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin'
  });
} catch (error) {
  console.log('MinIO not available, using local storage fallback');
}

// Storage configuration with MinIO fallback
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
    }
  }
});

// Helper function to get correct bucket name based on file type
function getBucketName(mimeType) {
  if (mimeType.startsWith('image/')) {
    return 'feed-images';
  } else if (mimeType.startsWith('video/')) {
    return 'feed-videos';
  } else {
    return 'feed-documents';
  }
}

// Helper function to upload to MinIO or local storage
async function uploadFile(file, filename, bucketName = null) {
  // Determine bucket name based on file type if not provided
  if (!bucketName) {
    bucketName = getBucketName(file.mimetype);
  }
  
  try {
    if (minioClient) {
      // Try MinIO first
      await minioClient.putObject(bucketName, filename, file.buffer, file.size, {
        'Content-Type': file.mimetype,
      });
      return {
        url: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${bucketName}/${filename}`,
        storage: 'minio',
        filename
      };
    }
  } catch (error) {
    console.log('MinIO upload failed, falling back to local storage:', error.message);
  }
  
  // Fallback to local storage
  const uploadDir = path.join(__dirname, '../../uploads/posts');
  await fs.mkdir(uploadDir, { recursive: true });
  const filepath = path.join(uploadDir, filename);
  await fs.writeFile(filepath, file.buffer);
  
  return {
    url: `/uploads/posts/${filename}`,
    storage: 'local',
    filename
  };
}

// Helper function to generate thumbnails
async function generateThumbnail(imageBuffer, filename) {
  try {
    const thumbnailBuffer = await sharp(imageBuffer)
      .resize(300, 300, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();
    
    const thumbnailFilename = `thumb_${filename.replace(/\.[^/.]+$/, '.jpg')}`;
    const uploadResult = await uploadFile(
      { buffer: thumbnailBuffer, mimetype: 'image/jpeg', size: thumbnailBuffer.length },
      thumbnailFilename
    );
    
    return uploadResult.url;
  } catch (error) {
    console.error('Thumbnail generation failed:', error);
    return null;
  }
}

// Get all posts for feed with advanced filtering
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const {
      type,
      category,
      tags,
      author,
      search,
      sortBy = 'createdAt',
      order = 'desc',
      privacy = 'public'
    } = req.query;

    // Build filter query
    const filter = {};
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (tags) filter.tags = { $in: tags.split(',') };
    if (author) filter.author = author;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Privacy filter
    if (privacy === 'public') {
      filter.privacy = 'public';
    } else {
      filter.$or = [
        { privacy: 'public' },
        { author: req.user._id, privacy: { $in: ['private', 'friends'] } }
      ];
    }

    // Sorting
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    
    if (sortBy === 'popularity') {
      sortOptions.likes = -1;
      sortOptions.createdAt = -1;
    } else if (sortBy === 'engagement') {
      sortOptions.commentCount = -1;
      sortOptions.likes = -1;
    } else {
      sortOptions[sortBy] = sortOrder;
    }

    const posts = await Post.find(filter)
      .populate('author', 'username email avatar level reputation')
      .populate('comments.author', 'username avatar')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Add user interaction data
    const postsWithInteractions = posts.map(post => {
      const userLike = post.likes?.find(like => like && like.user && like.user.toString() === req.user._id.toString());
      return {
        ...post,
        hasLiked: !!userLike,
        userReaction: userLike?.reaction || null,
        hasBookmarked: post.bookmarks?.includes(req.user._id),
        likesCount: post.likes?.length || 0,
        bookmarksCount: post.bookmarks?.length || 0,
        sharesCount: post.shares?.length || 0,
        commentsCount: post.comments?.length || 0,
        reactions: post.likes?.reduce((acc, like) => {
          if (!like || !like.reaction) return acc;
          acc[like.reaction] = (acc[like.reaction] || 0) + 1;
          return acc;
        }, {}) || {}
      };
    });

    res.json({
      success: true,
      posts: postsWithInteractions,
      pagination: {
        current: page,
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      total
    });
  } catch (error) {
    console.error('Feed fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed',
      error: error.message
    });
  }
});

// Create new post with file upload
router.post('/', auth, upload.array('files', 5), async (req, res) => {
  try {
    const {
      title,
      content,
      type = 'text',
      category,
      tags,
      privacy = 'public',
      codeLanguage,
      pollOptions
    } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const post = new Post({
      title: title?.trim(),
      content: content.trim(),
      type,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      privacy,
      author: req.user._id,
      codeLanguage,
      media: []
    });

    // Handle poll creation
    if (type === 'poll' && pollOptions) {
      const options = JSON.parse(pollOptions);
      post.poll = {
        options: options.map(option => ({ text: option, votes: 0 })),
        allowMultipleChoices: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      };
    }

    // Handle file uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        const uploadResult = await uploadFile(file, filename);
        
        const mediaItem = {
          type: file.mimetype.startsWith('image/') ? 'image' :
                file.mimetype.startsWith('video/') ? 'video' : 'document',
          url: uploadResult.url,
          filename: uploadResult.filename,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype
        };

        // Generate thumbnail for images
        if (file.mimetype.startsWith('image/')) {
          mediaItem.thumbnail = await generateThumbnail(file.buffer, filename);
        }

        post.media.push(mediaItem);
      }
    }

    // Handle pre-uploaded media (from frontend direct upload)
    if (req.body.media) {
      let mediaData = req.body.media;
      if (typeof mediaData === 'string') {
        try {
          mediaData = JSON.parse(mediaData);
        } catch (e) {
          console.error('Failed to parse media JSON:', e);
          mediaData = [];
        }
      }

      if (Array.isArray(mediaData)) {
        mediaData.forEach(item => {
          // Ensure we have the required fields
          if (item.url && item.originalName) {
             post.media.push({
              type: item.type || 'image',
              url: item.url,
              filename: item.filename || item.originalName,
              originalName: item.originalName,
              size: item.size || 0,
              mimeType: item.mimeType || 'application/octet-stream',
              thumbnail: item.thumbnail
            });
          }
        });
      }
    }

    await post.save();
    await post.populate('author', 'username email avatar level reputation');

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    console.error('Post creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
});

// Get single post by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'username email avatar level reputation')
      .populate('comments.author', 'username avatar')
      .lean();

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check privacy permissions
    if (post.privacy === 'private' && post.author._id.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Add user interaction data
    const postWithInteractions = {
      ...post,
      hasLiked: post.likes?.includes(req.user._id),
      hasBookmarked: post.bookmarks?.includes(req.user._id),
      likesCount: post.likes?.length || 0,
      bookmarksCount: post.bookmarks?.length || 0,
      sharesCount: post.shares?.length || 0
    };

    res.json({
      success: true,
      post: postWithInteractions
    });
  } catch (error) {
    console.error('Post fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch post',
      error: error.message
    });
  }
});

// Update post
router.put('/:id', auth, upload.array('files', 5), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to update this post'
      });
    }

    const {
      title,
      content,
      category,
      tags,
      privacy
    } = req.body;

    // Update fields
    if (title !== undefined) post.title = title.trim();
    if (content !== undefined) post.content = content.trim();
    if (category !== undefined) post.category = category;
    if (tags !== undefined) post.tags = tags.split(',').map(tag => tag.trim());
    if (privacy !== undefined) post.privacy = privacy;

    // Handle new file uploads
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const timestamp = Date.now();
        const filename = `${timestamp}_${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
        
        const uploadResult = await uploadFile(file, filename);
        
        const mediaItem = {
          type: file.mimetype.startsWith('image/') ? 'image' :
                file.mimetype.startsWith('video/') ? 'video' : 'document',
          url: uploadResult.url,
          filename: uploadResult.filename,
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype
        };

        if (file.mimetype.startsWith('image/')) {
          mediaItem.thumbnail = await generateThumbnail(file.buffer, filename);
        }

        post.media.push(mediaItem);
      }
    }

    post.updatedAt = new Date();
    await post.save();
    await post.populate('author', 'username email avatar level reputation');

    res.json({
      success: true,
      message: 'Post updated successfully',
      post
    });
  } catch (error) {
    console.error('Post update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update post',
      error: error.message
    });
  }
});

// Delete post
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.author.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this post'
      });
    }

    // TODO: Clean up uploaded files from storage
    await Post.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Post deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
});

// Like/Unlike post with reactions
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const userId = req.user._id;
    const { reactionType = 'like' } = req.body;
    
    // Find existing like from this user
    const existingLikeIndex = post.likes.findIndex(like => 
      like && like.user && like.user.toString() === userId.toString()
    );

    if (existingLikeIndex !== -1) {
      // User already liked - remove or change reaction
      if (post.likes[existingLikeIndex].reaction === reactionType) {
        // Same reaction, remove it (unlike)
        post.likes.splice(existingLikeIndex, 1);
      } else {
        // Different reaction, update it
        post.likes[existingLikeIndex].reaction = reactionType;
      }
    } else {
      // New like
      post.likes.push({
        user: userId,
        reaction: reactionType,
        createdAt: new Date()
      });
    }

    await post.save();
    
    // Calculate reaction counts
    const reactions = post.likes.reduce((acc, like) => {
      if (!like || !like.reaction) return acc;
      acc[like.reaction] = (acc[like.reaction] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      likesCount: post.likes.length,
      reactions,
      hasLiked: post.likes.some(like => like && like.user && like.user.toString() === userId.toString()),
      userReaction: post.likes.find(like => like && like.user && like.user.toString() === userId.toString())?.reaction || null
    });
  } catch (error) {
    console.error('Like toggle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle like',
      error: error.message
    });
  }
});

// Add comment to post
router.post('/:id/comments', auth, async (req, res) => {
  try {
    const { content, parentId } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = {
      content: content.trim(),
      author: req.user._id,
      parentId: parentId || null,
      createdAt: new Date()
    };

    post.comments.push(comment);
    await post.save();
    await post.populate('comments.author', 'username avatar');

    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      comment: newComment
    });
  } catch (error) {
    console.error('Comment creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
});

// Delete comment
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (comment.author.toString() !== req.user._id && post.author.toString() !== req.user._id) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this comment'
      });
    }

    post.comments.pull(req.params.commentId);
    await post.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Comment deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    });
  }
});

// Bookmark/Unbookmark post
router.post('/:id/bookmark', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const userId = req.user._id;
    const hasBookmarked = post.bookmarks.includes(userId);

    if (hasBookmarked) {
      post.bookmarks.pull(userId);
    } else {
      post.bookmarks.push(userId);
    }

    await post.save();

    res.json({
      success: true,
      message: hasBookmarked ? 'Bookmark removed' : 'Post bookmarked',
      hasBookmarked: !hasBookmarked,
      bookmarksCount: post.bookmarks.length
    });
  } catch (error) {
    console.error('Bookmark toggle error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle bookmark',
      error: error.message
    });
  }
});

// Share post
router.post('/:id/share', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const userId = req.user._id;
    
    if (!post.shares.includes(userId)) {
      post.shares.push(userId);
      await post.save();
    }

    res.json({
      success: true,
      message: 'Post shared successfully',
      sharesCount: post.shares.length
    });
  } catch (error) {
    console.error('Share error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to share post',
      error: error.message
    });
  }
});

// Vote on poll
router.post('/:id/poll/vote', auth, async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.type !== 'poll' || !post.poll) {
      return res.status(400).json({
        success: false,
        message: 'This post is not a poll'
      });
    }

    if (post.poll.expiresAt && post.poll.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Poll has expired'
      });
    }

    if (optionIndex < 0 || optionIndex >= post.poll.options.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid option index'
      });
    }

    const userId = req.user._id;
    
    // Remove previous vote if exists
    post.poll.options.forEach(option => {
      option.voters = option.voters.filter(voter => voter.toString() !== userId);
    });

    // Add new vote
    post.poll.options[optionIndex].voters.push(userId);
    post.poll.options[optionIndex].votes = post.poll.options[optionIndex].voters.length;

    await post.save();

    res.json({
      success: true,
      message: 'Vote recorded successfully',
      poll: post.poll
    });
  } catch (error) {
    console.error('Poll vote error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record vote',
      error: error.message
    });
  }
});

// Get user's bookmarked posts
router.get('/bookmarks/me', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ bookmarks: req.user._id })
      .populate('author', 'username email avatar level reputation')
      .populate('comments.author', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments({ bookmarks: req.user._id });
    const totalPages = Math.ceil(total / limit);

    const postsWithInteractions = posts.map(post => {
      const userLike = post.likes?.find(like => like.user?.toString() === req.user._id.toString());
      const reactions = (post.likes || []).reduce((acc, like) => {
        acc[like.reaction] = (acc[like.reaction] || 0) + 1;
        return acc;
      }, {});
      
      return {
        ...post,
        hasLiked: !!userLike,
        userReaction: userLike?.reaction || null,
        hasBookmarked: true,
        likesCount: post.likes?.length || 0,
        reactions,
        bookmarksCount: post.bookmarks?.length || 0,
        sharesCount: post.shares?.length || 0
      };
    });

    res.json({
      success: true,
      posts: postsWithInteractions,
      pagination: {
        current: page,
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      total
    });
  } catch (error) {
    console.error('Bookmarks fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch bookmarks',
      error: error.message
    });
  }
});

// Get trending posts
router.get('/trending/posts', auth, async (req, res) => {
  try {
    const timeframe = req.query.timeframe || '7d'; // 1d, 7d, 30d
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let dateFilter = {};
    const now = new Date();
    
    switch (timeframe) {
      case '1d':
        dateFilter = { createdAt: { $gte: new Date(now - 24 * 60 * 60 * 1000) } };
        break;
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now - 30 * 24 * 60 * 60 * 1000) } };
        break;
    }

    const posts = await Post.aggregate([
      { $match: { privacy: 'public', ...dateFilter } },
      {
        $addFields: {
          engagementScore: {
            $add: [
              { $multiply: [{ $size: { $ifNull: ['$likes', []] } }, 1] },
              { $multiply: [{ $size: { $ifNull: ['$comments', []] } }, 2] },
              { $multiply: [{ $size: { $ifNull: ['$shares', []] } }, 3] }
            ]
          }
        }
      },
      { $sort: { engagementScore: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    await Post.populate(posts, [
      { path: 'author', select: 'username email avatar level reputation' },
      { path: 'comments.author', select: 'username avatar' }
    ]);

    const total = await Post.countDocuments({ privacy: 'public', ...dateFilter });
    const totalPages = Math.ceil(total / limit);

    const postsWithInteractions = posts.map(post => {
      const userLike = post.likes?.find(like => like.user?.toString() === req.user._id.toString());
      const reactions = (post.likes || []).reduce((acc, like) => {
        acc[like.reaction] = (acc[like.reaction] || 0) + 1;
        return acc;
      }, {});
      
      return {
        ...post,
        hasLiked: !!userLike,
        userReaction: userLike?.reaction || null,
        hasBookmarked: post.bookmarks?.includes(req.user._id),
        likesCount: post.likes?.length || 0,
        reactions,
        bookmarksCount: post.bookmarks?.length || 0,
        sharesCount: post.shares?.length || 0
      };
    });

    res.json({
      success: true,
      posts: postsWithInteractions,
      pagination: {
        current: page,
        total: totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      total
    });
  } catch (error) {
    console.error('Trending posts fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trending posts',
      error: error.message
    });
  }
});

module.exports = router;
