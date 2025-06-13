const Notification = require("../../models/Notification");
const User = require("../../models/user");

module.exports = {
  /**
   * @api {post} /admin/notification 1.0 Send System Notification
   * @apiName SendSystemNotification
   * @apiGroup Admin_Notifications
   * @apiVersion 1.0.0
   * @apiPermission Admin
   *
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   *
   * @apiDescription This endpoint allows administrators to send system notifications to all users or a specific user.
   *
   * @apiParam {String} title Title of the notification
   * @apiParam {String} message Content of the notification
   * @apiParam {String} target Target audience for the notification (must be 'all' or 'specific_user')
   * @apiParam {String} [targetUser] User ID of the specific user (required when target is 'specific_user')
   * @apiParam {Date} [expiresAt] Optional expiration date for the notification
   *
   * @apiExample {json} Request Example - All Users:
   * {
   *   "title": "System Maintenance",
   *   "message": "The system will be down for maintenance on Saturday from 2-4 AM",
   *   "target": "all"
   * }
   *
   * @apiExample {json} Request Example - Specific User:
   * {
   *   "title": "Account Update",
   *   "message": "Your account has been upgraded to premium",
   *   "target": "specific_user",
   *   "targetUser": "60f5a13d6b1f0e12345abcde"
   * }
   *
   * @apiSuccess {Boolean} error Indicates if there was an error (always false for success)
   * @apiSuccess {String} message Success message
   * @apiSuccess {Object} notification The created notification object
   *
   * @apiSuccessExample {json} Success Response:
   * HTTP/1.1 201 Created
   * {
   *   "error": false,
   *   "message": "Notification sent successfully",
   *   "notification": {
   *     "_id": "60f5a13d6b1f0e12345abcde",
   *     "title": "System Maintenance",
   *     "message": "The system will be down for maintenance on Saturday from 2-4 AM",
   *     "type": "system",
   *     "target": "all",
   *     "sourceUser": "60f5a13d6b1f0e12345abcdf",
   *     "createdAt": "2023-07-19T10:30:15.123Z",
   *     "updatedAt": "2023-07-19T10:30:15.123Z"
   *   }
   * }
   *
   * @apiError (400) {Boolean} error Error indicator (always true for errors)
   * @apiError (400) {String} reason Error message
   *
   * @apiErrorExample {json} Error Response - Missing Fields:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": true,
   *   "reason": "Missing required fields: title, message, and target are mandatory"
   * }
   *
   * @apiErrorExample {json} Error Response - Invalid Target:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": true,
   *   "reason": "Invalid target. Must be one of: all, specific_user"
   * }
   *
   * @apiErrorExample {json} Error Response - Missing Target User:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": true,
   *   "reason": "targetUser is required when target is 'specific_user'"
   * }
   *
   * @apiErrorExample {json} Error Response - Unauthorized:
   * HTTP/1.1 403 Forbidden
   * {
   *   "error": true,
   *   "reason": "Unauthorized access"
   * }
   */
  async sendNotification(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: true,
          reason: "Unauthorized access"
        });
      }

      const { title, message, target, targetUser, expiresAt } = req.body;

      // Validate required fields
      if (!title || !message || !target) {
        return res.status(400).json({
          error: true,
          reason: "Missing required fields: title, message, and target are mandatory"
        });
      }

      // Validate target
      const validTargets = ['all', 'specific_user'];
      if (!validTargets.includes(target)) {
        return res.status(400).json({
          error: true,
          reason: `Invalid target. Must be one of: ${validTargets.join(', ')}`
        });
      }

      // If target is 'specific_user', validate targetUser
      if (target === 'specific_user' && !targetUser) {
        return res.status(400).json({
          error: true,
          reason: "targetUser is required when target is 'specific_user'"
        });
      }

      // If target is 'all', get all active user IDs to populate unreadUsers
      let unreadUsers = [];
      if (target === 'all') {
        // Get all active users
        const activeUsers = await User.find({ isActive: true }).select('_id');
        unreadUsers = activeUsers.map(user => user._id);
      }

      // Create the notification
      const notification = await Notification.create({
        title,
        message,
        type: 'system',
        target,
        targetUser: target === 'specific_user' ? targetUser : null,
        sourceUser: req.user._id,
        unreadUsers: target === 'all' ? unreadUsers : [],
        expiresAt: expiresAt || null
      });

      return res.status(201).json({
        error: false,
        message: "Notification sent successfully",
        notification
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      });
    }
  },

  /**
   * @api {post} /admin/notifications 2.0 Get All Notifications
   * @apiName GetAllNotifications
   * @apiGroup Admin_Notifications
   * @apiVersion 2.0.0
   * @apiPermission Admin
   *
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   *
   * @apiDescription This endpoint allows administrators to retrieve all notifications in the system with pagination and filtering options.
   *
   * @apiParam {Number} [page=1] Page number for pagination
   * @apiParam {Number} [limit=10] Number of notifications per page
   * @apiParam {String} [type] Filter notifications by type ('new_blog', 'like', 'comment', 'reply', 'system')
   *
   * @apiExample {json} Request Example:
   * {
   *   "page": 1,
   *   "limit": 10,
   *   "type": "system"
   * }
   *
   * @apiSuccess {Boolean} error Indicates if there was an error (always false for success)
   * @apiSuccess {Array} notifications Array of notification objects
   * @apiSuccess {Object} pagination Pagination information
   * @apiSuccess {Number} pagination.total Total number of notifications
   * @apiSuccess {Number} pagination.page Current page number
   * @apiSuccess {Number} pagination.limit Number of notifications per page
   * @apiSuccess {Number} pagination.pages Total number of pages
   *
   * @apiSuccessExample {json} Success Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "notifications": [
   *     {
   *       "_id": "60f5a13d6b1f0e12345abcde",
   *       "title": "System Maintenance",
   *       "message": "The system will be down for maintenance on Saturday from 2-4 AM",
   *       "type": "system",
   *       "target": "all",
   *       "sourceUser": {
   *         "_id": "60f5a13d6b1f0e12345abcdf",
   *         "name": "Admin User"
   *       },
   *       "isRead": false,
   *       "createdAt": "2023-07-19T10:30:15.123Z",
   *       "updatedAt": "2023-07-19T10:30:15.123Z"
   *     }
   *   ],
   *   "pagination": {
   *     "total": 25,
   *     "page": 1,
   *     "limit": 10,
   *     "pages": 3
   *   }
   * }
   *
   * @apiError (403) {Boolean} error Error indicator (always true for errors)
   * @apiError (403) {String} reason Error message
   *
   * @apiErrorExample {json} Error Response - Unauthorized:
   * HTTP/1.1 403 Forbidden
   * {
   *   "error": true,
   *   "reason": "Unauthorized access"
   * }
   *
   * @apiErrorExample {json} Error Response - Server Error:
   * HTTP/1.1 500 Internal Server Error
   * {
   *   "error": true,
   *   "reason": "Internal server error"
   * }
   */
  async getAllNotifications(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: true,
          reason: "Unauthorized access"
        });
      }

      const { page = 1, limit = 10, type } = req.body;

      // Parse pagination parameters
      const parsedPage = parseInt(page, 10);
      const parsedLimit = parseInt(limit, 10);

      // Build filter
      const filter = {};

      // Filter by type if provided
      if (type) {
        filter.type = type;
      }
      filter.isDeleted = false;

      // Count total notifications
      const totalNotifications = await Notification.countDocuments(filter);

      // Get notifications with pagination
      const notifications = await Notification.find(filter)
        .populate({
          path: 'sourceUser',
          select: 'name'
        })
        .populate({
          path: 'targetUser',
          select: 'name'
        })
        .populate({
          path: 'blogId',
          select: 'title slug'
        })
        .sort({ createdAt: -1 })
        .skip((parsedPage - 1) * parsedLimit)
        .limit(parsedLimit)
        .lean();

      return res.status(200).json({
        error: false,
        notifications,
        pagination: {
          total: totalNotifications,
          page: parsedPage,
          limit: parsedLimit,
          pages: Math.ceil(totalNotifications / parsedLimit)
        }
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      });
    }
  },

  /**
   * @api {delete} /admin/notifications/:id 3.0 Delete Notification
   * @apiName DeleteNotification
   * @apiGroup Admin_Notifications
   * @apiVersion 3.0.0
   * @apiPermission Admin
   *
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   *
   * @apiDescription This endpoint allows administrators to delete a specific notification from the system.
   *
   * @apiParam {String} id Notification's unique ID (in URL path)
   *
   * @apiExample {curl} Example Usage:
   * curl -X DELETE -H "Authorization: Bearer xxxx.yyyy.zzzz" https://api.example.com/admin/notifications/60f5a13d6b1f0e12345abcde
   *
   * @apiSuccess {Boolean} error Indicates if there was an error (always false for success)
   * @apiSuccess {String} message Success message
   *
   * @apiSuccessExample {json} Success Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "message": "Notification deleted successfully"
   * }
   *
   * @apiError (403) {Boolean} error Error indicator (always true for errors)
   * @apiError (403) {String} reason Error message
   *
   * @apiError (404) {Boolean} error Error indicator (always true for errors)
   * @apiError (404) {String} reason Error message
   *
   * @apiErrorExample {json} Error Response - Unauthorized:
   * HTTP/1.1 403 Forbidden
   * {
   *   "error": true,
   *   "reason": "Unauthorized access"
   * }
   *
   * @apiErrorExample {json} Error Response - Not Found:
   * HTTP/1.1 404 Not Found
   * {
   *   "error": true,
   *   "reason": "Notification not found"
   * }
   *
   * @apiErrorExample {json} Error Response - Server Error:
   * HTTP/1.1 500 Internal Server Error
   * {
   *   "error": true,
   *   "reason": "Internal server error"
   * }
   */
  async deleteNotification(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: true,
          reason: "Unauthorized access"
        });
      }

      const { id } = req.params;


      // Find the notification
      const notification = await Notification.findOne({
        _id: id,
        isDeleted: false
      });

      console.log(notification);

      if (!notification) {
        return res.status(404).json({
          error: true,
          reason: "Notification not found"
        });
      }

      // Soft delete the notification
      notification.isDeleted = true;
      await notification.save();

      return res.status(200).json({
        error: false,
        message: "Notification deleted successfully"
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      });
    }
  }
};
