const HistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to the user
  date: { type: Date, default: Date.now }, // The specific day for the history entry
  readingHistory: [
    {
      blogId: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
      readAt: { type: Date, default: Date.now }, // Timestamp when the blog was read
      readingTime: { type: Number, default: 0 } // Time spent reading (in seconds)
    }
  ],
  searchHistory: [
    {
      query: { type: String, required: true }, // The search query entered by the user
      searchedAt: { type: Date, default: Date.now }, // Timestamp of the search
      frequency: { type: Number, default: 1 }, // Frequency of this search query
      thumbnail: { type: String, default: '' } // Thumbnail image URL
    }
  ]
});

HistorySchema.set('timestamps', true);
HistorySchema.set('toJSON', { virtuals: true });
HistorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('History', HistorySchema);