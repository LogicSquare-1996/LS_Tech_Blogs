const Blog = require("../../models/blog");
const History = require("../../models/history");

module.exports ={

    /**
 * @api {post} /createBlog Create a new blog post
 * @apiName CreateBlog
 * @apiGroup Blogs
 * @apiVersion 1.0.0
 * 
 * @apiDescription This endpoint allows an authenticated user to create a new blog post. 
 * Mandatory fields include `title`, `content`, and `tags`. Optionally, you can provide 
 * a `category`, `gitHubLink`, `attachments`, `thumbnail`, and set the publication `status`.
 * If `status` is set to "published", the blog will be marked as published at the current time.
 * 
 * @apiPermission Authenticated User
 * 
 * @apiHeader {String} Authorization Bearer token for user authentication.
 * 
 * @apiBody {String} title The title of the blog post (mandatory).
 * @apiBody {String} content The content of the blog post (mandatory).
 * @apiBody {Array} tags An array of tags associated with the blog post (mandatory).
 * @apiBody {String} [category] The category of the blog post (optional).
 * @apiBody {String} [gitHubLink] A GitHub link associated with the blog post (optional).
 * @apiBody {Array} [attachments] An array of file URLs for attachments (optional).
 * @apiBody {String} [thumbnail] A URL to the thumbnail image of the blog post (optional).
 * @apiBody {String} [status="published"] The publication status of the blog ("published" or "draft").
 * 
 * 
 * @apiError {Boolean} error Indicates whether an error occurred (always true).
 * @apiError {String} message Error message describing what went wrong.
 * 
 * @apiExample {json} Request Example:
 * {
 *   "title": "My First Blog",
 *   "content": "This is the content of the blog.",
 *   "tags": ["Node.js", "API", "Blog"],
 *   "category": "Technology",
 *   "gitHubLink": "https://github.com/user/repo",
 *   "attachments": ["https://example.com/file1.pdf"],
 *   "thumbnail": "https://example.com/image.jpg",
 *   "status": "published"
 * }
 * 
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 201 Created
 * {
 *   "message": "Blog created successfully",
 *   "blog": {
 *     "_id": "60f5a13d6b1f0e12345abcde",
 *     "title": "My First Blog",
 *     "content": "This is the content of the blog.",
 *     "tags": ["Node.js", "API", "Blog"],
 *     "category": "Technology",
 *     "gitHubLink": "https://github.com/user/repo",
 *     "attachments": ["https://example.com/file1.pdf"],
 *     "thumbnail": "https://example.com/image.jpg",
 *     "status": "published",
 *     "publishedAt": "2025-01-21T12:34:56.789Z",
 *     "_author": "60f5a13d6b1f0e12345abcd9"
 *   }
 * }
 * 
 * @apiErrorExample {json} Error Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": true,
 *   "message": "Missing mandatory field `title`"
 * }
 */

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
            console.log(error);
            
            return res.status(400).json({ error: true, message: error.message });
        }
    },

    /**
 * @api {post} /blogs Get blog posts with filters and pagination
 * @apiName GetBlogs
 * @apiGroup Blogs
 * @apiVersion 2.0.0
 * 
 * @apiDescription This endpoint allows an authenticated user to retrieve a list of published blog posts with filtering, sorting, and pagination. 
 * You can filter by `tags`, `categories`, and search by keywords (`searchQuery`). Blogs can be sorted by recommended posts (based on the user's search history) or by creation date.
 * 
 * @apiPermission Authenticated User
 * 
 * @apiHeader {String} Authorization Bearer token for user authentication.
 * 
 * @apiBody {Number} [page=1] The page number to fetch. Default is 1.
 * @apiBody {Number} [limit=10] The number of blog posts per page. Default is 10.
 * @apiBody {String="recommended", "byDate"} [sortBy="recommended"] The sorting method. Options are `recommended` (based on user history) and `byDate` (based on creation date).
 * @apiBody {Array} [tags=[]] An array of tags to filter blogs by (optional).
 * @apiBody {Array} [categories=[]] An array of categories to filter blogs by (optional).
 * @apiBody {String} [searchQuery=""] A search query to match blogs by title using a case-insensitive regex (optional).
 * 
 * 
 * @apiError {Boolean} error Indicates whether an error occurred (always true).
 * @apiError {String} message Error message describing what went wrong.
 * 
 * @apiExample {json} Request Example:
 * {
 *   "page": 1,
 *   "limit": 10,
 *   "sortBy": "recommended",
 *   "tags": ["Node.js", "API"],
 *   "categories": ["Technology"],
 *   "searchQuery": "blog"
 * }
 * 
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200 OK
 * {
 *   "error": false,
 *   "blogs": [
 *     {
 *       "_id": "60f5a13d6b1f0e12345abcde",
 *       "title": "My First Blog",
 *       "content": "This is the content of the blog.",
 *       "tags": ["Node.js", "API"],
 *       "category": "Technology",
 *       "gitHubLink": "https://github.com/user/repo",
 *       "attachments": ["https://example.com/file1.pdf"],
 *       "thumbnail": "https://example.com/image.jpg",
 *       "status": "published",
 *       "publishedAt": "2025-01-21T12:34:56.789Z",
 *       "_author": "60f5a13d6b1f0e12345abcd9",
 *       "frequency": 5
 *     }
 *   ]
 * }
 * 
 * @apiErrorExample {json} Error Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": true,
 *   "message": "Invalid pagination parameters."
 * }
 */

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
      },
    

