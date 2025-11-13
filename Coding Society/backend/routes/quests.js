/**
 * Quest Routes for Coding Society Platform
 * Handles quest management, completion, and progress tracking
 */

const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Quest = require('../models/Quest');
const User = require('../models/User');
const { asyncHandler, CustomError } = require('../middleware/errorHandler');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all quests
// @route   GET /api/v1/quests
// @access  Private
router.get('/', auth, [
  query('category').optional().isIn(['frontend', 'backend', 'ai', 'mobile', 'devops', 'security', 'algorithms', 'databases', 'general']),
  query('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced', 'expert']),
  query('language').optional().isString(),
  query('featured').optional().isBoolean(),
  query('limit').optional().isInt({ min: 1, max: 50 }),
  query('page').optional().isInt({ min: 1 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { 
    category, 
    difficulty, 
    language: programmingLanguage, 
    featured,
    limit = 20, 
    page = 1 
  } = req.query;

  // Build query
  const query = { status: 'published' };
  
  if (category) query.category = category;
  if (difficulty) query.difficulty = difficulty;
  if (programmingLanguage) query.programmingLanguage = programmingLanguage;
  if (featured) query.featured = featured === 'true';

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get quests
  const quests = await Quest.find(query)
    .select('-challenge.testCases -challenge.solutionTemplate')
    .sort({ featured: -1, 'analytics.totalCompletions': -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate('author', 'username profile.firstName profile.lastName');

  const total = await Quest.countDocuments(query);

  // Add user completion status
  const questsWithStatus = quests.map(quest => {
    const isCompleted = req.user.gameData.quests.completed.some(
      completedQuest => completedQuest.questId === quest._id.toString()
    );
    const isInProgress = req.user.gameData.quests.current.some(
      currentQuest => currentQuest.questId === quest._id.toString()
    );

    return {
      ...quest.toObject(),
      userStatus: isCompleted ? 'completed' : isInProgress ? 'in_progress' : 'available',
      completionRate: quest.completionRate,
      averageRating: quest.averageRating
    };
  });

  res.json({
    success: true,
    data: {
      quests: questsWithStatus,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalQuests: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    }
  });
}));

// @desc    Get recommended quests
// @route   GET /api/v1/quests/recommended
// @access  Private
router.get('/recommended', auth, asyncHandler(async (req, res) => {
  const user = req.user;
  
  // Get recommended quests based on user preferences and level
  const recommendedQuests = await Quest.findRecommended(user);

  // Add user completion status
  const questsWithStatus = recommendedQuests.map(quest => {
    const isCompleted = user.gameData.quests.completed.some(
      completedQuest => completedQuest.questId === quest._id.toString()
    );
    const isInProgress = user.gameData.quests.current.some(
      currentQuest => currentQuest.questId === quest._id.toString()
    );

    return {
      ...quest,
      userStatus: isCompleted ? 'completed' : isInProgress ? 'in_progress' : 'available'
    };
  });

  res.json({
    success: true,
    data: { quests: questsWithStatus }
  });
}));

// @desc    Get single quest
// @route   GET /api/v1/quests/:id
// @access  Private
router.get('/:id', auth, asyncHandler(async (req, res) => {
  const quest = await Quest.findById(req.params.id)
    .populate('author', 'username profile.firstName profile.lastName profile.avatar');

  if (!quest) {
    throw new CustomError('Quest not found', 404);
  }

  // Check if user has completed this quest
  const isCompleted = req.user.gameData.quests.completed.some(
    completedQuest => completedQuest.questId === quest._id.toString()
  );

  const isInProgress = req.user.gameData.quests.current.some(
    currentQuest => currentQuest.questId === quest._id.toString()
  );

  // Hide solution if not completed
  const questData = quest.toObject();
  if (!isCompleted && !['admin', 'superadmin'].includes(req.user.role)) {
    delete questData.challenge.solutionTemplate;
    // Hide some test cases
    questData.challenge.testCases = questData.challenge.testCases.filter(tc => !tc.isHidden);
  }

  res.json({
    success: true,
    data: {
      quest: {
        ...questData,
        userStatus: isCompleted ? 'completed' : isInProgress ? 'in_progress' : 'available',
        completionRate: quest.completionRate,
        averageRating: quest.averageRating
      }
    }
  });
}));

// @desc    Start a quest
// @route   POST /api/v1/quests/:id/start
// @access  Private
router.post('/:id/start', auth, asyncHandler(async (req, res) => {
  const quest = await Quest.findById(req.params.id);

  if (!quest) {
    throw new CustomError('Quest not found', 404);
  }

  if (quest.status !== 'published') {
    throw new CustomError('Quest is not available', 400);
  }

  const user = req.user;

  // Check if already completed
  const isCompleted = user.gameData.quests.completed.some(
    completedQuest => completedQuest.questId === quest._id.toString()
  );

  if (isCompleted) {
    return res.status(400).json({
      success: false,
      message: 'Quest already completed'
    });
  }

  // Check if already in progress
  const isInProgress = user.gameData.quests.current.some(
    currentQuest => currentQuest.questId === quest._id.toString()
  );

  if (isInProgress) {
    return res.status(400).json({
      success: false,
      message: 'Quest already in progress'
    });
  }

  // Check prerequisites
  for (const prereq of quest.prerequisites) {
    if (prereq.type === 'quest') {
      const hasCompleted = user.gameData.quests.completed.some(
        completedQuest => completedQuest.questId === prereq.id
      );
      if (!hasCompleted) {
        return res.status(400).json({
          success: false,
          message: `You must complete the prerequisite quest: ${prereq.description || prereq.id}`
        });
      }
    } else if (prereq.type === 'level') {
      if (user.gameData.level < parseInt(prereq.id)) {
        return res.status(400).json({
          success: false,
          message: `You must be level ${prereq.id} to start this quest`
        });
      }
    }
  }

  // Add to current quests
  user.gameData.quests.current.push({
    questId: quest._id.toString(),
    title: quest.title,
    startedAt: new Date(),
    progress: 0,
    hintsUsed: 0
  });

  await user.save();

  res.json({
    success: true,
    message: `Quest "${quest.title}" started!`,
    data: {
      quest: {
        id: quest._id,
        title: quest.title,
        description: quest.description,
        difficulty: quest.difficulty,
        startedAt: new Date()
      }
    }
  });
}));

// @desc    Submit quest solution
// @route   POST /api/v1/quests/:id/submit
// @access  Private
router.post('/:id/submit', auth, [
  body('code').notEmpty().withMessage('Code solution is required'),
  body('language').optional().isString(),
  body('timeSpent').optional().isInt({ min: 0 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const quest = await Quest.findById(req.params.id);
  
  if (!quest) {
    throw new CustomError('Quest not found', 404);
  }

  const { code, language, timeSpent = 0 } = req.body;
  const user = req.user;

  // Check if quest is in progress
  const questProgress = user.gameData.quests.current.find(
    currentQuest => currentQuest.questId === quest._id.toString()
  );

  if (!questProgress) {
    return res.status(400).json({
      success: false,
      message: 'Quest not started. Please start the quest first.'
    });
  }

  // Simulate code execution and testing
  // In a real implementation, you would execute the code against test cases
  const testResults = await simulateCodeExecution(code, quest.challenge.testCases);
  
  const passed = testResults.passedTests === testResults.totalTests;
  const score = Math.round((testResults.passedTests / testResults.totalTests) * 100);

  if (passed) {
    // Quest completed successfully
    const completedQuest = {
      questId: quest._id.toString(),
      title: quest.title,
      difficulty: quest.difficulty,
      completedAt: new Date(),
      xpEarned: quest.rewards.xp,
      timeSpent: timeSpent || Math.floor((new Date() - questProgress.startedAt) / 1000 / 60)
    };

    // Remove from current quests
    user.gameData.quests.current = user.gameData.quests.current.filter(
      currentQuest => currentQuest.questId !== quest._id.toString()
    );

    // Add to completed quests
    user.gameData.quests.completed.push(completedQuest);

    // Award XP and other rewards
    const levelUpResult = user.addXP(quest.rewards.xp);
    user.gameData.coins += quest.rewards.coins || 0;
    user.gameData.gems += quest.rewards.gems || 0;
    user.gameData.stats.totalQuestsCompleted++;

    await user.save();

    // Update quest analytics
    quest.recordCompletion(completedQuest.timeSpent, 1);
    await quest.save();

    res.json({
      success: true,
      message: `🎉 Quest completed! +${quest.rewards.xp} XP earned!`,
      data: {
        completed: true,
        score: 100,
        testResults,
        rewards: {
          xp: quest.rewards.xp,
          coins: quest.rewards.coins || 0,
          gems: quest.rewards.gems || 0
        },
        levelUp: levelUpResult,
        timeSpent: completedQuest.timeSpent
      }
    });

  } else {
    // Quest failed, update attempts
    questProgress.progress = score;
    await user.save();

    res.json({
      success: false,
      message: `Quest not completed. ${testResults.passedTests}/${testResults.totalTests} tests passed.`,
      data: {
        completed: false,
        score,
        testResults,
        hints: score < 50 ? quest.challenge.hints.slice(0, 1) : []
      }
    });
  }
}));

// @desc    Get quest hint
// @route   POST /api/v1/quests/:id/hint
// @access  Private
router.post('/:id/hint', auth, [
  body('hintIndex').isInt({ min: 0 }).withMessage('Valid hint index is required')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const quest = await Quest.findById(req.params.id);
  
  if (!quest) {
    throw new CustomError('Quest not found', 404);
  }

  const { hintIndex } = req.body;
  const user = req.user;

  // Check if quest is in progress
  const questProgress = user.gameData.quests.current.find(
    currentQuest => currentQuest.questId === quest._id.toString()
  );

  if (!questProgress) {
    return res.status(400).json({
      success: false,
      message: 'Quest not started'
    });
  }

  if (hintIndex >= quest.challenge.hints.length) {
    return res.status(400).json({
      success: false,
      message: 'Hint not available'
    });
  }

  const hint = quest.challenge.hints[hintIndex];
  
  // Check if user can afford hint
  if (hint.cost > 0 && user.gameData.coins < hint.cost) {
    return res.status(400).json({
      success: false,
      message: `Not enough coins. Hint costs ${hint.cost} coins.`
    });
  }

  // Deduct cost and increment hints used
  if (hint.cost > 0) {
    user.gameData.coins -= hint.cost;
  }
  questProgress.hintsUsed++;
  
  await user.save();

  res.json({
    success: true,
    message: hint.cost > 0 ? `Hint unlocked for ${hint.cost} coins` : 'Hint unlocked',
    data: {
      hint: hint.text,
      cost: hint.cost,
      hintsUsed: questProgress.hintsUsed,
      remainingCoins: user.gameData.coins
    }
  });
}));

// @desc    Rate a quest
// @route   POST /api/v1/quests/:id/rate
// @access  Private
router.post('/:id/rate', auth, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('difficulty').isInt({ min: 1, max: 5 }).withMessage('Difficulty rating must be between 1 and 5'),
  body('feedback').optional().isLength({ max: 500 }).withMessage('Feedback cannot exceed 500 characters')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const quest = await Quest.findById(req.params.id);
  
  if (!quest) {
    throw new CustomError('Quest not found', 404);
  }

  const { rating, difficulty, feedback = '' } = req.body;
  const user = req.user;

  // Check if user has completed this quest
  const hasCompleted = user.gameData.quests.completed.some(
    completedQuest => completedQuest.questId === quest._id.toString()
  );

  if (!hasCompleted) {
    return res.status(400).json({
      success: false,
      message: 'You must complete the quest before rating it'
    });
  }

  // Add rating
  quest.addRating(user._id, rating, difficulty, feedback);
  await quest.save();

  res.json({
    success: true,
    message: 'Quest rated successfully!',
    data: {
      rating,
      difficulty,
      feedback,
      averageRating: quest.averageRating
    }
  });
}));

// Helper function to simulate code execution
async function simulateCodeExecution(code, testCases) {
  // This is a simplified simulation
  // In a real implementation, you would use a secure code execution environment
  
  try {
    // Simulate running test cases
    const results = testCases.map((testCase, index) => {
      // Simple simulation - in reality, you'd execute the code
      const passed = Math.random() > 0.3; // 70% chance of passing for simulation
      
      return {
        testCase: index + 1,
        passed,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: passed ? testCase.expectedOutput : 'incorrect output',
        executionTime: Math.floor(Math.random() * 100) + 10 // Random execution time
      };
    });

    const passedTests = results.filter(r => r.passed).length;
    
    return {
      success: true,
      totalTests: testCases.length,
      passedTests,
      failedTests: testCases.length - passedTests,
      results,
      totalExecutionTime: results.reduce((sum, r) => sum + r.executionTime, 0)
    };

  } catch (error) {
    return {
      success: false,
      error: 'Code execution failed',
      message: error.message,
      totalTests: testCases.length,
      passedTests: 0,
      failedTests: testCases.length
    };
  }
}

module.exports = router;