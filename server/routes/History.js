// routes/uploadhistory.js
const express = require('express');
const router = express.Router();
const UserHistory = require('../models/userHistory');

// POST to store history
router.post('/history', async (req, res) => {
  try {
    const entry = await UserHistory.create(req.body);
    res.status(201).json(entry);
  } catch (err) {
    console.error('❌ Failed to save history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET to fetch history
router.get('/history/:userId', async (req, res) => {
  try {
    const history = await UserHistory.find({ userId: req.params.userId }).sort({ uploadDate: -1 });
    res.json(history);
    console.log('Fetching history for user:', req.params.userId);

  } catch (err) {
    console.error('❌ Failed to fetch history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
