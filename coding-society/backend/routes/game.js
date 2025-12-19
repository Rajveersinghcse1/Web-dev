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

module.exports = router;