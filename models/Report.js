const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog'
  },
  commentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BlogInteraction'
  },
  reason: {
    type: String,
    required: true
  },
  details: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
    default: 'pending'
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Enable timestamps for createdAt and updatedAt
ReportSchema.set('timestamps', true);

// Enable virtual fields in JSON and Object conversions
ReportSchema.set('toJSON', { virtuals: true });
ReportSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Report', ReportSchema);
