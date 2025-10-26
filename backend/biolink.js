const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const router = express.Router();




// Resolve existing user model from the app (prefer CreaterhubUser)
let UserModel;
if (mongoose.models.CreaterhubUser) {
  UserModel = mongoose.models.CreaterhubUser;
} else if (mongoose.models.User) {
  UserModel = mongoose.models.User;
} else {
  const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    displayName: String,
    avatar: String,
    password: String,
    createdAt: { type: Date, default: Date.now }
  });
  UserModel = mongoose.model('User', userSchema);
}

// BioLink Schema - use a dedicated model name to avoid conflicts with any legacy model loaded elsewhere
let BioLinkModel;
try {
  const collectionName = (mongoose.models.BioLink && mongoose.models.BioLink.collection && mongoose.models.BioLink.collection.name) || 'biolinks';
  const biolinkSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // username is optional for drafts; must be unique only when set/published
    username: { type: String, required: false, index: true, sparse: true, unique: false },
    profile: {
      avatar: String,
      displayName: String,
      tagline: String,
      bio: String
    },
    links: [{
      id: String,
      title: String,
      url: String,
      platform: String,
      icon: String,
      isActive: { type: Boolean, default: true }
    }],
    products: [{
      id: String,
      name: String,
      description: String,
      price: String,
      image: String,
      url: String,
      category: String
    }],
    tickets: [{
      id: String,
      title: String,
      description: String,
      price: Number,
      currency: String,
      event_date: Date,
      event_time: String,
      location: String,
      venue: String,
      total_tickets: Number,
      available_tickets: Number,
      cover_image: String,
      event_type: String,
      is_active: Boolean
    }],
    theme: { type: String, default: 'minimal' },
    elements: {
      type: [mongoose.Schema.Types.Mixed],
      default: []
    },
    settings: {
      backgroundColor: { type: String, default: '#ffffff' },
      textColor: { type: String, default: '#1e1b4b' },
      accentColor: { type: String, default: '#8b5cf6' },
      borderRadius: { type: String, default: '12px' },
      spacing: { type: String, default: '16px' }
    },
    analytics: {
      views: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      lastViewed: Date
    },
    isPublished: { type: Boolean, default: false },
    publishedAt: Date,
    lastModified: { type: Date, default: Date.now }
  }, { timestamps: true, collection: collectionName });

  // Indexes
  biolinkSchema.index({ userId: 1, lastModified: -1 });
  // Enforce uniqueness of username when set; allow multiple nulls/undefined
  biolinkSchema.index({ username: 1 }, { unique: true, sparse: true });
  
  BioLinkModel = mongoose.models.BioLinkFlex || mongoose.model('BioLinkFlex', biolinkSchema);
  // Back-compat alias if any legacy code references BioLink
  const BioLink = BioLinkModel;
} catch (error) {
  // Fallback: ensure BioLink is defined even if re-registration failed for some reason
  BioLinkModel = mongoose.models.BioLinkFlex || mongoose.model('BioLinkFlex', new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    username: { type: String, required: true, unique: true },
    profile: { avatar: String, displayName: String, tagline: String, bio: String },
    links: [{ id: String, title: String, url: String, platform: String, icon: String, isActive: { type: Boolean, default: true } }],
    products: [{ id: String, name: String, description: String, price: String, image: String, url: String, category: String }],
    theme: { type: String, default: 'minimal' },
    elements: { type: [mongoose.Schema.Types.Mixed], default: [] },
    settings: { backgroundColor: { type: String, default: '#ffffff' }, textColor: { type: String, default: '#1e1b4b' }, accentColor: { type: String, default: '#8b5cf6' }, borderRadius: { type: String, default: '12px' }, spacing: { type: String, default: '16px' } },
    analytics: { views: { type: Number, default: 0 }, clicks: { type: Number, default: 0 }, lastViewed: Date },
    isPublished: { type: Boolean, default: false },
    publishedAt: Date,
    lastModified: { type: Date, default: Date.now }
  }, { timestamps: true, collection: 'biolinks' }));
}
// Back-compat alias if any legacy code references BioLink
const BioLink = BioLinkModel;

