const mongoose = require('mongoose');
const express = require('express');
const { authenticateToken } = require('./middleware/auth');
const router = express.Router();

// Updated Schema to include linktree links
const createrhubUserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  password: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  profileImage: {
    type: String,
  },
  linktreeLinks: [{
    linkName: {
      type: String,
      required: true,
      trim: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create or get existing User model
const CreaterhubUser = mongoose.models.CreaterhubUser || 
  mongoose.model('CreaterhubUser', createrhubUserSchema);

// Authentication Middleware (centralized)
const authMiddleware = authenticateToken;

// GET Profile Route - Updated to include linktree links
router.get('/me', authMiddleware, async (req, res) => {
  try {
    // Find user by ID and select specific fields, including linktree links
    const user = await CreaterhubUser.findById(req.userId).select(
      'name username email profileImage linktreeLinks'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Construct profile response with linktree links
    res.json({
      name: user.name || user.username,
      username: user.username,
      email: user.email || '',
      profileImage: user.profileImage,
      linktreeLinks: user.linktreeLinks || []
    });
  } catch (err) {
    console.error('Profile fetch error:', err);
    res.status(500).json({ 
      error: 'Server error fetching profile',
      details: err.message 
    });
  }
});

// GET Profile by Username Route (Public Access)
router.get('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    
    // Find user by username
    const user = await CreaterhubUser.findOne({ username }).select(
      'name username email profileImage linktreeLinks'
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return public profile data
    res.json({
      name: user.name || user.username,
      username: user.username,
      email: user.email || '',
      profileImage: user.profileImage,
      linktreeLinks: user.linktreeLinks || [],
      socialLinks: [], // Will be populated from separate collection
      products: [], // Will be populated from separate collection
      backgroundColor: '#ffffff',
      accentColor: '#000000',
      textColor: '#000000',
      secondaryColor: '#666666'
    });
  } catch (err) {
    console.error('Public profile fetch error:', err);
    res.status(500).json({ 
      error: 'Server error fetching public profile',
      details: err.message 
    });
  }
});

// CREATE Linktree Link Route
router.post('/linktree', authMiddleware, async (req, res) => {
  try {
    const { linkName } = req.body;
    
    // Validate linkName
    if (!linkName || typeof linkName !== 'string' || linkName.trim() === '') {
      return res.status(400).json({ error: 'Link name is required' });
    }
    
    // Format linkName: remove spaces and special characters
    const formattedLinkName = linkName.trim().toLowerCase().replace(/[^\w-]/g, '-');
    
    // Find the user
    const user = await CreaterhubUser.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if link name already exists for this user
    const linkExists = user.linktreeLinks.some(
      link => link.linkName === formattedLinkName
    );
    
    if (linkExists) {
      return res.status(400).json({ error: 'Link name already exists' });
    }
    
    // Add new linktree link
    user.linktreeLinks.push({ linkName: formattedLinkName });
    await user.save();
    
    res.status(201).json({
      message: 'Linktree link created successfully',
      linktreeLinks: user.linktreeLinks
    });
  } catch (err) {
    console.error('Error creating linktree link:', err);
    res.status(500).json({ error: 'Server error creating linktree link' });
  }
});

// DELETE Linktree Link Route
router.delete('/linktree/:linkId', authMiddleware, async (req, res) => {
  try {
    const { linkId } = req.params;
    
    // Find the user
    const user = await CreaterhubUser.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if link exists
    const linkIndex = user.linktreeLinks.findIndex(
      link => link._id.toString() === linkId
    );
    
    if (linkIndex === -1) {
      return res.status(404).json({ error: 'Linktree link not found' });
    }
    
    // Remove the link
    user.linktreeLinks.splice(linkIndex, 1);
    await user.save();
    
    res.json({
      message: 'Linktree link deleted successfully',
      linktreeLinks: user.linktreeLinks
    });
  } catch (err) {
    console.error('Error deleting linktree link:', err);
    res.status(500).json({ error: 'Server error deleting linktree link' });
  }
});

module.exports = router;