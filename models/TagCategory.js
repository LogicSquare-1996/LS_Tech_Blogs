const mongoose = require('mongoose');

const TagCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['tag', 'category'],
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  count: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Enable timestamps for createdAt and updatedAt
TagCategorySchema.set('timestamps', true);

// Enable virtual fields in JSON and Object conversions
TagCategorySchema.set('toJSON', { virtuals: true });
TagCategorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('TagCategory', TagCategorySchema);
