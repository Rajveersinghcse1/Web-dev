const express = require('express');
const router = express.Router();
const Hackathon = require('../models/Hackathon');
const { auth } = require('../middleware/auth');

// @route   GET /api/v1/hackathons
// @desc    Get all public hackathons with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      mode,
      search,
      sortBy = 'startDate',
      sortOrder = 'asc'
    } = req.query;

    const filter = {};
    
    // Filter by status if provided, otherwise default to showing upcoming/ongoing
    if (status) {
      filter.status = status;
    } else {
      // Default: show published hackathons that aren't cancelled
      filter.status = { $in: ['published', 'open', 'ongoing', 'upcoming'] };
    }

    if (mode) filter.mode = mode;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'organizer.name': { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [hackathons, total] = await Promise.all([
      Hackathon.find(filter)
        .select('-registrations -budget -metrics') // Exclude sensitive data
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Hackathon.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        hackathons,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching hackathons:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hackathons',
      error: error.message
    });
  }
});

// @route   GET /api/v1/hackathons/:id
// @desc    Get single hackathon by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const hackathon = await Hackathon.findById(req.params.id)
      .select('-registrations -budget -metrics'); // Exclude sensitive data

    if (!hackathon) {
      return res.status(404).json({
        success: false,
        message: 'Hackathon not found'
      });
    }

    // Increment view count (lightweight analytics)
    // hackathon.metrics.views += 1;
    // await hackathon.save({ validateBeforeSave: false });

    res.json({
      success: true,
      data: hackathon
    });
  } catch (error) {
    console.error('Error fetching hackathon:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching hackathon',
      error: error.message
    });
  }
});

module.exports = router;
