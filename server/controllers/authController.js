// controllers/authController.js
const User = require('../models/User');
const TempAdmin = require('../models/TempAdmin'); // new temp model for admin OTP
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { default: AdminRegister } = require('../../client/src/pages/AdminRegister');

// Utility: create transporter (uses env EMAIL_USER and EMAIL_PASS)
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

    // 6-digit OTP, 10 minute expiry for regular users
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    res.status(200).json({
      message: 'Login successful',
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role
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

    const resetUrl = `http://localhost:5173/reset-password/${rawToken}`;
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
   USER: Verify OTP (regular users)
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
   USER: Reset password (via token)
   ---------------------------- */
const resetPassword = async (req, res) => {
  const { token } = req.params; // raw token
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

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    res.status(200).json({
      message: 'Admin login successful',
      userId: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ error: 'Server error during admin login' });
  }
};

/* ----------------------------
   ADMIN OTP FLOW
   1) adminRegisterEmail  -> send OTP, returns tempId (3 min expiry)
   2) adminVerifyOtp      -> verify OTP
   3) adminCompleteRegister -> set password & create admin
   ---------------------------- */

/**
 * Step 1: send OTP to admin email and create TempAdmin
 * Body: { email, username? }
 */
const adminRegisterEmail = async (req, res) => {
  const { email, username } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  try {
    const existing = await User.findOne({ email, role: 'admin' });
    if (existing) return res.status(400).json({ error: 'Admin already exists with that email' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 3 * 60 * 1000; // 3 minutes

    // Upsert temp admin entry
    const temp = await TempAdmin.findOneAndUpdate(
      { email },
      { email, username, otp, otpExpiry },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const transporter = getTransporter();
    await transporter.sendMail({
      from: `"Verify your admin account" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Admin Registration OTP (3 minutes)",
      html: `<p>Your OTP is: <b>${otp}</b></p><p>This OTP expires in 3 minutes.</p>`
    });

    return res.status(200).json({ message: 'OTP sent', tempId: temp._id });
  } catch (err) {
    console.error("adminRegisterEmail error:", err);
    return res.status(500).json({ error: 'Server error sending OTP' });
  }
};

/**
 * Step 2: verify OTP
 * Body: { tempId, email, otp }
 */
const adminVerifyOtp = async (req, res) => {
  const { tempId, email, otp } = req.body;
  if (!tempId || !email || !otp) return res.status(400).json({ error: 'tempId, email and otp required' });

  try {
    const temp = await TempAdmin.findById(tempId);
    if (!temp) return res.status(404).json({ error: 'Verification request not found' });

    if (temp.email !== email) return res.status(400).json({ error: 'Email mismatch' });

    if (temp.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });

    if (Date.now() > new Date(temp.otpExpiry).getTime()) return res.status(400).json({ error: 'OTP expired' });

    return res.status(200).json({ message: 'OTP verified' });
  } catch (err) {
    console.error("adminVerifyOtp error:", err);
    return res.status(500).json({ error: 'Server error verifying OTP' });
  }
};

/**
 * Step 3: complete registration (create admin user)
 * Body: { tempId, email, username?, password }
 */
const adminCompleteRegister = async (req, res) => {
  const { tempId, email, username, password } = req.body;
  if (!tempId || !email || !password) return res.status(400).json({ error: 'tempId, email and password required' });

  try {
    const temp = await TempAdmin.findById(tempId);
    if (!temp) return res.status(404).json({ error: 'Registration session not found' });

    if (temp.email !== email) return res.status(400).json({ error: 'Email mismatch' });

    if (Date.now() > new Date(temp.otpExpiry).getTime()) {
      await TempAdmin.findByIdAndDelete(tempId);
      return res.status(400).json({ error: 'OTP session expired' });
    }

    const existingAdmin = await User.findOne({ email, role: 'admin' });
    if (existingAdmin) {
      await TempAdmin.findByIdAndDelete(tempId);
      return res.status(400).json({ error: 'Admin already exists with that email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const finalUsername = username || temp.username || email.split('@')[0];

    const newAdmin = new User({
      username: finalUsername,
      email,
      password: hashedPassword,
      role: 'admin',
      verified: true
    });

    await newAdmin.save();
    await TempAdmin.findByIdAndDelete(tempId);

    return res.status(201).json({ message: 'Admin created', userId: newAdmin._id });
  } catch (err) {
    console.error("adminCompleteRegister error:", err);
    return res.status(500).json({ error: 'Server error completing registration' });
  }
};

/* ----------------------------
   EXPORTS
   ---------------------------- */
module.exports = {
  // user
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyOtp,
  adminLogin,
  AdminRegister, 
  adminRegisterEmail,
  adminVerifyOtp,
  adminCompleteRegister
};
