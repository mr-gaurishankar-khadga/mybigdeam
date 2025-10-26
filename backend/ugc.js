const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Import models
const UGCContent = require('./models/UGCContent');
const UGCComment = require('./models/UGCComment');
const UGCLike = require('./models/UGCLike');
const User = require('./models/User');

// Import centralized auth middleware
const { authenticateToken } = require('./middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'public', 'uploads', 'ugc');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit to keep uploads fast
  },
  fileFilter: (req, file, cb) => {
    console.log('File filter - Original name:', file.originalname);
    console.log('File filter - MIME type:', file.mimetype);
    
    const allowedTypes = /jpeg|jpg|png|gif|mp4|avi|mov|txt|md/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      console.log('File filter - Accepted');
      return cb(null, true);
    } else {
      console.log('File filter - Rejected');
      cb(new Error('Invalid file type. Only images, videos, and text files are allowed.'));
    }
  }
});

// Helper function to get content with filters
async function getContent(query = {}, options = {}) {
  const {
    sort = 'createdAt',
    order = 'desc',
    limit = 20,
    page = 1,
    userId
  } = options;

  // Build MongoDB query
  let mongoQuery = { isActive: true };
  
  if (query.type && query.type !== 'all') {
    mongoQuery.type = query.type;
  }
  
  if (query.user === 'me' && userId) {
    mongoQuery.userId = userId;
  }
  
  if (query.liked === 'true' || query.liked === true) {
    mongoQuery.likes = { $gte: 20 };
  }

  // Apply sorting
  const sortObj = {};
  sortObj[sort] = order === 'desc' ? -1 : 1;

  // Apply pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const content = await UGCContent.find(mongoQuery)
      .populate('userId', 'name username profileImage')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    return content;
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
}

// Routes

// Get all UGC content
router.get('/ugc', async (req, res) => {
  try {
    const { sort = 'createdAt', order = 'desc', type, user, liked, limit = 20, page = 1 } = req.query;
    
    const query = { type, user, liked };
    const options = { sort, order, limit, page };
    
    const content = await getContent(query, options);
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching UGC content:', error);
    res.status(500).json({ error: 'Failed to fetch UGC content' });
  }
});

// Get trending UGC content
router.get('/ugc/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const content = await UGCContent.find({ isActive: true })
      .populate('userId', 'name username profileImage')
      .sort({ likes: -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching trending content:', error);
    res.status(500).json({ error: 'Failed to fetch trending content' });
  }
});

// Search UGC content
router.get('/ugc/search', async (req, res) => {
  try {
    const { q, type, limit = 20 } = req.query;
    
    if (!q) {
      return res.json([]);
    }
    
    let query = { 
      isActive: true,
      $text: { $search: q }
    };
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    const content = await UGCContent.find(query)
      .populate('userId', 'name username profileImage')
      .limit(parseInt(limit))
      .lean();
    
    res.json(content);
  } catch (error) {
    console.error('Error searching content:', error);
    res.status(500).json({ error: 'Failed to search content' });
  }
});

