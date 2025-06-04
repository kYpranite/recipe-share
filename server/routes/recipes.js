import express from 'express';
import Recipe from '../models/Recipe.js';
import User from '../models/User.js';
import Version from '../models/Version.js';

import { auth } from '../middleware/auth.js';

const router = express.Router();

// Create recipe
router.post('/', auth, async (req, res) => {
  console.log('POST /api/recipes - Creating new recipe');
  try {
    const {
      name,
      description,
      isPrivate,
      tags,
      cuisine,
      versionData
    } = req.body;

    const recipe = new Recipe({
      name,
      description,
      originalAuthor: req.user.id,
      isPrivate: isPrivate || false,
      tags: tags || [],
      cuisine
    });

    // Create initial version
    const initialVersion = await recipe.addVersion({
      ...versionData,
      author: req.user.id
    });

    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { recipes: recipe._id } }
    );

    console.log('Recipe created successfully:', recipe);
    res.status(201).json({
      message: 'Recipe created successfully',
      recipe: {
        ...recipe.toObject(),
        currentVersion: initialVersion
      }
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ 
      message: 'Error creating recipe', 
      error: error.message,
      details: error.errors ? Object.values(error.errors).map(err => err.message) : undefined
    });
  }
});

// Get single recipe
router.get('/:id', auth, async (req, res) => {
  console.log('GET /api/recipes/:id - Fetching recipe');
  console.log('Recipe ID:', req.params.id);
  
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('currentVersion')
      .populate('originalAuthor', 'name profilePicture');

    if (!recipe) {
      console.log('Recipe not found');
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (recipe.isPrivate && recipe.originalAuthor._id.toString() !== req.user.id) {
      console.log('Unauthorized access to private recipe');
      return res.status(403).json({ message: 'This recipe is private' });
    }

    console.log('Recipe found:', recipe);
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ message: 'Error fetching recipe', error: error.message });
  }
});

export default router; 