const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Email verification
  verified: { type: Boolean, default: false },
  otp: String,
  otpExpiry: Date,

  // Password reset
  resetToken: String,
  resetTokenExpiry: Date,

  // Optional duplicate field - you can remove if not needed
  isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', UserSchema);
