import mongoose from 'mongoose';

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
  forks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  }],
  forkedFrom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    default: null
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true
  }],
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

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;