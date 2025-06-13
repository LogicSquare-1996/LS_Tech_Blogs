const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['new_blog', 'like', 'comment', 'reply', 'system'],
    default: 'system'
  },
  target: {
    type: String,
    enum: ['all', 'specific_user'],
    default: 'specific_user'
  },
  targetUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sourceUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  },
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogInteraction'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  // Array of users who haven't read this notification yet (for 'all' target notifications)
  unreadUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  expiresAt: {
    type: Date
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

// Enable timestamps for createdAt and updatedAt
NotificationSchema.set('timestamps', true);

// Enable virtual fields in JSON and Object conversions
NotificationSchema.set('toJSON', { virtuals: true });
NotificationSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Notification', NotificationSchema);
