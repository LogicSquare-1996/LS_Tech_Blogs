const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  blogId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  replies: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      comment: String,
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

// Enable timestamps
CommentSchema.set('timestamps', true);

// Enable virtual fields in JSON and Object conversions
CommentSchema.set('toJSON', { virtuals: true });
CommentSchema.set('toObject', { virtuals: true });

// Pre-save middleware to validate blog existence
CommentSchema.pre('save', async function (next) {
  const blogExists = await mongoose.model('Blog').exists({ _id: this.blogId });
  if (!blogExists) {
    return next(new Error('The blog being commented on does not exist.'));
  }
  next();
});

// Post-save middleware for logging
CommentSchema.post('save', function (doc) {
  console.log(`Comment by user ${doc.userId} on blog ${doc.blogId} was saved.`);
});

// Virtual field to count replies
CommentSchema.virtual('replyCount').get(function () {
  return this.replies.length;
});

// Cascading delete: If a blog is deleted, delete its comments
mongoose.model('Blog').schema.pre('remove', async function (next) {
  await mongoose.model('Comment').deleteMany({ blogId: this._id });
  next();
});

// Populate `userId` and `replies.userId` automatically
CommentSchema.post('find', async function (docs, next) {
  for (const doc of docs) {
    await doc
      .populate('userId', 'name email')
      .populate('replies.userId', 'name email')
      .execPopulate();
  }
  next();
});

module.exports = mongoose.model('Comment', CommentSchema);
