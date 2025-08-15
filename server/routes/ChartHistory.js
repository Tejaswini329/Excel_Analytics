const path = require('path');
const multer = require('multer');
const express = require('express');
const router = express.Router();
const UserChartHistory = require('../models/UserChartHistory');

// ✅ Storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'downloads/'); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// ✅ Upload route — require BOTH files
router.post(
  '/uploadcharts',
  upload.fields([
    { name: 'chartPNG', maxCount: 1 },
    { name: 'chartPDF', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      console.log('Files received:', req.files);

      const { userId, fileName, chartType, xAxis, yAxis, labelColumn } = req.body;
      const pngFile = req.files?.chartPNG?.[0];
      const pdfFile = req.files?.chartPDF?.[0];

      if (!chartType || !fileName || !pngFile || !pdfFile) {
        return res.status(400).json({ error: 'PNG and PDF files are required' });
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

module.exports = router;
