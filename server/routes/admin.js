const express = require("express");
const User = require("../models/User");
const UserChartHistory = require("../models/UserChartHistory");

const router = express.Router();

// 📊 Get analytics
router.get("/analytics", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCharts = await UserChartHistory.countDocuments();

    // Group by chartType
    const chartTypes = await UserChartHistory.aggregate([
      { $group: { _id: "$chartType", count: { $sum: 1 } } }
    ]);
    const formattedChartTypes = chartTypes.map(c => ({
      type: c._id,
      count: c.count
    }));

    // Group daily uploads by createdAt
    const dailyUploads = await UserChartHistory.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    const formattedDaily = dailyUploads.map(d => ({
      date: d._id,
      count: d.count
    }));

    res.json({
      totalUsers,
      totalCharts,
      chartTypes: formattedChartTypes,
      dailyUploads: formattedDaily
    });
  } catch (err) {
    console.error("Error fetching analytics:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 👥 Get all users with chart counts
router.get("/users", async (req, res) => {
  try {
    const users = await User.find().lean();

    const usersWithCounts = await Promise.all(
      users.map(async u => {
        const count = await UserChartHistory.countDocuments({ userId: u._id });
        return {
          ...u,
          chartCount: count
        };
      })
    );

    res.json(usersWithCounts);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🔄 Toggle user enable/disable
router.patch("/users/:id/toggle", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    const chartCount = await UserChartHistory.countDocuments({ userId: user._id });

    res.json({
      _id: user._id,
      username: user.username,
      email: user.email,
      isActive: user.isActive,
      chartCount
    });
  } catch (err) {
    console.error("Error toggling user:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
