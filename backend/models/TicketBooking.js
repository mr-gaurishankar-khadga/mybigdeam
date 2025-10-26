const mongoose = require('mongoose');

const ticketBookingSchema = new mongoose.Schema({
  ticketId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ticket',
    required: true
  },
  customerName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  customerEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
      },
      message: 'Invalid email format'
    }
  },
  customerPhone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  bookingId: {
    type: String,
    required: true,
    unique: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    max: 50
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    maxlength: 3
  },
  specialRequirements: {
    type: String,
    trim: true,
    maxlength: 500
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'paypal', 'stripe', 'cashfree', 'razorpay', 'other'],
    default: 'card'
  },
  paymentDate: Date,
  bookingStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'checked_in', 'no_show'],
    default: 'pending'
  },
  qrCode: {
    type: String,
    trim: true
  },
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: Date,
  refundAmount: {
    type: Number,
    default: 0
  },
  refundDate: Date,
  refundReason: {
    type: String,
    trim: true
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String
  }
}, {
  timestamps: true
});

// Indexes (bookingId is already unique from schema)
ticketBookingSchema.index({ ticketId: 1, createdAt: -1 });
ticketBookingSchema.index({ customerEmail: 1 });
ticketBookingSchema.index({ paymentStatus: 1 });
ticketBookingSchema.index({ bookingStatus: 1 });
ticketBookingSchema.index({ qrCode: 1 });

module.exports = mongoose.model('TicketBooking', ticketBookingSchema);