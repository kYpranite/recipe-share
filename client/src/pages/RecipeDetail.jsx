import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import RatingStars from '../components/RatingStars';
import LikeButton from '../components/LikeButton';
import VersionHistory from '../components/VersionHistory';
import styles from './RecipeDetail.module.css';

const LOCAL_RECIPES_KEY = 'dev_recipes';
const LOCAL_VERSIONS_KEY = 'dev_recipe_versions';
const LOCAL_RATINGS_KEY = 'dev_ratings';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDevMode, user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(0);

  // Add debug function
  const debugVersionControl = () => {
    if (isDevMode) {
      console.log('=== Version Control Debug Info ===');
      console.log('Current Recipe:', recipe);
      console.log('Selected Version:', selectedVersion);
      console.log('All Versions:', versions);
      
      const storedRecipes = localStorage.getItem(LOCAL_RECIPES_KEY);
      console.log('Stored Recipes:', storedRecipes ? JSON.parse(storedRecipes) : []);
      
      const storedVersions = localStorage.getItem(`${LOCAL_VERSIONS_KEY}_${id}`);
      console.log('Stored Versions:', storedVersions ? JSON.parse(storedVersions) : []);
    }
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        if (isDevMode) {
          // In dev mode, get from localStorage
          const storedRecipes = localStorage.getItem(LOCAL_RECIPES_KEY);
          console.log('RecipeDetail - Stored recipes:', storedRecipes);
          
          if (!storedRecipes) {
            setError('No recipes found in storage');
            setLoading(false);
            return;
          }

          const recipes = JSON.parse(storedRecipes);
          console.log('RecipeDetail - Parsed recipes:', recipes);
          
          if (!Array.isArray(recipes)) {
            setError('Invalid recipe data format');
            setLoading(false);
            return;
          }

          // Convert id to string for comparison
          const recipeId = String(id);
          const foundRecipe = recipes.find(r => String(r.id) === recipeId);
          console.log('RecipeDetail - Found recipe:', foundRecipe);
          
          if (foundRecipe) {
            // Ensure all required fields are present
            const validRecipe = {
              id: foundRecipe.id,
              title: foundRecipe.title || 'Untitled Recipe',
              author: foundRecipe.author || 'Anonymous',
              authorAvatar: foundRecipe.authorAvatar,
              image: foundRecipe.image,
              ingredients: Array.isArray(foundRecipe.ingredients) ? foundRecipe.ingredients : [],
              instructions: Array.isArray(foundRecipe.instructions) 
                ? foundRecipe.instructions 
                : typeof foundRecipe.instructions === 'string'
                  ? foundRecipe.instructions.split('\n').filter(step => step.trim().length > 0)
                  : [],
              cuisine: foundRecipe.cuisine || 'Unspecified',
              prepTime: foundRecipe.prepTime || 0,
              cookTime: foundRecipe.cookTime || 0,
              servings: foundRecipe.servings || 1,
              createdAt: foundRecipe.createdAt || new Date().toISOString()
            };
            
            setRecipe(validRecipe);
            
            // Fetch version history
            const storedVersions = localStorage.getItem(`${LOCAL_VERSIONS_KEY}_${recipeId}`);
            if (storedVersions) {
              try {
                const parsedVersions = JSON.parse(storedVersions);
                if (Array.isArray(parsedVersions)) {
                  setVersions(parsedVersions);
                }
              } catch (e) {
                console.error('Error parsing versions:', e);
              }
            }
            
            // Get ratings
            const storedRatings = localStorage.getItem(LOCAL_RATINGS_KEY);
            if (storedRatings) {
              try {
                const ratingsData = JSON.parse(storedRatings);
                const recipeRatings = ratingsData[recipeId] || {};
                
                // Calculate average rating
                const ratings = Object.values(recipeRatings);
                if (ratings.length > 0) {
                  const sum = ratings.reduce((acc, curr) => acc + curr, 0);
                  setAverageRating(sum / ratings.length);
                }
                
                // Get user's rating if they've rated this recipe
                if (user && recipeRatings[user.name]) {
                  setUserRating(recipeRatings[user.name]);
                }
              } catch (e) {
                console.error('Error parsing ratings:', e);
              }
            }
            
            // Add debug call
            debugVersionControl();
          } else {
            setError('Recipe not found');
          }
        } else {
          // In production, fetch from API
          const response = await fetch(`http://localhost:3000/api/recipes/${id}`);
          if (!response.ok) {
            throw new Error('Recipe not found');
          }
          const data = await response.json();
          setRecipe(data.recipe);
          setAverageRating(data.averageRating || 0);
          setUserRating(data.userRating || 0);
          
          // Fetch version history from API
          const versionsResponse = await fetch(`http://localhost:3000/api/recipes/${id}/versions`);
          if (versionsResponse.ok) {
            const versionsData = await versionsResponse.json();
            setVersions(versionsData.versions);
          }
        }
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, isDevMode, user]);

  const handleFork = () => {
    if (recipe) {
      // Store the forked recipe data in localStorage
      const forkedRecipe = {
        ...recipe,
        id: Date.now().toString(), // Generate new ID
        originalRecipeId: recipe.id, // Keep reference to original
        originalAuthor: recipe.author, // Keep reference to original author
        author: user?.name || 'Anonymous', // Set current user as author
        createdAt: new Date().toISOString(),
        isFork: true,
        parentVersion: selectedVersion?.id || recipe.id // Track which version was forked
      };
      
      console.log('Forking recipe:', forkedRecipe);
      localStorage.setItem('forked_recipe', JSON.stringify(forkedRecipe));
      navigate('/create-recipe?fork=true');
    }
  };

  const handleViewVersion = (version) => {
    console.log('Viewing version:', version);
    setSelectedVersion(version);
    setRecipe(version);
  };

  const handleRevert = async (version) => {
    if (!user || user.name !== recipe.author) {
      setError('Only the recipe author can revert to previous versions');
      return;
    }

    try {
      if (isDevMode) {
        console.log('Reverting to version:', version);
        // In dev mode, update localStorage
        const storedRecipes = localStorage.getItem(LOCAL_RECIPES_KEY);
        const recipes = storedRecipes ? JSON.parse(storedRecipes) : [];
        const recipeIndex = recipes.findIndex(r => r.id === id);
        
        if (recipeIndex !== -1) {
          // Create new version
          const newVersion = {
            ...version,
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            revertedFrom: recipe.id
          };
          
          // Update recipe
          recipes[recipeIndex] = newVersion;
          localStorage.setItem(LOCAL_RECIPES_KEY, JSON.stringify(recipes));
          
          // Update versions
          const updatedVersions = [newVersion, ...versions];
          localStorage.setItem(`${LOCAL_VERSIONS_KEY}_${id}`, JSON.stringify(updatedVersions));
          
          setRecipe(newVersion);
          setVersions(updatedVersions);
          setSelectedVersion(null);
        }
      } else {
        // In production, update via API
        const response = await fetch(`http://localhost:3000/api/recipes/${id}/revert`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ versionId: version.id })
        });
        
        if (!response.ok) {
          throw new Error('Failed to revert recipe');
        }
        
        const data = await response.json();
        setRecipe(data.recipe);
        setVersions(data.versions);
        setSelectedVersion(null);
      }
    } catch (err) {
      console.error('Error reverting recipe:', err);
      setError(err.message);
    }
  };

  const handleRatingChange = (newRating) => {
    // Update the user's rating
    setUserRating(newRating);
    
    // Recalculate average rating (in dev mode)
    if (isDevMode) {
      const storedRatings = localStorage.getItem(LOCAL_RATINGS_KEY);
      if (storedRatings) {
        const ratingsData = JSON.parse(storedRatings);
        const recipeRatings = ratingsData[id] || {};
        const ratings = Object.values(recipeRatings);
        
        if (ratings.length > 0) {
          const sum = ratings.reduce((acc, curr) => acc + curr, 0);
          setAverageRating(sum / ratings.length);
        }
      }
    }
  };

  const handleAuthorClick = () => {
    if (recipe && recipe.author) {
      navigate(`/profile/${recipe.author}`);
    }
  };

  const handleDelete = async () => {
    if (!user || user.name !== recipe.author) {
      setError('Only the recipe author can delete this recipe');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      return;
    }

    try {
      if (isDevMode) {
        // In dev mode, update localStorage
        const storedRecipes = localStorage.getItem(LOCAL_RECIPES_KEY);
        if (storedRecipes) {
          const recipes = JSON.parse(storedRecipes);
          const updatedRecipes = recipes.filter(r => String(r.id) !== String(id));
          localStorage.setItem(LOCAL_RECIPES_KEY, JSON.stringify(updatedRecipes));
        }

        // Also remove versions
        localStorage.removeItem(`${LOCAL_VERSIONS_KEY}_${id}`);
        
        // Remove ratings
        const storedRatings = localStorage.getItem(LOCAL_RATINGS_KEY);
        if (storedRatings) {
          const ratings = JSON.parse(storedRatings);
          delete ratings[id];
          localStorage.setItem(LOCAL_RATINGS_KEY, JSON.stringify(ratings));
        }

        // Remove comments
        const storedComments = localStorage.getItem('dev_comments');
        if (storedComments) {
          const comments = JSON.parse(storedComments);
          delete comments[id];
          localStorage.setItem('dev_comments', JSON.stringify(comments));
        }

        navigate('/home');
      } else {
        // In production, delete via API
        const response = await fetch(`http://localhost:3000/api/recipes/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete recipe');
        }

        navigate('/home');
      }
    } catch (err) {
      console.error('Error deleting recipe:', err);
      setError(err.message);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading recipe...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!recipe) {
    return <div className={styles.error}>Recipe not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.recipeHeader}>
        <h1>{recipe.title}</h1>
        <div className={styles.authorInfo} onClick={handleAuthorClick}>
          <img
            src={recipe.authorAvatar || 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png'}
            alt="author avatar"
            className={styles.authorAvatar}
          />
          <span className={styles.authorName}>{recipe.author}</span>
        </div>
      </div>

      <div className={styles.recipeImage}>
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.title} />
        ) : (
          <div className={styles.placeholderImage}>No image available</div>
        )}
      </div>

      <div className={styles.interactionBar}>
        <div className={styles.ratings}>
          <div className={styles.averageRating}>
            <span className={styles.ratingValue}>{averageRating.toFixed(1)}</span>
            <RatingStars recipeId={id} initialRating={averageRating} readOnly={true} />
          </div>
          {user && (
            <div className={styles.userRating}>
              <span className={styles.ratingLabel}>Your Rating:</span>
              <RatingStars 
                recipeId={id} 
                initialRating={userRating} 
                onRatingChange={handleRatingChange} 
              />
            </div>
          )}
        </div>
        <LikeButton recipeId={id} />
      </div>

      <div className={styles.recipeInfo}>
        <div className={styles.infoItem}>
          <span className={styles.label}>Cuisine:</span>
          <span>{recipe.cuisine}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Prep Time:</span>
          <span>{recipe.prepTime} minutes</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Cook Time:</span>
          <span>{recipe.cookTime} minutes</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Servings:</span>
          <span>{recipe.servings}</span>
        </div>
      </div>

      <div className={styles.recipeContent}>
        <div className={styles.ingredients}>
          <h2>Ingredients</h2>
          <ul>
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
        </div>
        <div className={styles.instructions}>
          <h2>Instructions</h2>
          <ol>
            {recipe.instructions.map((instruction, index) => (
              <li key={index}>{instruction}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.forkButton} onClick={handleFork}>
          Fork Recipe
        </button>
        {user && user.name === recipe.author && (
          <>
            <button 
              className={styles.editButton} 
              onClick={() => navigate(`/edit-recipe/${id}`)}
            >
              Edit Recipe
            </button>
            <button 
              className={styles.deleteButton} 
              onClick={handleDelete}
            >
              Delete Recipe
            </button>
          </>
        )}
        <button className={styles.backButton} onClick={() => navigate('/home')}>
          Back to Feed
        </button>
      </div>

      {versions.length > 0 && (
        <VersionHistory
          versions={versions}
          currentVersion={selectedVersion || recipe}
          onVersionSelect={handleViewVersion}
          onFork={handleFork}
          onRevert={handleRevert}
          isAuthor={user && user.name === recipe.author}
          isDevMode={isDevMode}
        />
      )}

      <CommentSection recipeId={id} />
    </div>
  );
} 