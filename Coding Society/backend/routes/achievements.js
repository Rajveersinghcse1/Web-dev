// Achievement routes - Basic implementation
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Achievement = require('../models/Achievement');

router.get('/', auth, async (req, res) => {
  const achievements = await Achievement.find({ status: 'active' });
  res.json({ success: true, data: { achievements } });
});

module.exports = router;