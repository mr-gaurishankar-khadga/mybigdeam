const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  biolinkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BioLink',
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
    maxlength: 1000
  },
  eventType: {
    type: String,
    required: true,
    enum: ['concert', 'conference', 'workshop', 'meetup', 'webinar', 'sports', 'theater', 'other'],
    default: 'other'
  },
  eventDate: {
    type: Date,
    required: true
  },
  eventTime: {
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
  price: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    maxlength: 3
  },
  totalTickets: {
    type: Number,
    required: true,
    min: 1
  },
  availableTickets: {
    type: Number,
    required: true,
    min: 0
  },
  soldTickets: {
    type: Number,
    default: 0
  },
  coverImage: {
    type: String,
    trim: true
  },
  termsConditions: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'sold_out', 'cancelled', 'completed'],
    default: 'draft'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    bookings: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    }
  },
  settings: {
    allowRefunds: {
      type: Boolean,
      default: true
    },
    refundDeadline: Date,
    maxTicketsPerUser: {
      type: Number,
      default: 10
    },
    requireApproval: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes
ticketSchema.index({ creatorId: 1, createdAt: -1 });
ticketSchema.index({ biolinkId: 1 });
ticketSchema.index({ status: 1 });
ticketSchema.index({ eventDate: 1 });
ticketSchema.index({ eventType: 1 });
ticketSchema.index({ location: 1 });
ticketSchema.index({ isActive: 1 });

module.exports = mongoose.model('Ticket', ticketSchema);