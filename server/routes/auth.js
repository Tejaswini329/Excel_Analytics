const express = require('express');
const router = express.Router();

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyOtp 
} = require('../controllers/authController');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

// ✅ OTP verification route
router.post('/verify-otp', verifyOtp);

module.exports = router;