// Import ticket models
let TicketModel, TicketBookingModel;
try {
  TicketModel = require('./models/Ticket');
  TicketBookingModel = require('./models/TicketBooking');
} catch (error) {
  console.log('Ticket models not found, ticket functionality will be limited');
}

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'public', 'uploads', 'biolinks');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Media upload (images and videos)
const mediaUpload = multer({
  storage: storage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'));
    }
  }
});

// Gallery images upload (multiple images)
const galleryUpload = multer({
  storage: storage,
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB per image
    files: 50 // Allow up to 50 images per upload
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Import centralized auth middleware
const { authenticateToken } = require('./middleware/auth');

// === ONLY SIMPLE STATIC ROUTES ===

// Test route
router.get('/test', (req, res) => {
  res.json({ 
    message: 'Biolinks routes working!', 
    timestamp: new Date().toISOString()
  });
});

// Get user biolink data (supports specific biolink by id, or returns latest + list)
router.get('/data', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.query || {};
    
    const user = await UserModel.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Fetch list for convenience (e.g., multi-biolink UIs)
    const biolinks = await BioLinkModel.find({ userId: userId }).sort({ lastModified: -1, updatedAt: -1 });

    let biolink = null;
    if (id) {
      biolink = await BioLinkModel.findOne({ _id: id, userId: userId });
      if (!biolink) {
        return res.status(404).json({ error: 'BioLink not found' });
      }
    } else {
      // maintain backward compatibility: return latest or create first if none exists
      biolink = biolinks[0] || null;
      if (!biolink) {
        biolink = new BioLink({
          userId: userId,
          username: user.username,
          profile: {
            displayName: user.displayName || user.username,
            tagline: 'Your tagline here',
            bio: ''
          },
          links: [],
          products: [],
          theme: 'minimal',
          elements: [],
          settings: {
            backgroundColor: '#ffffff',
            textColor: '#1e1b4b',
            accentColor: '#8b5cf6',
            borderRadius: '12px',
            spacing: '16px'
          },
          analytics: { views: 0, clicks: 0 }
        });
        await biolink.save();
      }
    }
    
    res.json({ biolink, biolinks, user });
    
  } catch (error) {
    console.error('Error fetching biolink data:', error);
    res.status(500).json({ error: 'Failed to fetch biolink data' });
  }
});

