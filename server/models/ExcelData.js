const mongoose = require('mongoose');

const excelDataSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rows: {
    type: [mongoose.Schema.Types.Mixed],
    required: true
  },
  fileName: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ExcelData', excelDataSchema);
