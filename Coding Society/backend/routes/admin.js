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
const User = require('../models/User');

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
      const {
        title,
        description,
        subject,
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

      // Create library content
      const libraryContent = new LibraryContent({
        title,
        description,
        subject,
        type,
        difficulty,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        content,
        prerequisites: prerequisites ? prerequisites.split(',').map(p => p.trim()) : [],
        estimatedDuration: estimatedDuration ? parseInt(estimatedDuration) : undefined,
        learningObjectives: learningObjectives ? learningObjectives.split(',').map(obj => obj.trim()) : [],
        files: fileData,
        uploadedBy: req.user._id,
        status: 'published'
      });

      await libraryContent.save();

      // Populate user data for response
      await libraryContent.populate('uploadedBy', 'username email profile.firstName profile.lastName');

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

      // Handle new file uploads
      if (req.uploadedFiles && req.uploadedFiles.length > 0) {
        const newFiles = req.uploadedFiles.map(file => ({
          originalName: file.originalName,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
          url: getFileUrl(file.filename, 'library'),
          uploadedAt: new Date()
        }));
        
        updateData.files = [...(existingContent.files || []), ...newFiles];
      }

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

      const innovation = new Innovation({
        title,
        description,
        category,
        difficulty,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
        timeline: timeline ? JSON.parse(timeline) : {},
        requirements: requirements ? requirements.split(',').map(req => req.trim()) : [],
        objectives: objectives ? objectives.split(',').map(obj => obj.trim()) : [],
        techStack: techStack ? techStack.split(',').map(tech => tech.trim()) : [],
        collaborators: collaboratorData,
        files: fileData,
        creator: req.user._id,
        status: 'planning'
      });

      await innovation.save();

      // Populate for response
      await innovation.populate('creator', 'username email profile.firstName profile.lastName');

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

      // Process arrays
      if (updateData.tags) updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
      if (updateData.requirements) updateData.requirements = updateData.requirements.split(',').map(req => req.trim());
      if (updateData.objectives) updateData.objectives = updateData.objectives.split(',').map(obj => obj.trim());
      if (updateData.techStack) updateData.techStack = updateData.techStack.split(',').map(tech => tech.trim());

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

      // Handle new file uploads
      if (req.uploadedFiles && req.uploadedFiles.length > 0) {
        const newFiles = req.uploadedFiles.map(file => ({
          originalName: file.originalName,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
          url: getFileUrl(file.filename, 'innovation'),
          uploadedAt: new Date()
        }));
        updateData.files = [...(existingProject.files || []), ...newFiles];
      }

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
        type,
        duration,
        location,
        salary,
        requirements,
        benefits,
        applicationDeadline,
        startDate,
        mentorName,
        mentorEmail,
        mentorPhone,
        mentorLinkedIn
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

      const internship = new Internship({
        title,
        company,
        description,
        type,
        duration: duration ? parseInt(duration) : undefined,
        location,
        salary: salary ? JSON.parse(salary) : undefined,
        requirements: requirements ? requirements.split(',').map(req => req.trim()) : [],
        benefits: benefits ? benefits.split(',').map(benefit => benefit.trim()) : [],
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : undefined,
        startDate: startDate ? new Date(startDate) : undefined,
        mentorDetails: {
          name: mentorName,
          email: mentorEmail,
          phone: mentorPhone,
          linkedIn: mentorLinkedIn
        },
        files: fileData,
        postedBy: req.user._id,
        status: 'active'
      });

      await internship.save();

      // Populate for response
      await internship.populate('postedBy', 'username email profile.firstName profile.lastName');

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

      // Process arrays
      if (updateData.requirements) updateData.requirements = updateData.requirements.split(',').map(req => req.trim());
      if (updateData.benefits) updateData.benefits = updateData.benefits.split(',').map(benefit => benefit.trim());

      // Process complex objects
      if (updateData.salary) updateData.salary = JSON.parse(updateData.salary);
      if (updateData.applicationDeadline) updateData.applicationDeadline = new Date(updateData.applicationDeadline);
      if (updateData.startDate) updateData.startDate = new Date(updateData.startDate);

      // Process mentor details
      const mentorDetails = {};
      if (updateData.mentorName) mentorDetails.name = updateData.mentorName;
      if (updateData.mentorEmail) mentorDetails.email = updateData.mentorEmail;
      if (updateData.mentorPhone) mentorDetails.phone = updateData.mentorPhone;
      if (updateData.mentorLinkedIn) mentorDetails.linkedIn = updateData.mentorLinkedIn;
      
      if (Object.keys(mentorDetails).length > 0) {
        updateData.mentorDetails = mentorDetails;
      }

      // Remove individual mentor fields from updateData
      delete updateData.mentorName;
      delete updateData.mentorEmail;
      delete updateData.mentorPhone;
      delete updateData.mentorLinkedIn;

      const existingInternship = await Internship.findById(id);
      if (!existingInternship) {
        return res.status(404).json({
          success: false,
          message: 'Internship not found'
        });
      }

      // Handle new file uploads
      if (req.uploadedFiles && req.uploadedFiles.length > 0) {
        const newFiles = req.uploadedFiles.map(file => ({
          originalName: file.originalName,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
          url: getFileUrl(file.filename, 'internship'),
          uploadedAt: new Date()
        }));
        updateData.files = [...(existingInternship.files || []), ...newFiles];
      }

      updateData.updatedAt = new Date();

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
        timeline,
        prizes,
        rules,
        judgesCriteria,
        requirements,
        maxParticipants,
        maxTeamSize,
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

      const hackathon = new Hackathon({
        title,
        description,
        theme,
        type,
        timeline: timeline ? JSON.parse(timeline) : {},
        prizes: prizes ? JSON.parse(prizes) : [],
        rules: rules ? rules.split('\n').map(rule => rule.trim()).filter(rule => rule) : [],
        judgesCriteria: judgesCriteria ? JSON.parse(judgesCriteria) : [],
        requirements: requirements ? requirements.split(',').map(req => req.trim()) : [],
        maxParticipants: maxParticipants ? parseInt(maxParticipants) : undefined,
        maxTeamSize: maxTeamSize ? parseInt(maxTeamSize) : 4,
        registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : undefined,
        eventStartDate: eventStartDate ? new Date(eventStartDate) : undefined,
        eventEndDate: eventEndDate ? new Date(eventEndDate) : undefined,
        files: fileData,
        creator: req.user._id,
        status: 'upcoming'
      });

      await hackathon.save();

      // Populate for response
      await hackathon.populate('creator', 'username email profile.firstName profile.lastName');

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

      // Process complex data
      if (updateData.timeline) updateData.timeline = JSON.parse(updateData.timeline);
      if (updateData.prizes) updateData.prizes = JSON.parse(updateData.prizes);
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

      // Handle new file uploads
      if (req.uploadedFiles && req.uploadedFiles.length > 0) {
        const newFiles = req.uploadedFiles.map(file => ({
          originalName: file.originalName,
          filename: file.filename,
          size: file.size,
          mimetype: file.mimetype,
          url: getFileUrl(file.filename, 'hackathon'),
          uploadedAt: new Date()
        }));
        updateData.files = [...(existingHackathon.files || []), ...newFiles];
      }

      updateData.updatedAt = new Date();

      const updatedHackathon = await Hackathon.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      ).populate('creator', 'username email profile.firstName profile.lastName');

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

module.exports = router;