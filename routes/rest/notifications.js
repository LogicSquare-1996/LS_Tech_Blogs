const Notification = require("../../models/Notification");
const User = require("../../models/user");

module.exports = {
  /**
   * Get notifications for the current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with notifications
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
   * Mark a notification as read
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with success status
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
   * Mark all notifications as read for the current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with success status
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
   * Get unread notification count for the current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with unread count
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
