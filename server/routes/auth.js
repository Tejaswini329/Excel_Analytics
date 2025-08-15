// routes/auth.js
const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyOtp,
  adminLogin,
  registerAdmin
} = require('../controllers/authController');

// DEBUG LOG (temporary) - optional
console.log({
  registerUser: typeof registerUser,
  loginUser: typeof loginUser,
  forgotPassword: typeof forgotPassword,
  resetPassword: typeof resetPassword,
  verifyOtp: typeof verifyOtp,
  adminLogin: typeof adminLogin,
  registerAdmin: typeof registerAdmin,
});

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/verify-otp', verifyOtp);
router.post('/admin-register', registerAdmin);
router.post('/admin-login', adminLogin);

module.exports = router;
