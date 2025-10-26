const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  date: {
    type: Date,
    required: true
  },
  time: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  venue: {
    type: String,
    trim: true,
    maxlength: 200
  },
  organizer: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  maxAttendees: {
    type: Number,
    required: true,
    min: 1
  },
  attendees: {
    type: Number,
    default: 0
  },
  imageUrl: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
    default: 'draft'
  },
  category: {
    type: String,
    trim: true,
    maxlength: 50
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  price: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    maxlength: 3
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  onlineLink: {
    type: String,
    trim: true
  },
  requirements: {
    type: String,
    trim: true,
    maxlength: 500
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    registrations: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Indexes
eventSchema.index({ userId: 1, createdAt: -1 });
eventSchema.index({ status: 1 });
eventSchema.index({ date: 1 });
eventSchema.index({ location: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Event', eventSchema);