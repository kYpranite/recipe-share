import mongoose from 'mongoose';

const versionSchema = new mongoose.Schema({
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  versionNumber: {
    type: Number,
    required: true
  },
  ingredients: [{
    name: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    },
    notes: String
  }],
  instructions: [{
    stepNumber: {
      type: Number,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  }],
  cookingTime: {
    prep: {
      value: Number,
      unit: {
        type: String,
        enum: ['minutes', 'hours']
      }
    },
    cook: {
      value: Number,
      unit: {
        type: String,
        enum: ['minutes', 'hours']
      }
    }
  },
  servings: {
    type: Number,
    required: true
  },
  notes: String,
  images: [{
    url: String,
    caption: String
  }],
  parentVersion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Version',
    default: null
  },
  changelog: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

versionSchema.index({ recipe: 1, versionNumber: 1 }, { unique: true });

const Version = mongoose.model('Version', versionSchema);
export default Version;