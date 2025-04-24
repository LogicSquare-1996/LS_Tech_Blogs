const Notification = require("../../models/Notification");
const User = require("../../models/user");

module.exports = {
  /**
   * Send a system notification to users
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with notification
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

      // Create the notification
      const notification = await Notification.create({
        title,
        message,
        type: 'system',
        target,
        targetUser: target === 'specific_user' ? targetUser : null,
        sourceUser: req.user._id,
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
   * Get all notifications (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with notifications
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
   * Delete a notification (admin only)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Object} JSON response with success status
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
      
      // Find and delete the notification
      const notification = await Notification.findByIdAndDelete(id);
      
      if (!notification) {
        return res.status(404).json({
          error: true,
          reason: "Notification not found"
        });
      }
      
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
