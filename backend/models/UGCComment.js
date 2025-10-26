const mongoose = require('mongoose');

const ugcCommentSchema = new mongoose.Schema({
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UGCContent',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UGCComment',
    default: null
  },
  likes: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: Date
}, {
  timestamps: true
});

// Indexes
ugcCommentSchema.index({ contentId: 1, createdAt: -1 });
ugcCommentSchema.index({ userId: 1 });
ugcCommentSchema.index({ parentCommentId: 1 });
ugcCommentSchema.index({ isActive: 1 });

module.exports = mongoose.model('UGCComment', ugcCommentSchema);