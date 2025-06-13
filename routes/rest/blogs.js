const Blog = require("../../models/blog");
const History = require("../../models/history");
const User = require("../../models/user");
const BlogInteraction = require("../../models/BlogInteraction");
const Notification = require("../../models/Notification");

module.exports = {

  /**
  * @api {post} /createBlog 1.0 Create a New Blog Post
  * @apiName createBlog
  * @apiGroup Blogs
  * @apiVersion 1.0.0
  * @apiPermission Authenticated User
  * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
  *
  * @apiParam {String} title The title of the blog post (mandatory).
  * @apiParam {String} content The content of the blog post (mandatory).
  * @apiParam {Array} tags An array of tags associated with the blog post (mandatory).
  * @apiParam {String} [category] The category of the blog post (optional).
  * @apiParam {String} [gitHubLink] A GitHub link associated with the blog post (optional).
  * @apiParam {Array} [attachments] An array of file URLs for attachments (optional).
  * @apiParam {String} [thumbnail] A URL to the thumbnail image of the blog post (optional).
  * @apiParam {String} [status="published"] The publication status of the blog ("published" or "draft").
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
  * @apiSuccessExample {type} Success-Response:
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


  async post(req, res) {
    try {

      const {
        title, content, tags, category, gitHubLink, attachments, thumbnail, status = "published",
      } = req.body;


      if (!title) return res.status(400).json({ error: true, message: "Missing mandatory field `title`" });
      if (!content) return res.status(400).json({ error: true, message: "Missing mandatory field `content`" });
      if (!tags) return res.status(400).json({ error: true, message: "Missing mandatory field `tags`" });

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

      // Create notification for all users if the blog is published
      if (status === 'published') {
        try {
          // Get all active users to populate unreadUsers array
          const activeUsers = await User.find({ isActive: true }).select('_id');
          const unreadUsers = activeUsers.map(user => user._id);

          await Notification.create({
            title: 'New Blog Published',
            message: `${req.user.fullName} published a new blog: "${blog.title}" `,
            type: 'new_blog',
            target: 'all',
            sourceUser: req.user._id,
            blogId: blog._id,
            unreadUsers: unreadUsers // Add all active users to unreadUsers array
          });
        } catch (notificationError) {
          console.error('Error creating blog notification:', notificationError);
          // Continue with the response even if notification creation fails
        }
      }

      res.status(201).json({ message: 'Blog created successfully', blog });


    } catch (error) {
      console.log(error);

      return res.status(400).json({ error: true, message: error.message });
    }
  },

  /**
 * @api {post} /blogs 2.0 Get Blog Posts with Filters and Pagination
 * @apiName getBlogs
 * @apiGroup Blogs
 * @apiVersion 2.0.0
 * @apiPermission Authenticated User
 * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
 *
 * @apiParam {Number} [page=1] The page number to fetch. Default is 1.
 * @apiParam {Number} [limit=10] The number of blog posts per page. Default is 10.
 * @apiParam {String="recommended", "byDate"} [sortBy="recommended"] The sorting method. Options are `recommended` (based on user history) and `byDate` (based on creation date).
 * @apiParam {Array} [tags=[]] An array of tags to filter blogs by (optional).
 * @apiParam {Array} [categories=[]] An array of categories to filter blogs by (optional).
 * @apiParam {String} [searchQuery=""] A search query to match blogs by title using a case-insensitive regex (optional).
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
 * @apiSuccessExample {type} Success-Response:
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
      const { page = 1, limit = 10, sortBy = 'recommended', tags = [], categories = [], authors = [], searchQuery = '' } = req.body;

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

      // Filter by authors if provided
      if (authors.length > 0) {
        filter.author = { $in: authors }; // This will match blogs by any of the provided authors
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
 * @api {get} /blog/:id 3.0 Get a Specific Blog by ID
 * @apiName getBlogById
 * @apiGroup Blogs
 * @apiVersion 3.0.0
 * @apiPermission Authenticated User
 *
 * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz".
 *
 * @apiParam {String} id The ID of the blog to retrieve.
 *
 * @apiDescription This endpoint retrieves a specific published blog by its ID.
 *
 * @apiExample {json} Request Example:
 * GET /blog/60f5a13d6b1f0e12345abcde
 *
 * @apiExample {json} Request Header Example:
 * Authorization: Bearer <jwt_token>
 *
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200 OK
 * {
 *   "error": false,
 *   "blog": {
 *     "_id": "60f5a13d6b1f0e12345abcde",
 *     "title": "My First Blog",
 *     "content": "This is the content of the blog.",
 *     "tags": ["Node.js", "API"],
 *     "category": "Technology",
 *     "gitHubLink": "https://github.com/user/repo",
 *     "attachments": ["https://example.com/file1.pdf"],
 *     "thumbnail": "https://example.com/image.jpg",
 *     "status": "published",
 *     "publishedAt": "2025-01-21T12:34:56.789Z",
 *     "_author": "60f5a13d6b1f0e12345abcd9",
 *     "frequency": 5
 *   }
 * }
 *
 * @apiErrorExample {json} Error Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": true,
 *   "message": "Blog not found"
 * }
 */


  async getblog(req, res) {
    try {
      const { id } = req.params;
      const blog = await Blog.findById({ _id: id, status: "published" });
      if (!blog) return res.status(400).json({ error: true, message: "Blog not found" });
      return res.status(200).json({ error: false, blog });
    } catch (error) {
      console.log("Error is: ", error)
      return res.status(400).json({ error: true, message: error.message })
    }
  },

  /**
 * @api {post} /blogs/:id 4.0 Update a Blog
 * @apiName updateBlog
 * @apiGroup Blogs
 * @apiVersion 4.0.0
 * @apiPermission Authenticated User
 *
 * @apiDescription This endpoint allows an authenticated user to update their blog. The blog must belong to the authenticated user.
 *
 * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz".
 *
 * @apiParam {String} id The ID of the blog to update.
 *
 * @apiBody {String} [title] The updated title of the blog.
 * @apiBody {String} [content] The updated content of the blog.
 * @apiBody {Array} [tags] An array of updated tags for the blog.
 * @apiBody {String} [category] The updated category for the blog.
 * @apiBody {String} [gitHubLink] The updated GitHub link for the blog.
 * @apiBody {Array} [attachments] An array of updated attachments for the blog.
 * @apiBody {String} [thumbnail] The updated thumbnail URL for the blog.
 * @apiBody {String="draft","publish"} [status] The updated status of the blog. Use `"draft"` for drafts or `"publish"` to publish the blog.
 *
 * @apiExample {json} Request Example:
 * PUT /blogs/60f5a13d6b1f0e12345abcde
 * {
 *   "title": "Updated Blog Title",
 *   "content": "Updated blog content",
 *   "tags": ["Node.js", "Express"],
 *   "category": "Technology",
 *   "gitHubLink": "https://github.com/user/repo",
 *   "attachments": ["https://example.com/file1.pdf"],
 *   "thumbnail": "https://example.com/image.jpg",
 *   "status": "publish"
 * }
 *
 * @apiSuccess {Boolean} success Indicates whether the operation was successful (true if successful).
 * @apiSuccess {String} message A success message.
 * @apiSuccess {Object} blog The updated blog object.
 *
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200 OK
 * {
 *   "success": true,
 *   "message": "Blog updated successfully",
 *   "blog": {
 *     "_id": "60f5a13d6b1f0e12345abcde",
 *     "title": "Updated Blog Title",
 *     "content": "Updated blog content",
 *     "tags": ["Node.js", "Express"],
 *     "category": "Technology",
 *     "gitHubLink": "https://github.com/user/repo",
 *     "attachments": ["https://example.com/file1.pdf"],
 *     "thumbnail": "https://example.com/image.jpg",
 *     "status": "published",
 *     "_author": "60f5a13d6b1f0e12345abcd9"
 *   }
 * }
 *
 * @apiError {Boolean} error Indicates whether an error occurred (always true).
 * @apiError {String} message A descriptive message about the error.
 *
 * @apiErrorExample {json} BlogNotFound Error Response:
 * HTTP/1.1 404 Not Found
 * {
 *   "error": true,
 *   "message": "Blog not found"
 * }
 *
 * @apiErrorExample {json} InternalServerError Error Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "error": true,
 *   "message": "An unexpected error occurred"
 * }
 */

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

  /**
 * @api {get} /blogs/:id 5.0 Delete Blog (Soft Delete)
 * @apiName deleteBlog
 * @apiGroup Blogs
 * @apiVersion 5.0.0
 * @apiPermission Authenticated User
 *
 * @apiDescription This endpoint allows an authenticated user to perform a soft delete of a blog they authored. The blog is marked as deleted but not permanently removed from the database.
 *
 * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz".
 *
 * @apiParam {String} id The ID of the blog to delete.
 *
 * @apiExample {json} Request Example:
 * DELETE /blogs/60f5a13d6b1f0e12345abcde
 *
 * @apiExample {json} Request Header Example:
 * Authorization: Bearer <jwt_token>
 *
 * @apiSuccess {Boolean} success Indicates whether the operation was successful.
 * @apiSuccess {String} message A message confirming the blog was soft-deleted.
 *
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200 OK
 * {
 *   "success": true,
 *   "message": "Blog deleted successfully (soft delete)"
 * }
 *
 * @apiError {Boolean} error Indicates whether an error occurred (always true).
 * @apiError {String} message A descriptive message about the error.
 *
 * @apiErrorExample {json} Invalid Blog ID Error Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": true,
 *   "message": "Invalid Blog ID"
 * }
 *
 * @apiErrorExample {json} Blog Not Found Error Response:
 * HTTP/1.1 404 Not Found
 * {
 *   "error": true,
 *   "message": "No Blog Found"
 * }
 *
 * @apiErrorExample {json} Internal Server Error Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": true,
 *   "message": "An unexpected error occurred"
 * }
 */

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

  async publishDraftBlog(req, res) {
    try {
      const { id } = req.params

      const blog = await Blog.findOne({ _id: id, _author: req.user._id })

      if (!blog) {
        return res.status(404).json({ message: 'Blog not found' });
      }

      // Check if the blog is in "Draft" status
      if (blog.status !== 'draft') {
        return res.status(400).json({ message: 'Only draft blogs can be published' });
      }

      // Update the blog status to "Published"
      blog.status = 'published';
      blog.publishedAt = Date.now();

      // Save the updated blog
      await blog.save();

      // Create notification for all users
      try {
        // Get all active users to populate unreadUsers array
        const activeUsers = await User.find({ isActive: true }).select('_id');
        const unreadUsers = activeUsers.map(user => user._id);

        await Notification.create({
          title: 'New Blog Published',
          message: `${req.user.fullName} published a new blog: "${blog.title}" `,
          type: 'new_blog',
          target: 'all',
          sourceUser: req.user._id,
          blogId: blog._id,
          unreadUsers: unreadUsers // Add all active users to unreadUsers array
        });
      } catch (notificationError) {
        console.error('Error creating blog notification:', notificationError);
        // Continue with the response even if notification creation fails
      }

      // Respond with success
      return res.status(200).json({
        error: false,
        message: 'Blog published successfully',
        blog
      });
    } catch (error) {
      console.log("Error is: ", error);
      return res.status(400).json({ error: true, message: error.message })
    }
  },

  /**
   * @api {get} /blogs/drafts 6.0 Get Draft Blogs
   * @apiName getDraftBlogs
   * @apiGroup Blogs
   * @apiVersion 6.0.0
   *  @apiPermission Authenticated User
   *
   * @apiDescription This endpoint retrieves a paginated list of draft blogs authored by the authenticated user. Draft blogs are those with a status of "draft".
   *
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz".
   *
   * @apiParam {Number} [page=1] The page number for pagination.
   * @apiParam {Number} [limit=10] The number of blogs to retrieve per page.
   *
   * @apiExample {json} Request Example:
   * GET /blogs/drafts?page=2&limit=5
   *
   * @apiExample {json} Request Header Example:
   * Authorization: Bearer <jwt_token>
   * @apiSuccessExample {json} Success Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "draftBlogs": [
   *     {
   *       "_id": "60f5a13d6b1f0e12345abcde",
   *       "title": "Draft Blog Title",
   *       "content": "This is a draft blog content...",
   *       "tags": ["tag1", "tag2"],
   *       "category": "Category Name",
   *       "status": "draft",
   *       "_author": {
   *         "email": "user@example.com",
   *         "name": "John Doe",
   *         "profileImage": "http://example.com/image.jpg"
   *       },
   *       "createdAt": "2024-12-01T12:00:00.000Z",
   *       "updatedAt": "2024-12-02T12:00:00.000Z"
   *     }
   *   ],
   *   "totalCount": 15,
   *   "page": 2,
   *   "limit": 5
   * }
   *
   * @apiError {Boolean} error Indicates whether an error occurred (always true).
   * @apiError {String} message A descriptive message about the error.
   *
   * @apiErrorExample {json} No Draft Blogs Error Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": true,
   *   "message": "No draft blogs found"
   * }
   *
   * @apiErrorExample {json} Internal Server Error Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": true,
   *   "message": "An unexpected error occurred"
   * }
  */

  async getDraftBlogs(req, res) {
    try {
      const { body: { page = 1, limit = 10 }
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

      return res.status(200).json({ error: false, draftBlogs, totalCount, page, limit });
    } catch (error) {
      console.log("Error is: ", error);
      return res.status(400).json({ error: true, message: error.message });
    }
  },

  /**
   * @api {get} /blogs/authors 7.0 Get Distinct Authors
   * @apiName getAuthors
   * @apiGroup Blogs
   * @apiVersion 7.0.0
   * @apiPermission Authenticated User
   *
   * @apiDescription This endpoint retrieves a list of distinct authors who have published blogs. The response includes the author's email, full name, and ID.
   *
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz".
   *
   * @apiExample {json} Request Example:
   * GET /blogs/authors
   *
   * @apiExample {json} Request Header Example:
   * Authorization: Bearer <jwt_token>
   *
   * @apiSuccess {Boolean} error Indicates whether the operation was successful (false if successful).
   * @apiSuccess {Object[]} authorsList List of distinct authors.
   * @apiSuccess {String} authorsList.email Author's email address.
   * @apiSuccess {String} authorsList.name Author's full name.
   * @apiSuccess {String} authorsList._id Author's unique ID.
   *
   * @apiSuccessExample {json} Success Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "authorsList": [
   *     {
   *       "email": "alice@example.com",
   *       "name": "Alice Doe",
   *       "_id": "60f5a13d6b1f0e12345abcde"
   *     },
   *     {
   *       "email": "bob@example.com",
   *       "name": "Bob Smith",
   *       "_id": "60f5a13d6b1f0e12345abcd1"
   *     }
   *   ]
   * }
   *
   * @apiError {Boolean} error Indicates whether an error occurred (always true).
   * @apiError {String} message A descriptive message about the error.
   *
   * @apiErrorExample {json} NoAuthorsFound Error Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": true,
   *   "message": "No authors found"
   * }
   *
   * @apiErrorExample {json} InternalServerError Error Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": true,
   *   "message": "An unexpected error occurred"
   * }
   */

  async getAuthors(req, res) {
    try {
      const authors = await Blog.distinct('_author').exec();

      const distinctAuthors = await User.find({ _id: { $in: authors } }).select("email name").exec();

      const authorsList = distinctAuthors.map((author) => {
        return {
          email: author.email,
          name: author.name.full,
          _id: author._id
        };
      });

      if (!authors || authors.length === 0) {
        return res.status(400).json({ error: true, message: "No authors found" });
      }
      return res.status(200).json({ error: false, authorsList });
    } catch (error) {
      console.log("Error is:", error);
      return res.status(400).json({ error: true, message: error.message })

    }
  },

  /**
 * @api {post} /blog/bookmark/:id 1.0 Bookmark/Unbookmark a Blog
 * @apiName BookMarkAndUnbookMark
 * @apiGroup Bookmarks
 * @apiVersion 1.0.0
 * @apiPermission User (Authenticated with JWT)
 *
 * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz".
 *
 * @apiParam {String} id Blog ID to bookmark or unbookmark (sent as a URL parameter).

 *
 * @apiError {Boolean} error Status of the request.
 * @apiError {String} message Error message.
 *
 * @apiSuccessExample {json} Success Response (Bookmarked):
 * HTTP/1.1 200 OK
 * {
 *   "success": true,
 *   "message": "Blog bookmarked",
 *   "bookmarked": true
 * }
 *
 * @apiSuccessExample {json} Success Response (Unbookmarked):
 * HTTP/1.1 200 OK
 * {
 *   "success": true,
 *   "message": "Bookmark removed",
 *   "bookmarked": false
 * }
 *
 * @apiErrorExample {json} User Not Found:
 * HTTP/1.1 404 Not Found
 * {
 *   "error": true,
 *   "message": "User not found"
 * }
 *
 * @apiErrorExample {json} Blog Not Found:
 * HTTP/1.1 404 Not Found
 * {
 *   "error": true,
 *   "message": "Blog not found"
 * }
 *
 * @apiErrorExample {json} Server Error:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "error": true,
 *   "message": "Internal server error"
 * }
 */
  async bookMarkAndUnbookMark(req, res) {
    try {
      const { id } = req.params;  // Blog Id
      const userId = req.user._id; // Assuming user is authenticated

      const user = await User.findOne({ _id: userId });
      if (!user) return res.status(404).json({ error: true, message: "User not found" });

      const blog = await Blog.findOne({ _id: id, status:"published" });
      if (!blog) return res.status(404).json({ error: true, message: "Blog is not available or Not Published" });

      const isBookmarked = user._bookmarks.includes(id);

      if (isBookmarked) {
        // Unbookmark the blog
        user._bookmarks = user._bookmarks.filter(bookmarkId => bookmarkId.toString() !== id);
      } else {
        // Bookmark the blog
        user._bookmarks.push(id);
      }

      await user.save();

      return res.status(200).json({
        success: true,
        message: isBookmarked ? "Bookmark removed" : "Blog bookmarked",
        bookmarked: !isBookmarked
      });

    } catch (error) {
      console.error("Error:", error);
      return res.status(500).json({ error: true, message: error.message });
    }
  },

  /**
 * @api {get} /bookmarks 2.0 Get all bookmarked blogs
 * @apiVersion 2.0.0
 * @apiName GetAllBookmarks
 * @apiGroup Bookmarks
 * @apiPermission Authenticated User
 *
 * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz".
 *
 * @apiError (404) NotFound No bookmarks found for the user.
 * @apiError (500) ServerError Internal server error.
 *
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200 OK
 * {
 *   "message": true,
 *   "blogList": [
 *     {
 *       "_id": "60df1c5e2a4a3b001c8e4d12",
 *       "title": "Understanding Node.js",
 *       "content": "Node.js is a JavaScript runtime...",
 *       "_author": {
 *         "name": "John Doe",
 *         "email": "john@example.com"
 *       }
 *     }
 *   ]
 * }
 *
 * @apiErrorExample {json} Not Found:
 * HTTP/1.1 404 Not Found
 * {
 *   "error": true,
 *   "message": "No bookmarks found"
 * }
 *
 * @apiErrorExample {json} Server Error:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "error": true,
 *   "message": "Internal server error"
 * }
 */

  async getAllBookmarks(req, res) {
    try {
      // Fetch the user and their bookmarked blogs
      const user = await User.findOne({ _id: req.user._id });

      if (!user || !user._bookmarks.length) {
        return res.status(404).json({ error: true, message: 'No bookmarks found' });
      }

      // Fetch all blog details from the bookmarked IDs
      const blogList = await Blog.find({ _id: { $in: user._bookmarks } })
        .populate('_author', 'name email') // Populate blog author details
        .lean(); // Convert to plain JS object for performance

      return res.status(200).json({ message: true, blogList });
    } catch (error) {
      console.error('Error:', error);
      return res.status(500).json({ error: true, message: error.message });
    }
  }



}