// Get analytics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const biolink = await BioLink.findOne({ userId: userId });
    
    if (!biolink) {
      return res.status(404).json({ error: 'BioLink not found' });
    }
    
    res.json({
      views: biolink.analytics.views, 
      clicks: biolink.analytics.clicks,
      lastViewed: biolink.analytics.lastViewed,
      publishedAt: biolink.publishedAt,
      isPublished: biolink.isPublished
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// === POST ROUTES === 

// Save biolink
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const biolinkData = req.body || {};
    const userId = req.userId;
    
    console.log('Received biolink data:', JSON.stringify(biolinkData, null, 2));
    
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // If a specific id is provided, target that document; otherwise create new
    let biolink = null;
    if (biolinkData._id) {
      // Build update payload
      const updatePayload = {};
      if (biolinkData.username) updatePayload.username = biolinkData.username;
      if (biolinkData.profile) updatePayload.profile = { ...biolinkData.profile };
      if (Array.isArray(biolinkData.links)) updatePayload.links = biolinkData.links;
      if (Array.isArray(biolinkData.products)) updatePayload.products = biolinkData.products;
      if (Array.isArray(biolinkData.elements)) {
        updatePayload.elements = biolinkData.elements.map(element => ({
          id: element.id || `element_${Date.now()}_${Math.random()}`,
          type: element.type || 'text',
          content: element.content || {},
          position: element.position || 0,
          isActive: element.isActive !== false
        }));
      }
      if (biolinkData.theme) updatePayload.theme = biolinkData.theme;
      if (biolinkData.settings) updatePayload.settings = { ...(biolinkData.settings || {}) };
      updatePayload.lastModified = new Date();

      // Atomic update to avoid version conflicts
      biolink = await BioLinkModel.findOneAndUpdate(
        { _id: biolinkData._id, userId: userId },
        { $set: updatePayload },
        { new: true }
      );
      if (!biolink) {
        return res.status(404).json({ error: 'BioLink not found' });
      }
    }
    
    // Normalize elements if received as a JSON string
    if (typeof biolinkData.elements === 'string') {
      try {
        biolinkData.elements = JSON.parse(biolinkData.elements);
      } catch (e) {
        console.warn('elements is string but not valid JSON, ignoring parse');
      }
    }

    if (biolink) {
      // Update existing biolink - ensure elements are properly handled
      if (biolinkData.username) {
        biolink.username = biolinkData.username;
      }
      biolink.profile = { ...biolink.profile, ...biolinkData.profile };
      biolink.links = Array.isArray(biolinkData.links) ? biolinkData.links : biolink.links;
      biolink.products = Array.isArray(biolinkData.products) ? biolinkData.products : biolink.products;
      
      // Ensure elements is an array of objects, not strings
      if (Array.isArray(biolinkData.elements)) {
        biolink.elements = biolinkData.elements.map(element => ({
          id: element.id || `element_${Date.now()}_${Math.random()}`,
          type: element.type || 'text',
          content: element.content || {},
          position: element.position || 0,
          isActive: element.isActive !== false
        }));
      }
      
      biolink.theme = biolinkData.theme || biolink.theme;
      biolink.settings = { ...biolink.settings, ...biolinkData.settings };
      biolink.lastModified = new Date();
    } else {
      // Create new biolink (multi-biolink support)
      const newBiolinkData = {
        userId: userId,
        // username can be set later on publish; drafts may omit it
        username: biolinkData.username,
        profile: biolinkData.profile || {},
        links: Array.isArray(biolinkData.links) ? biolinkData.links : [],
        products: Array.isArray(biolinkData.products) ? biolinkData.products : [],
        elements: Array.isArray(biolinkData.elements) ? biolinkData.elements.map(element => ({
          id: element.id || `element_${Date.now()}_${Math.random()}`,
          type: element.type || 'text',
          content: element.content || {},
          position: element.position || 0,
          isActive: element.isActive !== false
        })) : [],
        theme: biolinkData.theme || 'minimal',
        settings: biolinkData.settings || {}
      };
      
      biolink = new BioLinkModel(newBiolinkData);
    }
    
    // If created new above, save it once; updates already persisted via findOneAndUpdate
    if (biolink.isNew) {
      console.log('Saving new biolink with elements:', biolink.elements);
      await biolink.save();
    }
    res.json({ success: true, biolink });
    
  } catch (error) {
    console.error('Error saving biolink:', error);
    res.status(500).json({ error: 'Failed to save biolink', details: error.message });
  }
});

