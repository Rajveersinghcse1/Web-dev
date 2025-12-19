// Skill tree routes - Basic implementation
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

router.get('/', auth, (req, res) => {
  res.json({ success: true, data: { skillTrees: req.user.gameData.skillTrees } });
});

module.exports = router;