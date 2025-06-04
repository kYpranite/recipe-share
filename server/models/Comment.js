import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Comment content is required'],
    trim: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  likeCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
commentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to toggle like status
commentSchema.methods.toggleLike = async function(userId) {
  const index = this.likes.indexOf(userId);
  if (index === -1) {
    // Add like
    this.likes.push(userId);
    this.likeCount += 1;
  } else {
    // Remove like
    this.likes.splice(index, 1);
    this.likeCount -= 1;
  }
  return await this.save();
};

const Comment = mongoose.model('Comment', commentSchema);
export default Comment; 