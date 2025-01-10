const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to the user
  date: { type: Date, required: true }, // The specific day for the history entry
  readingHistory: [
    {
      blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
      readAt: { type: Date, default: Date.now } // Timestamp when the blog was read
    }
  ],
  searchHistory: [
    {
      query: { type: String, required: true }, // The search query entered by the user
      searchedAt: { type: Date, default: Date.now } // Timestamp of the search
    }
  ]
});

HistorySchema.index({ userId: 1, date: 1 }, { unique: true }); // Ensure one entry per user per day

HistorySchema.set('timestamps', true);

// Enable virtual fields in JSON and Object conversions
HistorySchema.set('toJSON', { virtuals: true });
HistorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('History', HistorySchema);

 
