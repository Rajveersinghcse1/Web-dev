/**
 * Game Routes for Coding Society Platform
 * Handles game state, progression, XP, and character management
 */

const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const { asyncHandler, CustomError } = require('../middleware/errorHandler');
const { auth, validateGameSession } = require('../middleware/auth');

const router = express.Router();

// @desc    Get game state
// @route   GET /api/v1/game/state
// @access  Private
router.get('/state', auth, asyncHandler(async (req, res) => {
  const user = req.user;

  res.json({
    success: true,
    data: {
      gameState: {
        level: user.gameData.level,
        xp: user.gameData.xp,
        totalXP: user.gameData.totalXP,
        xpToNext: user.xpToNextLevel,
        skillPoints: user.gameData.skillPoints,
        coins: user.gameData.coins,
        gems: user.gameData.gems,
        characterClass: user.gameData.characterClass,
        stats: user.gameData.stats,
        skillTrees: user.gameData.skillTrees,
        avatar: user.gameData.avatar,
        achievements: user.gameData.achievements,
        quests: user.gameData.quests,
        battleStats: user.gameData.battleStats
      },
      player: {
        name: user.profile.firstName || user.username,
        class: user.gameData.characterClass,
        avatar: user.profile.avatar
      }
    }
  });
}));

// @desc    Add XP to user
// @route   POST /api/v1/game/xp
// @access  Private
router.post('/xp', auth, validateGameSession, [
  body('amount')
    .isInt({ min: 1, max: 1000 })
    .withMessage('XP amount must be between 1 and 1000'),
  body('source')
    .optional()
    .isString()
    .withMessage('Source must be a string'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { amount, source = 'manual', metadata = {} } = req.body;
  const user = req.user;

  // Add XP and check for level up
  const result = user.addXP(amount);
  await user.save();

  let message = `+${amount} XP earned!`;
  const data = {
    xpGained: amount,
    newXP: user.gameData.xp,
    newTotalXP: user.gameData.totalXP,
    level: user.gameData.level,
    ...result
  };

  if (result.leveledUp) {
    message = `🎉 Level Up! You're now level ${result.newLevel}! (+${result.skillPointsGained} skill points)`;
    
    // Check for level-based achievements
    await checkLevelAchievements(user);
  }

  res.json({
    success: true,
    message,
    data
  });
}));

// @desc    Update character class
// @route   PUT /api/v1/game/character-class
// @access  Private
router.put('/character-class', auth, [
  body('characterClass')
    .isIn(['novice_coder', 'frontend_wizard', 'backend_knight', 'ai_sorcerer', 'fullstack_paladin'])
    .withMessage('Invalid character class')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { characterClass } = req.body;
  const user = req.user;

  // Check if user has enough level to choose advanced classes
  const classRequirements = {
    'novice_coder': 1,
    'frontend_wizard': 5,
    'backend_knight': 5,
    'ai_sorcerer': 10,
    'fullstack_paladin': 15
  };

  if (user.gameData.level < classRequirements[characterClass]) {
    return res.status(400).json({
      success: false,
      message: `You need to be level ${classRequirements[characterClass]} to choose this class`
    });
  }

  user.gameData.characterClass = characterClass;
  await user.save();

  res.json({
    success: true,
    message: `Character class updated to ${characterClass.replace('_', ' ')}!`,
    data: {
      characterClass: user.gameData.characterClass,
      level: user.gameData.level
    }
  });
}));

// @desc    Spend skill points
// @route   POST /api/v1/game/spend-skill-points
// @access  Private
router.post('/spend-skill-points', auth, [
  body('skillTree')
    .isIn(['frontend', 'backend', 'ai', 'mobile', 'devops', 'security', 'algorithms', 'databases'])
    .withMessage('Invalid skill tree'),
  body('skillId')
    .isString()
    .withMessage('Skill ID is required'),
  body('pointsToSpend')
    .isInt({ min: 1, max: 5 })
    .withMessage('Points to spend must be between 1 and 5')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { skillTree, skillId, pointsToSpend } = req.body;
  const user = req.user;

  // Check if user has enough skill points
  if (user.gameData.skillPoints < pointsToSpend) {
    return res.status(400).json({
      success: false,
      message: 'Not enough skill points'
    });
  }

  // Check if skill is already unlocked
  if (user.gameData.skillTrees[skillTree].unlockedSkills.includes(skillId)) {
    return res.status(400).json({
      success: false,
      message: 'Skill already unlocked'
    });
  }

  // Unlock skill
  user.gameData.skillTrees[skillTree].unlockedSkills.push(skillId);
  user.gameData.skillTrees[skillTree].skillPoints += pointsToSpend;
  user.gameData.skillPoints -= pointsToSpend;

  await user.save();

  res.json({
    success: true,
    message: `Skill unlocked in ${skillTree} tree!`,
    data: {
      skillTree,
      skillId,
      pointsSpent: pointsToSpend,
      remainingSkillPoints: user.gameData.skillPoints,
      skillTreeData: user.gameData.skillTrees[skillTree]
    }
  });
}));

