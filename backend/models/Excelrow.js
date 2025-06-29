// models/ExcelRow.js
const mongoose = require('mongoose');

const ExcelRowSchema = new mongoose.Schema({}, { strict: false });

module.exports = mongoose.model('ExcelRow', ExcelRowSchema);

