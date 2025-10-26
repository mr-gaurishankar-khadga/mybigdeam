const mongoose = require('mongoose');

const ugcLikeSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['like', 'love', 'laugh', 'wow', 'sad', 'angry'],
    default: 'like'
  }
}, {
  timestamps: true
});

// Indexes
ugcLikeSchema.index({ contentId: 1, userId: 1 }, { unique: true });
ugcLikeSchema.index({ userId: 1 });
ugcLikeSchema.index({ contentId: 1 });

module.exports = mongoose.model('UGCLike', ugcLikeSchema);