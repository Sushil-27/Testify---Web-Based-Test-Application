// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nodemailer = require('nodemailer');
const { v4: uuidv4 } = require('uuid');
const { authenticate, requireAdmin } = require('../middleware/authMiddleware');

// In-memory OTP store
const otpStore = {}; // { email: { otp: '123456', expiresAt: timestamp } }

// 📩 Send OTP to email
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: 'Email is required' });
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(500).json({ msg: 'Email credentials not set in environment variables' });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 2 * 60 * 1000; // 2 minutes expiry

  otpStore[email] = { otp, expiresAt };

  // Setup nodemailer
  const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.EMAIL_USER,   // e.g. 'youremail@gmail.com'
      pass: process.env.EMAIL_PASS    // Use App Password
    }
  });

  const mailOptions = {
    from: `"TestPS" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'OTP for Registration on TestPS',
    text: `Your OTP for registration is: ${otp}`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}: ${otp}`);
    res.json({ msg: 'OTP sent successfully' });
  } catch (error) {
    console.error("❌ Failed to send OTP:", error);
    res.status(500).json({ msg: 'Failed to send OTP' });
  }
});

// ✅ Verify OTP
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).json({ msg: 'Email and OTP are required' });
  const record = otpStore[email];

  if (!record) return res.status(400).json({ msg: 'No OTP found. Please request again.' });
  if (Date.now() > record.expiresAt) return res.status(400).json({ msg: 'OTP expired. Please request a new one.' });
  if (otp !== record.otp) return res.status(400).json({ msg: 'Invalid OTP' });

  return res.json({ msg: 'OTP verified successfully' });
});

// ✅ Register route
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ msg: 'Name, email, and password are required' });
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ msg: 'User already exists' });

  const hash = await bcrypt.hash(password, 10);
  const userId = uuidv4(); // Generate unique userId

  const newUser = new User({
    name,
    email,
    password: hash,
    userId
  });

  try {
    await newUser.save();
    res.json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error("❌ Registration failed:", err);
    res.status(500).json({ msg: 'Server error during registration' });
  }
});

// ✅ Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ msg: 'Email and password are required' });
  }
  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ msg: 'JWT secret not set in environment variables' });
  }
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ msg: 'Invalid credentials' });

  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

  res.json({
    token,
    user: {
      _id: user._id,
      userId: user.userId, // Add userId here
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});

// Admin: Get all users
router.get('/users', authenticate, requireAdmin, async (req, res) => {
  try {
    const users = await User.find({}, 'name email role');
    res.json(users);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch users' });
  }
});

// Admin: Change user role
router.put('/users/:id/role', authenticate, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['admin', 'student'].includes(role)) {
      return res.status(400).json({ msg: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ msg: 'Role updated', user });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to update role' });
  }
});

// Admin: Delete/block user
router.delete('/users/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ msg: 'User deleted' });
  } catch (err) {
    res.status(500).json({ msg: 'Failed to delete user' });
  }
});

module.exports = router;
