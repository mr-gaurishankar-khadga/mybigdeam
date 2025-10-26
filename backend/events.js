const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Import models
const Event = require('./models/Event');
const EventRegistration = require('./models/EventRegistration');
const mongoose = require('mongoose');

// Import centralized auth middleware
const { authenticateToken } = require('./middleware/auth');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'public', 'uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Helper function to get events with filters
async function getEvents(query = {}, options = {}) {
  const {
    sort = 'createdAt',
    order = 'desc',
    limit = 20,
    page = 1
  } = options;

  // Build MongoDB query
  let mongoQuery = {};
  
  if (query.status) {
    mongoQuery.status = query.status;
  }
  
  if (query.organizer) {
    mongoQuery.organizer = query.organizer;
  }

  // Apply sorting
  const sortObj = {};
  sortObj[sort] = order === 'desc' ? -1 : 1;

  // Apply pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  try {
    const events = await Event.find(mongoQuery)
      .populate('userId', 'name username profileImage')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    return events;
  } catch (error) {
    console.error('Database error:', error);
    return [];
  }
}

// Routes

// Get upcoming events
router.get('/events/upcoming', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const now = new Date();
    
    const upcomingEvents = await Event.find({
      date: { $gt: now },
      status: 'published'
    })
      .populate('userId', 'name username profileImage')
      .sort({ date: 1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json(upcomingEvents);
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    res.status(500).json({ error: 'Failed to fetch upcoming events' });
  }
});

// Get past events
router.get('/events/past', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const now = new Date();
    
    const pastEvents = await Event.find({
      date: { $lt: now },
      status: 'published'
    })
      .populate('userId', 'name username profileImage')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .lean();
    
    res.json(pastEvents);
  } catch (error) {
    console.error('Error fetching past events:', error);
    res.status(500).json({ error: 'Failed to fetch past events' });
  }
});

// Search events
router.get('/events/search', async (req, res) => {
  try {
    const { q, status, limit = 20 } = req.query;
    
    if (!q) {
      return res.json([]);
    }
    
    let query = { 
      $text: { $search: q },
      status: 'published'
    };
    
    if (status) {
      query.status = status;
    }
    
    const events = await Event.find(query)
      .populate('userId', 'name username profileImage')
      .limit(parseInt(limit))
      .lean();
    
    res.json(events);
  } catch (error) {
    console.error('Error searching events:', error);
    res.status(500).json({ error: 'Failed to search events' });
  }
});

// Get user's registered events
router.get('/events/my-registrations', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    
    const registrations = await EventRegistration.find({ userId })
      .populate('eventId')
      .sort({ createdAt: -1 })
      .lean();
    
    const userEvents = registrations.map(reg => reg.eventId).filter(Boolean);
    
    res.json(userEvents);
  } catch (error) {
    console.error('Error fetching user registrations:', error);
    res.status(500).json({ error: 'Failed to fetch user registrations' });
  }
});

// Get analytics
router.get('/events/analytics', authenticateToken, async (req, res) => {
  try {
    const userId = req.userId;
    const mongoose = require('mongoose');
    if (!mongoose.isValidObjectId(userId)) {
      return res.json({ totalEvents: 0, totalRegistrations: 0, averageAttendees: 0 });
    }

    const analytics = await Event.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          totalRegistrations: { $sum: '$attendees' },
          averageAttendees: { $avg: '$attendees' }
        }
      }
    ]);
    
    const result = analytics[0] || {
      totalEvents: 0,
      totalRegistrations: 0,
      averageAttendees: 0
    };
    
    res.json(result);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// Get all events
