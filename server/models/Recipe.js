import mongoose from 'mongoose';
import Version from '../models/Version.js';

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Recipe name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  originalAuthor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Version',
    required: true
  },
  versionHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Version'
  }],
  forks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  forkedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    default: null
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
  cuisine: {
    type: String,
    required: [true, 'Cuisine is required'],
    trim: true
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

recipeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

recipeSchema.methods.getVersionHistory = async function() {
  return await mongoose.model('Version')
    .find({ _id: { $in: this.versionHistory } })
    .sort({ versionNumber: -1 });
};

recipeSchema.methods.addVersion = async function(versionData) {
  const newVersion = await mongoose.model('Version').create({
    ...versionData,
    recipe: this._id,
    versionNumber: this.versionHistory.length + 1,
    changelog: versionData.changelog || 'No changes specified',
  });
  
  this.currentVersion = newVersion._id;
  this.versionHistory.push(newVersion._id);
  await this.save();
  
  return newVersion;
};

// Method to add a comment to the recipe
recipeSchema.methods.addComment = async function(commentId) {
  this.comments.push(commentId);
  return await this.save();
};

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;