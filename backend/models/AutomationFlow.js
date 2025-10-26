const mongoose = require('mongoose');

const nodeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['social_trigger', 'comment_trigger', 'follower_check', 'send_message', 'delay', 'condition', 'webhook', 'email', 'notification']
  },
  position: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    }
  },
  data: {
    label: String,
    platform: String,
    contentType: String,
    condition: String,
    message: String,
    duration: Number,
    unit: String,
    keywords: String,
    messageType: String,
    webhookUrl: String,
    emailTemplate: String,
    notificationType: String
  }
});

const edgeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  source: {
    type: String,
    required: true
  },
  target: {
    type: String,
    required: true
  }
});

const automationFlowSchema = new mongoose.Schema({
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
  nodes: [nodeSchema],
  edges: [edgeSchema],
  settings: {
    isActive: {
      type: Boolean,
      default: false
    },
    triggerCount: {
      type: Number,
      default: 0
    },
    successCount: {
      type: Number,
      default: 0
    },
    lastTriggered: Date,
    maxExecutions: {
      type: Number,
      default: 1000
    },
    cooldownPeriod: {
      type: Number,
      default: 300 // seconds
    }
  },
  stats: {
    triggered: {
      type: Number,
      default: 0
    },
    completed: {
      type: Number,
      default: 0
    },
    failed: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    averageExecutionTime: {
      type: Number,
      default: 0
    }
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 30
  }],
  category: {
    type: String,
    trim: true,
    maxlength: 50
  }
}, {
  timestamps: true
});

// Indexes
automationFlowSchema.index({ userId: 1, createdAt: -1 });
automationFlowSchema.index({ 'settings.isActive': 1 });
automationFlowSchema.index({ category: 1 });
automationFlowSchema.index({ tags: 1 });
automationFlowSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('AutomationFlow', automationFlowSchema);
