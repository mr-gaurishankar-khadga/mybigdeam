const mongoose = require('mongoose');

const ugcContentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
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
  type: {
    type: String,
    required: true,
    enum: ['image', 'video', 'text', 'audio', 'document']
  },
  mediaUrl: {
    type: String,
    trim: true
  },
  contentText: {
    type: String,
    trim: true,
    maxlength: 5000
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  likes: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  category: {
    type: String,
    trim: true,
    maxlength: 50
  },
  location: {
    type: String,
    trim: true,
    maxlength: 100
  },
  metadata: {
    fileSize: Number,
    duration: Number, // for videos/audio
    dimensions: {
      width: Number,
      height: Number
    },
    format: String
  }
}, {
  timestamps: true
});

// Indexes - removed problematic id index
ugcContentSchema.index({ userId: 1, createdAt: -1 });
ugcContentSchema.index({ type: 1 });
ugcContentSchema.index({ isActive: 1, isFeatured: 1 });
ugcContentSchema.index({ tags: 1 });
ugcContentSchema.index({ likes: -1 });
ugcContentSchema.index({ views: -1 });
ugcContentSchema.index({ title: 'text', description: 'text', contentText: 'text' });

module.exports = mongoose.model('UGCContent', ugcContentSchema);