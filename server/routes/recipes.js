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
      cuisine,
      comments: [] // Initialize empty comments array
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

// Get recent recipes
router.get('/recent', auth, async (req, res) => {
  console.log('GET /api/recipes/recent - Fetching recent recipes');
  try {
    const recipes = await Recipe.find({ isPrivate: false })
      .populate('currentVersion')
      .populate('originalAuthor', 'name profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name profilePicture'
        }
      })
      .sort({ updatedAt: -1 });

    console.log(`Found ${recipes.length} recipes`);
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Error fetching recipes', error: error.message });
  }
});

// Get single recipe
router.get('/:id', auth, async (req, res) => {
  console.log('GET /api/recipes/:id - Fetching recipe');
  console.log('Recipe ID:', req.params.id);
  
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('currentVersion')
      .populate('originalAuthor', 'name profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name profilePicture'
        }
      });

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

// Get recipe likes
router.get('/:id/likes', auth, async (req, res) => {
  console.log('GET /api/recipes/:id/likes - Fetching recipe likes');
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const isLiked = recipe.likes.includes(req.user.id);
    res.json({
      likeCount: recipe.likeCount,
      isLiked
    });
  } catch (error) {
    console.error('Error fetching recipe likes:', error);
    res.status(500).json({ message: 'Error fetching recipe likes', error: error.message });
  }
});

// Like recipe
router.post('/:id/like', auth, async (req, res) => {
  console.log('POST /api/recipes/:id/like - Liking recipe');
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (recipe.likes.includes(req.user.id)) {
      return res.status(400).json({ message: 'Recipe already liked' });
    }

    recipe.likes.push(req.user.id);
    recipe.likeCount += 1;
    await recipe.save();

    res.json({
      message: 'Recipe liked successfully',
      likeCount: recipe.likeCount
    });
  } catch (error) {
    console.error('Error liking recipe:', error);
    res.status(500).json({ message: 'Error liking recipe', error: error.message });
  }
});

// Unlike recipe
router.post('/:id/unlike', auth, async (req, res) => {
  console.log('POST /api/recipes/:id/unlike - Unliking recipe');
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (!recipe.likes.includes(req.user.id)) {
      return res.status(400).json({ message: 'Recipe not liked' });
    }

    recipe.likes = recipe.likes.filter(id => id.toString() !== req.user.id);
    recipe.likeCount = Math.max(0, recipe.likeCount - 1);
    await recipe.save();

    res.json({
      message: 'Recipe unliked successfully',
      likeCount: recipe.likeCount
    });
  } catch (error) {
    console.error('Error unliking recipe:', error);
    res.status(500).json({ message: 'Error unliking recipe', error: error.message });
  }
});

// Update recipe
router.put('/:id', auth, async (req, res) => {
  console.log('PUT /api/recipes/:id - Updating recipe');
  console.log('Recipe ID:', req.params.id);
  
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      console.log('Recipe not found');
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (recipe.originalAuthor.toString() !== req.user.id) {
      console.log('Unauthorized to update recipe');
      return res.status(403).json({ message: 'Not authorized to update this recipe' });
    }

    const {
      name,
      description,
      isPrivate,
      tags,
      cuisine,
      versionData
    } = req.body;

    // Update recipe fields
    recipe.name = name;
    recipe.description = description;
    recipe.isPrivate = isPrivate || false;
    recipe.tags = tags || [];
    recipe.cuisine = cuisine;

    // Create new version
    const newVersion = await recipe.addVersion({
      ...versionData,
      author: req.user.id
    });

    await recipe.save();

    console.log('Recipe updated successfully:', recipe);
    res.json({
      message: 'Recipe updated successfully',
      recipe: {
        ...recipe.toObject(),
        currentVersion: newVersion
      }
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ 
      message: 'Error updating recipe', 
      error: error.message,
      details: error.errors ? Object.values(error.errors).map(err => err.message) : undefined
    });
  }
});

export default router; 