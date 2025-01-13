const mongoose = require('mongoose');

const HistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user
  date: { type: Date, default: Date.now }, // The specific day for the history entry
  readingHistory: [
    {
      blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
      readAt: { type: Date, default: Date.now } // Timestamp when the blog was read
    }
  ],
  searchHistory: [
    {
      query: { type: String, required: true }, // The search query entered by the user
      searchedAt: { type: Date, default: Date.now }, // Timestamp of the search
      frequency: { type: Number, default: 1 } // Frequency of this search query
    }
  ]
});

// HistorySchema.index({ userId: 1, date: 1 }, { unique: true }); // Ensure one entry per user per day

HistorySchema.set('timestamps', true);

// Enable virtual fields in JSON and Object conversions
HistorySchema.set('toJSON', { virtuals: true });
HistorySchema.set('toObject', { virtuals: true });

// Post hook to store search history and track frequency
HistorySchema.post('find', async function (docs, next) {
  try {
    const userId = this.getFilter().userId; // Get userId from the query filter
    const queryString = this.getFilter().$or ? this.getFilter().$or[0].title.$regex : '';

    if (userId && queryString) {
      const currentDate = new Date();
      const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
      const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

      // Find or create a history entry for the current day
      let history = await mongoose.model('History').findOneAndUpdate(
        { userId, date: { $gte: startOfDay, $lt: endOfDay } },
        { $push: { searchHistory: { query: queryString } } },
        { upsert: true, new: true }
      );

      // Limit search history to the last 50 entries
      if (history.searchHistory.length > 50) {
        history.searchHistory = history.searchHistory.slice(-50);
        await history.save();
      }

      // Update search query frequency count
      const queryIndex = history.searchHistory.findIndex(entry => entry.query === queryString);
      if (queryIndex !== -1) {
        history.searchHistory[queryIndex].frequency += 1;
      } else {
        history.searchHistory.push({ query: queryString, frequency: 1 });
      }

      await history.save();
    }

    next();
  } catch (error) {
    console.error('Error in post hook for storing search history:', error.message);
    next(error);
  }
});

module.exports = mongoose.model('History', HistorySchema);
