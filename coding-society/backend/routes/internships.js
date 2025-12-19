const express = require('express');
const router = express.Router();
const Internship = require('../models/Internship');
const { auth } = require('../middleware/auth');

// @route   GET /api/v1/internships
// @desc    Get all public internships with filtering
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      location, 
      status = 'open', // Default to open internships for public view
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const filter = { status }; // Only show internships with specific status (default open)

    if (type) filter['duration.type'] = type;
    if (location) {
        // Simple regex search for location (city, state, country)
        filter['location.address.city'] = { $regex: location, $options: 'i' };
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'skills.required.name': { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [internships, total] = await Promise.all([
      Internship.find(filter)
        .select('-applications -views -clicks') // Exclude sensitive/heavy data
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Internship.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: internships,
      pagination: {
        current: parseInt(page),
        total: totalPages,
        totalItems: total,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching internships:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/v1/internships/:id
// @desc    Get internship by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id)
      .select('-applications'); // Exclude applications list for public view

    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    // Increment view count (simple implementation)
    await Internship.findByIdAndUpdate(req.params.id, { $inc: { 'views.total': 1 } });

    res.json({ success: true, data: internship });
  } catch (error) {
    console.error('Error fetching internship details:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   POST /api/v1/internships/:id/apply
// @desc    Apply for an internship
// @access  Private (Student)
router.post('/:id/apply', auth, async (req, res) => {
  try {
    const internship = await Internship.findById(req.params.id);

    if (!internship) {
      return res.status(404).json({ success: false, message: 'Internship not found' });
    }

    if (internship.status !== 'open') {
      return res.status(400).json({ success: false, message: 'This internship is no longer accepting applications' });
    }

    // Check if already applied
    const alreadyApplied = internship.applications.some(
      app => app.applicantId.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'You have already applied for this internship' });
    }

    const {
      resumeUrl,
      coverLetter,
      portfolioUrl,
      expectedStipend,
      availableStartDate,
      additionalInfo
    } = req.body;

    const newApplication = {
      applicantId: req.user._id,
      resumeUrl,
      coverLetter,
      portfolioUrl,
      expectedStipend,
      availableStartDate,
      additionalInfo,
      status: 'applied',
      appliedAt: new Date()
    };

    internship.applications.push(newApplication);
    internship.clicks.apply += 1; // Increment apply click count
    
    await internship.save();

    res.json({ success: true, message: 'Application submitted successfully' });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
});

// @route   GET /api/v1/internships/my-applications
// @desc    Get current user's applications
// @access  Private
router.get('/user/applications', auth, async (req, res) => {
    try {
        // Find internships where the user has an application
        const internships = await Internship.find({
            'applications.applicantId': req.user._id
        }).select('title company location status applications.$');

        // Transform data to show application details
        const applications = internships.map(internship => {
            const app = internship.applications[0]; // The projection returns only the matching element
            return {
                internshipId: internship._id,
                title: internship.title,
                company: internship.company,
                location: internship.location,
                status: app.status,
                appliedAt: app.appliedAt
            };
        });

        res.json({ success: true, data: applications });
    } catch (error) {
        console.error('Error fetching user applications:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
