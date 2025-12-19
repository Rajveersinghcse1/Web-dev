/**
 * Admin Routes for Content Management
 * Handles CRUD operations for all admin panel content
 */

const express = require('express');
const router = express.Router();

// Import models
const LibraryContent = require('../models/LibraryContent');
const Innovation = require('../models/Innovation');
const Internship = require('../models/Internship');
const Hackathon = require('../models/Hackathon');
const Quest = require('../models/Quest');
const Achievement = require('../models/Achievement');
const User = require('../models/User');
const SystemSettings = require('../models/SystemSettings');
const AdminAuditLog = require('../models/AdminAuditLog');
const AdminAnalytics = require('../models/AdminAnalytics');
const Post = require('../models/Post');
const Story = require('../models/Story');
const Feedback = require('../models/Feedback');

// Import middleware
const { 
  authenticate, 
  isAdmin, 
  checkContentPermission, 
  auditLog,
  adminRateLimit 
} = require('../middleware/adminAuth');
const { 
  handleUpload, 
  validateFiles, 
  cleanupFiles, 
  getFileUrl 
} = require('../middleware/fileUpload');

// Apply authentication and admin check to all routes
router.use(authenticate);
router.use(isAdmin);
router.use(adminRateLimit(200, 15 * 60 * 1000)); // 200 requests per 15 minutes

// =============================================================================
// LIBRARY CONTENT ROUTES
// =============================================================================

/**
 * @route   GET /api/v1/admin/library
 * @desc    Get all library content with pagination and filters
 * @access  Admin
 */
router.get('/library', 
  checkContentPermission('read', 'library'),
  auditLog('view_library_content'),
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        subject, 
        type, 
        difficulty,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter object
      const filter = {};
      if (subject) filter.subject = subject;
      if (type) filter.type = type;
      if (difficulty) filter.difficulty = difficulty;
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      // Calculate pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      // Execute query with population
      const [content, total] = await Promise.all([
        LibraryContent.find(filter)
          .populate('uploadedBy', 'username email profile.firstName profile.lastName')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        LibraryContent.countDocuments(filter)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / parseInt(limit));
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      res.json({
        success: true,
        data: {
          content,
          pagination: {
            current: parseInt(page),
            total: totalPages,
            hasNext,
            hasPrev,
            totalItems: total
          },
          filters: {
            subject,
            type,
            difficulty,
            status,
            search
          }
        }
      });
    } catch (error) {
      console.error('Get library content error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch library content'
      });
    }
  }
);

/**
 * @route   POST /api/v1/admin/library
 * @desc    Create new library content
 * @access  Admin
 */
router.post('/library',
  checkContentPermission('create', 'library'),
  handleUpload('library', 'files'),
  validateFiles,
  auditLog('create_library_content'),
  async (req, res) => {
    try {
      console.log('Library Create Request Body:', req.body);
      console.log('User:', req.user ? req.user._id : 'No User');
      
      const {
        title,
        description,
        subject,
        category,
        type,
        difficulty,
        tags,
        content,
        prerequisites,
        estimatedDuration,
        learningObjectives
      } = req.body;

      // Process uploaded files
      const files = req.uploadedFiles || [];
      const fileData = files.map(file => ({
        originalName: file.originalName,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        url: getFileUrl(file.filename, 'library'),
        uploadedAt: new Date()
      }));

      // Map frontend values to model enums
      // Frontend now sends correct values, but keeping mapping for backward compatibility
      const typeMapping = {
        'notes': 'study_notes',
        'exam_papers': 'exam_paper',
        'reference_books': 'book',
        'tutorials': 'tutorial',
        'assignments': 'practice_problems'
      };
      
      const mappedType = typeMapping[type] || type;
      const mappedCategory = category || subject; // Use category if available, else subject

      // Create library content
      const libraryContent = new LibraryContent({
        title,
        description,
        category: mappedCategory,
        type: mappedType,
        difficulty,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        content,
        prerequisites: prerequisites ? prerequisites.split(',').map(p => p.trim()) : [],
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : undefined,
        learningObjectives: learningObjectives ? learningObjectives.split(',').map(obj => obj.trim()) : [],
        files: fileData,
        createdBy: req.user._id,
        status: 'published',
        accessLevel: 'free' // Default access level
      });

      await libraryContent.save();

      // Populate user data for response
      await libraryContent.populate('createdBy', 'username email profile.firstName profile.lastName');

      res.status(201).json({
        success: true,
        message: 'Library content created successfully',
        data: libraryContent
      });
    } catch (error) {
      console.error('Create library content error:', error);
      
      // Clean up uploaded files on error
      if (req.uploadedFiles) {
        const filePaths = req.uploadedFiles.map(file => file.path);
        cleanupFiles(filePaths);
      }

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create library content'
      });
    }
  }
);

/**
 * @route   PUT /api/v1/admin/library/:id
 * @desc    Update library content
 * @access  Admin
 */
router.put('/library/:id',
  checkContentPermission('update', 'library'),
  handleUpload('library', 'files'),
  validateFiles,
  auditLog('update_library_content'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Map frontend values
      const typeMapping = {
        'notes': 'study_notes',
        'exam_papers': 'exam_paper',
        'reference_books': 'book',
        'tutorials': 'tutorial',
        'assignments': 'practice_problems'
      };
      if (updateData.type) {
        updateData.type = typeMapping[updateData.type] || updateData.type;
      }
      if (updateData.subject) {
        updateData.category = updateData.subject;
        delete updateData.subject;
      }

      // Process tags, prerequisites, and learning objectives
      if (updateData.tags) {
        updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
      }
      if (updateData.prerequisites) {
        updateData.prerequisites = updateData.prerequisites.split(',').map(p => p.trim());
      }
      if (updateData.learningObjectives) {
        updateData.learningObjectives = updateData.learningObjectives.split(',').map(obj => obj.trim());
      }

      // Find existing content
      const existingContent = await LibraryContent.findById(id);
      if (!existingContent) {
        return res.status(404).json({
          success: false,
          message: 'Library content not found'
        });
      }

      // Handle file updates (removals and additions)
      let finalFiles = existingContent.files || [];

      // 1. Handle removals based on existingFiles list from frontend
      if (req.body.existingFiles) {
        try {
          const keptFiles = JSON.parse(req.body.existingFiles);
          const keptFilenames = new Set(keptFiles.map(f => f.filename));
          
          // Identify files to remove
          const filesToRemove = finalFiles.filter(f => !keptFilenames.has(f.filename));
          
          // Cleanup removed files from storage
          if (filesToRemove.length > 0) {
            cleanupFiles(filesToRemove);
          }
          
          // Update list to only kept files
          finalFiles = finalFiles.filter(f => keptFilenames.has(f.filename));
        } catch (e) {
          console.error('Error parsing existingFiles:', e);
        }
      }

      // 2. Add new uploaded files
      if (req.uploadedFiles && req.uploadedFiles.length > 0) {
        const newFiles = req.uploadedFiles.map(file => ({
          originalName: file.originalName,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
          url: file.url || getFileUrl(file.filename, 'library'),
          storageType: file.storageType,
          bucket: file.bucket,
          uploadedAt: new Date()
        }));
        
        finalFiles = [...finalFiles, ...newFiles];
      }
      
      updateData.files = finalFiles;

      updateData.updatedAt = new Date();

      // Update content
      const updatedContent = await LibraryContent.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('uploadedBy', 'username email profile.firstName profile.lastName');

      res.json({
        success: true,
        message: 'Library content updated successfully',
        data: updatedContent
      });
    } catch (error) {
      console.error('Update library content error:', error);
      
      // Clean up uploaded files on error
      if (req.uploadedFiles) {
        const filePaths = req.uploadedFiles.map(file => file.path);
        cleanupFiles(filePaths);
      }

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update library content'
      });
    }
  }
);

