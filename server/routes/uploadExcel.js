const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const ExcelData = require('../models/ExcelData');
console.log('ExcelData:', ExcelData);
const mongoose = require('mongoose');

const UserChartHistory = require('../models/UserChartHistory'); 

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', upload.single('file'), async (req, res) => {
  const userId = req.body.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ error: 'Invalid userId' });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const chartType = req.body.chartType || 'Unknown';
    const originalFileName = req.file.originalname;

    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const parsedData = XLSX.utils.sheet_to_json(worksheet);

    if (!Array.isArray(parsedData) || parsedData.length === 0) {
      return res.status(400).json({ error: 'Excel content is empty or invalid' });
    }

    // ✅ Save the Excel data
    const excelEntry = await ExcelData.create({
      userId,
      rows: parsedData,
      uploadedAt: new Date(),
      fileName: originalFileName
    });

    // ✅ Log chart history
    await UserChartHistory.create({
      userId,
      fileName: originalFileName,
      chartType,
      downloadLinkPNG: '',
      downloadLinkPDF: ''
    });

    res.status(200).json({ message: 'Uploaded, saved, and chart history logged!', id: excelEntry._id });

  } catch (err) {
    console.error('❌ Upload or DB Error:', err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});


module.exports = router;
