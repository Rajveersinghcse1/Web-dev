const express = require('express');
const router = express.Router();
const Innovation = require('../models/Innovation');
const { auth } = require('../middleware/auth');

// @route   GET /api/v1/innovation
// @desc    Get all public innovation projects with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      domain,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = {};
    
    // Default to approved/active projects
    if (status) {
      filter.status = status;
    } else {
      filter.status = { $in: ['approved', 'active', 'completed'] };
    }

    if (domain) filter.domain = domain;
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { problemStatement: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [projects, total] = await Promise.all([
      Innovation.find(filter)
        .populate('leader', 'username profile.firstName profile.lastName profile.avatar')
        .select('-budget -resources.cost') // Exclude sensitive data
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Innovation.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: {
        projects,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Error fetching innovation projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching innovation projects',
      error: error.message
    });
  }
});

// @route   GET /api/v1/innovation/:id
// @desc    Get single innovation project by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const project = await Innovation.findById(req.params.id)
      .populate('leader', 'username profile.firstName profile.lastName profile.avatar')
      .populate('team.userId', 'username profile.firstName profile.lastName profile.avatar')
      .select('-budget -resources.cost');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Error fetching innovation project:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching innovation project',
      error: error.message
    });
  }
});

module.exports = router;
