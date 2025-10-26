const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'gshankar@$%@lsdhglhf';

// Define schemas
const createrhubUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const createrhubProductSchema = new mongoose.Schema({
  imageUrl: String,
  title: String,
  price: Number,
  link: String
});

const createrhubSocialLinkSchema = new mongoose.Schema({
  platform: String,
  url: String,
  order: Number
});

const createrhubProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CreaterhubUser',
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  name: String,
  tagline: String,
  profileImage: String,
  backgroundColor: String,
  accentColor: String,
  products: [createrhubProductSchema],
  socialLinks: [createrhubSocialLinkSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create models if they don't exist
const CreaterhubUser = mongoose.models.CreaterhubUser || mongoose.model('CreaterhubUser', createrhubUserSchema);
const CreaterhubProfile = mongoose.models.CreaterhubProfile || mongoose.model('CreaterhubProfile', createrhubProfileSchema);

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { email, password, username } = req.body;
    
    // Check if email or username already exists
    const existingUser = await CreaterhubUser.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ error: 'Email or username already in use' });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create new user
    const user = new CreaterhubUser({
      email,
      username,
      password: hashedPassword
    });
    
    await user.save();
    
    // Create default profile for the user
    const profile = new CreaterhubProfile({
      userId: user._id,
      username,
      name: username,
      tagline: 'My CreaterHub',
      profileImage: '/uploads/default-profile.png',
      backgroundColor: '#2563eb',
      accentColor: '#d9f99d',
      products: [],
      socialLinks: []
    });
    
    await profile.save();
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Check username availability - moved to app.js
// Since this endpoint path doesn't match the user registration path pattern

module.exports = router;