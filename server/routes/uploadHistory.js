// routes/uploadhistory.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const UserHistory = require('../models/userHistory');
// POST to store history
router.post('/', async (req, res) => {
  try {
    const entry = await UserHistory.create(req.body);
    res.status(201).json(entry);
  } catch (err) {
    console.error('❌ Failed to save history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET to fetch history
router.get('/:userId', async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid userId format' });
  }

  try {
    const history = await UserHistory.find({ userId });
    res.json(history);
  } catch (err) {
    console.error('❌ Failed to fetch history:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});




module.exports = router;
