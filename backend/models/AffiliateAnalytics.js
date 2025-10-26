const mongoose = require('mongoose');

const affiliateAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  platform: {
    type: String,
    enum: ['amazon', 'shopify', 'clickbank', 'cj', 'impact', 'rakuten', 'awin', 'flexoffers']
  },
  metrics: {
    totalClicks: {
      type: Number,
      default: 0
    },
    totalConversions: {
      type: Number,
      default: 0
    },
    totalEarnings: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    averageEarningsPerClick: {
      type: Number,
      default: 0
    }
  },
  clicksByHour: [{
    hour: Number,
    count: Number
  }],
  topPerformingLinks: [{
    linkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AffiliateLink'
    },
    clicks: Number,
    conversions: Number,
    earnings: Number
  }]
}, {
  timestamps: true
});

// Indexes
affiliateAnalyticsSchema.index({ userId: 1, date: -1 });
affiliateAnalyticsSchema.index({ platform: 1, date: -1 });
affiliateAnalyticsSchema.index({ date: 1 });

module.exports = mongoose.model('AffiliateAnalytics', affiliateAnalyticsSchema);
