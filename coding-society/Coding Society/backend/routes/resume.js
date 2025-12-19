const express = require('express');
const router = express.Router();
const Resume = require('../models/Resume');
const { auth } = require('../middleware/auth');

// @desc    Get current user's resume
// @route   GET /api/resume
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let resume = await Resume.findOne({ user: req.user.id });
    
    if (!resume) {
      // Return empty structure if no resume exists yet
      return res.status(200).json({
        personalInfo: { fullName: req.user.name || '', email: req.user.email || '' },
        education: [],
        skills: { technical: [], languages: [], tools: [] },
        projects: [],
        internships: [],
        achievements: [],
        settings: { accentColor: '#2563eb', fontFamily: 'font-sans', templateId: 'professional' }
      });
    }
    
    res.status(200).json(resume);
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// @desc    Create or Update user's resume
// @route   PUT /api/resume
// @access  Private
router.put('/', auth, async (req, res) => {
  try {
    const {
      personalInfo,
      objective,
      education,
      skills,
      projects,
      internships,
      achievements,
      settings
    } = req.body;

    // Build resume object
    const resumeFields = {
      user: req.user.id,
      personalInfo,
      objective,
      education,
      skills,
      projects,
      internships,
      achievements,
      settings,
      lastUpdated: Date.now()
    };

    let resume = await Resume.findOne({ user: req.user.id });

    if (resume) {
      // Update
      resume = await Resume.findOneAndUpdate(
        { user: req.user.id },
        { $set: resumeFields },
        { new: true }
      );
      return res.json(resume);
    }

    // Create
    resume = new Resume(resumeFields);
    await resume.save();
    res.json(resume);

  } catch (error) {
    console.error('Error saving resume:', error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
