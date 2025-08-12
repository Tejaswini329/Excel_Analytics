const User = require('../models/User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// POST /api/auth/register
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.verified)
      return res.status(400).json({ error: 'Email already registered and verified.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // Nodemailer Transport
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: `"Verify your account" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "OTP Verification - Complete Your Registration",
      html: `<p>Your OTP is: <b>${otp}</b></p><p>It expires in 10 minutes.</p>`
    });

    let user;
    if (existingUser) {
      // Update existing unverified user
      existingUser.username = username;
      existingUser.password = hashedPassword;
      existingUser.otp = otp;
      existingUser.otpExpiry = otpExpiry;
      await existingUser.save();
      user = existingUser;
    } else {
      // Create new user
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


// POST /api/auth/login
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
      email: user.email
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error during login' });
  }
};

// POST /api/auth/forgot-password
// POST /api/auth/forgot-password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate raw token
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Hash token for storage
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    // Store hashed token + expiry
    user.resetToken = hashedToken;
    user.resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hr
    await user.save();

    console.log("🔐 Hashed token saved in DB:", hashedToken);

    // ✅ Send raw token in email link
    const resetUrl = `http://localhost:5173/reset-password/${rawToken}`;


    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

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
    console.error("❌ Forgot password error:", err);
    res.status(500).json({ error: "Failed to send reset email." });
  }
};


// POST /api/auth/verify-otp
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

// POST /api/auth/reset-password/:token
const resetPassword = async (req, res) => {
  const { token } = req.params; // raw token from URL
  const { password } = req.body;

  try {
    console.log("👉 Raw token from URL:", token);

    // ✅ Hash the token before DB lookup
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetToken: hashedToken,
      resetTokenExpiry: { $gt: new Date() }
    });

    if (!user) {
      console.log("❌ Token not found or expired");
      return res.status(400).json({ error: 'Invalid or expired token' });
    }

    // ✅ Update password
    user.password = await bcrypt.hash(password, 10);
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully.' });

  } catch (err) {
    console.error("❌ Error resetting password:", err);
    res.status(500).json({ error: 'Server error during password reset' });
  }
};



module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  verifyOtp 
};
