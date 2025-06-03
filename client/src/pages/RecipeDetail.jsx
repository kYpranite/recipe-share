import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import RatingStars from '../components/RatingStars';
import LikeButton from '../components/LikeButton';
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

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        if (isDevMode) {
          // In dev mode, get from localStorage
          const storedRecipes = localStorage.getItem(LOCAL_RECIPES_KEY);
          const recipes = storedRecipes ? JSON.parse(storedRecipes) : [];
          const foundRecipe = recipes.find(r => r.id === id);
          if (foundRecipe) {
            setRecipe(foundRecipe);
            // Fetch version history
            const storedVersions = localStorage.getItem(`${LOCAL_VERSIONS_KEY}_${id}`);
            if (storedVersions) {
              setVersions(JSON.parse(storedVersions));
            }
            
            // Get ratings
            const storedRatings = localStorage.getItem(LOCAL_RATINGS_KEY);
            if (storedRatings) {
              const ratingsData = JSON.parse(storedRatings);
              const recipeRatings = ratingsData[id] || {};
              
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
            }
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
        author: null, // Will be set when published
        createdAt: new Date().toISOString(),
        isFork: true,
        parentVersion: selectedVersion?.id || recipe.id // Track which version was forked
      };
      localStorage.setItem('forked_recipe', JSON.stringify(forkedRecipe));
      navigate('/create-recipe?fork=true');
    }
  };

  const handleViewVersion = (version) => {
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
        <div className={styles.instructionsText}>
          {recipe.instructions.split('\n').map((step, index) => (
            <p key={index}>{step}</p>
          ))}
        </div>
      </div>

      {recipe.tags && recipe.tags.length > 0 && (
        <div className={styles.tags}>
          <h3>Tags</h3>
          <div className={styles.tagList}>
            {recipe.tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className={styles.actions}>
        <button className={styles.forkButton} onClick={handleFork}>
          Fork Recipe
        </button>
        {user && user.name === recipe.author && (
          <button className={styles.editButton} onClick={() => navigate(`/edit-recipe/${id}`)}>
            Edit Recipe
          </button>
        )}
        <button className={styles.backButton} onClick={() => navigate('/home')}>
          Back to Feed
        </button>
      </div>

      {versions.length > 0 && (
        <div className={styles.versionHistory}>
          <h2>Version History</h2>
          <div className={styles.versionList}>
            {versions.map((version) => (
              <div key={version.id} className={styles.versionItem}>
                <div className={styles.versionInfo}>
                  <span className={styles.versionAuthor}>{version.author}</span>
                  <span className={styles.versionDate}>
                    {new Date(version.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.versionActions}>
                  <button
                    className={styles.viewButton}
                    onClick={() => handleViewVersion(version)}
                  >
                    View
                  </button>
                  {user && user.name === recipe.author && (
                    <button
                      className={styles.revertButton}
                      onClick={() => handleRevert(version)}
                    >
                      Revert to this version
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <CommentSection recipeId={id} />
    </div>
  );
} 