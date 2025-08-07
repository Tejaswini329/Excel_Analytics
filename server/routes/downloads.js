const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const DOWNLOADS_DIR = path.join(__dirname, '..', 'downloads'); // adjust as needed

router.get('/', async (req, res) => {
  const { userId } = req.query;

  try {
    const files = await fs.promises.readdir(DOWNLOADS_DIR);

    const validFiles = files.filter(f =>
      f.endsWith('.png') || f.endsWith('.pdf') || f.endsWith('.xlsx') || f.endsWith('.xls')
    );

    const downloadList = validFiles
      .map(file => {
        const ext = path.extname(file).toLowerCase();
        const parts = file.split('-');
        const prefix = parts[0]; // this should be userId if your filename format is `${userId}-${timestamp}-filename.xlsx`

        if (userId && prefix !== userId) return null;

        const stats = fs.statSync(path.join(DOWNLOADS_DIR, file));
        let type = '';
        if (ext === '.png') type = 'png';
        else if (ext === '.pdf') type = 'pdf';
        else type = 'excel';

        return {
          fileName: file,
          type,
          uploadedAt: stats.ctime,
          url: `/downloads/${file}`,
          userId: prefix,
        };
      })
      .filter(Boolean);

    res.json(downloadList);
  } catch (err) {
    console.error('Error reading downloads folder:', err);
    res.status(500).json({ error: 'Failed to read downloads folder' });
  }
});

module.exports = router;
