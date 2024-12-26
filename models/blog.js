const mongoose = require('mongoose');

const BlogSchema = new mongoose.Schema({
  title: {
    type: String
  },
  content: {
    type: String
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: {
    type: [String]
  },
  gitHubLink: {
    type: String
  },
  codeBlocks: {
    type: [String]
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
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  ],
  comments: [
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
BlogSchema.pre('save', function (next) {
  // Generate slug from title
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-');
  }

  // Calculate read time based on content word count
  if (this.isModified('content')) {
    const words = this.content.split(/\s+/).length;
    this.readTime = Math.ceil(words / 200); // Average reading speed: 200 words/min
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

module.exports = mongoose.model('Blog', BlogSchema);