/**
 * @route   DELETE /api/v1/admin/library/:id
 * @desc    Delete library content
 * @access  Admin
 */
router.delete('/library/:id',
  checkContentPermission('delete', 'library'),
  auditLog('delete_library_content'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const content = await LibraryContent.findById(id);
      if (!content) {
        return res.status(404).json({
          success: false,
          message: 'Library content not found'
        });
      }

      // Clean up associated files
      if (content.files && content.files.length > 0) {
        const filePaths = content.files.map(file => 
          require('path').join(__dirname, '../uploads/library', file.filename)
        );
        cleanupFiles(filePaths);
      }

      await LibraryContent.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Library content deleted successfully'
      });
    } catch (error) {
      console.error('Delete library content error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete library content'
      });
    }
  }
);

// =============================================================================
// INNOVATION ROUTES
// =============================================================================

/**
 * @route   GET /api/v1/admin/innovation
 * @desc    Get all innovation projects
 * @access  Admin
 */
router.get('/innovation',
  checkContentPermission('read', 'innovation'),
  auditLog('view_innovation_projects'),
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter = {};
      if (category) filter.category = category;
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const [projects, total] = await Promise.all([
        Innovation.find(filter)
          .populate('creator', 'username email profile.firstName profile.lastName')
          .populate('collaborators.user', 'username email profile.firstName profile.lastName')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Innovation.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          projects,
          pagination: {
            current: parseInt(page),
            total: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            totalItems: total
          }
        }
      });
    } catch (error) {
      console.error('Get innovation projects error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch innovation projects'
      });
    }
  }
);

/**
 * @route   POST /api/v1/admin/innovation
 * @desc    Create new innovation project
 * @access  Admin
 */
router.post('/innovation',
  checkContentPermission('create', 'innovation'),
  handleUpload('innovation', 'files'),
  validateFiles,
  auditLog('create_innovation_project'),
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        type,
        difficulty,
        tags,
        timeline,
        requirements,
        objectives,
        techStack,
        collaborators
      } = req.body;

      // Process uploaded files
      const files = req.uploadedFiles || [];
      const fileData = files.map(file => ({
        originalName: file.originalName,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        url: getFileUrl(file.filename, 'innovation'),
        uploadedAt: new Date()
      }));

      // Process collaborators
      let collaboratorData = [];
      if (collaborators) {
        try {
          collaboratorData = JSON.parse(collaborators);
        } catch (e) {
          collaboratorData = [];
        }
      }

      // Map frontend values to model enums
      // Frontend now sends correct values, but keeping mapping for backward compatibility
      const categoryMapping = {
        'web_development': 'web_application',
        'mobile_development': 'mobile_app',
        'game_development': 'gaming'
      };
      const mappedCategory = categoryMapping[category] || category;

      const innovation = new Innovation({
        title,
        description,
        category: mappedCategory,
        type: type || 'concept',
        difficulty,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        timeline: timeline ? JSON.parse(timeline) : {},
        requirements: requirements ? requirements.split(',').map(req => req.trim()) : [],
        objectives: objectives ? objectives.split(',').map(obj => obj.trim()) : [],
        techStack: techStack ? { other: techStack.split(',').map(tech => tech.trim()) } : {},
        collaborators: collaboratorData,
        files: fileData,
        createdBy: req.user._id,
        status: 'planning'
      });

      await innovation.save();

      // Populate for response
      await innovation.populate('createdBy', 'username email profile.firstName profile.lastName');

      res.status(201).json({
        success: true,
        message: 'Innovation project created successfully',
        data: innovation
      });
    } catch (error) {
      console.error('Create innovation project error:', error);
      
      if (req.uploadedFiles) {
        const filePaths = req.uploadedFiles.map(file => file.path);
        cleanupFiles(filePaths);
      }

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create innovation project'
      });
    }
  }
);

/**
 * @route   PUT /api/v1/admin/innovation/:id
 * @desc    Update innovation project
 * @access  Admin
 */
router.put('/innovation/:id',
  checkContentPermission('update', 'innovation'),
  handleUpload('innovation', 'files'),
  validateFiles,
  auditLog('update_innovation_project'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Map frontend values
      const categoryMapping = {
        'web_development': 'web_application',
        'mobile_development': 'mobile_app',
        'game_development': 'gaming'
      };
      if (updateData.category) {
        updateData.category = categoryMapping[updateData.category] || updateData.category;
      }

      // Process arrays
      if (updateData.tags) updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
      if (updateData.requirements) updateData.requirements = updateData.requirements.split(',').map(req => req.trim());
      if (updateData.objectives) updateData.objectives = updateData.objectives.split(',').map(obj => obj.trim());
      if (updateData.techStack) updateData.techStack = { other: updateData.techStack.split(',').map(tech => tech.trim()) };

      // Process timeline and collaborators
      if (updateData.timeline) updateData.timeline = JSON.parse(updateData.timeline);
      if (updateData.collaborators) updateData.collaborators = JSON.parse(updateData.collaborators);

      const existingProject = await Innovation.findById(id);
      if (!existingProject) {
        return res.status(404).json({
          success: false,
          message: 'Innovation project not found'
        });
      }

      // Handle file updates (removals and additions)
      let finalFiles = existingProject.files || [];

      // 1. Handle removals based on existingFiles list from frontend
      if (req.body.existingFiles) {
        try {
          const keptFiles = JSON.parse(req.body.existingFiles);
          const keptFilenames = new Set(keptFiles.map(f => f.filename));
          
          // Identify files to remove
          const filesToRemove = finalFiles.filter(f => !keptFilenames.has(f.filename));
          
          // Cleanup removed files from storage
          if (filesToRemove.length > 0) {
            cleanupFiles(filesToRemove);
          }
          
          // Update list to only kept files
          finalFiles = finalFiles.filter(f => keptFilenames.has(f.filename));
        } catch (e) {
          console.error('Error parsing existingFiles:', e);
        }
      }

      // 2. Add new uploaded files
      if (req.uploadedFiles && req.uploadedFiles.length > 0) {
        const newFiles = req.uploadedFiles.map(file => ({
          originalName: file.originalName,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
          url: file.url || getFileUrl(file.filename, 'innovation'),
          storageType: file.storageType,
          bucket: file.bucket,
          uploadedAt: new Date()
        }));
        
        finalFiles = [...finalFiles, ...newFiles];
      }
      
      updateData.files = finalFiles;

      updateData.updatedAt = new Date();

      const updatedProject = await Innovation.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('creator', 'username email profile.firstName profile.lastName')
       .populate('collaborators.user', 'username email profile.firstName profile.lastName');

      res.json({
        success: true,
        message: 'Innovation project updated successfully',
        data: updatedProject
      });
    } catch (error) {
      console.error('Update innovation project error:', error);
      
      if (req.uploadedFiles) {
        const filePaths = req.uploadedFiles.map(file => file.path);
        cleanupFiles(filePaths);
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update innovation project'
      });
    }
  }
);

