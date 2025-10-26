const mongoose = require('mongoose');

const socialConnectionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['instagram', 'facebook', 'twitter', 'youtube', 'linkedin', 'tiktok', 'snapchat', 'pinterest']
  },
  platformUserId: {
    type: String,
    required: true
  },
  platformUsername: {
    type: String,
    trim: true
  },
  accessToken: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String
  },
  tokenExpiresAt: Date,
  isConnected: {
    type: Boolean,
    default: true
  },
  permissions: [{
    type: String,
    enum: ['read', 'write', 'publish', 'manage', 'analytics']
  }],
  lastSync: Date,
  syncStatus: {
    type: String,
    enum: ['active', 'error', 'expired', 'revoked'],
    default: 'active'
  },
  profileData: {
    name: String,
    username: String,
    avatar: String,
    followers: Number,
    following: Number,
    posts: Number,
    verified: Boolean
  },
  settings: {
    autoSync: {
      type: Boolean,
      default: false
    },
    syncInterval: {
      type: Number,
      default: 24 // hours
    },
    postAutomatically: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Indexes
socialConnectionSchema.index({ userId: 1, platform: 1 }, { unique: true });
socialConnectionSchema.index({ platformUserId: 1 });
socialConnectionSchema.index({ isConnected: 1 });
socialConnectionSchema.index({ syncStatus: 1 });
socialConnectionSchema.index({ lastSync: -1 });

module.exports = mongoose.model('SocialConnection', socialConnectionSchema);
