/**
 * Coding Challenge Routes
 * Professional code execution and validation system
 * Handles: submission, test case execution, performance metrics
 */

const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const axios = require('axios');
const CodingChallenge = require('../models/CodingChallenge');
const UserSubmission = require('../models/UserSubmission');
const { v4: uuidv4 } = require('uuid');

// ============================================================================
// COMPILER API INTEGRATION
// ============================================================================

const COMPILER_API_BASE = 'https://emkc.org/api/v2/piston';

// Language mapping for compiler API
const LANGUAGE_MAP = {
  'c': { language: 'c', version: '10.2.0' },
  'cpp': { language: 'c++', version: '10.2.0' },
  'java': { language: 'java', version: '15.0.2' },
  'python': { language: 'python', version: '3.10.0' },
  'javascript': { language: 'javascript', version: '18.15.0' },
  // Capitalized versions for backward compatibility
  'C': { language: 'c', version: '10.2.0' },
  'C++': { language: 'c++', version: '10.2.0' },
  'Java': { language: 'java', version: '15.0.2' },
  'Python': { language: 'python', version: '3.10.0' },
  'JavaScript': { language: 'javascript', version: '18.15.0' }
};

/**
 * Execute code against single test case using external compiler API
 */
async function executeTestCase(language, code, input, timeLimit = 5000, memoryLimit = 128) {
  try {
    const langConfig = LANGUAGE_MAP[language];
    if (!langConfig) {
      throw new Error(`Language ${language} not supported`);
    }

    const startTime = Date.now();

    // Call compiler API using axios
    const response = await axios.post(`${COMPILER_API_BASE}/execute`, {
      language: langConfig.language,
      version: langConfig.version,
      files: [{
        content: code
      }],
      stdin: input || '',
      compile_timeout: 10000,
      run_timeout: Math.min(timeLimit, 10000) // API limit is 10s
    }, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 15000
    });

    const executionTime = Date.now() - startTime;
    const result = response.data;

    // Parse result
    const output = normalizeOutput(result.run?.stdout || '');
    const error = result.run?.stderr || result.compile?.stderr || '';
    const exitCode = result.run?.code || 0;

    // Extract memory usage (API may not always provide this)
    const memoryUsage = result.run?.memory || 0;

    return {
      success: exitCode === 0 && !error,
      output,
      error,
      executionTime,
      memoryUsage: memoryUsage / 1024, // Convert to MB
      exitCode
    };

  } catch (error) {
    console.error('Execution error:', error);
    return {
      success: false,
      output: '',
      error: error.message,
      executionTime: 0,
      memoryUsage: 0,
      exitCode: -1
    };
  }
}

/**
 * Normalize output for comparison
 * Removes trailing whitespace, normalizes line endings
 */
function normalizeOutput(output) {
  return output
    .trim()
    .replace(/\r\n/g, '\n')
    .replace(/\s+$/gm, '');
}

/**
 * Compare actual output with expected output
 */
function compareOutputs(actual, expected) {
  const normalizedActual = normalizeOutput(actual);
  const normalizedExpected = normalizeOutput(expected);
  return normalizedActual === normalizedExpected;
}

// ============================================================================
// API ROUTES
// ============================================================================

/**
 * @route   GET /api/v1/challenges
 * @desc    Get all coding challenges (paginated, filtered)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      difficulty,
      category,
      search,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = { isActive: true };

    if (difficulty) {
      query.difficulty = difficulty;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { problemId: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'desc' ? -1 : 1;

    const [challenges, total] = await Promise.all([
      CodingChallenge.find(query)
        .select('-solution -testCases')
        .sort({ [sortBy]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      CodingChallenge.countDocuments(query)
    ]);

    // Add solved status if user is authenticated
    let challengesWithStatus = challenges;
    if (req.user) {
      const solvedChallenges = await UserSubmission.distinct('challengeId', {
        userId: req.user.id,
        status: 'ACCEPTED',
        submissionType: 'SUBMIT'
      });

      challengesWithStatus = challenges.map(challenge => ({
        ...challenge,
        isSolved: solvedChallenges.some(id => id.equals(challenge._id))
      }));
    }

    res.json({
      success: true,
      data: {
        challenges: challengesWithStatus,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalChallenges: total,
          hasMore: skip + challenges.length < total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenges',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/v1/challenges/:slug
 * @desc    Get single challenge by slug
 * @access  Public
 */
