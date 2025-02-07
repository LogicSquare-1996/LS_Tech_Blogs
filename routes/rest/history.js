const History = require("../../models/history")
const Blog = require("../../models/blog")
const User = require("../../models/user")

module.exports ={
   async searchHistory(req, res){
    try {
        const { userId, query, thumbnail } = req.body;
    
        if (!userId || !query) {
          return res.status(400).json({ message: 'User ID and query are required' });
        }
    
        const today = new Date();
        today.setHours(0, 0, 0, 0);
    
        let history = await History.findOne({ userId, date: { $gte: today } });
    
        if (!history) {
          history = new History({ userId, searchHistory: [] });
        }
    
        // Check if the search query already exists
        const existingSearch = history.searchHistory.find(s => s.query === query);
    
        if (existingSearch) {
          existingSearch.frequency += 1;
          existingSearch.searchedAt = new Date();
          existingSearch.thumbnail = thumbnail || existingSearch.thumbnail;
        } else {
          history.searchHistory.unshift({ query, searchedAt: new Date(), thumbnail });
        }
    
        // Keep only the last 50 search queries
        history.searchHistory = history.searchHistory.slice(0, 50);
    
        await history.save();
        res.status(200).json({ message: 'Search history updated', data: history.searchHistory });
    
      } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
      }
   }, 
}

