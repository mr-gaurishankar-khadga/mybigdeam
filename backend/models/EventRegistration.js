const mongoose = require('mongoose');

const eventRegistrationSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  attendeeName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  attendeeEmail: {
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
  attendeePhone: {
    type: String,
    trim: true,
    maxlength: 20
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'attended', 'no_show'],
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentId: {
    type: String,
    trim: true
  },
  amount: {
    type: Number,
    default: 0
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
  qrCode: {
    type: String,
    trim: true
  },
  checkedIn: {
    type: Boolean,
    default: false
  },
  checkedInAt: Date
}, {
  timestamps: true
});

// Indexes
eventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });
eventRegistrationSchema.index({ eventId: 1, status: 1 });
eventRegistrationSchema.index({ userId: 1 });
eventRegistrationSchema.index({ attendeeEmail: 1 });
eventRegistrationSchema.index({ registrationDate: -1 });

module.exports = mongoose.model('EventRegistration', eventRegistrationSchema);