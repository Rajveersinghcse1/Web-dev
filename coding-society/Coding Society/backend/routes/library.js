const express = require('express');
const router = express.Router();
const LibraryContent = require('../models/LibraryContent');
const { auth } = require('../middleware/auth');

// @route   GET /api/v1/library
// @desc    Get all public library content with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type,
      category,
      subject,
      difficulty,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { status: 'published' }; // Only show published content
    
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (subject) filter.subject = subject;
    if (difficulty) filter.difficulty = difficulty;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [content, total] = await Promise.all([
      LibraryContent.find(filter)
        .populate('uploadedBy', 'username profile.firstName profile.lastName')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      LibraryContent.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        content,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching library content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching library content',
      error: error.message
    });
  }
});

// @route   GET /api/v1/library/:id
// @desc    Get single library content by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const content = await LibraryContent.findById(req.params.id)
      .populate('uploadedBy', 'username profile.firstName profile.lastName');

    if (!content) {
      return res.status(404).json({
        success: false,
        message: 'Content not found'
      });
    }

    // Increment view count
    content.metrics.views += 1;
    await content.save({ validateBeforeSave: false });

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching library content:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching library content',
      error: error.message
    });
  }
});

module.exports = router;