// Publish biolink
router.post('/publish', authenticateToken, async (req, res) => {
  try {
    const { username, id } = req.body || {};
    const userId = req.userId;
    
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const targetUsername = username || user.username;
    
    // Check availability: username must be unique across ALL biolinks except the one being published
    const excludeId = id ? new mongoose.Types.ObjectId(id) : null;
    const existingBiolink = await BioLinkModel.findOne({ 
      username: targetUsername,
      ...(excludeId ? { _id: { $ne: excludeId } } : {})
    });
    
    if (existingBiolink) {
      return res.status(400).json({ error: 'Username already taken' });
    }
    
    let biolink;
    if (id) {
      biolink = await BioLinkModel.findOne({ _id: id, userId: userId });
    }
    if (!biolink) {
      biolink = await BioLinkModel.findOne({ userId: userId }).sort({ lastModified: -1 });
    }
    
    if (biolink) {
      biolink.username = targetUsername;
      biolink.isPublished = true;
      biolink.publishedAt = new Date();
      biolink.lastModified = new Date();
    } else {
      biolink = new BioLink({
        userId: userId,
        username: targetUsername,
        profile: {
          displayName: user.displayName || user.username,
          tagline: 'Your tagline here',
          bio: ''
        },
        links: [],
        products: [],
        theme: 'minimal',
        elements: [],
        settings: {
          backgroundColor: '#ffffff',
          textColor: '#1e1b4b',
          accentColor: '#8b5cf6',
          borderRadius: '12px',
          spacing: '16px'
        },
        isPublished: true,
        publishedAt: new Date()
      });
    }
    
    await biolink.save();
    res.json({ 
      success: true, 
      biolink,
      url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/p/${targetUsername}`
    });
    
  } catch (error) {
    console.error('Error publishing biolink:', error);
    res.status(500).json({ error: 'Failed to publish biolink' });
  }
});

// Upload avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const userId = req.userId;
    const { id } = req.body || {};
    let biolink = null;
    if (id) {
      biolink = await BioLinkModel.findOne({ _id: id, userId: userId });
    }
    if (!biolink) {
      biolink = await BioLinkModel.findOne({ userId: userId }).sort({ lastModified: -1 });
    }
    if (!biolink) {
      return res.status(404).json({ error: 'BioLink not found' });
    }
    
    biolink.profile.avatar = `/uploads/biolinks/${req.file.filename}`;
    biolink.lastModified = new Date();
    await biolink.save();
    
    res.json({ 
      success: true, 
      avatarUrl: `/uploads/biolinks/${req.file.filename}`
    });
  } catch (error) {
    console.error('Error uploading avatar:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Upload product image
router.post('/product-image', authenticateToken, upload.single('productImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({ 
      success: true, 
      imageUrl: `/uploads/biolinks/${req.file.filename}`
    });
  } catch (error) {
    console.error('Error uploading product image:', error);
    res.status(500).json({ error: 'Failed to upload product image' });
  }
});

// Upload video (for video elements)
router.post('/video', authenticateToken, mediaUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // We don't persist the URL into the model here; the client will attach
    // this URL to a specific element and save via /save
    const videoUrl = `/uploads/biolinks/${req.file.filename}`;
    res.json({ success: true, videoUrl });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ error: 'Failed to upload video' });
  }
});

// Track click
router.post('/click', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const biolink = await BioLinkModel.findOne({ 
      username: username,
      isPublished: true
    });
    
    if (!biolink) {
      return res.status(404).json({ error: 'BioLink not found' });
    }
    
    biolink.analytics.clicks += 1;
    await biolink.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ error: 'Failed to track click' });
  }
});

// Check username availability
router.post('/check', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const existingBiolink = await BioLinkModel.findOne({ username: username });
    res.json({ available: !existingBiolink, username });
  } catch (error) {
    console.error('Error checking username:', error);
    res.status(500).json({ error: 'Failed to check username', available: false });
  }
});

// Get public biolink
router.post('/view', async (req, res) => {
  try {
    const { username } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const biolink = await BioLinkModel.findOne({ 
      username: username,
      isPublished: true
    });
    
    if (!biolink) {
      return res.status(404).json({ error: 'BioLink not found' });
    }
    
    // Update view count
    biolink.analytics.views += 1;
    biolink.analytics.lastViewed = new Date();
    await biolink.save();
    
    res.json({ biolink });
  } catch (error) {
    console.error('Error fetching public biolink:', error);
    res.status(500).json({ error: 'Failed to fetch biolink' });
  }
});

// Public biolink (GET) for viewing by username
router.get('/public/:username', async (req, res) => {
  try {
    const { username } = req.params;

    const biolink = await BioLinkModel.findOne({ 
      username: username,
      isPublished: true
    });

    if (!biolink) {
      return res.status(404).json({ error: 'BioLink not found' });
    }

    // Update view count
    biolink.analytics.views += 1;
    biolink.analytics.lastViewed = new Date();
    await biolink.save();

    res.json({ biolink });
  } catch (error) {
    console.error('Error fetching public biolink:', error);
    res.status(500).json({ error: 'Failed to fetch biolink' });
  }
});

// === DELETE ROUTES ===

// Delete biolink
router.delete('/remove', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.body || {};
    const query = id ? { _id: id, userId } : { userId };
    const result = await BioLinkModel.findOneAndDelete(query);
    
    if (!result) {
      return res.status(404).json({ error: 'BioLink not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting biolink:', error);
    res.status(500).json({ error: 'Failed to delete biolink' });
  }
});

// Migration function to fix existing biolinks with incorrect element schemas
const migrateBiolinkElements = async () => {
  try {
    const biolinks = await BioLinkModel.find({});
    for (const biolink of biolinks) {
      if (biolink.elements && biolink.elements.length > 0) {
        let needsUpdate = false;
        const migratedElements = biolink.elements.map(element => {
          // If element is a string, convert it to proper object format
          if (typeof element === 'string') {
            needsUpdate = true;
            return {
              id: `element_${Date.now()}_${Math.random()}`,
              type: 'text',
              content: { content: element },
              position: 0,
              isActive: true
            };
          }
          // If element is already an object but missing required fields
          if (typeof element === 'object' && element !== null) {
            const hasRequiredFields = element.id && element.type && element.content;
            if (!hasRequiredFields) {
              needsUpdate = true;
              return {
                id: element.id || `element_${Date.now()}_${Math.random()}`,
                type: element.type || 'text',
                content: element.content || {},
                position: element.position || 0,
                isActive: element.isActive !== false
              };
            }
          }
          return element;
        });
        
        if (needsUpdate) {
          biolink.elements = migratedElements;
          await biolink.save();
          console.log(`Migrated biolink ${biolink.username} elements`);
        }
      }
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
};

// Gallery images upload endpoint
router.post('/gallery/upload', authenticateToken, galleryUpload.array('images', 50), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const imageUrls = req.files.map(file => `/uploads/biolinks/${file.filename}`);
    
    res.json({
      success: true,
      images: imageUrls,
      count: imageUrls.length
    });
  } catch (error) {
    console.error('Error uploading gallery images:', error);
    res.status(500).json({ error: 'Failed to upload gallery images' });
  }
});

// === TICKET ROUTES ===

// Create ticket
router.post('/tickets/create', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const ticketData = req.body;
    
    if (!TicketModel) {
      return res.status(500).json({ error: 'Ticket functionality not available' });
    }
    
    // Get user's biolink
    const biolink = await BioLinkModel.findOne({ userId: userId }).sort({ lastModified: -1 });
    if (!biolink) {
      return res.status(404).json({ error: 'BioLink not found' });
    }
    
    // Create ticket
    const ticket = new TicketModel({
      creator_id: userId,
      biolink_id: biolink._id,
      title: ticketData.title,
      description: ticketData.description,
      event_type: ticketData.event_type || 'concert',
      event_date: new Date(ticketData.event_date),
      event_time: ticketData.event_time,
      location: ticketData.location,
      venue: ticketData.venue,
      price: ticketData.price,
      currency: ticketData.currency || 'INR',
      total_tickets: ticketData.total_tickets,
      available_tickets: ticketData.total_tickets,
      cover_image: ticketData.cover_image,
      terms_conditions: ticketData.terms_conditions,
      status: 'published'
    });
    
    await ticket.save();
    
    // Add ticket to biolink
    const ticketElement = {
      id: `ticket_${ticket._id}`,
      title: ticket.title,
      description: ticket.description,
      price: ticket.price,
      currency: ticket.currency,
      event_date: ticket.event_date,
      event_time: ticket.event_time,
      location: ticket.location,
      venue: ticket.venue,
      total_tickets: ticket.total_tickets,
      available_tickets: ticket.available_tickets,
      cover_image: ticket.cover_image,
      event_type: ticket.event_type,
      is_active: ticket.is_active,
      ticket_id: ticket._id
    };
    
    biolink.tickets.push(ticketElement);
    biolink.lastModified = new Date();
    await biolink.save();
    
    res.json({ success: true, ticket, ticketElement });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
});

// Get tickets for biolink
router.get('/tickets', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    if (!TicketModel) {
      return res.status(500).json({ error: 'Ticket functionality not available' });
    }
    
    const tickets = await TicketModel.find({ creator_id: userId })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ tickets });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
});

// Get public ticket details
router.get('/tickets/:ticketId', async (req, res) => {
  try {
    const { ticketId } = req.params;
    
    if (!TicketModel) {
      return res.status(500).json({ error: 'Ticket functionality not available' });
    }
    
    const ticket = await TicketModel.findById(ticketId).lean();
    if (!ticket || !ticket.is_active || ticket.status !== 'published') {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    res.json({ ticket });
  } catch (error) {
    console.error('Error fetching ticket:', error);
    res.status(500).json({ error: 'Failed to fetch ticket' });
  }
});

// Book ticket
router.post('/tickets/:ticketId/book', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const bookingData = req.body;
    
    if (!TicketModel || !TicketBookingModel) {
      return res.status(500).json({ error: 'Ticket booking functionality not available' });
    }
    
    // Get ticket
    const ticket = await TicketModel.findById(ticketId);
    if (!ticket || !ticket.is_active || ticket.status !== 'published') {
      return res.status(404).json({ error: 'Ticket not found' });
    }
    
    // Check availability
    if (ticket.available_tickets < bookingData.quantity) {
      return res.status(400).json({ error: 'Not enough tickets available' });
    }
    
    // Generate booking ID
    const bookingId = `TKT${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // Create booking
    const booking = new TicketBookingModel({
      ticket_id: ticketId,
      customer_name: bookingData.customer_name,
      customer_email: bookingData.customer_email,
      customer_phone: bookingData.customer_phone,
      booking_id: bookingId,
      quantity: bookingData.quantity,
      unit_price: ticket.price,
      total_amount: ticket.price * bookingData.quantity,
      currency: ticket.currency,
      special_requirements: bookingData.special_requirements
    });
    
    await booking.save();
    
    // Update ticket availability
    ticket.available_tickets -= bookingData.quantity;
    ticket.sold_tickets += bookingData.quantity;
    ticket.analytics.bookings += 1;
    ticket.analytics.revenue += booking.total_amount;
    await ticket.save();
    
    // Update biolink ticket data
    const biolink = await BioLinkModel.findById(ticket.biolink_id);
    if (biolink) {
      const ticketIndex = biolink.tickets.findIndex(t => t.ticket_id === ticketId);
      if (ticketIndex !== -1) {
        biolink.tickets[ticketIndex].available_tickets = ticket.available_tickets;
        biolink.tickets[ticketIndex].sold_tickets = ticket.sold_tickets;
        await biolink.save();
      }
    }
    
    res.json({ 
      success: true, 
      booking: {
        booking_id: booking.booking_id,
        total_amount: booking.total_amount,
        currency: booking.currency,
        quantity: booking.quantity,
        customer_name: booking.customer_name,
        customer_email: booking.customer_email
      }
    });
  } catch (error) {
    console.error('Error booking ticket:', error);
    res.status(500).json({ error: 'Failed to book ticket' });
  }
});

// Create payment order (Cashfree)
router.post('/tickets/:ticketId/payment/create', async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { booking_id, customer_details } = req.body;
    
    if (!TicketBookingModel) {
      return res.status(500).json({ error: 'Payment functionality not available' });
    }
    
    // Get booking
    const booking = await TicketBookingModel.findOne({ 
      ticket_id: ticketId, 
      booking_id: booking_id 
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Generate Cashfree order ID
    const cashfreeOrderId = `CF_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    // Update booking with payment details
    booking.cashfree_order_id = cashfreeOrderId;
    booking.customer_name = customer_details.name;
    booking.customer_email = customer_details.email;
    booking.customer_phone = customer_details.phone;
    await booking.save();
    
    // Prepare Cashfree payment request
    const paymentData = {
      order_id: cashfreeOrderId,
      order_amount: booking.total_amount,
      order_currency: booking.currency,
      customer_details: {
        customer_id: customer_details.email,
        customer_name: customer_details.name,
        customer_email: customer_details.email,
        customer_phone: customer_details.phone
      },
      order_meta: {
        return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success`,
        notify_url: `${process.env.BACKEND_URL || 'http://localhost:3000'}/api/biolink/tickets/payment/webhook`
      }
    };
    
    res.json({
      success: true,
      payment_data: paymentData,
      booking_id: booking.booking_id
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Failed to create payment' });
  }
});

// Payment webhook (Cashfree)
router.post('/tickets/payment/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    
    if (!TicketBookingModel) {
      return res.status(500).json({ error: 'Payment functionality not available' });
    }
    
    // Verify webhook signature (implement Cashfree signature verification)
    // For now, we'll trust the webhook data
    
    const { order_id, payment_status, payment_id } = webhookData;
    
    // Find booking by Cashfree order ID
    const booking = await TicketBookingModel.findOne({ 
      cashfree_order_id: order_id 
    });
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Update booking status
    if (payment_status === 'SUCCESS') {
      booking.payment_status = 'paid';
      booking.payment_id = payment_id;
      booking.cashfree_payment_id = payment_id;
      booking.payment_date = new Date();
      booking.booking_status = 'confirmed';
      
      // Generate QR code for entry
      booking.qr_code = `QR_${booking.booking_id}_${Date.now()}`;
    } else {
      booking.payment_status = 'failed';
      booking.booking_status = 'cancelled';
    }
    
    await booking.save();
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

// Get booking details
router.get('/tickets/booking/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    
    if (!TicketBookingModel) {
      return res.status(500).json({ error: 'Booking functionality not available' });
    }
    
    const booking = await TicketBookingModel.findOne({ booking_id: bookingId })
      .populate('ticket_id', 'title event_date event_time location venue')
      .lean();
    
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json({ booking });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Clean up problematic indexes on startup
const cleanupIndexes = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const collection = mongoose.connection.db.collection('biolinks');
      const indexes = await collection.indexes();
      
      // Check for problematic slug index
      const slugIndex = indexes.find(index => index.key && index.key.slug);
      if (slugIndex) {
        await collection.dropIndex('slug_1');
        console.log('✅ Dropped problematic slug index');
      }

      // Ensure unique sparse username index exists
      const usernameIndex = indexes.find(index => index.key && index.key.username);
      if (!usernameIndex || !usernameIndex.unique) {
        try {
          // Attempt to create unique sparse index; may fail if duplicates exist
          await collection.createIndex({ username: 1 }, { unique: true, sparse: true, name: 'username_1' });
          console.log('✅ Ensured unique sparse index on username');
        } catch (e) {
          console.log('ℹ️ Could not create unique username index yet (possibly due to duplicates). Will attempt after cleanup.');
        }
      }
    }
  } catch (error) {
    console.log('ℹ️ No problematic indexes to clean up');
  }
};

// Deduplicate biolinks that share the same username (keep most recently updated)
const dedupeBiolinksByUsername = async () => {
  try {
    if (mongoose.connection.readyState !== 1) return;
    const duplicates = await BioLinkModel.aggregate([
      { $match: { username: { $ne: null } } },
      { $group: { _id: '$username', ids: { $push: { _id: '$_id', updatedAt: '$updatedAt', lastModified: '$lastModified' } }, count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } }
    ]);
    for (const dup of duplicates) {
      const sorted = dup.ids.sort((a, b) => new Date(b.lastModified || b.updatedAt || 0) - new Date(a.lastModified || a.updatedAt || 0));
      const keep = sorted[0]?._id;
      const removeIds = sorted.slice(1).map(x => x._id);
      if (removeIds.length) {
        await BioLinkModel.deleteMany({ _id: { $in: removeIds } });
        console.log(`🧹 Removed ${removeIds.length} duplicate biolinks for username '${dup._id}', kept ${keep}`);
      }
    }
    // After cleanup, ensure unique index
    try {
      await mongoose.connection.db.collection('biolinks').createIndex({ username: 1 }, { unique: true, sparse: true, name: 'username_1' });
    } catch (e) {
      console.log('ℹ️ Username unique index creation skipped or already exists');
    }
  } catch (e) {
    console.error('Error during biolink deduplication:', e);
  }
};

// Run cleanup and migration on startup
setTimeout(async () => {
  await cleanupIndexes();
  await migrateBiolinkElements();
  await dedupeBiolinksByUsername();
}, 1000);

console.log('🔧 Simple BioLink router initialized');
module.exports = router;