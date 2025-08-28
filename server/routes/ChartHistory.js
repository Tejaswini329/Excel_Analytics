const path = require('path');
const multer = require('multer');
const express = require('express');
const router = express.Router();
const UserChartHistory = require('../models/UserChartHistory');

// ✅ Storage setup (fixed typo: diskStorage)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'downloads/'); // make sure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

/**
 * ================================================
 *  POST /api/charthistory/uploadcharts
 *  → Upload chart PNG + PDF, save metadata to MongoDB
 * ================================================
 */
router.post( '/uploadcharts',
  upload.fields([
    { name: 'chartPNG', maxCount: 1 },
    { name: 'chartPDF', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log('📂 Files received:', req.files);

      const { userId, fileName, chartType, xAxis, yAxis, labelColumn } = req.body;
      const pngFile = req.files?.chartPNG?.[0];
      const pdfFile = req.files?.chartPDF?.[0];

      if (!chartType || !fileName || !pngFile || !pdfFile) {
        return res.status(400).json({ error: 'PNG, PDF, fileName, and chartType are required' });
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
  }
);


router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await UserChartHistory.find({ userId }).sort({ uploadDate: -1 });

    if (!history.length) {
      return res.json([]); // no history yet
    }

    res.json(history);
  } catch (err) {
    console.error('❌ Fetch history error:', err.message);
    res.status(500).json({ error: 'Failed to fetch chart history' });
  }
});

module.exports = router;
