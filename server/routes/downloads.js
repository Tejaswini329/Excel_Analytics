const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const DOWNLOADS_DIR = path.join(__dirname, '..', 'downloads');

router.get('/', (req, res) => {
  fs.readdir(DOWNLOADS_DIR, (err, files) => {
    if (err) {
      console.error('Error reading downloads folder:', err);
      return res.status(500).json({ error: 'Failed to read downloads folder' });
    }

    const validFiles = files.filter(f => f.endsWith('.png') || f.endsWith('.pdf'));

    const downloadList = validFiles.map(file => {
      const stats = fs.statSync(path.join(DOWNLOADS_DIR, file));
      return {
        fileName: file,
        type: file.endsWith('.png') ? 'png' : 'pdf',
        uploadedAt: stats.ctime,
        url: `/downloads/${file}`, // served statically
      };
    });

    res.json(downloadList);
  });
});

module.exports = router;
