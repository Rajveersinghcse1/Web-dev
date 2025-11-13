// Battle routes - Basic implementation
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

router.get('/leaderboard', auth, (req, res) => {
  res.json({ success: true, data: { leaderboard: [] } });
});

module.exports = router;