const User = require("../../models/user");
const Blog = require("../../models/blog");
const History = require("../../models/history");

module.exports = {
  /**
   * @api {get} /user/me 1.0 Get Current User Profile
   * @apiName GetCurrentUserProfile
   * @apiGroup User Profile
   * @apiVersion 1.0.0
   * @apiPermission Authenticated User
   * 
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   * 
   * @apiDescription Retrieves the profile information of the currently authenticated user.
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "user": {
   *     "_id": "60f5a13d6b1f0e12345abcd9",
   *     "email": "user@example.com",
   *     "name": {
   *       "first": "John",
   *       "last": "Doe",
   *       "full": "John Doe"
   *     },
   *     "username": "johndoe",
   *     "profileImage": "https://example.com/profile.jpg",
   *     "phone": "1234567890",
   *     "role": "employee",
   *     "isActive": true,
   *     "isVerified": true,
   *     "createdAt": "2023-01-01T00:00:00.000Z",
   *     "updatedAt": "2023-01-02T00:00:00.000Z"
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
  async getCurrentUser(req, res) {
    try {
      const userId = req.user._id;
      
      const user = await User.findById(userId)
        .select("-password -forgotpassword -otp -otpCreatedAt")
        .lean()
        .exec();
      
      if (!user) {
        return res.status(404).json({
          error: true,
          reason: "User not found"
        });
      }
      
      return res.json({
        error: false,
        user
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      });
    }
  },

  /**
   * @api {put} /user/me 2.0 Update Current User Profile
   * @apiName UpdateCurrentUserProfile
   * @apiGroup User Profile
   * @apiVersion 2.0.0
   * @apiPermission Authenticated User
   * 
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   * 
   * @apiDescription Updates the profile information of the currently authenticated user.
   * 
   * @apiParam {Object} [name] User's name object
   * @apiParam {String} [name.first] User's first name
   * @apiParam {String} [name.last] User's last name
   * @apiParam {String} [username] User's username
   * @apiParam {String} [phone] User's phone number
   * @apiParam {String} [gender] User's gender (Male, Female, Other)
   * @apiParam {String} [githubProfile] User's GitHub profile URL
   * @apiParam {Array} [social] User's social media profiles
   * 
   * @apiParamExample {json} Request-Example:
   * {
   *   "name": {
   *     "first": "John",
   *     "last": "Smith"
   *   },
   *   "phone": "9876543210",
   *   "gender": "Male",
   *   "githubProfile": "https://github.com/johnsmith",
   *   "social": [
   *     {
   *       "name": "twitter",
   *       "username": "johnsmith",
   *       "accountUrl": "https://twitter.com/johnsmith"
   *     }
   *   ]
   * }
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "message": "Profile updated successfully",
   *   "user": {
   *     "_id": "60f5a13d6b1f0e12345abcd9",
   *     "email": "user@example.com",
   *     "name": {
   *       "first": "John",
   *       "last": "Smith",
   *       "full": "John Smith"
   *     },
   *     "username": "johnsmith",
   *     "phone": "9876543210",
   *     "gender": "Male",
   *     "githubProfile": "https://github.com/johnsmith",
   *     "social": [
   *       {
   *         "name": "twitter",
   *         "username": "johnsmith",
   *         "accountUrl": "https://twitter.com/johnsmith"
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
  async updateCurrentUser(req, res) {
    try {
      const userId = req.user._id;
      const updateData = req.body;
      
      // Fields that are allowed to be updated
      const allowedFields = ['name', 'username', 'phone', 'gender', 'githubProfile', 'social'];
      
      // Create an object with only the allowed fields
      const filteredData = {};
      allowedFields.forEach(field => {
        if (updateData[field] !== undefined) {
          filteredData[field] = updateData[field];
        }
      });
      
      // Update the user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: filteredData },
        { new: true, runValidators: true }
      )
      .select("-password -forgotpassword -otp -otpCreatedAt")
      .exec();
      
      if (!updatedUser) {
        return res.status(404).json({
          error: true,
          reason: "User not found"
        });
      }
      
      return res.json({
        error: false,
        message: "Profile updated successfully",
        user: updatedUser
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      });
    }
  },

  /**
   * @api {put} /user/profile-picture 3.0 Update Profile Picture
   * @apiName UpdateProfilePicture
   * @apiGroup User Profile
   * @apiVersion 3.0.0
   * @apiPermission Authenticated User
   * 
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   * 
   * @apiDescription Returns a pre-signed S3 URL for uploading a profile picture. The client should use this URL to upload the image directly to S3.
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "uploadUrl": "https://s3-bucket.amazonaws.com/...",
   *   "key": "profile-pictures/user-123456.jpg"
   * }
   * 
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 500 Internal Server Error
   * {
   *   "error": true,
   *   "reason": "Error message"
   * }
   */
  async getProfilePictureUploadUrl(req, res) {
    try {
      // This route will return a pre-signed URL for uploading to S3
      // The actual implementation would use AWS SDK to generate the URL
      // For now, we'll just return a success message
      
      return res.json({
        error: false,
        message: "Please use the /awstempcreds endpoint to get AWS credentials for uploading your profile picture"
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      });
    }
  },

  /**
   * @api {get} /user/profile/:id 4.0 Get Public User Profile
   * @apiName GetPublicUserProfile
   * @apiGroup User Profile
   * @apiVersion 4.0.0
   * @apiPermission Authenticated User
   * 
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   * 
   * @apiParam {String} id User's unique ID
   * 
   * @apiDescription Retrieves the public profile information of a user by their ID.
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "user": {
   *     "_id": "60f5a13d6b1f0e12345abcd9",
   *     "name": {
   *       "first": "John",
   *       "last": "Doe",
   *       "full": "John Doe"
   *     },
   *     "username": "johndoe",
   *     "profileImage": "https://example.com/profile.jpg",
   *     "githubProfile": "https://github.com/johndoe",
   *     "social": [
   *       {
   *         "name": "twitter",
   *         "username": "johndoe",
   *         "accountUrl": "https://twitter.com/johndoe"
   *       }
   *     ],
   *     "blogs": [
   *       {
   *         "_id": "60f5a13d6b1f0e12345abcde",
   *         "title": "My First Blog",
   *         "thumbnail": "https://example.com/thumbnail.jpg",
   *         "createdAt": "2023-01-01T00:00:00.000Z"
   *       }
   *     ]
   *   }
   * }
   * 
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 404 Not Found
   * {
   *   "error": true,
   *   "reason": "User not found"
   * }
   */
  async getPublicUserProfile(req, res) {
    try {
      const { id } = req.params;
      
      // Get user basic info
      const user = await User.findById(id)
        .select("name username profileImage githubProfile social")
        .lean()
        .exec();
      
      if (!user) {
        return res.status(404).json({
          error: true,
          reason: "User not found"
        });
      }
      
      // Get user's published blogs
      const blogs = await Blog.find({ 
        _author: id, 
        status: "published",
        isDeleted: false
      })
      .select("title thumbnail createdAt")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean()
      .exec();
      
      // Add blogs to user object
      user.blogs = blogs;
      
      return res.json({
        error: false,
        user
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      });
    }
  },

  /**
   * @api {get} /user/history 5.0 Get User Reading History
   * @apiName GetUserHistory
   * @apiGroup User Profile
   * @apiVersion 5.0.0
   * @apiPermission Authenticated User
   * 
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz"
   * 
   * @apiDescription Retrieves the reading history of the currently authenticated user.
   * 
   * @apiParam {Number} [page=1] Page number for pagination
   * @apiParam {Number} [limit=10] Number of items per page
   * 
   * @apiSuccessExample {json} Success-Response:
   * HTTP/1.1 200 OK
   * {
   *   "error": false,
   *   "history": [
   *     {
   *       "blogId": {
   *         "_id": "60f5a13d6b1f0e12345abcde",
   *         "title": "My First Blog",
   *         "thumbnail": "https://example.com/thumbnail.jpg",
   *         "_author": {
   *           "_id": "60f5a13d6b1f0e12345abcd9",
   *           "name": {
   *             "full": "John Doe"
   *           }
   *         }
   *       },
   *       "readAt": "2023-01-01T00:00:00.000Z",
   *       "readingTime": 120
   *     }
   *   ],
   *   "totalItems": 25,
   *   "totalPages": 3,
   *   "currentPage": 1
   * }
   * 
   * @apiErrorExample {json} Error-Response:
   * HTTP/1.1 404 Not Found
   * {
   *   "error": true,
   *   "reason": "No reading history found"
   * }
   */
  async getUserHistory(req, res) {
    try {
      const userId = req.user._id;
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;
      
      // Find user's history
      const history = await History.findOne({ userId })
        .lean()
        .exec();
      
      if (!history || !history.readingHistory || history.readingHistory.length === 0) {
        return res.status(404).json({
          error: true,
          reason: "No reading history found"
        });
      }
      
      // Sort reading history by readAt (descending)
      const sortedHistory = history.readingHistory.sort((a, b) => 
        new Date(b.readAt) - new Date(a.readAt)
      );
      
      // Apply pagination
      const paginatedHistory = sortedHistory.slice(skip, skip + parseInt(limit));
      
      // Get blog details for each history item
      const historyWithDetails = await Promise.all(
        paginatedHistory.map(async (item) => {
          const blog = await Blog.findById(item.blogId)
            .select("title thumbnail")
            .populate("_author", "name")
            .lean()
            .exec();
          
          return {
            ...item,
            blogId: blog || { _id: item.blogId, title: "Blog not available" }
          };
        })
      );
      
      return res.json({
        error: false,
        history: historyWithDetails,
        totalItems: sortedHistory.length,
        totalPages: Math.ceil(sortedHistory.length / limit),
        currentPage: parseInt(page)
      });
    } catch (err) {
      return res.status(500).json({
        error: true,
        reason: err.message
      });
    }
  }
};
