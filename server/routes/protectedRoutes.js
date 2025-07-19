const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // JWT middleware

// 1. Protected route example
router.get('/dashboard', auth, (req, res) => {
  // 2. req.user middleware se aaya hai
  res.json({
    message: `Welcome to dashboard ${req.user.username}!`,
    userData: req.user
  });
});

module.exports = router;
