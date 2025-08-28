const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const ExcelData = require('../models/ExcelData');
const UserChartHistory = require('../models/UserChartHistory');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');

const router = express.Router();
console.log('__dirname:', __dirname);
const DOWNLOADS_DIR = path.join(__dirname, '..', 'downloads');
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, DOWNLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const timestamp = Date.now();
    const sanitized = file.originalname.replace(/\s+/g, '_');
    cb(null, `${timestamp}-${sanitized}`);
  }
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), async (req, res) => {
  const userId = req.body.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const originalFileName = req.file.filename;
    const chartType = req.body.chartType || 'Unknown';

    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const parsedData = XLSX.utils.sheet_to_json(worksheet);

    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      return res.status(400).json({ error: 'Excel content is empty or invalid' });
    }

    // Save Excel data to Mongo
    const excelEntry = await ExcelData.create({
      userId,
      rows: parsedData,
      uploadedAt: new Date(),
      fileName: originalFileName
    });

    // Log in chart history
    await UserChartHistory.create({
      userId,
      fileName: originalFileName,
      chartType,
      downloadLinkPNG: '',
      downloadLinkPDF: ''
    });

    res.status(200).json({
      message: 'Uploaded, saved, and chart history logged!',
      id: excelEntry._id,
      fileUrl: `/downloads/${originalFileName}`
    });

  } catch (err) {
    console.error('❌ Upload or DB Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
  console.log('📁 Uploaded file saved at:', req.file.path);

});

module.exports = router;
