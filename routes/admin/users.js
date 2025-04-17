const User = require("../../models/user")
const Blog = require("../../models/blog")
const BlogInteraction = require("../../models/BlogInteraction")

module.exports = {
  /**
    *
    * @api {get} /user/:id get user details
    * @apiName userDetails
    * @apiGroup Admin-User
    * @apiVersion  1.0.0
    * @apiPermission User
    *
    * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
    *
    * @apiParam {String} id Users unique ID.
    *
    * @apiSuccess (200) {json} name description
    *
    * @apiSuccessExample {type} Success-Response:
      {
        "error" : false,
        "user" : {
          "email": "myEmail@logic-square.com",
          "phone": "00000000000",
          "name"  : {
            "first":"Jhon",
            "last" :"Doe"
          }
        }
      }
    *
    *
  */
  async get(req, res) {
    try {
      const {
        id
      } = req.params
      const user = await User.findOne({
          _id: id,
          isAdmin: true
        })
        .select("-password -forgotpassword")
        .exec()
      if (user === null) throw new Error("No admin user found for the given id")
      return res.json({
        error: false,
        user
      })
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      })
    }
  },

  /**
   * @api {get} /admin/users 2.0 Get All Users
   * @apiName GetAllUsers
   * @apiGroup Admin Users
   * @apiVersion 2.0.0
   * @apiPermission Admin
   *
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   *
   * @apiDescription Retrieves a paginated list of all users with optional filtering.
   *
   * @apiParam {Number} [page=1] Page number for pagination
   * @apiParam {Number} [limit=10] Number of users per page
   * @apiParam {String} [search] Search term to filter users by name or email
   * @apiParam {String} [role] Filter users by role (employee, admin)
   * @apiParam {Boolean} [isActive] Filter users by active status
   * @apiParam {String} [sortBy=createdAt] Field to sort by (createdAt, name.first, email)
   * @apiParam {String} [sortOrder=desc] Sort order (asc, desc)
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "users": [
   *     {
   *       "_id": "60f5a13d6b1f0e12345abcd9",
   *       "email": "user@example.com",
   *       "name": {
   *         "first": "John",
   *         "last": "Doe",
   *         "full": "John Doe"
   *       },
   *       "username": "johndoe",
   *       "role": "employee",
   *       "isActive": true,
   *       "isVerified": true,
   *       "createdAt": "2023-01-01T00:00:00.000Z"
   *     }
   *   ],
   *   "totalUsers": 150,
   *   "totalPages": 15,
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
  async getAllUsers(req, res) {
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
        role,
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build filter
      const filter = {};

      // Add search filter if provided
      if (search) {
        filter.$or = [
          { 'name.first': { $regex: search, $options: 'i' } },
          { 'name.last': { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } }
        ];
      }

      // Add role filter if provided
      if (role) {
        filter.role = role;
      }

      // Add isActive filter if provided
      if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
      }

      // Build sort object
      const sort = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Get total count for pagination
      const totalUsers = await User.countDocuments(filter);

      // Get users with pagination
      const users = await User.find(filter)
        .select("-password -forgotpassword -otp -otpCreatedAt")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean()
        .exec();

      return res.json({
        error: false,
        users,
        totalUsers,
        totalPages: Math.ceil(totalUsers / limit),
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
   * @api {put} /admin/user/:id/role 3.0 Update User Role
   * @apiName UpdateUserRole
   * @apiGroup Admin Users
   * @apiVersion 3.0.0
   * @apiPermission Admin
   *
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   *
   * @apiParam {String} id User's unique ID
   * @apiParam {String} role New role for the user (employee, admin)
   *
   * @apiDescription Updates a user's role.
   *
   * @apiParamExample {json} Request-Example:
   * {
   *   "role": "admin"
   * }
   *
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "message": "User role updated successfully",
   *   "user": {
   *     "_id": "60f5a13d6b1f0e12345abcd9",
   *     "email": "user@example.com",
   *     "name": {
   *       "full": "John Doe"
   *     },
   *     "role": "admin"
   *   }
   * }
   *
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": true,
   *   "reason": "Invalid role"
   * }
   */
  async updateUserRole(req, res) {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          error: true,
          reason: "Unauthorized access"
        });
      }

      const { id } = req.params;
      const { role } = req.body;

      // Validate role
      if (!role || !['employee', 'admin'].includes(role)) {
        return res.status(400).json({
          error: true,
          reason: "Invalid role. Role must be 'employee' or 'admin'"
        });
      }

      // Update user role
      const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: { role } },
        { new: true }
      )
      .select("_id email name role")
      .exec();

      if (!updatedUser) {
        return res.status(404).json({
          error: true,
          reason: "User not found"
        });
      }

      return res.json({
        error: false,
        message: "User role updated successfully",
        user: updatedUser
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      });
    }
  }
}