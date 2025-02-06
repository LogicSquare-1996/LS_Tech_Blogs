const Blog = require("../../models/blog");
const User = require("../../models/user");
const BlogInteraction = require("../../models/BlogInteraction");

module.exports = {

  /**
 * @api {get} /post/likes/:id 2.0 likes Get Likes for a Blog
 * @apiName GetLikes
 * @apiGroup Blog
 * @apiVersion 2.0.0
 * 
 * @apiDescription Retrieve all likes for a specific blog post along with details about the users who liked the post and blog details.
 * 
 * @apiParam {String} id The ID of the blog to retrieve likes for.
 * 
 * @apiSuccessExample {json} Success Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "error": false,
 *       "interactions": [
 *         {
 *           "_id": "interactionId1",
 *           "category": "like",
 *           "_createdBy": {          // User who liked the post
 *             "name": "John Doe",
 *             "email": "john.doe@example.com"
 *           },
 *           "_blogId": {
 *             "title": "Sample Blog Title",
 *             "content": "This is the blog content.",
 *             "_author": {
 *               "name": "Author Name",
 *               "profileImage": "author-profile.jpg",
 *               "email": "author@example.com"
 *             }
 *           }
 *         }
 *       ]
 *     }
 * 
 * @apiError {Boolean} error Indicates if an error occurred.
 * @apiError {String} message Error message explaining the cause.
 * 
 * @apiErrorExample {json} Blog Not Found:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": true,
 *       "message": "Blog not found"
 *     }
 * 
 * @apiErrorExample {json} Interactions Not Found:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": true,
 *       "message": "Interactions not found"
 *     }
 * 
 * @apiErrorExample {json} Server Error:
 *     HTTP/1.1 400 Bad Request
 *     {
 *       "error": true,
 *       "message": "Error message"
 *     }
 */

  async getLikes(req, res) {
    try {
        
      const blog = await Blog.findOne({_id: req.params.id, status: "published"}).exec()
      if(!blog) return res.status(400).json({error: true, message: "Blog not found"})

        const interactions = await BlogInteraction.find({ category: "like", _blogId: blog._id })
        .populate({
          path: "_createdBy",
          select: "name email", // Only populate `name` and `email`
        })
        .populate({
          path: "_blogId",
          select: "title content",
          populate: {
            path: "_author", // Populate the author of the blog (if `_author` is a reference in the Blog model)
            select: "name profileImage email",
          },
        })
        .exec();
        
      if(!interactions) return res.status(400).json({error: true, message: "Interactions not found"})
      return res.status(200).json({error: false, interactions})

    } catch (error) {
      console.log("Error is: ", error);
      return res.status(400).json({ error: true, message: error.message });
      
    }
  },
  
  /**
 * @api {post} /post/comments/:id 4.0 Get Top Level Comments for a Blog
 * @apiName GetComments
 * @apiGroup Blog
 * @apiVersion 4.0.0
 * @apiPermission User (Authenticated with JWT)
 *
 * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz".
 *
 * @apiParam {Number} [page=1] Page number for pagination.
 * @apiParam {Number} [limit=10] Number of comments per page.
 *
 *
 * @apiError {Boolean} error Status of the request.
 * @apiError {String} message Error message.
 *
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200 OK
 * {
 *   "error": false,
 *   "comments": [
 *     {
 *       "_id": "654321abc",
 *       "content": "This is a great blog post!",
 *       "_createdBy": {
 *         "username": "JohnDoe",
 *         "profilePicture": "https://example.com/profile.jpg"
 *       }
 *     }
 *   ],
 *   "totalComments": 5,
 *   "totalPages": 1,
 *   "currentPage": 1
 * }
 *
 * @apiErrorExample {json} Error Response:
 * HTTP/1.1 500 Internal Server Error
 * {
 *   "error": true,
 *   "message": "Server error"
 * }
 */

  async getComments(req, res) {
    try {
      const { page = 1, limit = 10 } = req.body;
      const skip = (page - 1) * limit;
  
      const comments = await BlogInteraction.find({
        _blogId: req.params.id,
        category: "comment",
        isDeleted: false,
        isReply: false
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .populate("_createdBy", "username name profileImage")
      .exec();
  
      const totalComments = await BlogInteraction.countDocuments({
        _blogId: req.params.id,
        category: "comment",
        isDeleted: false,
        isReply: false
      });
  
      return res.json({
        error: false,
        comments,
        totalComments,
        totalPages: Math.ceil(totalComments / limit),
        currentPage: Number(page),
      });
    } catch (error) {
      console.error("Error fetching comments:", error);
      return res.status(500).json({ error: true, message: "Server error" });
    }
  },

  /**
 * @api {post} /post/replies/:id  5.0.0 Get Replies for a Comment
 * @apiName GetReplies
 * @apiGroup Blog
 * @apiVersion 5.0.0
 * @apiPermission User (Authenticated with JWT)
 *
 * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz".
 *
 * @apiParam {String} id Comment ID whose replies are to be fetched (sent as a URL parameter).
 * @apiParam {Number} [skip=0] Number of replies to skip for pagination.
 * @apiParam {Number} [limit=10] Number of replies to return per request.
 *
 *
 * @apiError {Boolean} error Status of the request.
 * @apiError {String} message Error message.
 *
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200 OK
 * {
 *   "error": false,
 *   "replies": [
 *     {
 *       "_id": "65d431abc",
 *       "content": "Great point! I completely agree.",
 *       "_createdBy": {
 *         "_id": "61234abcd",
 *         "username": "JaneDoe",
 *         "name": "Jane Doe",
 *         "profilePicture": "https://example.com/profile.jpg"
 *       },
 *       "_likedBy": [
 *         { "_id": "67890xyz", "username": "JohnDoe" }
 *       ],
 *       "_blogId": {
 *         "title": "Understanding JavaScript Closures"
 *       }
 *     }
 *   ],
 *   "totalReplies": 5,
 *   "totalPages": 1,
 *   "currentPage": 1
 * }
 *
 * @apiErrorExample {json} Error Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": true,
 *   "message": "Mandatory param `id` is missing or invalid"
 * }
 */


  async getReplies(req, res) {
    try {
      const {
        body: { skip = 0, limit = 10 },
        params: { id },
      } = req;
  
      // Validate the comment ID
      if (!id || id === "") {
        return res.status(400).json({ error: true, message: "Mandatory param `id` is missing or invalid" });
      }
  
      // Fetch replies and count total replies in parallel using Promise.all
      const [replies, totalReplies] = await Promise.all([
        BlogInteraction.find({
          _parentComment: id, // Parent comment reference
          isDeleted: false, // Ensure replies are not deleted
          isReply: true, // Ensure this is a reply
        })
          .sort({ updatedAt: -1 }) // Sort by creation date, descending
          .skip(Number(skip)) // Apply pagination skip
          .populate({
            path: "_createdBy", // Populate user who created the reply
            select: "_id username name profilePicture",
          })
          .populate({
            path: "_likedBy", // Populate users who liked the reply
            select: "_id username",
          })
          .populate({
            path: "_blogId", // Populate the blog associated with the reply
            select: "title", // Adjust fields to return
          })
          .exec(),
  
        BlogInteraction.countDocuments({
          _parentComment:id, // Parent comment reference
          isDeleted: false, // Ensure replies are not deleted
          isReply: true, // Ensure this is a reply
        }).exec(),
      ]);
      const totalPages = Math.ceil(totalReplies / limit); // Total pages
      const currentPage = Math.ceil(skip / limit) + 1; // Current page based on skip and limit
  
      return res.status(200).json({error:false,
        replies, // Paginated list of replies
        totalReplies, // Total count of replies
        totalPages,
        currentPage,
      });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ error: true, message: error.message });
    }
  }
  ,

  /**
 * @api {post} /blog/:id/interaction 1.0 Post Blog Interaction
 * @apiName PostBlogInteraction
 * @apiGroup BlogInteraction
 * @apiVersion 1.0.0
 * 
 * @apiDescription Handles interactions on a blog post, such as likes and comments (including replies to comments).
 * 
 * @apiParam {String} id The ID of the blog post.
 * @apiBody {String} category The interaction category ("like" or "comment"). 
 * @apiBody {String} [content] The comment content (mandatory if `category` is "comment").
 * @apiBody {Boolean} [isReply=false] Indicates whether the comment is a reply to another comment.
 * @apiBody {String} [_blogId=req.params] The blog ID (defaults to `req.params.id`).
 * @apiBody {String} [_createdby=req.user._id] The user ID of the creator (defaults to `req.user._id`).
 * @apiBody {String} [parentComment] The ID of the parent comment (mandatory if `isReply` is `true`).
 * @apiBody {Object[]} [attachments] Attachments related to the interaction.
 * 
 * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz".
 * @apiError {Boolean} error Indicates if there was an error (always `true` for failed requests).
 * @apiError {String} message A descriptive error message.
 * 
 * @apiErrorExample {json} Missing Mandatory Field (400):
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": true,
 *   "message": "Missing mandatory field `content` for comment"
 * }
 * 
 * @apiErrorExample {json} Blog Not Found (400):
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": true,
 *   "message": "Blog not found"
 * }
 * 
 * @apiErrorExample {json} Already Liked (400):
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": true,
 *   "message": "You have already liked this blog"
 * }
 * 
 * @apiErrorExample {json} Cannot Like Own Blog (400):
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": true,
 *   "message": "You cannot like your own blog"
 * }
 * 
 * @apiErrorExample {json} Parent Comment Not Found (404):
 * HTTP/1.1 404 Not Found
 * {
 *   "error": true,
 *   "message": "Parent comment not found"
 * }
 * 
 * @apiErrorExample {json} Server Error (400):
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": true,
 *   "message": "Error message from server"
 * }
 */

  async postInteraction(req, res) {
    try {
      const {
        category,
        content,
        isReply = false,
        parentComment,
        attachments
      } = req.body;
  
      // Ensure `_blogId` is always correctly assigned
      const _blogId = req.body._blogId || req.params.id; 
      const _createdBy = req.user._id;
  
      if (!_blogId) {
        return res.status(400).json({ error: true, message: "Missing mandatory field `_blogId`" });
      }
  
      let imageUrl;
      if (req.user.profileImage !== undefined) imageUrl = req.user.profileImage;
  
      if (isReply && !parentComment) {
        return res.status(400).json({ error: true, message: "Missing mandatory field `parentComment`" });
      }
  
      if (!category) {
        return res.status(400).json({ error: true, message: "Missing mandatory field `category`" });
      }
  
      if (category === "comment" && !content) {
        return res.status(400).json({ error: true, message: "Missing mandatory field `content`" });
      }
  
      // Find the blog
      const blog = await Blog.findOne({ _id: _blogId, status: "published" })
        .populate({ path: "_author", select: "name profileImage email" })
        .exec();
  
      if (!blog) {
        return res.status(400).json({ error: true, message: "Blog not found" });
      }
  
      // Handle "like" category
      if (category === "like") {
        const checkLike = await BlogInteraction.findOne({
          category: "like",
          _blogId,
          _createdBy
        });
  
        if (checkLike) {
          return res.status(400).json({
            error: true,
            message: "You have already liked this blog",
          });
        }
  
        if (String(_createdBy) === String(blog._author._id)) {
          return res.status(400).json({
            error: true,
            message: "You cannot like your own blog",
          });
        }
  
        blog.likes += 1;
        await blog.save();
      }
  
      let replyStored = false;
  
      // Handle "comment" or "reply" category
      if (category === "comment") {
        if (!content) {
          return res.status(400).json({
            error: true,
            message: "Missing mandatory field `content` for comment",
          });
        }
  
        if (isReply && !parentComment) {
          return res.status(400).json({
            error: true,
            message: "Missing mandatory field `parentComment` for reply",
          });
        }
  
        if (isReply) {
          const parentInteraction = await BlogInteraction.findOne({ _id: parentComment }).exec();
          if (!parentInteraction) {
            return res.status(404).json({
              error: true,
              message: "Parent comment not found",
            });
          }
  
          parentInteraction.replyCount += 1;
          await parentInteraction.save();
        }
  
        blog.comments += 1;
        await blog.save();
      }
  
      // Create interaction (comment/reply)
      const interaction = await BlogInteraction.create({
        category,
        content,
        _blogId,
        _createdBy,
        isReply,
        _parentComment: isReply ? parentComment : null,
        attachments,
      });
  
      // If it's a reply, store reply ID in the parent comment's `replies` array
      if (isReply) {
        const parentInteraction = await BlogInteraction.findOneAndUpdate(
          { _id: parentComment },
          { $push: { _replies: interaction._id } }, // Store reply ID in `replies`
          { new: true }
        );
  
        if (parentInteraction) {
          replyStored = true;
        }
      }
  
      return res.status(201).json({
        error: false,
        interaction,
        message: isReply
          ? `Replied successfully${replyStored ? " and reply stored in parent comment" : ""}`
          : "Commented successfully"
      });
  
    } catch (error) {
      console.log("Error is: ", error);
      return res.status(400).json({ error: true, message: error.message });
    }
  },

  /**
 * @api {post} /post/comment/like/:id 3.0 Like or Unlike a Comment/Reply
 * @apiName LikeCommentOrReply
 * @apiGroup BlogInteraction
 * @apiVersion 3.0.0
 * @apiDescription Allows users to like or unlike a comment or reply on a blog post.
 * 
 * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz".
 *
 * @apiParam {String} id The ID of the comment or reply to like or unlike.
 * @apiParam {Boolean} [like] Set to `true` to like the comment/reply.
 * @apiParam {Boolean} [unlike] Set to `true` to unlike the comment/reply.
 *
 * @apiHeader {String} Authorization User's access token.
 *
 * @apiSuccessExample {json} Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "error": false,
 *   "message": "Liked successfully"
 * }
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 404 Not Found
 * {
 *   "error": true,
 *   "message": "Comment or reply not found"
 * }
 *
 * @apiErrorExample {json} Error-Response:
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": true,
 *   "message": "Already liked this comment/reply"
 * }
 */

  async  likeCommentOrReply(req, res) {
    try {
      const { like, unlike } = req.body;
      const interactionId = req.params.id; // The ID of the comment or reply to like/unlike
      const userId = req.user._id;
  
      // Find the comment or reply
      const interaction = await BlogInteraction.findOne({
        _id: interactionId,
        category: "comment", // Applies to both comments and replies
      }).exec();
  
      if (!interaction) {
        return res.status(404).json({ error: true, message: "Comment or reply not found" });
      }
  
      if (like) {
        // Check if the user has already liked the comment/reply
        if (interaction._likedBy.includes(userId)) {
          return res.status(400).json({ error: true, message: "Already liked this comment/reply" });
        }
  
        // Add user to `_likedBy` array and increase likes count
        interaction._likedBy.push(userId);
        interaction.likes += 1;
      } else if (unlike) {
        // Check if the user has liked the comment/reply before
        if (!interaction._likedBy.includes(userId)) {
          return res.status(400).json({ error: true, message: "You haven't liked this comment/reply" });
        }
  
        // Remove user from `_likedBy` array and decrease likes count
        interaction._likedBy = interaction._likedBy.filter((id) => id.toString() !== userId.toString());
        interaction.likes = Math.max(0, interaction.likes - 1);
      }
  
      await interaction.save();
  
      return res.json({ error: false, message: like ? "Liked successfully" : "Unliked successfully" });
    } catch (error) {
      return res.status(400).json({ error: true, message: error.message });
    }
  },

  /**
 * @api {put} /api/blog/comment/:id  6.0.0. Update a Comment
 * @apiName UpdateComment
 * @apiGroup Blog
 * @apiVersion 6.0.0
 * @apiPermission User (Authenticated with JWT)
 *
 * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz".
 *
 * @apiParam {String} id Comment ID to be updated (sent as a URL parameter).
 * @apiParam {String} content The updated comment content.
 *
 * @apiError {Boolean} error Status of the request.
 * @apiError {String} message Error message.
 *
 * @apiSuccessExample {json} Success Response:
 * HTTP/1.1 200 OK
 * {
 *   "error": false,
 *   "message": "Updated successfully"
 * }
 *
 * @apiErrorExample {json} Missing Content:
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": true,
 *   "message": "Missing mandatory field `content`"
 * }
 *
 * @apiErrorExample {json} Comment Not Found:
 * HTTP/1.1 404 Not Found
 * {
 *   "error": true,
 *   "message": "Comment not found"
 * }
 *
 * @apiErrorExample {json} Server Error:
 * HTTP/1.1 400 Bad Request
 * {
 *   "error": true,
 *   "message": "Internal server error"
 * }
 */

  async updateComment(req, res){
    try {
      const {content} =req.body

      if(!content) res.status(400).json({error: true, message: "Missing mandatory field `content`"})
      
      let interaction = await BlogInteraction.findOne({_id: req.params.id, category: "comment", _createdBy: req.user._id}).exec()

      if(!interaction) return res.status(404).json({error: true, message: "Comment not found"})

      interaction.content = content
      await interaction.save()

      return res.json({error: false, message: "Updated successfully"})
      
    } catch (error) {
      console.log("Error is: ", error);
      return res.status(400).json({ error: true, message: error.message });
    }
  },

  /**
 * @api {delete} /post/deleteinteraction/:id  7.0.0 Delete Interaction
 * @apiName DeleteInteraction
 * @apiGroup Blog
 * @apiVersion 7.0.0
 * @apiPermission User (Authenticated with JWT)
 * 
 * @apiParam {String} id The unique ID of the interaction (comment or reply) to be deleted.
 * 
 * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz".
 * 
 * @apiSuccess {Boolean} error false Indicates the request was successful.
 * @apiSuccess {String} message Success message, e.g., "Interaction deleted successfully".
 * 
 * @apiError {Boolean} error true Indicates the request failed.
 * @apiError {String} message Error message detailing the issue.
 * 
 * @apiExample {curl} Example usage:
 *     curl -X DELETE "http://localhost:3000/blog-interactions/12345" \
 *     -H "Authorization: Bearer <your_jwt_token>"
 * 
 * @apiExample {json} Success Response:
 *   HTTP/1.1 200 OK
 *   {
 *     "error": false,
 *     "message": "Interaction deleted successfully"
 *   }
 * 
 * @apiExample {json} Error Response (Interaction already deleted):
 *   HTTP/1.1 400 Bad Request
 *   {
 *     "error": true,
 *     "message": "Interaction has already been deleted"
 *   }
 * 
 * @apiExample {json} Error Response (Permission denied):
 *   HTTP/1.1 403 Forbidden
 *   {
 *     "error": true,
 *     "message": "You cannot delete this reply"
 *   }
 */


  async deleteInteraction(req, res) {
    try {
      const { id } = req.params;
  
      const interaction = await BlogInteraction.findOne({ _id: id, isDeleted: false });
  
      if (!interaction)  return res.status(404).json({error: true, message: "Interaction not found" });
  
      interaction.isDeleted = true;
      await interaction.save();
  
      const blog = await Blog.findOne({ _id: interaction._blogId });
  
      if (interaction.category === "comment") {
        if (!interaction._parentComment) {
          // Main comment: Soft delete all replies
          const replies = await BlogInteraction.find({ _parentComment: interaction._id, isDeleted: false });
  
          await BlogInteraction.updateMany(
            { _parentComment: interaction._id },
            { $set: { isDeleted: true } }
          );
  
          const deletedCount = replies.length + 1; // Main comment + replies
          blog.comments -= deletedCount;
        } else {
          // It's a reply
          await BlogInteraction.updateOne(
            { _id: interaction._parentComment },
            { $inc: { replyCount: -1 } }
          );
  
          blog.comments -= 1;
        }
      }
  
      await blog.save();
  
      return res.status(200).json({error: true, message: "Interaction deleted successfully" });
    } catch (error) {
      return res.status(400).json({error: true, message: "Internal server error" });
    }
  }  
  ,



}