// @desc    Update avatar customization
// @route   PUT /api/v1/game/avatar
// @access  Private
router.put('/avatar', auth, [
  body('theme')
    .optional()
    .isString()
    .withMessage('Theme must be a string'),
  body('accessories')
    .optional()
    .isArray()
    .withMessage('Accessories must be an array'),
  body('avatar')
    .optional()
    .isString()
    .withMessage('Avatar must be a string')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { theme, accessories, avatar } = req.body;
  const user = req.user;

  // Update avatar customization
  if (theme && user.gameData.avatar.unlockedThemes.includes(theme)) {
    user.gameData.avatar.theme = theme;
  }

  if (accessories) {
    // Only use accessories that are unlocked
    const validAccessories = accessories.filter(acc => 
      user.gameData.avatar.unlockedAccessories.includes(acc)
    );
    user.gameData.avatar.accessories = validAccessories;
  }

  if (avatar) {
    user.profile.avatar = avatar;
  }

  await user.save();

  res.json({
    success: true,
    message: 'Avatar updated successfully!',
    data: {
      avatar: user.gameData.avatar,
      profileAvatar: user.profile.avatar
    }
  });
}));

// @desc    Get leaderboard
// @route   GET /api/v1/game/leaderboard
// @access  Private
router.get('/leaderboard', auth, asyncHandler(async (req, res) => {
  const { type = 'level', limit = 10 } = req.query;

  let sortField;
  switch (type) {
    case 'level':
      sortField = { 'gameData.level': -1, 'gameData.xp': -1 };
      break;
    case 'xp':
      sortField = { 'gameData.totalXP': -1 };
      break;
    case 'battles':
      sortField = { 'gameData.battleStats.wins': -1 };
      break;
    case 'streak':
      sortField = { 'gameData.stats.dailyStreak': -1 };
      break;
    default:
      sortField = { 'gameData.level': -1, 'gameData.xp': -1 };
  }

  const users = await User.find({ status: 'active' })
    .select('username profile.firstName profile.avatar gameData.level gameData.xp gameData.totalXP gameData.stats gameData.battleStats')
    .sort(sortField)
    .limit(parseInt(limit));

  const leaderboard = users.map((user, index) => ({
    rank: index + 1,
    username: user.username,
    name: user.profile.firstName || user.username,
    avatar: user.profile.avatar,
    level: user.gameData.level,
    xp: user.gameData.xp,
    totalXP: user.gameData.totalXP,
    dailyStreak: user.gameData.stats.dailyStreak,
    battleWins: user.gameData.battleStats.wins,
    isCurrentUser: user._id.toString() === req.user._id.toString()
  }));

  res.json({
    success: true,
    data: {
      leaderboard,
      type,
      userRank: leaderboard.findIndex(user => user.isCurrentUser) + 1
    }
  });
}));

// @desc    Get user statistics
// @route   GET /api/v1/game/stats
// @access  Private
router.get('/stats', auth, asyncHandler(async (req, res) => {
  const user = req.user;

  const stats = {
    general: {
      level: user.gameData.level,
      totalXP: user.gameData.totalXP,
      skillPoints: user.gameData.skillPoints,
      dailyStreak: user.gameData.stats.dailyStreak,
      longestStreak: user.gameData.stats.longestStreak,
      memberSince: user.createdAt
    },
    achievements: {
      total: user.gameData.achievements.unlocked.length,
      byRarity: user.gameData.achievements.unlocked.reduce((acc, achievement) => {
        acc[achievement.rarity] = (acc[achievement.rarity] || 0) + 1;
        return acc;
      }, {})
    },
    quests: {
      completed: user.gameData.quests.completed.length,
      current: user.gameData.quests.current.length,
      totalXPFromQuests: user.gameData.quests.completed.reduce((sum, quest) => sum + (quest.xpEarned || 0), 0)
    },
    battles: {
      totalBattles: user.gameData.battleStats.totalBattles,
      wins: user.gameData.battleStats.wins,
      losses: user.gameData.battleStats.losses,
      draws: user.gameData.battleStats.draws,
      winRate: user.winRate,
      eloRating: user.gameData.battleStats.eloRating,
      rank: user.gameData.battleStats.rank,
      winStreak: user.gameData.battleStats.winStreak,
      bestWinStreak: user.gameData.battleStats.bestWinStreak
    },
    coding: {
      totalExecutions: user.gameData.stats.totalCodeExecutions,
      linesOfCode: user.gameData.stats.totalLinesOfCode,
      favoriteLanguage: user.gameData.stats.favoriteLanguage
    }
  };

  res.json({
    success: true,
    data: { stats }
  });
}));

