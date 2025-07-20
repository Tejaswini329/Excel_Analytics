// server/models/UserChartHistory.js
const mongoose = require('mongoose');

const userChartHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fileName: String,
  chartType: String,
  uploadDate: { type: Date, default: Date.now },
  downloadLinkPNG: String,
  downloadLinkPDF: String
});

module.exports = mongoose.model('UserChartHistory', userChartHistorySchema);
