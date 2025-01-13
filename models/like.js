const mongoose = require('mongoose');

// Like Schema to track which users liked a blog
const LikeSchema = new mongoose.Schema({
  _blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Enable timestamps for createdAt and updatedAt
LikeSchema.set('timestamps', true);

// Enable virtual fields in JSON and Object conversions
LikeSchema.set('toJSON', { virtuals: true });
LikeSchema.set('toObject', { virtuals: true });

// Pre-save hook to ensure a user cannot like the same blog multiple times
LikeSchema.pre('save', async function (next) {
  const existingLike = await mongoose.model('Like').findOne({
    blogId: this.blogId,
    userId: this.userId,
  });

  if (existingLike) {
    return next(new Error('You have already liked this blog.'));
  }
  next();
});

// Post-save hook to log the like action
LikeSchema.post('save', function (doc) {
  console.log(`User ${doc.userId} liked the blog ${doc.blogId}.`);
});

// Virtual field to count total likes on a blog
LikeSchema.virtual('likeCount').get(async function () {
  const likeCount = await mongoose.model('Like').countDocuments({ blogId: this.blogId });
  return likeCount;
});



// Automatically populate userId field on find queries
LikeSchema.post('find', async function (docs, next) {
  for (const doc of docs) {
    await doc.populate('userId', 'name email').execPopulate();
  }
  next();
});

module.exports = mongoose.model('Like', LikeSchema);