/**
 * @route   DELETE /api/v1/admin/innovation/:id
 * @desc    Delete innovation project
 * @access  Admin
 */
router.delete('/innovation/:id',
  checkContentPermission('delete', 'innovation'),
  auditLog('delete_innovation_project'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const project = await Innovation.findById(id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Innovation project not found'
        });
      }

      // Clean up associated files
      if (project.files && project.files.length > 0) {
        const filePaths = project.files.map(file => 
          require('path').join(__dirname, '../uploads/innovation', file.filename)
        );
        cleanupFiles(filePaths);
      }

      await Innovation.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Innovation project deleted successfully'
      });
    } catch (error) {
      console.error('Delete innovation project error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete innovation project'
      });
    }
  }
);

// =============================================================================
// INTERNSHIP ROUTES
// =============================================================================

/**
 * @route   GET /api/v1/admin/internship
 * @desc    Get all internships
 * @access  Admin
 */
router.get('/internship',
  checkContentPermission('read', 'internship'),
  auditLog('view_internships'),
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        type,
        location,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter = {};
      if (type) filter.type = type;
      if (location) filter.location = { $regex: location, $options: 'i' };
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const [internships, total] = await Promise.all([
        Internship.find(filter)
          .populate('postedBy', 'username email profile.firstName profile.lastName')
          .populate('applicants.student', 'username email profile.firstName profile.lastName')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Internship.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          internships,
          pagination: {
            current: parseInt(page),
            total: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            totalItems: total
          }
        }
      });
    } catch (error) {
      console.error('Get internships error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch internships'
      });
    }
  }
);

/**
 * @route   POST /api/v1/admin/internship
 * @desc    Create new internship
 * @access  Admin
 */
router.post('/internship',
  checkContentPermission('create', 'internship'),
  handleUpload('internship', 'files'),
  validateFiles,
  auditLog('create_internship'),
  async (req, res) => {
    try {
      const {
        title,
        company,
        description,
        location,
        type,
        duration,
        department,
        requirements,
        responsibilities,
        skills,
        compensation,
        applicationDeadline,
        mentorName,
        mentorEmail,
        mentorPhone,
        mentorLinkedIn,
        mentorContact
      } = req.body;

      // Process uploaded files
      const files = req.uploadedFiles || [];
      const fileData = files.map(file => ({
        originalName: file.originalName,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        url: getFileUrl(file.filename, 'internship'),
        uploadedAt: new Date()
      }));

      // Process mentor contact
      let mentorData = {};
      if (mentorContact) {
        try {
          const parsedContact = JSON.parse(mentorContact);
          mentorData = {
            name: parsedContact.name,
            email: parsedContact.email,
            phone: parsedContact.phone,
            title: parsedContact.position || parsedContact.title, // Handle both position and title
            bio: parsedContact.bio
          };
        } catch (e) {
          mentorData = {
            name: mentorName,
            email: mentorEmail,
            phone: mentorPhone,
            title: mentorLinkedIn // Assuming linkedIn was mapped to title/position in some contexts, or just fallback
          };
        }
      } else {
        mentorData = {
          name: mentorName,
          email: mentorEmail,
          phone: mentorPhone,
          title: mentorLinkedIn // Assuming linkedIn was mapped to title/position in some contexts, or just fallback
        };
      }

      // Process complex objects
      let companyData = {};
      try {
        companyData = typeof company === 'string' && company.startsWith('{') ? JSON.parse(company) : { name: company, industry: 'technology' };
      } catch (e) {
        companyData = { name: company, industry: 'technology' };
      }

      let locationData = {};
      try {
        locationData = typeof location === 'string' && location.startsWith('{') ? JSON.parse(location) : { 
          type: type === 'remote' ? 'remote' : (type === 'hybrid' ? 'hybrid' : 'on_site'),
          address: { city: typeof location === 'string' ? location : '' }
        };
      } catch (e) {
        locationData = { 
          type: type === 'remote' ? 'remote' : (type === 'hybrid' ? 'hybrid' : 'on_site'),
          address: { city: typeof location === 'string' ? location : '' }
        };
      }

      let durationData = {};
      try {
        durationData = typeof duration === 'string' && duration.startsWith('{') ? JSON.parse(duration) : { 
          value: duration ? parseInt(duration) : 3,
          unit: 'months',
          type: 'fixed'
        };
      } catch (e) {
        durationData = { 
          value: duration ? parseInt(duration) : 3,
          unit: 'months',
          type: 'fixed'
        };
      }

      let stipendData = {};
      try {
        stipendData = typeof req.body.stipend === 'string' && req.body.stipend.startsWith('{') ? JSON.parse(req.body.stipend) : {
          amount: compensation ? parseInt(compensation) : 0,
          currency: 'USD',
          period: 'monthly' // Changed from frequency to period to match frontend/model
        };
      } catch (e) {
        stipendData = {
          amount: compensation ? parseInt(compensation) : 0,
          currency: 'USD',
          period: 'monthly'
        };
      }

      const internship = new Internship({
        title,
        company: companyData,
        description,
        department: department ? department.toLowerCase() : 'engineering',
        role: req.body.role || title,
        level: req.body.level || 'entry',
        location: locationData,
        duration: durationData,
        stipend: stipendData,
        status: req.body.status || 'active',
        requirements: requirements ? (typeof requirements === 'string' && requirements.startsWith('[') ? JSON.parse(requirements) : requirements.split(',').map(req => ({ category: 'other', description: req.trim() }))) : [],
        benefits: req.body.benefits ? (typeof req.body.benefits === 'string' && req.body.benefits.startsWith('[') ? JSON.parse(req.body.benefits) : []) : [],
        files: fileData,
        createdBy: req.user._id
      });

      await internship.save();

      // Populate for response
      await internship.populate('createdBy', 'username email profile.firstName profile.lastName');

      res.status(201).json({
        success: true,
        message: 'Internship created successfully',
        data: internship
      });
    } catch (error) {
      console.error('Create internship error:', error);
      
      if (req.uploadedFiles) {
        const filePaths = req.uploadedFiles.map(file => file.path);
        cleanupFiles(filePaths);
      }

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create internship'
      });
    }
  }
);

/**
 * @route   PUT /api/v1/admin/internship/:id
 * @desc    Update internship
 * @access  Admin
 */
