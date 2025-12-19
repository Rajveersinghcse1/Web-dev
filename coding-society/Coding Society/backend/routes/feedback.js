const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/feedback');
    try {
      await fs.mkdir(uploadPath, { recursive: true });
      cb(null, uploadPath);
    } catch (error) {
      cb(error);
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'feedback-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Allow images and documents
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// @route   POST /api/feedback
// @desc    Submit feedback/contact form
// @access  Public
router.post('/', upload.array('attachments', 5), async (req, res) => {
  try {
    const { name, email, subject, message, category, rating } = req.body;

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, subject, and message'
      });
    }

    // Get client information
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');

    // Check if user is authenticated
    let userId = null;
    if (req.header('x-auth-token')) {
      try {
        const token = req.header('x-auth-token');
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        userId = decoded.user.id;
      } catch (error) {
        // User not authenticated, continue as anonymous
      }
    }

    // Process attachments
    const attachments = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        attachments.push({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype
        });
      });
    }

    const feedbackData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
      category: category || 'general',
      userId,
      ipAddress,
      userAgent,
      attachments
    };

    if (rating && rating >= 1 && rating <= 5) {
      feedbackData.rating = parseInt(rating);
    }

    const feedback = new Feedback(feedbackData);
    await feedback.save();

    // Populate user info if available
    if (feedback.userId) {
      await feedback.populate('userId', 'name email');
    }

    res.status(201).json({
      success: true,
      message: 'Feedback submitted successfully! We\'ll get back to you soon.',
      data: {
        id: feedback._id,
        status: feedback.status,
        createdAt: feedback.createdAt
      }
    });

  } catch (error) {
    console.error('Feedback submission error:', error);
    
    // Clean up uploaded files if there's an error
    if (req.files && req.files.length > 0) {
      req.files.forEach(async (file) => {
        try {
          await fs.unlink(file.path);
        } catch (unlinkError) {
          console.error('Error deleting uploaded file:', unlinkError);
        }
      });
    }

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error occurred while submitting feedback'
    });
  }
});

// @route   GET /api/feedback
// @desc    Get all feedback (Admin only)
// @access  Private (Admin)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const {
      page = 1,
      limit = 10,
      status,
      category,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    
    if (search) {
      query.$text = { $search: search };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const limitNum = parseInt(limit);

    const [feedbacks, totalCount] = await Promise.all([
      Feedback.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'name email')
        .populate('assignedTo', 'name email')
        .populate('adminNotes.addedBy', 'name'),
      Feedback.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalCount / limitNum);

    res.json({
      success: true,
      data: feedbacks,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalCount,
        hasNext: parseInt(page) < totalPages,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching feedback'
    });
  }
});

// @route   GET /api/feedback/stats
// @desc    Get feedback statistics (Admin only)
// @access  Private (Admin)
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const [generalStats, categoryStats] = await Promise.all([
      Feedback.getStats(),
      Feedback.getCategoryStats()
    ]);

    res.json({
      success: true,
      data: {
        general: generalStats,
        categories: categoryStats
      }
    });

  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching feedback statistics'
    });
  }
});

// @route   GET /api/feedback/:id
// @desc    Get feedback by ID (Admin only)
// @access  Private (Admin)
router.get('/:id', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const feedback = await Feedback.findById(req.params.id)
      .populate('userId', 'name email avatar')
      .populate('assignedTo', 'name email')
      .populate('adminNotes.addedBy', 'name');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    res.json({
      success: true,
      data: feedback
    });

  } catch (error) {
    console.error('Get feedback by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while fetching feedback'
    });
  }
});

// @route   PUT /api/feedback/:id/status
// @desc    Update feedback status (Admin only)
// @access  Private (Admin)
router.put('/:id/status', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { status, note } = req.body;
    
    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    if (status === 'resolved') {
      await feedback.markResolved(req.user.id, note);
    } else {
      feedback.status = status;
      
      if (note) {
        feedback.adminNotes.push({
          note: note,
          addedBy: req.user.id
        });
      }
      
      await feedback.save();
    }

    await feedback.populate([
      { path: 'userId', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'adminNotes.addedBy', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Feedback status updated successfully',
      data: feedback
    });

  } catch (error) {
    console.error('Update feedback status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while updating feedback status'
    });
  }
});

// @route   PUT /api/feedback/:id/assign
// @desc    Assign feedback to admin (Admin only)
// @access  Private (Admin)
router.put('/:id/assign', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { assignedTo, note } = req.body;
    
    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    // Verify assigned user is an admin
    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser || assignedUser.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: 'Can only assign to admin users'
        });
      }
    }

    await feedback.assignTo(assignedTo, note);

    await feedback.populate([
      { path: 'userId', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'adminNotes.addedBy', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Feedback assigned successfully',
      data: feedback
    });

  } catch (error) {
    console.error('Assign feedback error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while assigning feedback'
    });
  }
});

// @route   POST /api/feedback/:id/notes
// @desc    Add admin note to feedback (Admin only)
// @access  Private (Admin)
router.post('/:id/notes', auth, async (req, res) => {
  try {
    // Check if user is admin
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin privileges required.'
      });
    }

    const { note } = req.body;
    
    if (!note) {
      return res.status(400).json({
        success: false,
        message: 'Note is required'
      });
    }

    const feedback = await Feedback.findById(req.params.id);
    
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found'
      });
    }

    await feedback.addAdminNote(note, req.user.id);

    await feedback.populate([
      { path: 'userId', select: 'name email' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'adminNotes.addedBy', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Admin note added successfully',
      data: feedback
    });

  } catch (error) {
    console.error('Add admin note error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error occurred while adding admin note'
    });
  }
});

module.exports = router;