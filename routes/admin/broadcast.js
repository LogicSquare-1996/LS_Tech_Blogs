const Broadcast = require("../../models/Broadcast");
const User = require("../../models/user");
const Blog = require("../../models/blog");

module.exports = {
  /**
   * @api {post} /admin/broadcast 1.0 Send Announcement
   * @apiName SendAnnouncement
   * @apiGroup Admin Broadcast
   * @apiVersion 1.0.0
   * @apiPermission Admin
   * 
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   * 
   * @apiDescription Creates and sends a broadcast announcement to users.
   * 
   * @apiParam {String} title Title of the announcement
   * @apiParam {String} message Content of the announcement
   * @apiParam {String} target Target audience for the announcement (all, top-contributors, admins, specific-users)
   * @apiParam {Array} [targetUsers] Array of user IDs (required if target is 'specific-users')
   * @apiParam {Date} [expiresAt] Expiration date for the announcement
   * 
   * @apiParamExample {json} Request-Example:
   * {
   *   "title": "System Maintenance",
   *   "message": "The system will be down for maintenance on Saturday from 2-4 AM.",
   *   "target": "all",
   *   "expiresAt": "2023-12-31T23:59:59.999Z"
   * }
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 201 Created
   * {
   *   "error": false,
   *   "message": "Broadcast sent successfully",
   *   "broadcast": {
   *     "_id": "60f5a13d6b1f0e12345abcdf",
   *     "title": "System Maintenance",
   *     "message": "The system will be down for maintenance on Saturday from 2-4 AM.",
   *     "target": "all",
   *     "sentBy": "60f5a13d6b1f0e12345abcd9",
   *     "expiresAt": "2023-12-31T23:59:59.999Z",
   *     "createdAt": "2023-01-01T00:00:00.000Z"
   *   }
   * }
   * 
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": true,
   *   "reason": "Missing required fields"
   * }
   */
  async sendBroadcast(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: true,
          reason: "Unauthorized access"
        });
      }
      
      const { title, message, target, targetUsers, expiresAt } = req.body;
      
      // Validate required fields
      if (!title || !message || !target) {
        return res.status(400).json({
          error: true,
          reason: "Missing required fields: title, message, and target are mandatory"
        });
      }
      
      // Validate target
      const validTargets = ['all', 'top-contributors', 'admins', 'specific-users'];
      if (!validTargets.includes(target)) {
        return res.status(400).json({
          error: true,
          reason: `Invalid target. Must be one of: ${validTargets.join(', ')}`
        });
      }
      
      // If target is 'specific-users', validate targetUsers
      if (target === 'specific-users' && (!targetUsers || !Array.isArray(targetUsers) || targetUsers.length === 0)) {
        return res.status(400).json({
          error: true,
          reason: "targetUsers array is required when target is 'specific-users'"
        });
      }
      
      // Create the broadcast
      const broadcast = await Broadcast.create({
        title,
        message,
        target,
        targetUsers: target === 'specific-users' ? targetUsers : [],
        sentBy: req.user._id,
        expiresAt: expiresAt || null
      });
      
      return res.status(201).json({
        error: false,
        message: "Broadcast sent successfully",
        broadcast
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      });
    }
  },

  /**
   * @api {get} /admin/broadcasts 2.0 Get All Broadcasts
   * @apiName GetAllBroadcasts
   * @apiGroup Admin Broadcast
   * @apiVersion 2.0.0
   * @apiPermission Admin
   * 
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   * 
   * @apiDescription Retrieves a paginated list of all broadcasts.
   * 
   * @apiParam {Number} [page=1] Page number for pagination
   * @apiParam {Number} [limit=10] Number of broadcasts per page
   * @apiParam {Boolean} [active=true] Filter by active status (not expired)
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "broadcasts": [
   *     {
   *       "_id": "60f5a13d6b1f0e12345abcdf",
   *       "title": "System Maintenance",
   *       "message": "The system will be down for maintenance on Saturday from 2-4 AM.",
   *       "target": "all",
   *       "sentBy": {
   *         "_id": "60f5a13d6b1f0e12345abcd9",
   *         "name": {
   *           "full": "Admin User"
   *         }
   *       },
   *       "expiresAt": "2023-12-31T23:59:59.999Z",
   *       "createdAt": "2023-01-01T00:00:00.000Z",
   *       "readCount": 25
   *     }
   *   ],
   *   "totalBroadcasts": 5,
   *   "totalPages": 1,
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
  async getAllBroadcasts(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: true,
          reason: "Unauthorized access"
        });
      }
      
      const { page = 1, limit = 10, active = 'true' } = req.query;
      
      // Build filter
      const filter = {};
      
      // Filter by active status if requested
      if (active === 'true') {
        filter.$or = [
          { expiresAt: { $gt: new Date() } },
          { expiresAt: null }
        ];
      }
      
      // Get total count for pagination
      const totalBroadcasts = await Broadcast.countDocuments(filter);
      
      // Get broadcasts with pagination
      const broadcasts = await Broadcast.find(filter)
        .populate({
          path: 'sentBy',
          select: 'name'
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean()
        .exec();
      
      // Add read count to each broadcast
      const broadcastsWithReadCount = broadcasts.map(broadcast => ({
        ...broadcast,
        readCount: broadcast.readBy ? broadcast.readBy.length : 0
      }));
      
      return res.json({
        error: false,
        broadcasts: broadcastsWithReadCount,
        totalBroadcasts,
        totalPages: Math.ceil(totalBroadcasts / limit),
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
   * @api {get} /admin/exports/:type 3.0 Export Data
   * @apiName ExportData
   * @apiGroup Admin Broadcast
   * @apiVersion 3.0.0
   * @apiPermission Admin
   * 
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   * 
   * @apiParam {String} type Type of data to export (users, blogs, comments)
   * 
   * @apiDescription Exports data in CSV format.
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "message": "Export successful",
   *   "data": "CSV data as string",
   *   "filename": "users_export_2023-01-01.csv"
   * }
   * 
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": true,
   *   "reason": "Invalid export type"
   * }
   */
  async exportData(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: true,
          reason: "Unauthorized access"
        });
      }
      
      const { type } = req.params;
      
      // Validate export type
      const validTypes = ['users', 'blogs', 'comments'];
      if (!validTypes.includes(type)) {
        return res.status(400).json({
          error: true,
          reason: `Invalid export type. Must be one of: ${validTypes.join(', ')}`
        });
      }
      
      let data = '';
      let filename = '';
      const date = new Date().toISOString().split('T')[0];
      
      // Generate export data based on type
      if (type === 'users') {
        const users = await User.find()
          .select('name email username role isActive createdAt')
          .lean()
          .exec();
        
        // Create CSV header
        data = 'ID,First Name,Last Name,Email,Username,Role,Active,Created At\n';
        
        // Add user data
        users.forEach(user => {
          data += `${user._id},${user.name.first || ''},${user.name.last || ''},${user.email || ''},${user.username || ''},${user.role || ''},${user.isActive ? 'Yes' : 'No'},${user.createdAt}\n`;
        });
        
        filename = `users_export_${date}.csv`;
      } else if (type === 'blogs') {
        const blogs = await Blog.find({ isDeleted: false })
          .populate({
            path: '_author',
            select: 'name.full'
          })
          .select('title status views likes comments createdAt')
          .lean()
          .exec();
        
        // Create CSV header
        data = 'ID,Title,Author,Status,Views,Likes,Comments,Created At\n';
        
        // Add blog data
        blogs.forEach(blog => {
          const authorName = blog._author ? blog._author.name.full : 'Unknown';
          data += `${blog._id},${blog.title.replace(/,/g, ' ')},${authorName},${blog.status},${blog.views},${blog.likes},${blog.comments},${blog.createdAt}\n`;
        });
        
        filename = `blogs_export_${date}.csv`;
      } else if (type === 'comments') {
        const comments = await BlogInteraction.find({ 
          category: 'comment',
          isDeleted: false 
        })
          .populate({
            path: '_createdBy',
            select: 'name.full'
          })
          .populate({
            path: '_blogId',
            select: 'title'
          })
          .select('content likes createdAt')
          .lean()
          .exec();
        
        // Create CSV header
        data = 'ID,Content,Author,Blog Title,Likes,Created At\n';
        
        // Add comment data
        comments.forEach(comment => {
          const authorName = comment._createdBy ? comment._createdBy.name.full : 'Unknown';
          const blogTitle = comment._blogId ? comment._blogId.title.replace(/,/g, ' ') : 'Unknown';
          const content = comment.content ? comment.content.replace(/,/g, ' ').replace(/\n/g, ' ') : '';
          
          data += `${comment._id},${content},${authorName},${blogTitle},${comment.likes || 0},${comment.createdAt}\n`;
        });
        
        filename = `comments_export_${date}.csv`;
      }
      
      return res.json({
        error: false,
        message: "Export successful",
        data,
        filename
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      });
    }
  }
};