router.put('/internship/:id',
  checkContentPermission('update', 'internship'),
  handleUpload('internship', 'files'),
  validateFiles,
  auditLog('update_internship'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Map complex objects
      if (updateData.location) {
        try {
          updateData.location = typeof updateData.location === 'string' && updateData.location.startsWith('{') ? JSON.parse(updateData.location) : {
            type: updateData.type === 'remote' ? 'remote' : (updateData.type === 'hybrid' ? 'hybrid' : 'on_site'),
            address: { city: updateData.location }
          };
        } catch (e) {
          // Fallback
        }
      }
      
      if (updateData.company) {
        try {
          updateData.company = typeof updateData.company === 'string' && updateData.company.startsWith('{') ? JSON.parse(updateData.company) : { name: updateData.company, industry: 'technology' };
        } catch (e) {
          // Fallback
        }
      }

      if (updateData.duration) {
        try {
          updateData.duration = typeof updateData.duration === 'string' && updateData.duration.startsWith('{') ? JSON.parse(updateData.duration) : {
            value: parseInt(updateData.duration) || 3,
            unit: 'months',
            type: 'fixed'
          };
        } catch (e) {
          // Fallback
        }
      }

      if (updateData.stipend) {
        try {
          updateData.stipend = typeof updateData.stipend === 'string' && updateData.stipend.startsWith('{') ? JSON.parse(updateData.stipend) : undefined;
        } catch (e) {
          // Fallback
        }
      }

      if (updateData.requirements) {
        try {
          updateData.requirements = typeof updateData.requirements === 'string' && updateData.requirements.startsWith('[') ? JSON.parse(updateData.requirements) : updateData.requirements.split(',').map(req => ({ category: 'other', description: req.trim() }));
        } catch (e) {
          // Fallback
        }
      }

      if (updateData.benefits) {
        try {
          updateData.benefits = typeof updateData.benefits === 'string' && updateData.benefits.startsWith('[') ? JSON.parse(updateData.benefits) : [];
        } catch (e) {
          // Fallback
        }
      }

      // Process complex objects
      if (updateData.salary) updateData.salary = JSON.parse(updateData.salary);
      if (updateData.applicationDeadline) updateData.applicationDeadline = new Date(updateData.applicationDeadline);
      if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);

      // Process mentor details
      let mentorData = {};
      if (updateData.mentorContact) {
        try {
          const parsedContact = JSON.parse(updateData.mentorContact);
          mentorData = {
            name: parsedContact.name,
            email: parsedContact.email,
            phone: parsedContact.phone,
            title: parsedContact.position || parsedContact.title,
            bio: parsedContact.bio
          };
          delete updateData.mentorContact;
        } catch (e) {
          console.error('Error parsing mentorContact:', e);
        }
      } else {
        if (updateData.mentorName) mentorData.name = updateData.mentorName;
        if (updateData.mentorEmail) mentorData.email = updateData.mentorEmail;
        if (updateData.mentorPhone) mentorData.phone = updateData.mentorPhone;
      }
      
      if (Object.keys(mentorData).length > 0) {
        updateData.mentor = mentorData;
      }

      // Remove individual mentor fields from updateData
      delete updateData.mentorName;
      delete updateData.mentorEmail;
      delete updateData.mentorPhone;
      delete updateData.mentorLinkedIn;
      delete updateData.mentorDetails;

      const existingInternship = await Internship.findById(id);
      if (!existingInternship) {
        return res.status(404).json({
          success: false,
          message: 'Internship not found'
        });
      }

      // Handle file updates (removals and additions)
      let finalFiles = existingInternship.files || [];

      // 1. Handle removals based on existingFiles list from frontend
      if (req.body.existingFiles) {
        try {
          const keptFiles = JSON.parse(req.body.existingFiles);
          const keptFilenames = new Set(keptFiles.map(f => f.filename));
          
          // Identify files to remove
          const filesToRemove = finalFiles.filter(f => !keptFilenames.has(f.filename));
          
          // Cleanup removed files from storage
          if (filesToRemove.length > 0) {
            cleanupFiles(filesToRemove);
          }
          
          // Update list to only kept files
          finalFiles = finalFiles.filter(f => keptFilenames.has(f.filename));
        } catch (e) {
          console.error('Error parsing existingFiles:', e);
        }
      }

      // 2. Add new uploaded files
      if (req.uploadedFiles && req.uploadedFiles.length > 0) {
        const newFiles = req.uploadedFiles.map(file => ({
          originalName: file.originalName,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
          url: file.url || getFileUrl(file.filename, 'internship'),
          storageType: file.storageType,
          bucket: file.bucket,
          uploadedAt: new Date()
        }));
        
        finalFiles = [...finalFiles, ...newFiles];
      }
      
      updateData.files = finalFiles;

      const updatedInternship = await Internship.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('postedBy', 'username email profile.firstName profile.lastName');

      res.json({
        success: true,
        message: 'Internship updated successfully',
        data: updatedInternship
      });
    } catch (error) {
      console.error('Update internship error:', error);
      
      if (req.uploadedFiles) {
        const filePaths = req.uploadedFiles.map(file => file.path);
        cleanupFiles(filePaths);
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update internship'
      });
    }
  }
);

/**
 * @route   DELETE /api/v1/admin/internship/:id
 * @desc    Delete internship
 * @access  Admin
 */
router.delete('/internship/:id',
  checkContentPermission('delete', 'internship'),
  auditLog('delete_internship'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const internship = await Internship.findById(id);
      if (!internship) {
        return res.status(404).json({
          success: false,
          message: 'Internship not found'
        });
      }

      // Clean up associated files
      if (internship.files && internship.files.length > 0) {
        const filePaths = internship.files.map(file => 
          require('path').join(__dirname, '../uploads/internship', file.filename)
        );
        cleanupFiles(filePaths);
      }

      await Internship.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Internship deleted successfully'
      });
    } catch (error) {
      console.error('Delete internship error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete internship'
      });
    }
  }
);

// =============================================================================
// HACKATHON ROUTES
// =============================================================================

/**
 * @route   GET /api/v1/admin/hackathon
 * @desc    Get all hackathons
 * @access  Admin
 */
router.get('/hackathon',
  checkContentPermission('read', 'hackathon'),
  auditLog('view_hackathons'),
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        type,
        status,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter = {};
      if (type) filter.type = type;
      if (status) filter.status = status;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { theme: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const [hackathons, total] = await Promise.all([
        Hackathon.find(filter)
          .populate('creator', 'username email profile.firstName profile.lastName')
          .populate('participants', 'username email profile.firstName profile.lastName')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Hackathon.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          hackathons,
          pagination: {
            current: parseInt(page),
            total: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            totalItems: total
          }
        }
      });
    } catch (error) {
      console.error('Get hackathons error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch hackathons'
      });
    }
  }
);

/**
 * @route   POST /api/v1/admin/hackathon
 * @desc    Create new hackathon
 * @access  Admin
 */