router.get('/:slug', async (req, res) => {
  try {
    const challenge = await CodingChallenge.findOne({ 
      slug: req.params.slug,
      isActive: true 
    })
    .select('-solution')
    .lean();

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Remove hidden test cases
    challenge.testCases = challenge.testCases.filter(tc => !tc.isHidden);

    // Add user-specific data if authenticated
    if (req.user) {
      const [submissionCount, hasAccepted, bestSubmission] = await Promise.all([
        UserSubmission.getUserSubmissionCount(req.user.id, challenge._id),
        UserSubmission.hasUserSolved(req.user.id, challenge._id),
        UserSubmission.getUserBestSubmission(req.user.id, challenge._id)
      ]);

      challenge.userProgress = {
        attemptCount: submissionCount,
        isSolved: hasAccepted,
        bestScore: bestSubmission?.score || 0,
        bestTime: bestSubmission?.totalExecutionTime || 0
      };
    }

    res.json({
      success: true,
      data: challenge
    });

  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/v1/challenges/:slug/run
 * @desc    Run code against visible test cases only (not a submission)
 * @access  Private
 */
router.post('/:slug/run', auth, async (req, res) => {
  try {
    const { code, language } = req.body;

    // Validation
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code and language are required'
      });
    }

    // Get challenge
    const challenge = await CodingChallenge.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Verify language support
    if (!challenge.supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: `Language ${language} is not supported for this challenge`
      });
    }

    // Get only visible test cases
    const visibleTestCases = challenge.testCases.filter(tc => !tc.isHidden);

    if (visibleTestCases.length === 0) {
      return res.status(500).json({
        success: false,
        message: 'No test cases available'
      });
    }

    // Execute code against visible test cases
    const results = [];
    let totalTime = 0;
    let peakMemory = 0;

    for (const testCase of visibleTestCases) {
      const result = await executeTestCase(
        language,
        code,
        testCase.input,
        testCase.timeLimit,
        testCase.memoryLimit
      );

      const passed = result.success && compareOutputs(result.output, testCase.expectedOutput);

      results.push({
        testCaseId: testCase._id,
        passed,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.output,
        executionTime: result.executionTime,
        memoryUsage: result.memoryUsage,
        error: result.error
      });

      totalTime += result.executionTime;
      peakMemory = Math.max(peakMemory, result.memoryUsage);
    }

    const passedCount = results.filter(r => r.passed).length;
    const allPassed = passedCount === visibleTestCases.length;

    res.json({
      success: true,
      data: {
        status: allPassed ? 'ALL_PASSED' : 'SOME_FAILED',
        testCaseResults: results,
        summary: {
          totalTestCases: visibleTestCases.length,
          passedTestCases: passedCount,
          failedTestCases: visibleTestCases.length - passedCount,
          totalExecutionTime: totalTime,
          peakMemoryUsage: peakMemory
        }
      }
    });

  } catch (error) {
    console.error('Error running code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to run code',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/v1/challenges/:slug/submit
 * @desc    Submit code for full evaluation (visible + hidden test cases)
 * @access  Private
 */
router.post('/:slug/submit', auth, async (req, res) => {
  try {
    const { code, language, timeSpentCoding = 0 } = req.body;

    // Validation
    if (!code || !language) {
      return res.status(400).json({
        success: false,
        message: 'Code and language are required'
      });
    }

    // Get challenge with all test cases
    const challenge = await CodingChallenge.findOne({ 
      slug: req.params.slug,
      isActive: true 
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    // Verify language support
    if (!challenge.supportedLanguages.includes(language)) {
      return res.status(400).json({
        success: false,
        message: `Language ${language} is not supported for this challenge`
      });
    }

    // Get attempt number
    const attemptNumber = await UserSubmission.getUserSubmissionCount(
      req.user.id,
      challenge._id
    ) + 1;

    // Execute against ALL test cases (visible + hidden)
    const allTestCases = challenge.testCases;
    const results = [];
    let totalTime = 0;
    let peakMemory = 0;
    let compilationError = null;
    let runtimeError = null;

    for (const testCase of allTestCases) {
      const result = await executeTestCase(
        language,
        code,
        testCase.input,
        testCase.timeLimit,
        testCase.memoryLimit
      );

      // Check for compilation error (stop execution)
      if (result.error && result.executionTime === 0) {
        compilationError = result.error;
        break;
      }

      // Check for runtime error
      if (result.error && result.executionTime > 0) {
        runtimeError = result.error;
      }

      const passed = result.success && compareOutputs(result.output, testCase.expectedOutput);

      results.push({
        testCaseId: testCase._id,
        passed,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: result.output,
        executionTime: result.executionTime,
        memoryUsage: result.memoryUsage,
        error: result.error
      });

      totalTime += result.executionTime;
      peakMemory = Math.max(peakMemory, result.memoryUsage);

      // Check for time limit exceeded
      if (result.executionTime > testCase.timeLimit) {
        break;
      }

      // Check for memory limit exceeded
      if (result.memoryUsage > testCase.memoryLimit) {
        break;
      }
    }

    // Determine submission status
    let status = 'ACCEPTED';
    const passedCount = results.filter(r => r.passed).length;
    const totalCount = allTestCases.length;

    if (compilationError) {
      status = 'COMPILATION_ERROR';
    } else if (runtimeError) {
      status = 'RUNTIME_ERROR';
    } else if (results.some(r => r.executionTime > allTestCases[0].timeLimit)) {
      status = 'TIME_LIMIT_EXCEEDED';
    } else if (peakMemory > allTestCases[0].memoryLimit) {
      status = 'MEMORY_LIMIT_EXCEEDED';
    } else if (passedCount < totalCount) {
      status = 'WRONG_ANSWER';
    }

    // Check if this is first accepted submission
    const isFirstAccepted = status === 'ACCEPTED' && 
      !(await UserSubmission.hasUserSolved(req.user.id, challenge._id));

    // Create submission record
    const submission = new UserSubmission({
      submissionId: uuidv4(),
      userId: req.user.id,
      challengeId: challenge._id,
      submissionType: 'SUBMIT',
      language,
      code,
      codeLength: code.length,
      status,
      testCaseResults: results,
      totalTestCases: totalCount,
      passedTestCases: passedCount,
      failedTestCases: totalCount - passedCount,
      totalExecutionTime: totalTime,
      peakMemoryUsage: peakMemory,
      compilerError: compilationError || '',
      timeSpentCoding,
      attemptNumber,
      isFirstAccepted,
      ipAddress: req.ip,
      userAgent: req.get('user-agent')
    });

    await submission.save();

    // Update challenge statistics
    await challenge.updateStatistics(
      status === 'ACCEPTED',
      totalTime,
      peakMemory
    );

    // Update user XP/points if accepted
    if (status === 'ACCEPTED' && isFirstAccepted) {
      // Award points based on difficulty
      const pointsMap = { 'Easy': 10, 'Medium': 20, 'Hard': 30 };
      const points = pointsMap[challenge.difficulty] || 10;
      
      submission.earnedPoints = points;
      await submission.save();

      // Update user game data (assuming User model has gameData)
      const User = require('../models/User');
      await User.findByIdAndUpdate(req.user.id, {
        $inc: { 
          'gameData.xp': points,
          'gameData.totalChallengesSolved': 1
        }
      });
    }

    // Prepare response (hide test case details for hidden cases)
    const responseResults = results.map((r, index) => {
      const isHidden = allTestCases[index].isHidden;
      return {
        testCaseNumber: index + 1,
        passed: r.passed,
        isHidden,
        ...(isHidden ? {} : {
          input: r.input,
          expectedOutput: r.expectedOutput,
          actualOutput: r.actualOutput
        }),
        executionTime: r.executionTime,
        memoryUsage: r.memoryUsage
      };
    });

    res.json({
      success: true,
      data: {
        submissionId: submission.submissionId,
        status,
        testCaseResults: responseResults,
        summary: {
          totalTestCases: totalCount,
          passedTestCases: passedCount,
          failedTestCases: totalCount - passedCount,
          totalExecutionTime: totalTime,
          peakMemoryUsage: peakMemory,
          score: submission.score,
          earnedPoints: submission.earnedPoints
        },
        isFirstAccepted,
        attemptNumber
      }
    });

  } catch (error) {
    console.error('Error submitting code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit code',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/v1/challenges/:slug/submissions
 * @desc    Get user's submission history for a challenge
 * @access  Private
 */
router.get('/:slug/submissions', auth, async (req, res) => {
  try {
    const challenge = await CodingChallenge.findOne({ 
      slug: req.params.slug 
    });

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    const submissions = await UserSubmission.find({
      userId: req.user.id,
      challengeId: challenge._id,
      submissionType: 'SUBMIT'
    })
    .select('-code -testCaseResults -ipAddress -userAgent')
    .sort({ createdAt: -1 })
    .limit(50);

    res.json({
      success: true,
      data: submissions
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/v1/challenges/:slug/submissions/:submissionId
 * @desc    Get detailed submission info
 * @access  Private
 */
router.get('/:slug/submissions/:submissionId', auth, async (req, res) => {
  try {
    const submission = await UserSubmission.findOne({
      submissionId: req.params.submissionId,
      userId: req.user.id
    }).populate('challengeId', 'title difficulty');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.json({
      success: true,
      data: submission
    });

  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission',
      error: error.message
    });
  }
});

module.exports = router;
