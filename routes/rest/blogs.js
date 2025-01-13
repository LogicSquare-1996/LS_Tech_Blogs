const Blog = require("../../models/blog");
const History = require("../../models/history");

module.exports ={
    async post(req,res){
        try {
            
            const { 
                    title, content, tags, category, gitHubLink, attachments, thumbnail, status="published",
             } = req.body;


            if(!title) return res.status(400).json({ error: true, message: "Missing mandatory field `title`" });
            if(!content) return res.status(400).json({ error: true, message: "Missing mandatory field `content`" });
            if(!tags) return res.status(400).json({ error: true, message: "Missing mandatory field `tags`" });

            const blog = await Blog.create({
                _author: req.user._id,
                title,
                content,
                tags,
                category,
                gitHubLink,
                attachments,
                thumbnail,
                status,
                publishedAt: status === 'published' ? Date.now() : null, // Set publishedAt if status is 'published'
              });
          
              res.status(201).json({ message: 'Blog created successfully', blog });
            
            
        } catch (error) {
            return res.status(400).json({ error: true, message: error.message });
        }
    },

    async getBlogs(req, res) {
        try {
          // Fetch parameters from the body instead of query
          const { page = 1, limit = 10, sortBy = 'recommended', tags = [], categories = [], searchQuery = '' } = req.body;
      
          const userId = req.user._id;
      
          // Build the filter for the search
          let filter = { status: 'published' };
      
          // Search by tags and categories if provided
          if (tags.length > 0) {
            filter.tags = { $in: tags };  // This will match any of the tags
          }
          
          if (categories.length > 0) {
            filter.category = { $in: categories };
          }
      
          // Search by keywords using regex if provided
          if (searchQuery) {
            filter.title = { $regex: searchQuery, $options: 'i' }; // Case-insensitive regex search for title
          }
      
          // Determine sorting order based on the `sortBy` parameter
          let sort = {};
      
          if (sortBy === 'recommended') {
            // Fetch the user's search history to determine recommendations
            const userHistory = await History.findOne({ userId }).sort({ date: -1 }).limit(1);
            if (userHistory && userHistory.searchHistory.length > 0) {
              const lastSearch = userHistory.searchHistory[userHistory.searchHistory.length - 1];
      
              // Fetch blogs that match the last search query and order by frequency
              const recommendedBlogs = await Blog.find({
                ...filter,
                title: { $regex: lastSearch.query, $options: 'i' } // Match blogs based on last search query
              })
                .sort({ frequency: -1 }) // Sort by frequency of match
                .skip((page - 1) * limit)  // Pagination: skip previous pages
                .limit(parseInt(limit));  // Pagination: limit the number of results per page
      
              return res.status(200).json({ error: false, blogs: recommendedBlogs });
            }
      
            // If no search history found, sort by createdAt by default
            sort = { createdAt: -1 };
          } else if (sortBy === 'byDate') {
            // Sort by the createdAt date if 'byDate' is chosen
            sort = { createdAt: -1 };
          } else {
            // Default sorting by createdAt if no valid sortBy option is provided
            sort = { createdAt: -1 };
          }
      
          // Pagination logic for general search results
          const blogs = await Blog.find(filter)
            .skip((page - 1) * limit)  // Pagination: skip previous pages
            .limit(parseInt(limit))    // Pagination: limit the number of results per page
            .sort(sort);               // Apply the sort order (either by recommended or date)
      
          return res.status(200).json({ error: false, blogs });
        } catch (error) {
          console.error(error);
          return res.status(400).json({ error: true, message: error.message });
        }
      }
      
    

}