router.post('/hackathon',
  checkContentPermission('create', 'hackathon'),
  handleUpload('hackathon', 'files'),
  validateFiles,
  auditLog('create_hackathon'),
  async (req, res) => {
    try {
      const {
        title,
        description,
        theme,
        type,
        eventFormat,
        timeline,
        prizes,
        sponsors,
        rules,
        judgesCriteria,
        requirements,
        maxParticipants,
        maxTeamSize,
        registrationStartDate,
        registrationEndDate,
        registrationDeadline,
        eventStartDate,
        eventEndDate
      } = req.body;

      // Process uploaded files
      const files = req.uploadedFiles || [];
      const fileData = files.map(file => ({
        originalName: file.originalName,
        filename: file.filename,
        size: file.size,
        mimetype: file.mimetype,
        url: getFileUrl(file.filename, 'hackathon'),
        uploadedAt: new Date()
      }));

      // Map frontend values
      // Use provided eventFormat or fallback to mapping logic
      const mappedEventFormat = eventFormat || (type === 'online' ? 'virtual' : (type === 'offline' ? 'in_person' : 'hybrid'));
      
      const organizerData = {
        name: 'Coding Society',
        email: req.user.email || 'admin@codingsociety.com'
      };

      // Construct timeline object
      const timelineData = timeline ? JSON.parse(timeline) : {};
      const finalTimeline = {
        registrationStart: registrationStartDate ? new Date(registrationStartDate) : (timelineData.registrationStart ? new Date(timelineData.registrationStart) : new Date()),
        registrationEnd: registrationEndDate ? new Date(registrationEndDate) : (registrationDeadline ? new Date(registrationDeadline) : new Date(Date.now() + 30*24*60*60*1000)),
        eventStart: eventStartDate ? new Date(eventStartDate) : new Date(Date.now() + 45*24*60*60*1000),
        eventEnd: eventEndDate ? new Date(eventEndDate) : new Date(Date.now() + 47*24*60*60*1000),
        submissionDeadline: eventEndDate ? new Date(eventEndDate) : new Date(Date.now() + 47*24*60*60*1000)
      };

      // Calculate duration in hours
      const durationHours = Math.ceil((finalTimeline.eventEnd - finalTimeline.eventStart) / (1000 * 60 * 60));

      const hackathon = new Hackathon({
        title,
        description,
        organizer: organizerData,
        type: type || 'general', // Use provided type (Category)
        difficulty: 'mixed', // Default difficulty
        eventFormat: mappedEventFormat,
        theme,
        timeline: finalTimeline,
        duration: { hours: durationHours > 0 ? durationHours : 48 },
        prizes: prizes ? JSON.parse(prizes) : [],
        sponsors: sponsors ? JSON.parse(sponsors) : [],
        rules: rules ? rules.split('\n').map(rule => rule.trim()).filter(rule => rule) : [],
        judgesCriteria: judgesCriteria ? JSON.parse(judgesCriteria) : [],
        requirements: requirements ? requirements.split(',').map(req => req.trim()) : [],
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
        maxTeamSize: maxTeamSize ? parseInt(maxTeamSize) : 4,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
        eventStartDate: eventStartDate ? new Date(eventStartDate) : undefined,
        eventEndDate: eventEndDate ? new Date(eventEndDate) : undefined,
        files: fileData,
        createdBy: req.user._id,
        status: 'upcoming'
      });

      await hackathon.save();

      // Populate for response
      await hackathon.populate('createdBy', 'username email profile.firstName profile.lastName');

      res.status(201).json({
        success: true,
        message: 'Hackathon created successfully',
        data: hackathon
      });
    } catch (error) {
      console.error('Create hackathon error:', error);
      
      if (req.uploadedFiles) {
        const filePaths = req.uploadedFiles.map(file => file.path);
        cleanupFiles(filePaths);
      }

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }

      res.status(500).json({
        success: false,
        message: 'Failed to create hackathon'
      });
    }
  }
);

/**
 * @route   PUT /api/v1/admin/hackathon/:id
 * @desc    Update hackathon
 * @access  Admin
 */
router.put('/hackathon/:id',
  checkContentPermission('update', 'hackathon'),
  handleUpload('hackathon', 'files'),
  validateFiles,
  auditLog('update_hackathon'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = { ...req.body };

      // Map frontend values
      if (updateData.type && ['online', 'offline', 'hybrid'].includes(updateData.type)) {
         updateData.eventFormat = updateData.type === 'online' ? 'virtual' : (updateData.type === 'offline' ? 'in_person' : 'hybrid');
         delete updateData.type; 
      }

      // Handle timeline and duration
      if (updateData.timeline || updateData.eventStartDate || updateData.eventEndDate || updateData.registrationStartDate || updateData.registrationEndDate) {
         let timelineData = {};
         try {
            timelineData = updateData.timeline ? JSON.parse(updateData.timeline) : {};
         } catch (e) {}

         const regStart = updateData.registrationStartDate ? new Date(updateData.registrationStartDate) : (timelineData.registrationStart ? new Date(timelineData.registrationStart) : undefined);
         const regEnd = updateData.registrationEndDate ? new Date(updateData.registrationEndDate) : (updateData.registrationDeadline ? new Date(updateData.registrationDeadline) : undefined);
         const evtStart = updateData.eventStartDate ? new Date(updateData.eventStartDate) : undefined;
         const evtEnd = updateData.eventEndDate ? new Date(updateData.eventEndDate) : undefined;

         // We need to fetch existing hackathon to merge timeline if partial update?
         // For now, assume full update or defaults
         updateData.timeline = {
            registrationStart: regStart || new Date(),
            registrationEnd: regEnd || new Date(Date.now() + 30*24*60*60*1000),
            eventStart: evtStart || new Date(Date.now() + 45*24*60*60*1000),
            eventEnd: evtEnd || new Date(Date.now() + 47*24*60*60*1000),
            submissionDeadline: evtEnd || new Date(Date.now() + 47*24*60*60*1000)
         };
         
         const durationHours = Math.ceil((updateData.timeline.eventEnd - updateData.timeline.eventStart) / (1000 * 60 * 60));
         updateData.duration = { hours: durationHours > 0 ? durationHours : 48 };

         delete updateData.registrationStartDate;
         delete updateData.registrationEndDate;
         delete updateData.registrationDeadline;
         delete updateData.eventStartDate;
         delete updateData.eventEndDate;
      }

      // Process complex data
      if (updateData.timeline && typeof updateData.timeline === 'string') updateData.timeline = JSON.parse(updateData.timeline); // Already handled above but just in case
      if (updateData.prizes) updateData.prizes = JSON.parse(updateData.prizes);
      if (updateData.sponsors) updateData.sponsors = JSON.parse(updateData.sponsors);
      if (updateData.judgesCriteria) updateData.judgesCriteria = JSON.parse(updateData.judgesCriteria);
      if (updateData.rules) updateData.rules = updateData.rules.split('\n').map(rule => rule.trim()).filter(rule => rule);
      if (updateData.requirements) updateData.requirements = updateData.requirements.split(',').map(req => req.trim());

      // Process dates
      if (updateData.registrationDeadline) updateData.registrationDeadline = new Date(updateData.registrationDeadline);
      if (updateData.eventStartDate) updateData.eventStartDate = new Date(updateData.eventStartDate);
      if (updateData.eventEndDate) updateData.eventEndDate = new Date(updateData.eventEndDate);

      const existingHackathon = await Hackathon.findById(id);
      if (!existingHackathon) {
        return res.status(404).json({
          success: false,
          message: 'Hackathon not found'
        });
      }

      // Handle file updates (removals and additions)
      let finalFiles = existingHackathon.files || [];

      // 1. Handle removals based on existingFiles list from frontend
      if (req.body.existingFiles) {
        try {
          const keptFiles = JSON.parse(req.body.existingFiles);
          const keptFilenames = new Set(keptFiles.map(f => f.filename));
          
          // Identify files to remove
          const filesToRemove = finalFiles.filter(f => !keptFilenames.has(f.filename));
          
          // Cleanup removed files from storage
          if (filesToRemove.length > 0) {
            cleanupFiles(filesToRemove);
          }
          
          // Update list to only kept files
          finalFiles = finalFiles.filter(f => keptFilenames.has(f.filename));
        } catch (e) {
          console.error('Error parsing existingFiles:', e);
        }
      }

      // 2. Add new uploaded files
      if (req.uploadedFiles && req.uploadedFiles.length > 0) {
        const newFiles = req.uploadedFiles.map(file => ({
          originalName: file.originalName,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
          url: file.url || getFileUrl(file.filename, 'hackathon'),
          storageType: file.storageType,
          bucket: file.bucket,
          uploadedAt: new Date()
        }));
        
        finalFiles = [...finalFiles, ...newFiles];
      }
      
      updateData.files = finalFiles;
      updateData.updatedAt = new Date();

      const updatedHackathon = await Hackathon.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('createdBy', 'username email profile.firstName profile.lastName');

      res.json({
        success: true,
        message: 'Hackathon updated successfully',
        data: updatedHackathon
      });
    } catch (error) {
      console.error('Update hackathon error:', error);
      
      if (req.uploadedFiles) {
        const filePaths = req.uploadedFiles.map(file => file.path);
        cleanupFiles(filePaths);
      }

      res.status(500).json({
        success: false,
        message: 'Failed to update hackathon'
      });
    }
  }
);

