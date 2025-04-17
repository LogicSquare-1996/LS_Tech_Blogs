const Blog = require("../../models/blog");
const User = require("../../models/user");
const BlogInteraction = require("../../models/BlogInteraction");

module.exports = {
  /**
   * @api {get} /admin/blogs 1.0 Get All Blogs
   * @apiName GetAllBlogs
   * @apiGroup Admin Blogs
   * @apiVersion 1.0.0
   * @apiPermission Admin
   * 
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   * 
   * @apiDescription Retrieves a paginated list of all blogs with optional filtering.
   * 
   * @apiParam {Number} [page=1] Page number for pagination
   * @apiParam {Number} [limit=10] Number of blogs per page
   * @apiParam {String} [search] Search term to filter blogs by title or content
   * @apiParam {String} [status] Filter blogs by status (published, draft)
   * @apiParam {String} [author] Filter blogs by author ID
   * @apiParam {String} [sortBy=createdAt] Field to sort by (createdAt, title, views, likes, comments)
   * @apiParam {String} [sortOrder=desc] Sort order (asc, desc)
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "blogs": [
   *     {
   *       "_id": "60f5a13d6b1f0e12345abcde",
   *       "title": "Blog Title",
   *       "content": "Blog content...",
   *       "status": "published",
   *       "_author": {
   *         "_id": "60f5a13d6b1f0e12345abcd9",
   *         "name": {
   *           "full": "John Doe"
   *         }
   *       },
   *       "views": 100,
   *       "likes": 10,
   *       "comments": 5,
   *       "createdAt": "2023-01-01T00:00:00.000Z"
   *     }
   *   ],
   *   "totalBlogs": 50,
   *   "totalPages": 5,
   *   "currentPage": 1
   * }
   * 
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 403 Forbidden
   * {
   *   "error": true,
   *   "reason": "Unauthorized access"
   * }
   */
  async getAllBlogs(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: true,
          reason: "Unauthorized access"
        });
      }
      
      const {
        page = 1,
        limit = 10,
        search = '',
        status,
        author,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      // Build filter
      const filter = { isDeleted: false };
      
      // Add search filter if provided
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ];
      }
      
      // Add status filter if provided
      if (status) {
        filter.status = status;
      }
      
      // Add author filter if provided
      if (author) {
        filter._author = author;
      }
      
      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
      
      // Get total count for pagination
      const totalBlogs = await Blog.countDocuments(filter);
      
      // Get blogs with pagination
      const blogs = await Blog.find(filter)
        .populate({
          path: '_author',
          select: 'name'
        })
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean()
        .exec();
      
      return res.json({
        error: false,
        blogs,
        totalBlogs,
        totalPages: Math.ceil(totalBlogs / limit),
        currentPage: parseInt(page)
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      });
    }
  },

  /**
   * @api {delete} /admin/blogs/:id 2.0 Delete Blog
   * @apiName DeleteBlog
   * @apiGroup Admin Blogs
   * @apiVersion 2.0.0
   * @apiPermission Admin
   * 
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   * 
   * @apiParam {String} id Blog's unique ID
   * 
   * @apiDescription Soft deletes a blog by setting its isDeleted flag to true.
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "message": "Blog deleted successfully"
   * }
   * 
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 404 Not Found
   * {
   *   "error": true,
   *   "reason": "Blog not found"
   * }
   */
  async deleteBlog(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: true,
          reason: "Unauthorized access"
        });
      }
      
      const { id } = req.params;
      
      // Find the blog
      const blog = await Blog.findById(id);
      
      if (!blog) {
        return res.status(404).json({
          error: true,
          reason: "Blog not found"
        });
      }
      
      // Soft delete the blog
      blog.isDeleted = true;
      await blog.save();
      
      return res.json({
        error: false,
        message: "Blog deleted successfully"
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      });
    }
  },

  /**
   * @api {get} /admin/comments 3.0 Get All Comments
   * @apiName GetAllComments
   * @apiGroup Admin Blogs
   * @apiVersion 3.0.0
   * @apiPermission Admin
   * 
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   * 
   * @apiDescription Retrieves a paginated list of all comments with optional filtering.
   * 
   * @apiParam {Number} [page=1] Page number for pagination
   * @apiParam {Number} [limit=10] Number of comments per page
   * @apiParam {String} [search] Search term to filter comments by content
   * @apiParam {String} [blogId] Filter comments by blog ID
   * @apiParam {String} [userId] Filter comments by user ID
   * @apiParam {String} [sortBy=createdAt] Field to sort by (createdAt, likes)
   * @apiParam {String} [sortOrder=desc] Sort order (asc, desc)
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "comments": [
   *     {
   *       "_id": "60f5a13d6b1f0e12345abcdf",
   *       "content": "Comment content...",
   *       "_createdBy": {
   *         "_id": "60f5a13d6b1f0e12345abcd9",
   *         "name": {
   *           "full": "John Doe"
   *         }
   *       },
   *       "_blogId": {
   *         "_id": "60f5a13d6b1f0e12345abcde",
   *         "title": "Blog Title"
   *       },
   *       "likes": 5,
   *       "createdAt": "2023-01-01T00:00:00.000Z"
   *     }
   *   ],
   *   "totalComments": 100,
   *   "totalPages": 10,
   *   "currentPage": 1
   * }
   * 
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 403 Forbidden
   * {
   *   "error": true,
   *   "reason": "Unauthorized access"
   * }
   */
  async getAllComments(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: true,
          reason: "Unauthorized access"
        });
      }
      
      const {
        page = 1,
        limit = 10,
        search = '',
        blogId,
        userId,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;
      
      // Build filter
      const filter = { 
        category: 'comment',
        isDeleted: false 
      };
      
      // Add search filter if provided
      if (search) {
        filter.content = { $regex: search, $options: 'i' };
      }
      
      // Add blog filter if provided
      if (blogId) {
        filter._blogId = blogId;
      }
      
      // Add user filter if provided
      if (userId) {
        filter._createdBy = userId;
      }
      
      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
      
      // Get total count for pagination
      const totalComments = await BlogInteraction.countDocuments(filter);
      
      // Get comments with pagination
      const comments = await BlogInteraction.find(filter)
        .populate({
          path: '_createdBy',
          select: 'name'
        })
        .populate({
          path: '_blogId',
          select: 'title'
        })
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean()
        .exec();
      
      return res.json({
        error: false,
        comments,
        totalComments,
        totalPages: Math.ceil(totalComments / limit),
        currentPage: parseInt(page)
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      });
    }
  },

  /**
   * @api {delete} /admin/comments/:id 4.0 Delete Comment
   * @apiName DeleteComment
   * @apiGroup Admin Blogs
   * @apiVersion 4.0.0
   * @apiPermission Admin
   * 
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   * 
   * @apiParam {String} id Comment's unique ID
   * 
   * @apiDescription Soft deletes a comment by setting its isDeleted flag to true.
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "message": "Comment deleted successfully"
   * }
   * 
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 404 Not Found
   * {
   *   "error": true,
   *   "reason": "Comment not found"
   * }
   */
  async deleteComment(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: true,
          reason: "Unauthorized access"
        });
      }
      
      const { id } = req.params;
      
      // Find the comment
      const comment = await BlogInteraction.findOne({
        _id: id,
        category: 'comment'
      });
      
      if (!comment) {
        return res.status(404).json({
          error: true,
          reason: "Comment not found"
        });
      }
      
      // Soft delete the comment
      comment.isDeleted = true;
      await comment.save();
      
      // Update comment count on the blog
      const blog = await Blog.findById(comment._blogId);
      if (blog) {
        blog.comments = Math.max(0, blog.comments - 1);
        await blog.save();
      }
      
      return res.json({
        error: false,
        message: "Comment deleted successfully"
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      });
    }
  }
};
