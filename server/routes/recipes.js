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

// Get trending recipes (most liked in past 3 days)
router.get('/trending', auth, async (req, res) => {
  console.log('GET /api/recipes/trending - Fetching trending recipes');
  try {
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const recipes = await Recipe.find({ 
      isPrivate: false,
      updatedAt: { $gte: threeDaysAgo }
    })
      .populate('currentVersion')
      .populate('originalAuthor', 'name profilePicture')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name profilePicture'
        }
      })
      .sort({ likeCount: -1 })
      .limit(3);

    console.log(`Found ${recipes.length} trending recipes`);
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching trending recipes:', error);
    res.status(500).json({ message: 'Error fetching trending recipes', error: error.message });
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

// Fork recipe
router.post('/:id/fork', auth, async (req, res) => {
  console.log('POST /api/recipes/:id/fork - Forking recipe');
  try {
    const originalRecipe = await Recipe.findById(req.params.id)
      .populate('currentVersion');
    
    if (!originalRecipe) {
      console.log('Original recipe not found');
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (originalRecipe.isPrivate && originalRecipe.originalAuthor.toString() !== req.user.id) {
      console.log('Unauthorized access to private recipe');
      return res.status(403).json({ message: 'Cannot fork a private recipe' });
    }

    const forkedRecipe = new Recipe({
      name: `${originalRecipe.name} (Forked)`,
      description: originalRecipe.description,
      originalAuthor: req.user.id,
      currentVersion: originalRecipe.currentVersion._id,
      versionHistory: [originalRecipe.currentVersion._id],
      forkedFrom: originalRecipe._id,
      isPrivate: false,
      tags: originalRecipe.tags,
      cuisine: originalRecipe.cuisine,
      comments: []
    });

    await forkedRecipe.save();

    originalRecipe.forks.push(forkedRecipe._id);
    await originalRecipe.save();

    await User.findByIdAndUpdate(
      req.user.id,
      { $push: { recipes: forkedRecipe._id } }
    );

    console.log('Recipe forked successfully');
    res.status(201).json({
      message: 'Recipe forked successfully',
      recipe: forkedRecipe
    });
  } catch (error) {
    console.error('Error forking recipe:', error);
    res.status(500).json({ message: 'Error forking recipe', error: error.message });
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

// Delete recipe
router.delete('/:id', auth, async (req, res) => {
  console.log('DELETE /api/recipes/:id - Deleting recipe');
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      console.log('Recipe not found');
      return res.status(404).json({ message: 'Recipe not found' });
    }

    if (recipe.originalAuthor.toString() !== req.user.id) {
      console.log('Unauthorized to delete recipe');
      return res.status(403).json({ message: 'Not authorized to delete this recipe' });
    }

    // Remove recipe from user's recipes array
    await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { recipes: recipe._id } }
    );

    // Remove recipe from any forks' forkedFrom references
    await Recipe.updateMany(
      { forkedFrom: recipe._id },
      { $set: { forkedFrom: null } }
    );

    // Delete all versions associated with the recipe
    await Version.deleteMany({ recipe: recipe._id });

    // Delete the recipe
    await recipe.deleteOne();

    console.log('Recipe deleted successfully');
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ message: 'Error deleting recipe', error: error.message });
  }
});

// Get version history including forks and ancestry chain
router.get('/:id/versions', auth, async (req, res) => {
  console.log('GET /api/recipes/:id/versions - Fetching version history');
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate({
        path: 'versionHistory',
        populate: {
          path: 'author',
          select: 'name profilePicture'
        }
      });
      
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Sort versions by versionNumber in descending order
    const versions = recipe.versionHistory.sort((a, b) => b.versionNumber - a.versionNumber);

    res.json({ versions });
  } catch (error) {
    console.error('Error fetching version history:', error);
    res.status(500).json({ message: 'Error fetching version history', error: error.message });
  }
});

// Get specific version of a recipe
router.get('/:recipeId/versions/:versionId', auth, async (req, res) => {
  console.log('GET /api/recipes/:recipeId/versions/:versionId - Fetching specific version');
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const version = await Version.findById(req.params.versionId)
      .populate('author', 'name profilePicture');

    if (!version) {
      return res.status(404).json({ message: 'Version not found' });
    }

    // Verify this version belongs to the recipe
    if (version.recipe.toString() !== recipe._id.toString()) {
      return res.status(400).json({ message: 'Version does not belong to this recipe' });
    }

    res.json({
      ...version.toObject(),
      recipeName: version.title,
      recipeDescription: recipe.description,
      recipeCuisine: recipe.cuisine,
      recipeTags: recipe.tags
    });
  } catch (error) {
    console.error('Error fetching version:', error);
    res.status(500).json({ message: 'Error fetching version', error: error.message });
  }
});

export default router; 