router.get('/events', async (req, res) => {
  try {
    const { status, organizer, limit = 20, page = 1, featured } = req.query;
    
    const query = { status: status || 'published' };
    
    if (organizer) {
      query.organizer = organizer;
    }
    
    const events = await getEvents(query, { limit, page });
    
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event
router.get('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const event = await Event.findById(id)
      .populate('userId', 'name username profileImage')
      .lean();
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create new event
router.post('/events', authenticateToken, async (req, res) => {
  try {
    // Drop the problematic id index if it exists
    try {
      await Event.collection.dropIndex('id_1');
      console.log('Events - Dropped problematic id_1 index');
    } catch (err) {
      console.log('Events - Index id_1 does not exist or already dropped');
    }
    
    const { 
      title, 
      description, 
      date, 
      start_date,
      end_date,
      time, 
      location, 
      organizer, 
      max_attendees, 
      image_url,
      cover_image,
      category,
      tags,
      price,
      currency,
      isOnline,
      onlineLink,
      online_link,
      requirements
    } = req.body;
    const userId = req.userId;
    
    // Handle date field - use start_date if date is not provided
    const eventDate = date || start_date;
    
    // Handle organizer - use a default if not provided
    const eventOrganizer = organizer || 'Event Organizer';
    
    // Handle requirements - convert array to string if needed
    let requirementsString = '';
    if (Array.isArray(requirements)) {
      requirementsString = requirements.join(', ');
    } else if (typeof requirements === 'string') {
      requirementsString = requirements;
    }
    
    // Handle online link
    const onlineUrl = onlineLink || online_link;
    
    // Handle image URL
    const imageUrl = image_url || cover_image;

    const newEvent = await Event.create({
      userId,
      title,
      description,
      date: eventDate,
      time,
      location,
      organizer: eventOrganizer,
      maxAttendees: max_attendees,
      imageUrl,
      category,
      tags,
      price: price || 0,
      currency: currency || 'USD',
      isOnline: isOnline || false,
      onlineLink: onlineUrl,
      requirements: requirementsString
    });
    
    await newEvent.populate('userId', 'name username profileImage');
    
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event
router.put('/events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.userId;
    
    const event = await Event.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    ).populate('userId', 'name username profileImage');
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json(event);
  } catch (error) {
    console.error('Error updating event:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event
router.delete('/events/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    const event = await Event.findOneAndUpdate(
      { _id: id, userId },
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

// Register for event
router.post('/events/:id/register', async (req, res) => {
  try {
    // Drop the problematic id index if it exists
    try {
      await EventRegistration.collection.dropIndex('id_1');
      console.log('EventRegistration - Dropped problematic id_1 index');
    } catch (err) {
      console.log('EventRegistration - Index id_1 does not exist or already dropped');
    }
    
    const { id } = req.params;
    const { 
      attendeeName, 
      attendeeEmail, 
      attendeePhone, 
      specialRequirements 
    } = req.body;
    
    const event = await Event.findById(id);
    if (!event || event.status !== 'published') {
      return res.status(404).json({ error: 'Event not found' });
    }
    
    if (event.attendees >= event.maxAttendees) {
      return res.status(400).json({ error: 'Event is full' });
    }
    
    // Check if already registered
    const existingRegistration = await EventRegistration.findOne({
      eventId: id,
      attendeeEmail
    });
    
    if (existingRegistration) {
      return res.status(400).json({ error: 'Already registered for this event' });
    }
    
    // Create registration
    const registration = await EventRegistration.create({
      eventId: id,
      attendeeName,
      attendeeEmail,
      attendeePhone,
      specialRequirements,
      amount: event.price,
      currency: event.currency
    });
    
    // Update event attendees
    event.attendees += 1;
    await event.save();
    
    res.json({ 
      message: 'Successfully registered for event',
      registrationId: registration._id
    });
  } catch (error) {
    console.error('Error registering for event:', error);
    res.status(500).json({ error: 'Failed to register for event' });
  }
});

// Unregister from event
router.post('/events/:id/unregister', async (req, res) => {
  try {
    const { id } = req.params;
    const { attendeeEmail } = req.body;
    
    const registration = await EventRegistration.findOneAndDelete({
      eventId: id,
      attendeeEmail
    });
    
    if (!registration) {
      return res.status(400).json({ error: 'Not registered for this event' });
    }
    
    // Update event attendees
    const event = await Event.findById(id);
    if (event) {
      event.attendees = Math.max(0, event.attendees - 1);
      await event.save();
    }
    
    res.json({ message: 'Successfully unregistered from event' });
  } catch (error) {
    console.error('Error unregistering from event:', error);
    res.status(500).json({ error: 'Failed to unregister from event' });
  }
});

// Get event registrations
router.get('/events/:id/registrations', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    
    // Check if user owns the event
    const event = await Event.findOne({ _id: id, userId });
    if (!event) {
      return res.status(404).json({ error: 'Event not found or access denied' });
    }
    
    const registrations = await EventRegistration.find({ eventId: id })
      .sort({ createdAt: -1 })
      .lean();
    
    res.json(registrations);
  } catch (error) {
    console.error('Error fetching event registrations:', error);
    res.status(500).json({ error: 'Failed to fetch event registrations' });
  }
});

// File upload endpoint for event cover images
router.post('/events/upload', upload.single('media'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ 
      success: true,
      url: fileUrl,
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

module.exports = router;