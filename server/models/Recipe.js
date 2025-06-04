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

const Recipe = mongoose.model('Recipe', recipeSchema);
export default Recipe;