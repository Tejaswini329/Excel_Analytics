// models/userHistory.js
const mongoose = require('mongoose');

const userHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  fileName: String,
  chartType: String,
  uploadDate: { type: Date, default: Date.now },
  downloadLinkPNG: String,
  downloadLinkPDF: String
});

module.exports = mongoose.model('UserHistory', userHistorySchema);
