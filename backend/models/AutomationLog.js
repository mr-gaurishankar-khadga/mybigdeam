const mongoose = require('mongoose');

const automationLogSchema = new mongoose.Schema({
  flowId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AutomationFlow',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  triggerType: {
    type: String,
    required: true
  },
  triggerData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  executionPath: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
    default: 'pending'
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  error: {
    type: String,
    trim: true
  },
  executionTime: {
    type: Number,
    default: 0 // milliseconds
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  nextRetryAt: Date,
  metadata: {
    userAgent: String,
    ipAddress: String,
    platform: String,
    version: String
  }
}, {
  timestamps: true
});

// Indexes
automationLogSchema.index({ flowId: 1, createdAt: -1 });
automationLogSchema.index({ userId: 1, createdAt: -1 });
automationLogSchema.index({ status: 1 });
automationLogSchema.index({ triggerType: 1 });
automationLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AutomationLog', automationLogSchema);
