const mongoose = require('mongoose');
const userHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileName: String,
  chartType: String,
  uploadDate: { type: Date, default: Date.now },
  downloadLinkPNG: String,
  downloadLinkPDF: String
});