// Get analytics
router.get('/ugc/analytics', authenticateToken, async (req, res) => {
  try {
    const { timeframe = '7d' } = req.query;
    const userId = req.userId;
    
    const now = new Date();
    const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 1;
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const analytics = await UGCContent.aggregate([
      {
        $match: {
          isActive: true,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalContent: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: '$likes' },
          totalComments: { $sum: '$comments' }
        }
      }
    ]);
    
    const result = analytics[0] || {
      totalContent: 0,
      totalViews: 0,
      totalLikes: 0,
      totalComments: 0
    };
    
    res.json({
      ...result,
      timeframe
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get single UGC content
router.get('/ugc/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const content = await UGCContent.findById(id)
      .populate('userId', 'name username profileImage')
      .lean();
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.json(content);
  } catch (error) {
    console.error('Error fetching UGC content:', error);
    res.status(500).json({ error: 'Failed to fetch UGC content' });
  }
});

// Create new UGC content
router.post('/ugc', authenticateToken, async (req, res) => {
  try {
    console.log('UGC Create - User ID:', req.userId);
    console.log('UGC Create - Body:', JSON.stringify(req.body, null, 2));
    
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      console.log('UGC Create - Database not connected');
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    if (!UGCContent) {
      console.log('UGC Create - UGCContent model not found');
      return res.status(500).json({ error: 'UGCContent model not available' });
    }
    
    // Drop the problematic id index if it exists
    try {
      await UGCContent.collection.dropIndex('id_1');
      console.log('UGC Create - Dropped problematic id_1 index');
    } catch (err) {
      console.log('UGC Create - Index id_1 does not exist or already dropped');
    }
    
    const {
      title = '',
      description = '',
      type = '',
      media_url = '',
      content_text = '',
      tags = []
    } = req.body || {};

    const userId = req.userId;
    console.log('UGC Create - Parsed data:', { title, type, media_url, userId });

    // Basic validation
    if (!title || typeof title !== 'string') {
      console.log('UGC Create - Title validation failed');
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!type || !['image', 'video', 'text', 'audio', 'document'].includes(type)) {
      console.log('UGC Create - Type validation failed:', type);
      return res.status(400).json({ error: 'Invalid content type' });
    }
    if ((type === 'image' || type === 'video') && !media_url) {
      console.log('UGC Create - Media URL validation failed');
      return res.status(400).json({ error: 'Media URL is required for image/video' });
    }

    // Coerce tags to array of strings
    let normalizedTags = tags;
    if (typeof normalizedTags === 'string') {
      normalizedTags = normalizedTags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
    }
    if (!Array.isArray(normalizedTags)) {
      normalizedTags = [];
    }

    console.log('UGC Create - Creating document with:', {
      userId,
      title,
      description,
      type,
      mediaUrl: media_url || undefined,
      contentText: content_text || undefined,
      tags: normalizedTags
    });

    const newContent = await UGCContent.create({
      userId,
      title,
      description,
      type,
      mediaUrl: media_url || undefined,
      contentText: content_text || undefined,
      tags: normalizedTags
    });

    console.log('UGC Create - Document created:', newContent._id);
    await newContent.populate('userId', 'name username profileImage');
    console.log('UGC Create - Document populated');

    res.status(201).json(newContent);
  } catch (error) {
    console.error('UGC Create - Full error:', error);
    console.error('UGC Create - Error name:', error.name);
    console.error('UGC Create - Error message:', error.message);
    console.error('UGC Create - Error stack:', error.stack);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed', details: error.message });
    }
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid data format', details: error.message });
    }
    res.status(500).json({ error: 'Failed to create content', details: error.message });
  }
});

// Update UGC content
router.put('/ugc/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.userId;
    
    const content = await UGCContent.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'name username profileImage');
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.json(content);
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({ error: 'Failed to update content' });
  }
});

// Delete UGC content
router.delete('/ugc/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const content = await UGCContent.findOneAndUpdate(
      { _id: id, userId },
      { isActive: false },
      { new: true }
    );
    
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    res.json({ message: 'Content deleted successfully' });
  } catch (error) {
    console.error('Error deleting content:', error);
    res.status(500).json({ error: 'Failed to delete content' });
  }
});

// Toggle like
router.post('/ugc/:id/like', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const content = await UGCContent.findById(id);
    if (!content) {
      return res.status(404).json({ error: 'Content not found' });
    }
    
    const existingLike = await UGCLike.findOne({ contentId: id, userId });
    
    if (existingLike) {
      await UGCLike.findByIdAndDelete(existingLike._id);
      content.likes = Math.max(0, content.likes - 1);
      await content.save();
      
      res.json({ 
        likes: content.likes,
        liked: false 
      });
    } else {
      await UGCLike.create({ contentId: id, userId });
      content.likes += 1;
      await content.save();
      
      res.json({ 
        likes: content.likes,
        liked: true 
      });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
});

// Report content
router.post('/ugc/:id/report', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    console.log(`Content ${id} reported for: ${reason}`);
    res.json({ message: 'Content reported successfully' });
  } catch (error) {
    console.error('Error reporting content:', error);
    res.status(500).json({ error: 'Failed to report content' });
  }
});

