// routes/admin.js
const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/adminAuth');
const User = require('../models/User');
const UserChartHistory = require('../models/UserChartHistory'); // ensure exists

router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCharts = await UserChartHistory.countDocuments();
    const chartTypeCounts = await UserChartHistory.aggregate([
      { $group: { _id: '$chartType', count: { $sum: 1 } } }
    ]);

    res.json({ totalUsers, totalCharts, chartTypeCounts });
  } catch (err) {
    console.error("Admin stats error:", err);
    res.status(500).json({ error: 'Server error fetching stats' });
  }
});

module.exports = router;
