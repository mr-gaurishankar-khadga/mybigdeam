const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
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
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  budget: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  targetAudience: {
    type: String,
    trim: true,
    maxlength: 500
  },
  creativeAssets: [{
    type: String,
    trim: true
  }],
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
    }
  },
  platforms: [{
    type: String,
    enum: ['facebook', 'instagram', 'twitter', 'linkedin', 'youtube', 'tiktok', 'google', 'snapchat']
  }],
  objectives: [{
    type: String,
    enum: ['awareness', 'traffic', 'engagement', 'leads', 'sales', 'app_installs', 'video_views']
  }],
  budgetAllocation: {
    total: Number,
    daily: Number,
    byPlatform: mongoose.Schema.Types.Mixed
  },
  targeting: {
    age: {
      min: Number,
      max: Number
    },
    gender: [String],
    interests: [String],
    locations: [String],
    languages: [String],
    behaviors: [String]
  },
  schedule: {
    startTime: Date,
    endTime: Date,
    timezone: String,
    frequency: {
      type: String,
      enum: ['once', 'daily', 'weekly', 'monthly'],
      default: 'once'
    }
  }
}, {
  timestamps: true
});

// Indexes
campaignSchema.index({ userId: 1, createdAt: -1 });
campaignSchema.index({ status: 1 });
campaignSchema.index({ startDate: 1, endDate: 1 });
campaignSchema.index({ platforms: 1 });
campaignSchema.index({ objectives: 1 });
campaignSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Campaign', campaignSchema);