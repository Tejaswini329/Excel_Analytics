// models/TempAdmin.js
const mongoose = require('mongoose');

const TempAdminSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String },
  otp: { type: String, required: true },
  otpExpiry: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('TempAdmin', TempAdminSchema);
