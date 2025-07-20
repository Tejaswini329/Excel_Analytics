const User = require('../models/User');
const bcrypt = require('bcrypt');

// POST /api/auth/register
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // 🔍 Check if email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    // 🔒 Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🆕 Create and save new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // ✅ Respond with userId
    res.status(201).json({
      message: 'User registered successfully',
      userId: newUser._id,
      username: newUser.username,
      email: newUser.email
    });
  } catch (err) {
    console.error('🛑 Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // 🔍 Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    // 🔐 Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    // ✅ Success
    res.status(200).json({
      message: 'Login successful',
      userId: user._id,
      username: user.username,
      email: user.email
    });
  } catch (err) {
    console.error('🛑 Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

module.exports = { registerUser, loginUser };
