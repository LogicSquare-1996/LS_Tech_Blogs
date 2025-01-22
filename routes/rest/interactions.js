const Blog = require("../../models/blog");
const User = require("../../models/user");
const BlogInteraction = require("../../models/BlogInteraction");

module.exports ={

  /**
 * @api {post} /blog/:id/interaction Post Blog Interaction
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
 * @apiBody {String} [_blogid=req.params] The blog ID (defaults to `req.params.id`).
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

    async postInteraction(req,res){
        try {
            const {
                body:{
                    category,
                content,
                _blogid = req.params,
                _createdby = req.user._id,
                isReply = false,
                parentComment,
                attachments
                }, params:{
                    id
                }
            } =  req

            
            

            let imageUrl;
            if(req.user.profileImage!== undefined) imageUrl = req.user.profileImage;
            
            if(isReply === true && !parentComment) return res.status(400).json({ error: true, message: "Missing mandatory field `parentComment`" });

            if(!category) return res.status(400).json({ error: true, message: "Missing mandatory field `category`" });

            if(category === "comment" && !content) return res.status(400).json({ error: true, message: "Missing mandatory field `content`" });

            const blog = await Blog.findOne({_id: id}).populate("_author").exec();
            if(!blog) return res.status(400).json({ error: true, message: "Blog not found" });
            
            
            if (category === "like") {
                // Check if the user has already liked this blog
                const checkLike = await BlogInteraction.findOne({
                    category: "like",
                    _blogId: id,
                    _createdBy: _createdby,
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
              }
              if (category === "comment") {
                if (isReply) {
                  const parentInteraction = await BlogInteraction.findById(parentComment);
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
        
              return res.status(201).json({
                error: false,
                interaction,
                message: `${category === "like" ? "Liked" : "Commented"} successfully`,
              });

        } catch (error) {
            console.log("Error is: ",error);
            return res.status(400).json({ error: true, message: error.message })
            
        }
    }
}