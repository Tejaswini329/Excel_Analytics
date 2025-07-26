const express = require('express');
const router = express.Router();
const UserChartHistory = require('../models/UserChartHistory');
const multer = require('multer');

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

// (Optional) GET chart history by user
router.get('/:userId', async (req, res) => {
  try {
    const entries = await UserChartHistory.find({ userId: req.params.userId }).sort({ uploadDate: -1 });
    res.json(entries);
    console.log('📥 Chart history received:', req.body);

  } catch (err) {
    console.error('❌ Error fetching chart history:', err.message);
    res.status(500).json({ error: 'Server error fetching history' });
  }
});

const upload = multer({ storage });

router.post('/upload', upload.fields([
  { name: 'chartPNG', maxCount: 1 },
  { name: 'chartPDF', maxCount: 1 }
]), async (req, res) => {
  try {
    const { userId, fileName, chartType, xAxis, yAxis, labelColumn } = req.body;

    const pngPath = req.files.chartPNG?.[0]?.filename;
    const pdfPath = req.files.chartPDF?.[0]?.filename;

    const entry = await UserChartHistory.create({
      userId,
      fileName,
      chartType,
      xAxis,
      yAxis,
      labelColumn,
      downloadLinkPNG: pngPath ? `/downloads/${pngPath}` : '',
      downloadLinkPDF: pdfPath ? `/downloads/${pdfPath}` : ''
    });

    res.status(201).json({ message: 'Saved successfully', entry });
  } catch (err) {
    console.error('❌ Upload route DB error:', err.message);
    res.status(500).json({ error: 'Failed to save chart history' });
  }
});


module.exports = router;