/**
 * @route   DELETE /api/v1/admin/hackathon/:id
 * @desc    Delete hackathon
 * @access  Admin
 */
router.delete('/hackathon/:id',
  checkContentPermission('delete', 'hackathon'),
  auditLog('delete_hackathon'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const hackathon = await Hackathon.findById(id);
      if (!hackathon) {
        return res.status(404).json({
          success: false,
          message: 'Hackathon not found'
        });
      }

      // Clean up associated files
      if (hackathon.files && hackathon.files.length > 0) {
        const filePaths = hackathon.files.map(file => 
          require('path').join(__dirname, '../uploads/hackathon', file.filename)
        );
        cleanupFiles(filePaths);
      }

      await Hackathon.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Hackathon deleted successfully'
      });
    } catch (error) {
      console.error('Delete hackathon error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete hackathon'
      });
    }
  }
);

// =============================================================================
// QUEST ROUTES
// =============================================================================

/**
 * @route   GET /api/v1/admin/quests
 * @desc    Get all quests
 * @access  Admin
 */
router.get('/quests',
  checkContentPermission('read', 'general'),
  auditLog('view_quests'),
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category,
        difficulty,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter = {};
      if (category) filter.category = category;
      if (difficulty) filter.difficulty = difficulty;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const [quests, total] = await Promise.all([
        Quest.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Quest.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          quests,
          pagination: {
            current: parseInt(page),
            total: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            totalItems: total
          }
        }
      });
    } catch (error) {
      console.error('Get quests error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch quests'
      });
    }
  }
);

/**
 * @route   POST /api/v1/admin/quests
 * @desc    Create new quest
 * @access  Admin
 */
router.post('/quests',
  checkContentPermission('create', 'general'),
  auditLog('create_quest'),
  async (req, res) => {
    try {
      const quest = new Quest({
        ...req.body,
        author: req.user._id
      });

      await quest.save();

      res.status(201).json({
        success: true,
        message: 'Quest created successfully',
        data: quest
      });
    } catch (error) {
      console.error('Create quest error:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to create quest'
      });
    }
  }
);

/**
 * @route   PUT /api/v1/admin/quests/:id
 * @desc    Update quest
 * @access  Admin
 */
router.put('/quests/:id',
  checkContentPermission('update', 'general'),
  auditLog('update_quest'),
  async (req, res) => {
    try {
      const quest = await Quest.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!quest) {
        return res.status(404).json({
          success: false,
          message: 'Quest not found'
        });
      }

      res.json({
        success: true,
        message: 'Quest updated successfully',
        data: quest
      });
    } catch (error) {
      console.error('Update quest error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update quest'
      });
    }
  }
);

/**
 * @route   DELETE /api/v1/admin/quests/:id
 * @desc    Delete quest
 * @access  Admin
 */
router.delete('/quests/:id',
  checkContentPermission('delete', 'general'),
  auditLog('delete_quest'),
  async (req, res) => {
    try {
      const quest = await Quest.findByIdAndDelete(req.params.id);

      if (!quest) {
        return res.status(404).json({
          success: false,
          message: 'Quest not found'
        });
      }

      res.json({
        success: true,
        message: 'Quest deleted successfully'
      });
    } catch (error) {
      console.error('Delete quest error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete quest'
      });
    }
  }
);

// =============================================================================
// ACHIEVEMENT ROUTES
// =============================================================================

/**
 * @route   GET /api/v1/admin/achievements
 * @desc    Get all achievements
 * @access  Admin
 */
router.get('/achievements',
  checkContentPermission('read', 'general'),
  auditLog('view_achievements'),
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        category,
        type,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter = {};
      if (category) filter.category = category;
      if (type) filter.type = type;
      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const [achievements, total] = await Promise.all([
        Achievement.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Achievement.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          achievements,
          pagination: {
            current: parseInt(page),
            total: totalPages,
            hasNext: page < totalPages,
            hasPrev: page > 1,
            totalItems: total
          }
        }
      });
    } catch (error) {
      console.error('Get achievements error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch achievements'
      });
    }
  }
);

/**
 * @route   POST /api/v1/admin/achievements
 * @desc    Create new achievement
 * @access  Admin
 */
router.post('/achievements',
  checkContentPermission('create', 'general'),
  auditLog('create_achievement'),
  async (req, res) => {
    try {
      const achievement = new Achievement(req.body);
      await achievement.save();

      res.status(201).json({
        success: true,
        message: 'Achievement created successfully',
        data: achievement
      });
    } catch (error) {
      console.error('Create achievement error:', error);
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Validation error',
          errors: Object.values(error.errors).map(err => err.message)
        });
      }
      res.status(500).json({
        success: false,
        message: 'Failed to create achievement'
      });
    }
  }
);

/**
 * @route   PUT /api/v1/admin/achievements/:id
 * @desc    Update achievement
 * @access  Admin
 */
router.put('/achievements/:id',
  checkContentPermission('update', 'general'),
  auditLog('update_achievement'),
  async (req, res) => {
    try {
      const achievement = await Achievement.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!achievement) {
        return res.status(404).json({
          success: false,
          message: 'Achievement not found'
        });
      }

      res.json({
        success: true,
        message: 'Achievement updated successfully',
        data: achievement
      });
    } catch (error) {
      console.error('Update achievement error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update achievement'
      });
    }
  }
);

/**
 * @route   DELETE /api/v1/admin/achievements/:id
 * @desc    Delete achievement
 * @access  Admin
 */
router.delete('/achievements/:id',
  checkContentPermission('delete', 'general'),
  auditLog('delete_achievement'),
  async (req, res) => {
    try {
      const achievement = await Achievement.findByIdAndDelete(req.params.id);

      if (!achievement) {
        return res.status(404).json({
          success: false,
          message: 'Achievement not found'
        });
      }

      res.json({
        success: true,
        message: 'Achievement deleted successfully'
      });
    } catch (error) {
      console.error('Delete achievement error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete achievement'
      });
    }
  }
);

// =============================================================================
// ANALYTICS ROUTES
// =============================================================================

/**
 * @route   GET /api/v1/admin/analytics
 * @desc    Get admin dashboard analytics
 * @access  Admin
 */
