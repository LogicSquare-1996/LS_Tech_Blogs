const mongoose = require('mongoose');
const BlogInteraction = require('./BlogInteraction')

const BlogSchema = new mongoose.Schema({
  _author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
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
  likes:{
    type: Number,
    default: 0
  },
  comments:{
    type: Number,
    default: 0
  },
  slug: {
    type: String
  },
  readTime: {
    type: Number
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
});

// Pre-save middleware to generate slug and calculate read time
BlogSchema.pre('save', async function (next) {
  if (this.isModified('title')) {
    // Create the base slug from the title
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-');

    // If the blog has been saved (has _id), append the _id to the slug
    this.slug = `${this.slug}-${this._id}`;
  }
  next();
});

BlogSchema.set('timestamps', true);

// Enable virtual fields in JSON and Object conversions
BlogSchema.set('toJSON', { virtuals: true });
BlogSchema.set('toObject', { virtuals: true });

// Virtual for comment count
// BlogSchema.virtual('commentCount').get(function () {
//   return this._comments?.length || 0; // Corrected for comments stored in _comments
// });

// // Virtual for like count
// BlogSchema.virtual('likeCount').get(function () {
//   return this._likes?.length || 0; // Corrected for likes stored in _likes
// });

BlogSchema.post('remove', async function () {
  try {
    // Soft delete all related interactions (likes, comments, replies) for the blog
    await mongoose.model('BlogInteraction').updateMany(
      { _blogId: this._id }, // Find interactions related to the blog
      { $set: { isDeleted: true } } // Soft delete by setting isDeleted to true
    );
  } catch (error) {
    console.error('Error soft deleting interactions for blog: ', error);
  }
});

module.exports = mongoose.model('Blog', BlogSchema);
