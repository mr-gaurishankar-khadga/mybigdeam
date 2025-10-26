const mongoose = require('mongoose');

const affiliateLinkSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalUrl: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'URL must start with http:// or https://'
    }
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['amazon', 'shopify', 'clickbank', 'cj', 'impact', 'rakuten', 'awin', 'flexoffers']
  },
  product: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  customAlias: {
    type: String,
    trim: true,
    maxlength: 50,
    match: /^[a-zA-Z0-9_-]+$/
  },
  clicks: {
    type: Number,
    default: 0
  },
  conversions: {
    type: Number,
    default: 0
  },
  earnings: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'archived'],
    default: 'active'
  },
  trackingParams: [{
    key: String,
    value: String
  }],
  lastClicked: Date,
  imported: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes (shortUrl is already unique from schema)
affiliateLinkSchema.index({ userId: 1, createdAt: -1 });
affiliateLinkSchema.index({ platform: 1 });
affiliateLinkSchema.index({ status: 1 });
affiliateLinkSchema.index({ 'analytics.clicks': -1 });

module.exports = mongoose.model('AffiliateLink', affiliateLinkSchema);