router.get('/analytics',
  checkContentPermission('read', 'general'),
  auditLog('view_analytics'),
  async (req, res) => {
    try {
      const [
        libraryCount,
        innovationCount,
        internshipCount,
        hackathonCount,
        totalUsers
      ] = await Promise.all([
        LibraryContent.countDocuments(),
        Innovation.countDocuments(),
        Internship.countDocuments(),
        Hackathon.countDocuments(),
        User.countDocuments()
      ]);

      // Calculate date range (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      // Aggregate daily activity
      const [dailyUsers, dailyContent] = await Promise.all([
        User.aggregate([
          { $match: { createdAt: { $gte: sevenDaysAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]),
        LibraryContent.aggregate([
          { $match: { createdAt: { $gte: sevenDaysAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ])
      ]);

      // Format chart data
      const chartData = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const userCount = dailyUsers.find(u => u._id === dateStr)?.count || 0;
        const contentCount = dailyContent.find(c => c._id === dateStr)?.count || 0;
        
        chartData.unshift({
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          users: userCount,
          content: contentCount,
          amt: userCount + contentCount
        });
      }

      // Get recent activity
      const recentLibrary = await LibraryContent.find().sort({ createdAt: -1 }).limit(5);
      const recentInnovation = await Innovation.find().sort({ createdAt: -1 }).limit(5);
      const recentInternships = await Internship.find().sort({ createdAt: -1 }).limit(5);
      const recentHackathons = await Hackathon.find().sort({ createdAt: -1 }).limit(5);

      res.json({
        success: true,
        data: {
          counts: {
            library: libraryCount,
            innovation: innovationCount,
            internship: internshipCount,
            hackathon: hackathonCount,
            users: totalUsers
          },
          chartData,
          recentActivity: {
            library: recentLibrary,
            innovation: recentInnovation,
            internships: recentInternships,
            hackathons: recentHackathons
          }
        }
      });
    } catch (error) {
      console.error('Get analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch analytics'
      });
    }
  }
);

// =============================================================================
// USER MANAGEMENT ROUTES
// =============================================================================

/**
 * @route   GET /api/v1/admin/users
 * @desc    Get all users with pagination and filters
 * @access  Admin
 */
router.get('/users',
  checkContentPermission('read', 'general'),
  auditLog('view_users'),
  async (req, res) => {
    try {
      const { 
        page = 1, 
        limit = 10, 
        role, 
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter = {};
      if (role) filter.role = role;
      if (search) {
        filter.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { 'profile.firstName': { $regex: search, $options: 'i' } },
          { 'profile.lastName': { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const [users, total] = await Promise.all([
        User.find(filter)
          .select('-password')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        User.countDocuments(filter)
      ]);

      const totalPages = Math.ceil(total / parseInt(limit));

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            current: parseInt(page),
            total: totalPages,
            count: total,
            hasNext: parseInt(page) < totalPages,
            hasPrev: parseInt(page) > 1
          }
        }
      });
    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch users'
      });
    }
  }
);

/**
 * @route   PUT /api/v1/admin/users/:id/role
 * @desc    Update user role
 * @access  SuperAdmin
 */
router.put('/users/:id/role',
  checkContentPermission('update', 'general'),
  auditLog('update_user_role'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;

      if (!['user', 'admin', 'superadmin'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
      }

      const user = await User.findByIdAndUpdate(
        id,
        { role },
        { new: true }
      ).select('-password');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User role updated successfully',
        data: user
      });
    } catch (error) {
      console.error('Update user role error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user role'
      });
    }
  }
);

// =============================================================================
// SYSTEM SETTINGS ROUTES
// =============================================================================

/**
 * @route   GET /api/v1/admin/settings
 * @desc    Get system settings
 * @access  Admin
 */
router.get('/settings',
  checkContentPermission('read', 'general'),
  auditLog('view_settings'),
  async (req, res) => {
    try {
      const settings = await SystemSettings.getSettings();
      res.json({
        success: true,
        data: settings
      });
    } catch (error) {
      console.error('Get settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch settings'
      });
    }
  }
);

/**
 * @route   PUT /api/v1/admin/settings
 * @desc    Update system settings
 * @access  SuperAdmin
 */
router.put('/settings',
  checkContentPermission('update', 'general'),
  auditLog('update_settings'),
  async (req, res) => {
    try {
      const updateData = req.body;
      
      // Prevent updating immutable fields if any
      delete updateData._id;
      delete updateData.createdAt;
      delete updateData.updatedAt;

      const settings = await SystemSettings.findOneAndUpdate(
        {},
        { 
          ...updateData,
          updatedBy: req.user._id,
          updatedAt: new Date()
        },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );

      // Log the action
      await AdminAuditLog.logAction({
        admin: req.user._id,
        action: 'update',
        resourceType: 'settings',
        details: { updatedFields: Object.keys(updateData) },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({
        success: true,
        message: 'Settings updated successfully',
        data: settings
      });
    } catch (error) {
      console.error('Update settings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update settings'
      });
    }
  }
);

// =============================================================================
// ENHANCED ANALYTICS ROUTES
// =============================================================================

/**
 * @route   GET /api/v1/admin/analytics/dashboard
 * @desc    Get comprehensive dashboard analytics
 * @access  Admin
 */
router.get('/analytics/dashboard',
  checkContentPermission('read', 'general'),
  async (req, res) => {
    try {
      const { period = 'daily', days = 7 } = req.query;
      
      // Get current counts
      const [
        totalUsers,
        activeUsers,
        totalPosts,
        totalLibrary,
        totalInnovations,
        totalInternships,
        totalHackathons,
        totalQuests,
        totalAchievements
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ status: 'active' }),
        Post.countDocuments(),
        LibraryContent.countDocuments(),
        Innovation.countDocuments(),
        Internship.countDocuments(),
        Hackathon.countDocuments(),
        Quest.countDocuments(),
        Achievement.countDocuments()
      ]);

      // Get growth data
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));

      const [newUsers, newPosts, newContent] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: daysAgo } }),
        Post.countDocuments({ createdAt: { $gte: daysAgo } }),
        LibraryContent.countDocuments({ createdAt: { $gte: daysAgo } })
      ]);

      // Get user role distribution
      const usersByRole = await User.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]);

      // Get user status distribution
      const usersByStatus = await User.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      // Get daily trend data
      const dailyTrends = await User.aggregate([
        { $match: { createdAt: { $gte: daysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]);

      // Get top users by XP
      const topUsers = await User.find()
        .select('username profile.firstName profile.lastName gameData.xp gameData.level')
        .sort({ 'gameData.xp': -1 })
        .limit(10);

      res.json({
        success: true,
        data: {
          overview: {
            users: {
              total: totalUsers,
              active: activeUsers,
              new: newUsers,
              growth: totalUsers > 0 ? ((newUsers / totalUsers) * 100).toFixed(2) : 0
            },
            content: {
              posts: totalPosts,
              library: totalLibrary,
              innovations: totalInnovations,
              internships: totalInternships,
              hackathons: totalHackathons,
              quests: totalQuests,
              achievements: totalAchievements,
              newContent,
              total: totalPosts + totalLibrary + totalInnovations + totalInternships + totalHackathons
            }
          },
          distributions: {
            usersByRole: usersByRole.reduce((acc, item) => {
              acc[item._id] = item.count;
              return acc;
            }, {}),
            usersByStatus: usersByStatus.reduce((acc, item) => {
              acc[item._id] = item.count;
              return acc;
            }, {})
          },
          trends: {
            daily: dailyTrends
          },
          topUsers
        }
      });
    } catch (error) {
      console.error('Dashboard analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch dashboard analytics'
      });
    }
  }
);

/**
 * @route   GET /api/v1/admin/analytics/content
 * @desc    Get content analytics and statistics
 * @access  Admin
 */
