// Avatar routes - Basic implementation
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');

router.get('/', auth, (req, res) => {
  res.json({ success: true, data: { avatar: req.user.gameData.avatar } });
});

module.exports = router;