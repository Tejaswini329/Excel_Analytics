const express = require('express');
const router = express.Router();
const UserChartHistory = require('../models/UserChartHistory');

// POST chart history
router.post('/charthistory', async (req, res) => {
  try {
    const entry = await UserChartHistory.create(req.body);
    res.status(201).json({ message: 'Chart history saved!', id: entry._id });
    console.log('📝 Chart history received with fileName:', req.body.fileName);

  } catch (err) {
    console.error('❌ Chart history error:', err.message);
    res.status(500).json({ error: 'Server error saving chart history' });
  }
});

// (Optional) GET chart history by user
router.get('/charthistory/:userId', async (req, res) => {
  try {
    const entries = await UserChartHistory.find({ userId: req.params.userId }).sort({ uploadDate: -1 });
    res.json(entries);
    console.log('📥 Chart history received:', req.body);

  } catch (err) {
    console.error('❌ Error fetching chart history:', err.message);
    res.status(500).json({ error: 'Server error fetching history' });
  }
});

module.exports = router;
