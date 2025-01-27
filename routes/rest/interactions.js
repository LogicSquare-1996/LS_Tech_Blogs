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
 *           "_createdBy": {
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
        body: {
          category,
          content,
          _blogId = req.params._id,
          _createdBy = req.user._id,
          isReply = false,
          parentComment,
          attachments
        }, params: {
          id
        }
      } = req




      let imageUrl;
      if (req.user.profileImage !== undefined) imageUrl = req.user.profileImage;

      if (isReply === true && !parentComment) return res.status(400).json({ error: true, message: "Missing mandatory field `parentComment`" });

      if (!category) return res.status(400).json({ error: true, message: "Missing mandatory field `category`" });

      if (category === "comment" && !content) return res.status(400).json({ error: true, message: "Missing mandatory field `content`" });

      const blog = await Blog.findOne({ _id: id, status: "published" }).populate("_author").exec();
      if (!blog) return res.status(400).json({ error: true, message: "Blog not found" });

      //Like logic 
      if (category === "like") {
        // Check if the user has already liked this blog
        const checkLike = await BlogInteraction.findOne({
          category: "like",
          _blogId: id,
          _createdBy: _createdBy,
        });

        if (checkLike) {
          return res.status(400).json({
            error: true,
            message: "You have already liked this blog",
          });
        }

        // Check if the user is the blog author
        if (String(_createdby) === String(blog._author._id)) {
          return res.status(400).json({
            error: true,
            message: "You cannot like your own blog",
          });
        }

        // Increment likes
        blog.likes += 1;
        await blog.save();
      }
      //Comment Reply Logic
      if (category === "comment") {
        if (!content)
          return res.status(400).json({
            error: true,
            message: "Missing mandatory field `content` for comment",
          });

        if (isReply && !parentComment)
          return res.status(400).json({
            error: true,
            message: "Missing mandatory field `parentComment` for reply",
          });

        if (isReply) {
          const parentInteraction = await BlogInteraction.findOne({ _id: parentComment }).exec(); // Fixed: Added `{ _id: parentComment }` for proper query

          if (!parentInteraction)
            return res.status(404).json({
              error: true,
              message: "Parent comment not found",
            });

          parentInteraction.replyCount += 1; // Increment reply count on parent comment
          await parentInteraction.save();
        }

        blog.comments += 1; // Increment comment count on the blog
        await blog.save();
      }

      // Create interaction
      const interaction = await BlogInteraction.create({
        category,
        content,
        _blogId,
        _createdBy,
        isReply,
        _parentComment: isReply ? parentComment : null,
        attachments,
      });

      return res.status(201).json({ error: false, interaction, message: `${category === "like" ? "Liked" : category === "comment" && isReply ? "Replied successfully" : "Commented successfully"}` });

    } catch (error) {
      console.log("Error is: ", error);
      return res.status(400).json({ error: true, message: error.message })

    }
  },


  /**
   * @api {delete} /blog/:id/interaction/:interactionId 1.0 Delete Blog Interaction
   * @apiName DeleteBlogInteraction
   * @apiGroup BlogInteraction
   * @apiVersion 1.0.0
   * 
   * @apiDescription Deletes a comment or reply from a blog post interaction.
   * 
   * @apiParam {String} id The ID of the blog post.
   * @apiParam {String} interactionId The ID of the interaction (comment or reply).
   * 
   * @apiHeader {String} Authorization The JWT Token in format "Bearer xxxx.yyyy.zzzz".
   * 
   * @apiError {Boolean} error Indicates if there was an error.
   * @apiError {String} message A descriptive error message.
   * 
   * @apiErrorExample {json} Blog Not Found (400):
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": true,
   *   "message": "Blog not found"
   * }
   * 
   * @apiErrorExample {json} Interaction Not Found (404):
   * HTTP/1.1 404 Not Found
   * {
   *   "error": true,
   *   "message": "Interaction not found"
   * }
   * 
   * @apiErrorExample {json} Cannot Delete Parent Comment (400):
   * HTTP/1.1 400 Bad Request
   * {
   *   "error": true,
   *   "message": "Cannot delete the parent comment"
   * }
   * 
   * @apiErrorExample {json} Server Error (500):
   * HTTP/1.1 500 Internal Server Error
   * {
   *   "error": true,
   *   "message": "Error message from server"
   * }
   */

  async deleteInteraction(req, res) {
    try {
      const { id, interactionId } = req.params;
      const { _createdBy } = req.user; // Logged in user

      // Find the blog post
      const blog = await Blog.findById(id);
      if (!blog) {
        return res.status(400).json({ error: true, message: "Blog not found" });
      }

      // Find the interaction (comment or reply)
      const interaction = await BlogInteraction.findById(interactionId);
      if (!interaction) {
        return res.status(404).json({ error: true, message: "Interaction not found" });
      }

      // Check if the logged-in user is the creator of the interaction
      if (String(interaction._createdBy) !== String(_createdBy)) {
        return res.status(400).json({ error: true, message: "You cannot delete this interaction" });
      }

      // If it's a reply, update the parent comment's reply count
      if (interaction.isReply) {
        const parentComment = await BlogInteraction.findById(interaction._parentComment);
        if (!parentComment) {
          return res.status(400).json({ error: true, message: "Parent comment not found" });
        }
        parentComment.replyCount -= 1; // Decrease reply count
        await parentComment.save();
      }

      // Decrement comment or like count on the blog
      if (interaction.category === "comment") {
        blog.comments -= 1;
      }
      await blog.save();

      // Delete the interaction (comment or reply)
      await interaction.remove();

      return res.status(200).json({ error: false, message: "Interaction deleted successfully" });
    } catch (error) {
      console.log("Error is: ", error);
      return res.status(500).json({ error: true, message: "Server error" });
    }
  },



}