// Helper function to check level-based achievements
async function checkLevelAchievements(user) {
  const levelAchievements = [
    { level: 5, achievementId: 'level_5_milestone' },
    { level: 10, achievementId: 'level_10_milestone' },
    { level: 25, achievementId: 'level_25_milestone' },
    { level: 50, achievementId: 'level_50_milestone' },
    { level: 100, achievementId: 'level_100_milestone' }
  ];

  for (const { level, achievementId } of levelAchievements) {
    if (user.gameData.level >= level) {
      const achievement = await Achievement.findOne({ id: achievementId, status: 'active' });
      if (achievement) {
        const eligible = await Achievement.checkUserEligibility(achievementId, user);
        if (eligible) {
          user.unlockAchievement({
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            rarity: achievement.rarity,
            xpReward: achievement.rewards.xp
          });
        }
      }
    }
  }
}

// @desc    Get user battles history
// @route   GET /api/v1/game/battles/history
// @access  Private
router.get('/battles/history', auth, asyncHandler(async (req, res) => {
  const user = req.user;
  const { limit = 10, page = 1 } = req.query;

  // This would fetch from a Battle model (to be created)
  // For now, return mock data structure
  res.json({
    success: true,
    data: {
      battles: [],
      stats: user.gameData.battleStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: 1,
        hasNext: false,
        hasPrev: false
      }
    }
  });
}));

// @desc    Submit battle result
// @route   POST /api/v1/game/battles/submit
// @access  Private
router.post('/battles/submit', auth, [
  body('battleId').isString().withMessage('Battle ID is required'),
  body('won').isBoolean().withMessage('Won status must be boolean'),
  body('score').isInt({ min: 0 }).withMessage('Score must be non-negative integer')
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { battleId, won, score } = req.body;
  const user = req.user;

  // Update battle stats
  user.gameData.battleStats.totalBattles += 1;
  if (won) {
    user.gameData.battleStats.wins += 1;
    user.gameData.battleStats.winStreak += 1;
    if (user.gameData.battleStats.winStreak > user.gameData.battleStats.bestWinStreak) {
      user.gameData.battleStats.bestWinStreak = user.gameData.battleStats.winStreak;
    }
    // Award XP for win
    user.addXP(200);
  } else {
    user.gameData.battleStats.losses += 1;
    user.gameData.battleStats.winStreak = 0;
  }

  await user.save();

  res.json({
    success: true,
    message: won ? 'Victory! +200 XP' : 'Better luck next time!',
    data: {
      battleStats: user.gameData.battleStats,
      newXP: user.gameData.xp,
      level: user.gameData.level
    }
  });
}));

// @desc    Get daily challenge
// @route   GET /api/v1/game/daily-challenge
// @access  Private
router.get('/daily-challenge', auth, asyncHandler(async (req, res) => {
  const user = req.user;
  const today = new Date().toISOString().split('T')[0];
  
  // Check if user completed today's challenge
  const completedToday = user.gameData.stats.lastChallengeDate === today;

  // In production, this would fetch from a DailyChallenge model
  res.json({
    success: true,
    data: {
      challenge: {
        id: `daily-${today}`,
        title: "Today's Coding Challenge",
        description: 'Complete a special daily quest for bonus rewards',
        xpReward: 500,
        bonusReward: user.gameData.stats.dailyStreak >= 7 ? 200 : 0
      },
      completed: completedToday,
      streak: user.gameData.stats.dailyStreak
    }
  });
}));

// @desc    Get skill tree data
// @route   GET /api/v1/game/skill-trees
// @access  Private
router.get('/skill-trees', auth, asyncHandler(async (req, res) => {
  const user = req.user;

  res.json({
    success: true,
    data: {
      skillTrees: user.gameData.skillTrees,
      availablePoints: user.gameData.skillPoints,
      recommendations: getSkillRecommendations(user)
    }
  });
}));

// @desc    Reset skill tree
// @route   POST /api/v1/game/skill-trees/reset
// @access  Private
router.post('/skill-trees/reset', auth, [
  body('skillTree').isIn(['frontend', 'backend', 'ai', 'mobile', 'devops', 'security', 'algorithms', 'databases'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { skillTree } = req.body;
  const user = req.user;

  // Refund skill points
  const pointsToRefund = user.gameData.skillTrees[skillTree].skillPoints;
  user.gameData.skillPoints += pointsToRefund;

  // Reset skill tree
  user.gameData.skillTrees[skillTree] = {
    level: 0,
    xp: 0,
    skillPoints: 0,
    unlockedSkills: []
  };

  await user.save();

  res.json({
    success: true,
    message: `${skillTree} skill tree reset. ${pointsToRefund} points refunded.`,
    data: {
      skillTree: user.gameData.skillTrees[skillTree],
      availablePoints: user.gameData.skillPoints
    }
  });
}));

// Helper function for skill recommendations
function getSkillRecommendations(user) {
  const recommendations = [];
  const characterClass = user.gameData.characterClass;

  // Recommend skills based on character class
  if (characterClass === 'frontend_wizard') {
    recommendations.push('react_mastery', 'css_animations', 'ux_design');
  } else if (characterClass === 'backend_knight') {
    recommendations.push('api_design', 'database_optimization', 'microservices');
  } else if (characterClass === 'ai_sorcerer') {
    recommendations.push('neural_networks', 'data_preprocessing', 'model_optimization');
  }

  return recommendations;
}

module.exports = router;