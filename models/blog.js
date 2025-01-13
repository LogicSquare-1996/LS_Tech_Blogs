const mongoose = require('mongoose');
const Like = require('./like');
const Comment = require('./comment');

const BlogSchema = new mongoose.Schema({
  _author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  _likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  _comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      comment: {
        type: String
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  likesCount: {
    type: Number,
    default: 0
  },
  commentsCount: {
    type: Number,
    default: 0
  },
  bookmarks: [
    { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Blog' 
    }
  ],
  title: {
    type: String
  },
  content: {
    type: String
  },
  thumbnail: {
    type: String
  },
  tags: {
    type: [String]
  },
  gitHubLink: {
    type: String
  },
  attachments: [
    {
      filename: {
        type: String
      },
      url: {
        type: String
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  category: {
    type: String
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'draft'
  },
  views: {
    type: Number,
    default: 0
  },
  slug: {
    type: String
  },
  readTime: {
    type: Number
  }
});

// Pre-save middleware to generate slug and calculate read time
BlogSchema.pre('save', async function (next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
    const existingBlog = await Blog.findOne({ slug: this.slug });
    if (existingBlog) {
      this.slug = `${this.slug}-${Date.now()}`; // Add a timestamp to make it unique
    }
  }
  next();
});


// Virtual for comment count
BlogSchema.virtual('commentCount').get(function () {
  return this.comments.length;
});

// Virtual for like count
BlogSchema.virtual('likeCount').get(function () {
  return this.likes.length; // Fixed for likes as an array of ObjectId
});

// Pre-remove middleware for cascading delete
BlogSchema.pre('remove', async function (next) {
  // Delete all likes associated with this blog
  await mongoose.model('Like').deleteMany({ _blogId: this._id });

  // Delete all comments associated with this blog
  await mongoose.model('Comment').deleteMany({ _blogId: this._id });

  next();
});

module.exports = mongoose.model('Blog', BlogSchema);
