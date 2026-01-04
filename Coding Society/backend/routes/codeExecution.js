/**
 * Code Execution Routes
 * 
 * Handles API endpoints for secure code execution
 */

const express = require('express');
const router = express.Router();
const codeExecutionController = require('../controllers/codeExecutionController');
const { auth } = require('../middleware/auth');

// Rate limiting middleware
const rateLimitMiddleware = (req, res, next) => {
  if (!codeExecutionController.checkRateLimit()) {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please wait before trying again.',
      retryAfter: 60
    });
  }
  next();
};

// Apply authentication and rate limiting to all routes
router.use(auth);
router.use(rateLimitMiddleware);

/**
 * @route   POST /api/code-execution/execute
 * @desc    Execute code with given input
 * @access  Private
 */
router.post('/execute', codeExecutionController.executeCode);

/**
 * @route   POST /api/code-execution/test
 * @desc    Run code against multiple test cases
 * @access  Private
 */
router.post('/test', codeExecutionController.runTestCases);

/**
 * @route   POST /api/code-execution/submit
 * @desc    Submit solution for evaluation
 * @access  Private
 */
router.post('/submit', codeExecutionController.submitSolution);

/**
 * @route   GET /api/code-execution/runtimes
 * @desc    Get available language runtimes
 * @access  Private
 */
router.get('/runtimes', codeExecutionController.getRuntimes);

module.exports = router;
