const mongoose = require('mongoose');

const BroadcastSchema = new mongoose.Schema({
  message: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  target: {
    type: String,
    enum: ['all', 'top-contributors', 'admins', 'specific-users'],
    default: 'all'
  },
  targetUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  expiresAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Enable timestamps for createdAt and updatedAt
BroadcastSchema.set('timestamps', true);

// Enable virtual fields in JSON and Object conversions
BroadcastSchema.set('toJSON', { virtuals: true });
BroadcastSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Broadcast', BroadcastSchema);
