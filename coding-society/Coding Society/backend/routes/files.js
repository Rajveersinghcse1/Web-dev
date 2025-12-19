/**
 * File Serving Routes
 * Handles secure file serving for uploaded content
 */

const express = require('express');
const router = express.Router();
const { serveFile } = require('../middleware/fileUpload');
const { authenticate } = require('../middleware/adminAuth');

/**
 * @route   GET /api/v1/files/:contentType/:filename
 * @desc    Serve uploaded files
 * @access  Public (for now, can be restricted later)
 */
router.get('/:contentType/:filename', serveFile);

/**
 * @route   GET /api/v1/files/secure/:contentType/:filename
 * @desc    Serve files with authentication
 * @access  Private
 */
router.get('/secure/:contentType/:filename', authenticate, serveFile);

module.exports = router;