const mongoose = require('mongoose');

const affiliatePlatformSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  platformId: {
    type: String,
    required: true,
    enum: ['amazon', 'shopify', 'clickbank', 'cj', 'impact', 'rakuten', 'awin', 'flexoffers']
  },
  platformName: {
    type: String,
    required: true
  },
  isConnected: {
    type: Boolean,
    default: false
  },
  credentials: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  connectedAt: Date,
  lastSync: Date,
  status: {
    type: String,
    enum: ['active', 'inactive', 'error'],
    default: 'active'
  },
  permissions: [String],
  settings: {
    autoSync: {
      type: Boolean,
      default: false
    },
    syncInterval: {
      type: Number,
      default: 24 // hours
    }
  }
}, {
  timestamps: true
});

// Indexes
affiliatePlatformSchema.index({ userId: 1, platformId: 1 }, { unique: true });
affiliatePlatformSchema.index({ isConnected: 1 });
affiliatePlatformSchema.index({ status: 1 });

module.exports = mongoose.model('AffiliatePlatform', affiliatePlatformSchema);
