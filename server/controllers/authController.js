// controllers/authController.js
const User = require('../models/User');
const TempAdmin = require('../models/TempAdmin'); // temporary admin OTP model
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Utility: create transporter
function getTransporter() {
  return nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
}

/* ----------------------------
   USER: Register (with OTP)
---------------------------- */
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.verified)
      return res.status(400).json({ error: 'Email already registered and verified.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000;

    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Verify your account" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "OTP Verification - Complete Your Registration",
      html: `<p>Your OTP is: <b>${otp}</b></p><p>It expires in 10 minutes.</p>`
    });

    let user;
    if (existingUser) {
      existingUser.username = username;
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save();
      user = existingUser;
    } else {
      user = new User({
        username,
        email,
        password: hashedPassword,
        otp,
        otpExpiry,
        verified: false
      });
      await user.save();
    }

    res.status(200).json({
      message: 'OTP sent to email. Please verify.',
      tempUserId: user._id
    });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

/* ----------------------------
   USER: Login
---------------------------- */
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    // ✅ Check if user is active
    if (!user.isActive) return res.status(403).json({ error: 'Your account has been disabled. Please contact admin.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    res.status(200).json({
      message: 'Login successful',
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

/* ----------------------------
   USER: Forgot password
---------------------------- */
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetToken = hashedToken;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    const resetUrl = `https://web-development-project-gxnx.onrender.com/reset-password/${rawToken}`;
    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset your password",
      html: `
        <p>Hello,</p>
        <p>You requested a password reset. Click the link below:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
      `
    });

    res.status(200).json({ message: "Reset link sent! Please check your email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Failed to send reset email." });
  }
};

/* ----------------------------
   USER: Verify OTP
---------------------------- */
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.verified) return res.status(400).json({ error: "User already verified" });

    if (user.otp !== otp || Date.now() > user.otpExpiry) {
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.verified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified. Registration complete!" });
  } catch (err) {
    console.error("OTP verification error:", err);
    res.status(500).json({ error: "Server error during OTP verification" });
  }
};

/* ----------------------------
   USER: Reset password
---------------------------- */
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ error: 'Server error during password reset' });
  }
};

/* ----------------------------
   ADMIN: Login
---------------------------- */
const adminLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email, role: 'admin' });
    if (!user) return res.status(401).json({ error: 'Access denied. Not an admin.' });

    // ✅ Check if admin is active
    if (!user.isActive) return res.status(403).json({ error: 'Your admin account has been disabled.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    res.status(200).json({
      message: 'Admin login successful',
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: 'Server error during admin login' });
  }
};

/* ----------------------------
   ADMIN OTP FLOW
   (adminRegisterEmail, adminVerifyOtp, adminCompleteRegister)
   same as before
---------------------------- */
const adminRegisterEmail = async (req, res) => { /* unchanged */ };
const adminVerifyOtp = async (req, res) => { /* unchanged */ };
const adminCompleteRegister = async (req, res) => { /* unchanged */ };

/* ----------------------------
   EXPORTS
---------------------------- */
module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyOtp,
  adminLogin,
  adminRegisterEmail,
  adminVerifyOtp,
  adminCompleteRegister
};
