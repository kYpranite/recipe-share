import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import styles from './RecipeDetail.module.css';

const LOCAL_RECIPES_KEY = 'dev_recipes';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDevMode } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, isDevMode]);

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
        <div className={styles.authorInfo}>
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
        <button className={styles.editButton} onClick={() => navigate(`/edit-recipe/${id}`)}>
          Edit Recipe
        </button>
        <button className={styles.backButton} onClick={() => navigate('/home')}>
          Back to Feed
        </button>
      </div>

      <CommentSection recipeId={id} />
    </div>
  );
} 