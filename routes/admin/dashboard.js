const User = require("../../models/user");
const Blog = require("../../models/blog");
const BlogInteraction = require("../../models/BlogInteraction");
const Report = require("../../models/Report");

module.exports = {
  /**
   * @api {get} /admin/dashboard/stats 1.0 Get Dashboard Statistics
   * @apiName GetDashboardStats
   * @apiGroup Admin Dashboard
   * @apiVersion 1.0.0
   * @apiPermission Admin
   * 
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   * 
   * @apiDescription Retrieves statistics for the admin dashboard.
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "stats": {
   *     "totalUsers": 150,
   *     "activeUsers": 120,
   *     "newUsersToday": 5,
   *     "totalBlogs": 75,
   *     "publishedBlogs": 60,
   *     "draftBlogs": 15,
   *     "totalComments": 300,
   *     "totalLikes": 450,
   *     "pendingReports": 3,
   *     "topAuthors": [
   *       {
   *         "_id": "60f5a13d6b1f0e12345abcd9",
   *         "name": {
   *           "full": "John Doe"
   *         },
   *         "blogCount": 10
   *       }
   *     ],
   *     "popularBlogs": [
   *       {
   *         "_id": "60f5a13d6b1f0e12345abcde",
   *         "title": "Popular Blog Title",
   *         "views": 1200,
   *         "likes": 45,
   *         "comments": 20
   *       }
   *     ]
   *   }
   * }
   * 
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 500 Internal Server Error
   * {
   *   "error": true,
   *   "reason": "Error message"
   * }
   */
  async getDashboardStats(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: true,
          reason: "Unauthorized access"
        });
      }
      
      // Get today's date at midnight
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Run all queries in parallel for better performance
      const [
        totalUsers,
        activeUsers,
        newUsersToday,
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalComments,
        totalLikes,
        pendingReports,
        topAuthors,
        popularBlogs
      ] = await Promise.all([
        // User stats
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ createdAt: { $gte: today } }),
        
        // Blog stats
        Blog.countDocuments({ isDeleted: false }),
        Blog.countDocuments({ status: 'published', isDeleted: false }),
        Blog.countDocuments({ status: 'draft', isDeleted: false }),
        
        // Interaction stats
        BlogInteraction.countDocuments({ category: 'comment', isDeleted: false }),
        BlogInteraction.countDocuments({ category: 'like', isDeleted: false }),
        
        // Report stats
        Report.countDocuments({ status: 'pending' }),
        
        // Top authors (by number of blogs)
        Blog.aggregate([
          { $match: { isDeleted: false } },
          { $group: { _id: '$_author', blogCount: { $sum: 1 } } },
          { $sort: { blogCount: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'author'
            }
          },
          { $unwind: '$author' },
          {
            $project: {
              _id: '$author._id',
              name: '$author.name',
              blogCount: 1
            }
          }
        ]),
        
        // Popular blogs (by views)
        Blog.find({ status: 'published', isDeleted: false })
          .sort({ views: -1 })
          .limit(5)
          .select('title views likes comments')
          .lean()
      ]);
      
      return res.json({
        error: false,
        stats: {
          totalUsers,
          activeUsers,
          newUsersToday,
          totalBlogs,
          publishedBlogs,
          draftBlogs,
          totalComments,
          totalLikes,
          pendingReports,
          topAuthors,
          popularBlogs
        }
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      });
    }
  }
};