router.get('/analytics/content',
  checkContentPermission('read', 'general'),
  async (req, res) => {
    try {
      // Get content by category
      const libraryByCategory = await LibraryContent.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const libraryByType = await LibraryContent.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]);

      const innovationsByStatus = await Innovation.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);

      const internshipsByType = await Internship.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);

      // Get recent content
      const [recentLibrary, recentInnovations, recentInternships, recentHackathons] = await Promise.all([
        LibraryContent.find()
          .populate('createdBy', 'username profile.firstName profile.lastName')
          .sort({ createdAt: -1 })
          .limit(5)
          .select('title category type createdAt'),
        Innovation.find()
          .populate('createdBy', 'username')
          .sort({ createdAt: -1 })
          .limit(5)
          .select('title status createdAt'),
        Internship.find()
          .populate('postedBy', 'username')
          .sort({ createdAt: -1 })
          .limit(5)
          .select('title company createdAt'),
        Hackathon.find()
          .populate('organizer', 'username')
          .sort({ createdAt: -1 })
          .limit(5)
          .select('title startDate endDate status')
      ]);

      res.json({
        success: true,
        data: {
          distributions: {
            libraryByCategory,
            libraryByType,
            innovationsByStatus,
            internshipsByType
          },
          recent: {
            library: recentLibrary,
            innovations: recentInnovations,
            internships: recentInternships,
            hackathons: recentHackathons
          }
        }
      });
    } catch (error) {
      console.error('Content analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch content analytics'
      });
    }
  }
);

/**
 * @route   GET /api/v1/admin/analytics/engagement
 * @desc    Get user engagement analytics
 * @access  Admin
 */
router.get('/analytics/engagement',
  checkContentPermission('read', 'general'),
  async (req, res) => {
    try {
      const { days = 30 } = req.query;
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(days));

      // Get post engagement
      const postStats = await Post.aggregate([
        { $match: { createdAt: { $gte: daysAgo } } },
        {
          $group: {
            _id: null,
            totalPosts: { $sum: 1 },
            totalLikes: { $sum: { $size: '$likes' } },
            totalComments: { $sum: { $size: '$comments' } },
            totalShares: { $sum: { $size: '$shares' } },
            totalViews: { $sum: { $size: '$views' } }
          }
        }
      ]);

      // Get most active users
      const activeUsers = await Post.aggregate([
        { $match: { createdAt: { $gte: daysAgo } } },
        { $group: { _id: '$author', postCount: { $sum: 1 } } },
        { $sort: { postCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            username: '$user.username',
            postCount: 1,
            xp: '$user.gameData.xp'
          }
        }
      ]);

      // Get popular posts
      const popularPosts = await Post.find({ createdAt: { $gte: daysAgo } })
        .populate('author', 'username profile.firstName profile.lastName')
        .sort({ 'likes': -1 })
        .limit(10)
        .select('content author likes comments shares createdAt');

      res.json({
        success: true,
        data: {
          stats: postStats[0] || {
            totalPosts: 0,
            totalLikes: 0,
            totalComments: 0,
            totalShares: 0,
            totalViews: 0
          },
          activeUsers,
          popularPosts
        }
      });
    } catch (error) {
      console.error('Engagement analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch engagement analytics'
      });
    }
  }
);

// =============================================================================
// ENHANCED USER MANAGEMENT ROUTES
// =============================================================================

/**
 * @route   PUT /api/v1/admin/users/:id/status
 * @desc    Update user status (active/inactive/suspended)
 * @access  Admin
 */
router.put('/users/:id/status',
  checkContentPermission('update', 'general'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;

      if (!['active', 'inactive', 'suspended'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      const oldUser = await User.findById(id);
      if (!oldUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = await User.findByIdAndUpdate(
        id,
        { status },
        { new: true }
      ).select('-password');

      // Log the action
      await AdminAuditLog.logAction({
        admin: req.user._id,
        action: 'status_change',
        resourceType: 'user',
        resourceId: id,
        details: { oldStatus: oldUser.status, newStatus: status, reason },
        changes: {
          before: { status: oldUser.status },
          after: { status }
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({
        success: true,
        message: 'User status updated successfully',
        data: user
      });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user status'
      });
    }
  }
);

/**
 * @route   DELETE /api/v1/admin/users/:id
 * @desc    Delete user account
 * @access  SuperAdmin
 */
router.delete('/users/:id',
  checkContentPermission('delete', 'general'),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Prevent deleting superadmin
      if (user.role === 'superadmin') {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete superadmin account'
        });
      }

      await User.findByIdAndDelete(id);

      // Log the action
      await AdminAuditLog.logAction({
        admin: req.user._id,
        action: 'delete',
        resourceType: 'user',
        resourceId: id,
        details: { 
          deletedUser: user.username,
          deletedEmail: user.email,
          reason 
        },
        ipAddress: req.ip,
        userAgent: req.get('user-agent')
      });

      res.json({
        success: true,
        message: 'User deleted successfully'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }
);

/**
 * @route   GET /api/v1/admin/users/:id
 * @desc    Get user details by ID
 * @access  Admin
 */
router.get('/users/:id',
  checkContentPermission('read', 'general'),
  async (req, res) => {
    try {
      const { id } = req.params;

      const user = await User.findById(id).select('-password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Get user's content statistics
      const [postsCount, libraryCount, innovationsCount] = await Promise.all([
        Post.countDocuments({ author: id }),
        LibraryContent.countDocuments({ createdBy: id }),
        Innovation.countDocuments({ createdBy: id })
      ]);

      res.json({
        success: true,
        data: {
          user,
          statistics: {
            posts: postsCount,
            library: libraryCount,
            innovations: innovationsCount
          }
        }
      });
    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch user details'
      });
    }
  }
);

// =============================================================================
// AUDIT LOG ROUTES
// =============================================================================

/**
 * @route   GET /api/v1/admin/audit-logs
 * @desc    Get audit logs with filters
 * @access  Admin
 */
router.get('/audit-logs',
  checkContentPermission('read', 'general'),
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 50,
        adminId,
        action,
        resourceType,
        startDate,
        endDate
      } = req.query;

      const result = await AdminAuditLog.getAuditLogs({
        adminId,
        action,
        resourceType,
        startDate,
        endDate,
        page: parseInt(page),
        limit: parseInt(limit)
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get audit logs error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch audit logs'
      });
    }
  }
);

// =============================================================================
// SYSTEM HEALTH & MONITORING
// =============================================================================

/**
 * @route   GET /api/v1/admin/system/health
 * @desc    Get system health and status
 * @access  Admin
 */
router.get('/system/health',
  checkContentPermission('read', 'general'),
  async (req, res) => {
    try {
      const mongoose = require('mongoose');
      
      // Database connection status
      const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
      
      // Get collection stats
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionStats = await Promise.all(
        collections.map(async (col) => {
          const stats = await mongoose.connection.db.collection(col.name).stats();
          return {
            name: col.name,
            count: stats.count,
            size: stats.size,
            avgObjSize: stats.avgObjSize
          };
        })
      );

      // System info
      const systemInfo = {
        nodeVersion: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      };

      res.json({
        success: true,
        data: {
          database: {
            status: dbStatus,
            name: mongoose.connection.name,
            host: mongoose.connection.host,
            collections: collectionStats
          },
          system: systemInfo,
          timestamp: new Date()
        }
      });
    } catch (error) {
      console.error('System health error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch system health'
      });
    }
  }
);

module.exports = router;