const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const logger = require('../utils/logger');
const { redisHelpers } = require('../config/redis');

const router = express.Router();

// Validation middleware
const validatePost = [
  body('title')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .isLength({ min: 10, max: 10000 })
    .withMessage('Content must be between 10 and 10000 characters'),
  body('category')
    .optional()
    .isIn(['project', 'tutorial', 'question', 'discussion', 'showcase', 'news', 'job'])
    .withMessage('Invalid category')
];

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       required:
 *         - title
 *         - content
 *         - author
 *       properties:
 *         title:
 *           type: string
 *           minLength: 5
 *           maxLength: 200
 *         content:
 *           type: string
 *           minLength: 10
 *           maxLength: 10000
 *         author:
 *           type: string
 *           format: objectId
 *         category:
 *           type: string
 *           enum: [project, tutorial, question, discussion, showcase, news, job]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /api/v1/feed:
 *   get:
 *     summary: Get all posts (feed)
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { category, search, featured, author } = req.query;

    // Build query
    const query = { status: 'published' };
    
    if (category) {
      query.category = category;
    }
    
    if (featured === 'true') {
      query.featured = true;
    }
    
    if (author) {
      query.author = author;
    }

    // Handle search
    let posts, totalCount;
    
    if (search) {
      // Use text search
      [posts, totalCount] = await Promise.all([
        Post.find({
          ...query,
          $text: { $search: search }
        }, {
          score: { $meta: 'textScore' }
        })
        .populate('author', 'username profile.firstName profile.lastName profile.avatar')
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit),
        
        Post.countDocuments({
          ...query,
          $text: { $search: search }
        })
      ]);
    } else {
      // Check cache for regular queries
      const cacheKey = `posts:${JSON.stringify(query)}:${page}:${limit}`;
      let cachedResult = await redisHelpers.getCache(cacheKey);
      
      if (cachedResult) {
        logger.logCache('hit', cacheKey);
        return res.json(cachedResult);
      }

      // Regular query
      [posts, totalCount] = await Promise.all([
        Post.find(query)
          .populate('author', 'username profile.firstName profile.lastName profile.avatar')
          .sort({ 
            pinned: -1, 
            featured: -1, 
            createdAt: -1 
          })
          .skip(skip)
          .limit(limit),
        
        Post.countDocuments(query)
      ]);

      // Cache non-search results for 5 minutes
      const result = {
        success: true,
        data: posts.map(post => ({
          ...post.toObject(),
          likeCount: post.likeCount,
          commentCount: post.commentCount,
          engagementScore: post.engagementScore
        })),
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount,
          itemsPerPage: limit,
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        },
        total: totalCount
      };

      await redisHelpers.setCache(cacheKey, result, 300);
      logger.logCache('set', cacheKey);
      
      return res.json(result);
    }

    const result = {
      success: true,
      data: posts.map(post => ({
        ...post.toObject(),
        likeCount: post.likeCount,
        commentCount: post.commentCount,
        engagementScore: post.engagementScore
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      },
      total: totalCount
    };

    logger.logDatabase('query', 'posts', { 
      query, 
      search: !!search,
      count: posts.length, 
      totalCount 
    });

    res.json(result);
  } catch (error) {
    logger.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch posts',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/feed/{id}:
 *   get:
 *     summary: Get post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Check cache first
    const cacheKey = `post:${id}`;
    let cachedPost = await redisHelpers.getCache(cacheKey);
    
    if (cachedPost) {
      logger.logCache('hit', cacheKey);
      
      // Increment views (don't wait for completion)
      Post.findByIdAndUpdate(id, { $inc: { views: 1 } }).catch(err => 
        logger.error('Error incrementing views:', err)
      );
      
      return res.json({ success: true, data: cachedPost });
    }

    const post = await Post.findById(id)
      .populate('author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('comments.author', 'username profile.firstName profile.lastName profile.avatar')
      .populate('comments.replies.author', 'username profile.firstName profile.lastName profile.avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Increment views
    await post.incrementViews();

    const enrichedPost = {
      ...post.toObject(),
      likeCount: post.likeCount,
      commentCount: post.commentCount,
      engagementScore: post.engagementScore
    };

    // Cache for 10 minutes
    await redisHelpers.setCache(cacheKey, enrichedPost, 600);
    logger.logCache('set', cacheKey);

    logger.logDatabase('findById', 'posts', { id });

    res.json({
      success: true,
      data: enrichedPost
    });
  } catch (error) {
    logger.error('Error fetching post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch post',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/feed:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Post'
 *     responses:
 *       201:
 *         description: Post created successfully
 */
router.post('/', validatePost, async (req, res) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const postData = {
      ...req.body,
      // If no author provided in body, you might want to get it from authentication
      author: req.body.author || '507f1f77bcf86cd799439011' // placeholder ID
    };

    const post = new Post(postData);
    await post.save();

    // Populate author info
    await post.populate('author', 'username profile.firstName profile.lastName profile.avatar');

    // Clear posts cache
    await redisHelpers.deleteCache('posts:*');

    logger.logDatabase('create', 'posts', { 
      id: post._id, 
      title: post.title,
      author: post.author._id
    });

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: {
        ...post.toObject(),
        likeCount: post.likeCount,
        commentCount: post.commentCount
      }
    });
  } catch (error) {
    logger.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create post',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/feed/{id}:
 *   put:
 *     summary: Update post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Remove fields that shouldn't be updated directly
    delete updates._id;
    delete updates.__v;
    delete updates.author;
    delete updates.createdAt;
    delete updates.views;
    delete updates.likes;
    delete updates.comments;

    const post = await Post.findByIdAndUpdate(
      id,
      { 
        ...updates,
        'metadata.lastEditedBy': req.body.editedBy || null,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).populate('author', 'username profile.firstName profile.lastName profile.avatar');

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Clear cache
    await redisHelpers.deleteCache(`post:${id}`);

    logger.logDatabase('update', 'posts', { 
      id, 
      updates: Object.keys(updates)
    });

    res.json({
      success: true,
      message: 'Post updated successfully',
      data: {
        ...post.toObject(),
        likeCount: post.likeCount,
        commentCount: post.commentCount
      }
    });
  } catch (error) {
    logger.error('Error updating post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update post',
      message: error.message
    });
  }
});

/**
 * @swagger
 * /api/v1/feed/{id}:
 *   delete:
 *     summary: Delete post
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted successfully
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    // Clear cache
    await redisHelpers.deleteCache(`post:${id}`);

    logger.logDatabase('delete', 'posts', { 
      id, 
      title: post.title 
    });

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete post',
      message: error.message
    });
  }
});

// Like/Unlike post
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID is required'
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const liked = await post.addLike(userId);
    
    // Clear cache
    await redisHelpers.deleteCache(`post:${id}`);

    logger.logDatabase('like', 'posts', { id, userId, action: liked ? 'added' : 'exists' });

    res.json({
      success: true,
      message: liked ? 'Post liked successfully' : 'Post already liked',
      data: {
        likeCount: post.likeCount,
        liked: true
      }
    });
  } catch (error) {
    logger.error('Error liking post:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to like post',
      message: error.message
    });
  }
});

// Add comment to post
router.post('/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { content, author } = req.body;

    if (!content || !author) {
      return res.status(400).json({
        success: false,
        error: 'Content and author are required'
      });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({
        success: false,
        error: 'Post not found'
      });
    }

    const comment = await post.addComment({ content, author });
    
    // Populate the new comment's author
    await post.populate('comments.author', 'username profile.firstName profile.lastName profile.avatar');
    
    // Clear cache
    await redisHelpers.deleteCache(`post:${id}`);

    logger.logDatabase('comment', 'posts', { 
      postId: id, 
      commentId: comment._id,
      author 
    });

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: {
        comment: post.comments[post.comments.length - 1],
        commentCount: post.commentCount
      }
    });
  } catch (error) {
    logger.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add comment',
      message: error.message
    });
  }
});

module.exports = router;