/**
 * @api {get} /blog/:id Get a specific blog by ID
 * @apiName GetBlog
 * @apiGroup Blogs
 * @apiVersion 1.0.0
 * 
 * @apiDescription This endpoint retrieves a specific published blog by its ID.
 * 
 * @apiPermission Authenticated User
 * 
 * @apiHeader {String} Authorization Bearer token for user authentication. The token should be included in the `Authorization` header as `Bearer <jwt_token>`.
 * 
 * @apiParam {String} id The ID of the blog to retrieve.
 * 
 * @apiError {Boolean} error Indicates whether an error occurred (always true).
 * @apiError {String} message Error message describing what went wrong.
 * 
 * @apiExample {json} Request Example:
 * GET /blogs/60f5a13d6b1f0e12345abcde
 * 
 * @apiExample {json} Request Header Example:
 * Authorization: Bearer <jwt_token>
 * 
 * @apiErrorExample {json} Error Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": true,
 *   "message": "Blog not found"
 * }
 */

    async getblog(req,res){
        try {
            const {id} = req.params;
            const blog = await Blog.findById({_id:id,status:"published"});
            if(!blog) return res.status(400).json({error: true, message: "Blog not found"});
            return res.status(200).json({error: false, blog});
        } catch (error) {
            console.log("Error is: ", error)
            return res.status(400).json({error: true, message: error.message})
        }
    },

    async updateBlog(req, res) {
      try {
        const {
          params: { id },
          body: {
            title,
            content,
            tags,
            category,
            gitHubLink,
            attachments,
            thumbnail,
            status, // This should be provided explicitly from the frontend
          },
        } = req;
    
        // Find the blog authored by the authenticated user
        const blog = await Blog.findOne({ _id: id, _author: req.user._id }).exec();
    
        if (!blog) {
          return res.status(404).json({ error: true, message: "Blog not found" });
        }
    
        // Update blog fields if they are provided
        if (title) blog.title = title;
        if (content) blog.content = content;
        if (tags) blog.tags = tags;
        if (category) blog.category = category;
        if (gitHubLink) blog.gitHubLink = gitHubLink;
        if (attachments) blog.attachments = attachments;
        if (thumbnail) blog.thumbnail = thumbnail;
    
        // Set the status based on frontend input
        if (status) {
          if (status.toLowerCase() === "draft") {
            blog.status = "draft"; // Mark as pending for saved drafts
          } else if (status.toLowerCase() === "publish") {
            blog.status = "published"; // Mark as published for live posts
          }
        }
    
        // Save the updated blog
        await blog.save();
    
        return res.status(200).json({
          success: true,
          message: "Blog updated successfully",
          blog,
        });
      } catch (error) {
        console.error("Error is: ", error);
        return res.status(500).json({ error: true, message: error.message });
      }
    },
    async deleteBlog(req, res) {
      try {
        const { id } = req.params;
    
        // Validate the blog ID format
        if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
          return res.status(400).json({ error: true, message: "Invalid Blog ID" });
        }
    
        // Find the blog by its ID and author
        const blog = await Blog.findOne({ _id: id, _author: req.user._id });
    
        if (!blog) {
          return res.status(404).json({ error: true, message: "No Blog Found" });
        }
    
        // Mark the blog as deleted (soft delete)
        blog.isDeleted = true;
        await blog.save();
    
        return res.status(200).json({ success: true, message: "Blog deleted successfully (soft delete)" });
      } catch (error) {
        console.error("Error deleting blog: ", error);
        return res.status(400).json({
          error: true,
          message: error.message,
        });
      }
    },

    async publishDraftBlog(req,res){
      try {
        const {id} = req.params

        const blog = await Blog.findOne({_id: id, _author: author})

        if (!blog) {
          return res.status(404).json({ message: 'Blog not found' });
        }
  
        // Check if the blog is in "Draft" status
        if (blog.status !== 'draft') {
          return res.status(400).json({ message: 'Only draft blogs can be published' });
        }
  
        // Update the blog status to "Published"
        blog.status = 'published';
  
        // Save the updated blog
        await blog.save();
  
        // Respond with success
        return res.status(200).json({
          error: false,
          message: 'Blog published successfully',
          blog
        });
      } catch (error) {
        console.log("Error is: ",error);
        return res.status(400).json({error: true, message: error.message})
        
      }
    },

    async getDraftBlogs(req, res) {
      try {
        const {body:{page=1,limit=10}
      } = req

        const draftBlogs = await Blog.find({ status: "draft", _author: req.user._id })
          .populate({
            path: "_author",
            select: "email name profileImage  -_id", // Include email and name, exclude _id
            options: { toJSON: { virtuals: true } }, // Ensure virtuals are included
          }).sort({ createdAt: -1 })
          .skip((page - 1) * limit)
          .exec();
          
          const totalCount = await Blog.find({ status: "draft", _author: req.user._id }).countDocuments()

        if (!draftBlogs || draftBlogs.length === 0) {
          return res.status(400).json({ error: true, message: "No draft blogs found" });
        }
    
        return res.status(200).json({ error: false, draftBlogs,totalCount,page,limit });
      } catch (error) {
        console.log("Error is: ", error);
        return res.status(400).json({ error: true, message: error.message });
      }
    },


    
    
      
    

}