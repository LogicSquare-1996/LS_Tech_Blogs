const Notification = require("../../models/Notification");
const User = require("../../models/user");

module.exports = {
  /**
   * @api {post} /notifications 1.0 Get User Notifications
   * @apiName GetUserNotifications
   * @apiGroup Notifications
   * @apiVersion 1.0.0
   * @apiPermission Authenticated User
   *
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   *
   * @apiDescription This endpoint retrieves notifications for the currently authenticated user with pagination and filtering options.
   *
   * @apiParam {Number} [page=1] Page number for pagination
   * @apiParam {Number} [limit=10] Number of notifications per page
   * @apiParam {Boolean} [unreadOnly=false] Filter to show only unread notifications
   *
   * @apiExample {json} Request Example:
   * {
   *   "page": 1,
   *   "limit": 10,
   *   "unreadOnly": false
   * }
   *
   * @apiSuccess {Boolean} error Indicates if there was an error (always false for success)
   * @apiSuccess {Array} notifications Array of notification objects
   * @apiSuccess {Object} pagination Pagination information
   * @apiSuccess {Number} pagination.total Total number of notifications
   * @apiSuccess {Number} pagination.unreadCount Number of unread notifications
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
   *       "title": "New Blog Published",
   *       "message": "A new blog 'JavaScript Best Practices' has been published",
   *       "type": "new_blog",
   *       "target": "all",
   *       "sourceUser": {
   *         "_id": "60f5a13d6b1f0e12345abcdf",
   *         "name": "John Doe"
   *       },
   *       "blogId": {
   *         "_id": "60f5a13d6b1f0e12345abcdg",
   *         "title": "JavaScript Best Practices",
   *         "slug": "javascript-best-practices"
   *       },
   *       "isRead": false,
   *       "createdAt": "2023-07-19T10:30:15.123Z",
   *       "updatedAt": "2023-07-19T10:30:15.123Z"
   *     }
   *   ],
   *   "pagination": {
   *     "total": 25,
   *     "unreadCount": 10,
   *     "page": 1,
   *     "limit": 10,
   *     "pages": 3
   *   }
   * }
   *
   * @apiError (500) {Boolean} error Error indicator (always true for errors)
   * @apiError (500) {String} reason Error message
   *
   * @apiErrorExample {json} Error Response:
   * HTTP/1.1 500 Internal Server Error
   * {
   *   "error": true,
   *   "reason": "Internal server error"
   * }
   */
  async getUserNotifications(req, res) {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 10, unreadOnly = false } = req.body;

      // Parse pagination parameters
      const parsedPage = parseInt(page, 10);
      const parsedLimit = parseInt(limit, 10);
      const parsedUnreadOnly = unreadOnly === true || unreadOnly === "true";

      // Build filter for notifications that target this user
      const filter = {
        $or: [
          { target: 'all' },
          { targetUser: userId }
        ]
      };

      // Count total notifications for this user
      const totalNotifications = await Notification.countDocuments(filter);

      // Count unread notifications for this user
      const unreadFilter = { ...filter, isRead: false };
      const unreadCount = await Notification.countDocuments(unreadFilter);

      // If unreadOnly is true, add read status filter
      if (parsedUnreadOnly) {
        filter.isRead = false;
      }

      // Get notifications with pagination
      const notifications = await Notification.find(filter)
        .populate({
          path: 'sourceUser',
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
          unreadCount,
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
   * @api {put} /notifications/:id/read 2.0 Mark Notification as Read
   * @apiName MarkNotificationAsRead
   * @apiGroup Notifications
   * @apiVersion 2.0.0
   * @apiPermission Authenticated User
   *
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   *
   * @apiDescription This endpoint marks a specific notification as read for the currently authenticated user.
   *
   * @apiParam {String} id Notification's unique ID (in URL path)
   *
   * @apiExample {curl} Example Usage:
   * curl -X PUT -H "Authorization: Bearer xxxx.yyyy.zzzz" https://api.example.com/notifications/60f5a13d6b1f0e12345abcde/read
   *
   * @apiSuccess {Boolean} error Indicates if there was an error (always false for success)
   * @apiSuccess {String} message Success message
   *
   * @apiSuccessExample {json} Success Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "message": "Notification marked as read"
   * }
   *
   * @apiError (403) {Boolean} error Error indicator (always true for errors)
   * @apiError (403) {String} reason Error message
   *
   * @apiError (404) {Boolean} error Error indicator (always true for errors)
   * @apiError (404) {String} reason Error message
   *
   * @apiErrorExample {json} Error Response - Not Found:
   * HTTP/1.1 404 Not Found
   * {
   *   "error": true,
   *   "reason": "Notification not found"
   * }
   *
   * @apiErrorExample {json} Error Response - Unauthorized:
   * HTTP/1.1 403 Forbidden
   * {
   *   "error": true,
   *   "reason": "You don't have permission to access this notification"
   * }
   *
   * @apiErrorExample {json} Error Response - Server Error:
   * HTTP/1.1 500 Internal Server Error
   * {
   *   "error": true,
   *   "reason": "Internal server error"
   * }
   */
  async markNotificationAsRead(req, res) {
    try {
      const userId = req.user._id;
      const { id } = req.params;

      // Find the notification
      const notification = await Notification.findById(id);

      if (!notification) {
        return res.status(404).json({
          error: true,
          reason: "Notification not found"
        });
      }

      // Check if the notification is for this user or for all users
      if (notification.target !== 'all' &&
          (!notification.targetUser || !notification.targetUser.equals(userId))) {
        return res.status(403).json({
          error: true,
          reason: "You don't have permission to access this notification"
        });
      }

      // Mark as read
      notification.isRead = true;
      notification.readAt = new Date();
      await notification.save();

      return res.status(200).json({
        error: false,
        message: "Notification marked as read"
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      });
    }
  },

  /**
   * @api {put} /notifications/read-all 3.0 Mark All Notifications as Read
   * @apiName MarkAllNotificationsAsRead
   * @apiGroup Notifications
   * @apiVersion 3.0.0
   * @apiPermission Authenticated User
   *
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   *
   * @apiDescription This endpoint marks all notifications as read for the currently authenticated user.
   *
   * @apiExample {curl} Example Usage:
   * curl -X PUT -H "Authorization: Bearer xxxx.yyyy.zzzz" https://api.example.com/notifications/read-all
   *
   * @apiSuccess {Boolean} error Indicates if there was an error (always false for success)
   * @apiSuccess {String} message Success message with the number of notifications marked as read
   *
   * @apiSuccessExample {json} Success Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "message": "5 notifications marked as read"
   * }
   *
   * @apiError (500) {Boolean} error Error indicator (always true for errors)
   * @apiError (500) {String} reason Error message
   *
   * @apiErrorExample {json} Error Response:
   * HTTP/1.1 500 Internal Server Error
   * {
   *   "error": true,
   *   "reason": "Internal server error"
   * }
   */
  async markAllNotificationsAsRead(req, res) {
    try {
      const userId = req.user._id;

      // Build filter for notifications that target this user
      const filter = {
        $or: [
          { target: 'all' },
          { targetUser: userId }
        ],
        isRead: false
      };

      // Update all matching notifications
      const result = await Notification.updateMany(
        filter,
        {
          $set: {
            isRead: true,
            readAt: new Date()
          }
        }
      );

      return res.status(200).json({
        error: false,
        message: `${result.nModified} notifications marked as read`
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      });
    }
  },

  /**
   * @api {post} /notifications/unread-count 4.0 Get Unread Notification Count
   * @apiName GetUnreadNotificationCount
   * @apiGroup Notifications
   * @apiVersion 4.0.0
   * @apiPermission Authenticated User
   *
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   *
   * @apiDescription This endpoint retrieves the count of unread notifications for the currently authenticated user.
   *
   * @apiExample {curl} Example Usage:
   * curl -X POST -H "Authorization: Bearer xxxx.yyyy.zzzz" https://api.example.com/notifications/unread-count
   *
   * @apiSuccess {Boolean} error Indicates if there was an error (always false for success)
   * @apiSuccess {Number} unreadCount Number of unread notifications
   *
   * @apiSuccessExample {json} Success Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "unreadCount": 5
   * }
   *
   * @apiError (500) {Boolean} error Error indicator (always true for errors)
   * @apiError (500) {String} reason Error message
   *
   * @apiErrorExample {json} Error Response:
   * HTTP/1.1 500 Internal Server Error
   * {
   *   "error": true,
   *   "reason": "Internal server error"
   * }
   */
  async getUnreadNotificationCount(req, res) {
    try {
      const userId = req.user._id;

      // Build filter for notifications that target this user
      const filter = {
        $or: [
          { target: 'all' },
          { targetUser: userId }
        ],
        isRead: false
      };

      // Count unread notifications
      const unreadCount = await Notification.countDocuments(filter);

      return res.status(200).json({
        error: false,
        unreadCount
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      });
    }
  }
};
