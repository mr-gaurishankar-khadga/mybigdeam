const mongoose = require('mongoose');

const campaignAnalyticsSchema = new mongoose.Schema({
  campaignId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign',
    required: true
  },
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
    enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'google', 'snapchat']
  },
  metrics: {
    views: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    conversions: {
      type: Number,
      default: 0
    },
    spend: {
      type: Number,
      default: 0
    },
    impressions: {
      type: Number,
      default: 0
    },
    reach: {
      type: Number,
      default: 0
    },
    engagement: {
      type: Number,
      default: 0
    },
    ctr: {
      type: Number,
      default: 0
    },
    cpc: {
      type: Number,
      default: 0
    },
    cpm: {
      type: Number,
      default: 0
    },
    roas: {
      type: Number,
      default: 0
    }
  },
  demographics: {
    age: mongoose.Schema.Types.Mixed,
    gender: mongoose.Schema.Types.Mixed,
    location: mongoose.Schema.Types.Mixed
  },
  deviceBreakdown: {
    desktop: Number,
    mobile: Number,
    tablet: Number
  },
  hourlyBreakdown: [{
    hour: Number,
    views: Number,
    clicks: Number,
    conversions: Number
  }]
}, {
  timestamps: true
});

// Indexes
campaignAnalyticsSchema.index({ campaignId: 1, date: -1 });
campaignAnalyticsSchema.index({ userId: 1, date: -1 });
campaignAnalyticsSchema.index({ platform: 1, date: -1 });
campaignAnalyticsSchema.index({ date: 1 });

module.exports = mongoose.model('CampaignAnalytics', campaignAnalyticsSchema);