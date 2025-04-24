const mongoose = require("mongoose");

const BlogInteractionSchema = new mongoose.Schema({
  category: {
    type: String,
    enum: ["like", "comment"], // Specifies whether the interaction is a like or comment
  },
  _createdBy: { // The user who created the interaction (like/comment)
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  _updatedBy: { // The user who last updated the interaction
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  content: { // Content of the comment (only applicable for comments)
    type: String,
  },
  _blogId: { // The blog associated with the interaction
    type: mongoose.Schema.Types.ObjectId,
    ref: "Blog",
  },
  _parentComment: { // The parent comment if this is a reply
    type: mongoose.Schema.Types.ObjectId,
    ref: "BlogInteraction",
  },
  attachments:{
    type: String  //Can be image or any attachments
  },
  isDeleted: { // Indicates whether the interaction is soft-deleted
    type: Boolean,
    default: false,
  },
  likes: { // Number of likes on this comment or reply
    type: Number,
    default: 0,
    min: 0,
  },
  _likedBy: [ // List of users who liked this interaction comment or reply
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  isReply: {
    type: Boolean,
    default: false
  },
  _replies: [ // List of replies to this comment
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BlogInteraction",
    },
  ],
  replyCount: { // Number of replies to this comment
    type: Number,
    default: 0,
  },
});

// Hook to update blog counts when an interaction is saved or removed
BlogInteractionSchema.post("save", async function () {
  if (!this._blogId) return;

  const blog = await mongoose.model("Blog").findById(this._blogId);
  if (!blog) return;

  try {
    if (this.category === "like") {
      // Update the like count of the blog
      blog.likeCount = await mongoose.model("BlogInteraction").countDocuments({
        _blogId: this._blogId,
        category: "like",
        isDeleted: false,
      });
    } else if (this.category === "comment") {
      // Update the comment count and reply count
      blog.commentCount = await mongoose.model("BlogInteraction").countDocuments({
        _blogId: this._blogId,
        category: "comment",
        isDeleted: false,
      });

      // Update the reply count based on replies to comments
      blog.replyCount = await mongoose.model("BlogInteraction").countDocuments({
        _parentComment: { $exists: true },
        isDeleted: false,
      });
    }
  } catch (error) {
    console.error('Error updating blog counts:', error);
  }

  await blog.save();
});

// Hook to update blog counts when an interaction is removed (soft delete or hard delete)
BlogInteractionSchema.post("remove", async function () {
  if (!this._blogId) return;

  const blog = await mongoose.model("Blog").findById(this._blogId);

  if (this.category === "like") {
    // Update the like count of the blog
    blog.likeCount = await mongoose.model("BlogInteraction").countDocuments({
      _blogId: this._blogId,
      category: "like",
      isDeleted: false,
    });
  } else if (this.category === "comment") {
    // Update the comment count
    blog.commentCount = await mongoose.model("BlogInteraction").countDocuments({
      _blogId: this._blogId,
      category: "comment",
      isDeleted: false,
    });
    // Update the reply count based on replies to comments
    blog.replyCount = await mongoose.model("BlogInteraction").countDocuments({
      _parentComment: { $exists: true },
      isDeleted: false,
    });
  }

  await blog.save();
});

// Enable virtuals for better data representation
BlogInteractionSchema.set("toObject", { virtuals: true });
BlogInteractionSchema.set("toJSON", { virtuals: true });
BlogInteractionSchema.set("timestamps", true);

module.exports = mongoose.model("BlogInteraction", BlogInteractionSchema);