// Test upload endpoint (no auth for debugging)
router.post('/ugc/upload-test', upload.single('media'), (req, res) => {
  try {
    console.log('Test Upload - File:', req.file);
    console.log('Test Upload - Body:', req.body);
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/ugc/${req.file.filename}`;
    res.json({ url: fileUrl, filename: req.file.filename });
  } catch (error) {
    console.error('Test Upload Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test UGC creation endpoint (no auth for debugging)
router.post('/ugc/test', async (req, res) => {
  try {
    console.log('UGC Test - Body:', JSON.stringify(req.body, null, 2));
    
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    if (!UGCContent) {
      return res.status(500).json({ error: 'UGCContent model not available' });
    }
    
    const testData = {
      userId: new mongoose.Types.ObjectId(), // Dummy user ID
      title: 'Test Content',
      description: 'Test description',
      type: 'text',
      contentText: 'Test content text',
      tags: ['test']
    };
    
    console.log('UGC Test - Creating with:', testData);
    const newContent = await UGCContent.create(testData);
    console.log('UGC Test - Created:', newContent._id);
    
    res.json({ success: true, id: newContent._id });
  } catch (error) {
    console.error('UGC Test Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Test UGC creation with real data (no auth for debugging)
router.post('/ugc/test-real', async (req, res) => {
  try {
    console.log('UGC Test Real - Body:', JSON.stringify(req.body, null, 2));
    
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database not connected' });
    }
    
    if (!UGCContent) {
      return res.status(500).json({ error: 'UGCContent model not available' });
    }
    
    // Drop the problematic id index if it exists
    try {
      await UGCContent.collection.dropIndex('id_1');
      console.log('Dropped problematic id_1 index');
    } catch (err) {
      console.log('Index id_1 does not exist or already dropped');
    }
    
    const {
      title = '',
      description = '',
      type = '',
      media_url = '',
      content_text = '',
      tags = []
    } = req.body || {};

    // Basic validation
    if (!title || typeof title !== 'string') {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (!type || !['image', 'video', 'text', 'audio', 'document'].includes(type)) {
      return res.status(400).json({ error: 'Invalid content type' });
    }
    if ((type === 'image' || type === 'video') && !media_url) {
      return res.status(400).json({ error: 'Media URL is required for image/video' });
    }

    // Coerce tags to array of strings
    let normalizedTags = tags;
    if (typeof normalizedTags === 'string') {
      normalizedTags = normalizedTags
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);
    }
    if (!Array.isArray(normalizedTags)) {
      normalizedTags = [];
    }

    const testData = {
      userId: new mongoose.Types.ObjectId(), // Dummy user ID
      title,
      description,
      type,
      mediaUrl: media_url || undefined,
      contentText: content_text || undefined,
      tags: normalizedTags
    };
    
    console.log('UGC Test Real - Creating with:', testData);
    const newContent = await UGCContent.create(testData);
    console.log('UGC Test Real - Created:', newContent._id);
    
    res.json({ success: true, id: newContent._id, data: newContent });
  } catch (error) {
    console.error('UGC Test Real Error:', error);
    console.error('UGC Test Real Error Details:', error.message);
    console.error('UGC Test Real Error Stack:', error.stack);
    res.status(500).json({ error: error.message, details: error.stack });
  }
});

// Upload media
router.post('/ugc/upload', authenticateToken, (req, res, next) => {
  upload.single('media')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ error: 'Upload error', details: err.message });
      }
      return res.status(400).json({ error: err.message || 'Upload error' });
    }
    next();
  });
}, (req, res) => {
  try {
    console.log('UGC Upload - User ID:', req.userId);
    console.log('UGC Upload - File:', req.file);
    console.log('UGC Upload - Body:', req.body);
    
    if (!req.file) {
      console.log('UGC Upload - No file received');
      return res.status(400).json({ 
        error: 'No file uploaded',
        details: 'Please select a file to upload'
      });
    }
    
    const fileUrl = `/uploads/ugc/${req.file.filename}`;
    
    console.log('UGC Upload - Success:', fileUrl);
    res.json({
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('UGC Upload Error:', error);
    res.status(500).json({ 
      error: 'Failed to upload file',
      details: error.message 
    });
  }
});

// Handle multer errors
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error('Multer Error:', error);
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'File too large',
        details: 'Maximum file size is 50MB'
      });
    }
    return res.status(400).json({ 
      error: 'Upload error',
      details: error.message 
    });
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({ 
      error: 'Invalid file type',
      details: 'Only images, videos, and text files are allowed'
    });
  }
  
  console.error('UGC Upload Middleware Error:', error);
  res.status(500).json({ 
    error: 'Upload failed',
    details: error.message 
  });
});

// Get user's UGC content
router.get('/ugc/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const userContent = await UGCContent.find({ userId, isActive: true })
      .populate('userId', 'name username profileImage')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(userContent);
  } catch (error) {
    console.error('Error fetching user UGC:', error);
    res.status(500).json({ error: 'Failed to fetch user UGC' });
  }
});

// Follow/Unfollow user
router.post('/ugc/follow/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    res.json({ message: 'Follow toggled successfully', userId });
  } catch (error) {
    console.error('Error toggling follow:', error);
    res.status(500).json({ error: 'Failed to toggle follow' });
  }
});

// Get comments for UGC content
router.get('/ugc/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    
    const comments = await UGCComment.find({ contentId: id, isActive: true })
      .populate('userId', 'name username profileImage')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add comment to UGC content
router.post('/ugc/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.userId;
    
    const newComment = await UGCComment.create({
      contentId: id,
      userId,
      text
    });
    
    await newComment.populate('userId', 'name username profileImage');
    
    // Update comment count
    await UGCContent.findByIdAndUpdate(id, {
      $inc: { comments: 1 }
    });
    
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large' });
    }
  }
  
  res.status(500).json({ error: error.message || 'Internal server error' });
});

module.exports = router;