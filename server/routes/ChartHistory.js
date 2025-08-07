const express = require('express');
const router = express.Router();
const UserChartHistory = require('../models/UserChartHistory');
const multer = require('multer');
const mongoose = require('mongoose');
// POST chart history
const path = require('path');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'downloads/'); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Keeps original file extension
  }
});

router.post('/', async (req, res) => {
  try {
    const entry = await UserChartHistory.create(req.body);
    res.status(201).json({ message: 'Chart history saved!', id: entry._id });
    console.log('📝 Chart history received with fileName:', req.body.fileName);

  } catch (err) {
    console.error('❌ Chart history error:', err.message);
    res.status(500).json({ error: 'Server error saving chart history' });
  }
});




const upload = multer({ storage });

router.post('/uploadcharts', upload.fields([
  { name: 'chartPNG', maxCount: 1 },
  { name: 'chartPDF', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Files received:', req.files);
    const { userId, fileName, chartType, xAxis, yAxis, labelColumn } = req.body;

    const pngFile = req.files.chartPNG?.[0];
    const pdfFile = req.files.chartPDF?.[0];

    // Prevent saving if essential fields are missing
    if (!chartType || !fileName || !pngFile || !pdfFile) {
      return res.status(400).json({ error: 'Missing chart data or files' });
    }

    const entry = await UserChartHistory.create({
      userId,
      fileName,
      chartType,
      xAxis,
      yAxis,
      labelColumn,
      downloadLinkPNG: `/downloads/${pngFile.filename}`,
      downloadLinkPDF: `/downloads/${pdfFile.filename}`
    });

    console.log('✅ Chart and files saved:', entry._id);
    res.status(201).json({ message: 'Saved successfully', entry });

  } catch (err) {
    console.error('❌ Upload route DB error:', err.message);
    res.status(500).json({ error: 'Failed to save chart history' });
  }
});

    



// (Optional) GET chart history by user
router.get('/:userId', async (req, res) => {
  try {
    const entries = await UserChartHistory.find({ userId: req.params.userId }).sort({ uploadDate: -1 });
    res.json(entries);
    console.log('📥 Chart history fetched for user:', req.params.userId);
  } catch (err) {
    console.error('❌ Error fetching chart history:', err.message);
    res.status(500).json({ error: 'Server error fetching history' });
  }
});
module.exports = router;
