const express = require('express');
const Achievement = require('../models/Achievement');
const logger = require('../utils/logger');
const { redisHelpers } = require('../config/redis');

const router = express.Router();

// Get all achievements
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { category, rarity, isActive } = req.query;

    const query = {};
    if (category) query.category = category;
    if (rarity) query.rarity = rarity;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const cacheKey = `achievements:${JSON.stringify(query)}:${page}:${limit}`;
    let cachedResult = await redisHelpers.getCache(cacheKey);
    
    if (cachedResult) {
      return res.json(cachedResult);
    }

    const [achievements, totalCount] = await Promise.all([
      Achievement.find(query)
        .sort({ points: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Achievement.countDocuments(query)
    ]);

    const result = {
      success: true,
      data: achievements.map(achievement => ({
        ...achievement.toObject(),
        earnedCount: achievement.earnedCount
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

    await redisHelpers.setCache(cacheKey, result, 600);
    res.json(result);
  } catch (error) {
    logger.error('Error fetching achievements:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch achievements',
      message: error.message
    });
  }
});

// Get achievement by ID
router.get('/:id', async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    
    if (!achievement) {
      return res.status(404).json({
        success: false,
        error: 'Achievement not found'
      });
    }

    res.json({
      success: true,
      data: {
        ...achievement.toObject(),
        earnedCount: achievement.earnedCount
      }
    });
  } catch (error) {
    logger.error('Error fetching achievement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch achievement',
      message: error.message
    });
  }
});

// Create achievement
router.post('/', async (req, res) => {
  try {
    const achievement = new Achievement(req.body);
    await achievement.save();

    await redisHelpers.deleteCache('achievements:*');

    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      data: achievement
    });
  } catch (error) {
    logger.error('Error creating achievement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create achievement',
      message: error.message
    });
  }
});

// Update achievement
router.put('/:id', async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!achievement) {
      return res.status(404).json({
        success: false,
        error: 'Achievement not found'
      });
    }

    await redisHelpers.deleteCache('achievements:*');

    res.json({
      success: true,
      message: 'Achievement updated successfully',
      data: achievement
    });
  } catch (error) {
    logger.error('Error updating achievement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update achievement',
      message: error.message
    });
  }
});

// Delete achievement
router.delete('/:id', async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);

    if (!achievement) {
      return res.status(404).json({
        success: false,
        error: 'Achievement not found'
      });
    }

    res.json({
      success: true,
      message: 'Achievement deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting achievement:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete achievement',
      message: error.message
    });
  }
});

module.exports = router;