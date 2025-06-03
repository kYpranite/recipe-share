//Handles recipe creation. In dev mode, saves to localStorage; in production, posts to backend.
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './RecipeForm.module.css';

const LOCAL_RECIPES_KEY = 'dev_recipes';
const LOCAL_PROFILE_KEY = 'dev_profile';
const LOCAL_VERSIONS_KEY = 'dev_recipe_versions';

export default function RecipeForm({ forkedRecipe, recipeId }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    cuisine: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    ingredients: [''],
    instructions: '',
    tags: '',
    image: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [originalRecipe, setOriginalRecipe] = useState(null);

  useEffect(() => {
    if (forkedRecipe) {
      setFormData({
        title: `${forkedRecipe.title} (Forked)`,
        cuisine: forkedRecipe.cuisine,
        prepTime: forkedRecipe.prepTime,
        cookTime: forkedRecipe.cookTime,
        servings: forkedRecipe.servings,
        ingredients: forkedRecipe.ingredients,
        instructions: forkedRecipe.instructions,
        tags: forkedRecipe.tags?.join(', ') || '',
        image: forkedRecipe.image || ''
      });
    } else if (recipeId) {
      // Load existing recipe for editing
      const storedRecipes = localStorage.getItem(LOCAL_RECIPES_KEY);
      const recipes = storedRecipes ? JSON.parse(storedRecipes) : [];
      const recipe = recipes.find(r => r.id === recipeId);
      
      if (recipe) {
        setOriginalRecipe(recipe);
        setFormData({
          title: recipe.title,
          cuisine: recipe.cuisine,
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          ingredients: recipe.ingredients,
          instructions: recipe.instructions,
          tags: recipe.tags?.join(', ') || '',
          image: recipe.image || ''
        });
      }
    }
  }, [forkedRecipe, recipeId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, '']
    }));
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const recipeData = {
        ...formData,
        id: forkedRecipe?.id || recipeId || Date.now().toString(),
        author: user.name,
        authorAvatar: user.avatar,
        createdAt: new Date().toISOString(),
        originalRecipeId: forkedRecipe?.originalRecipeId,
        originalAuthor: forkedRecipe?.originalAuthor,
        isFork: !!forkedRecipe,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      };

      if (forkedRecipe) {
        // Clear the forked recipe from localStorage
        localStorage.removeItem('forked_recipe');
      }

      // In dev mode, store in localStorage
      const storedRecipes = localStorage.getItem(LOCAL_RECIPES_KEY);
      const recipes = storedRecipes ? JSON.parse(storedRecipes) : [];
      
      if (recipeId) {
        // Update existing recipe
        const recipeIndex = recipes.findIndex(r => r.id === recipeId);
        if (recipeIndex !== -1) {
          // Store the old version in version history
          const oldVersion = recipes[recipeIndex];
          const storedVersions = localStorage.getItem(`${LOCAL_VERSIONS_KEY}_${recipeId}`);
          const versions = storedVersions ? JSON.parse(storedVersions) : [];
          versions.unshift(oldVersion);
          localStorage.setItem(`${LOCAL_VERSIONS_KEY}_${recipeId}`, JSON.stringify(versions));
          
          // Update the recipe
          recipes[recipeIndex] = recipeData;
        }
      } else {
        // Add new recipe
        recipes.unshift(recipeData);
      }
      
      localStorage.setItem(LOCAL_RECIPES_KEY, JSON.stringify(recipes));

      // Store profile info in localStorage (dev mode)
      const profile = {
        name: user.name,
        avatar: user.avatar
      };
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(profile));

      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {forkedRecipe ? 'Fork Recipe' : recipeId ? 'Edit Recipe' : 'Create New Recipe'}
      </h1>
      {forkedRecipe && (
        <p className={styles.forkInfo}>
          Forking recipe from {forkedRecipe.originalAuthor}
        </p>
      )}
      
      {error && <div className={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Recipe Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="cuisine">Cuisine</label>
          <input
            type="text"
            id="cuisine"
            name="cuisine"
            value={formData.cuisine}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label htmlFor="prepTime">Prep Time (minutes)</label>
            <input
              type="number"
              id="prepTime"
              name="prepTime"
              value={formData.prepTime}
              onChange={handleChange}
              required
              min="0"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="cookTime">Cook Time (minutes)</label>
            <input
              type="number"
              id="cookTime"
              name="cookTime"
              value={formData.cookTime}
              onChange={handleChange}
              required
              min="0"
              disabled={isSubmitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="servings">Servings</label>
            <input
              type="number"
              id="servings"
              name="servings"
              value={formData.servings}
              onChange={handleChange}
              required
              min="1"
              disabled={isSubmitting}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Ingredients</label>
          {formData.ingredients.map((ingredient, index) => (
            <div key={index} className={styles.ingredientInput}>
              <input
                type="text"
                value={ingredient}
                onChange={(e) => handleIngredientChange(index, e.target.value)}
                required
                disabled={isSubmitting}
                placeholder={`Ingredient ${index + 1}`}
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className={styles.removeButton}
                  disabled={isSubmitting}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addIngredient}
            className={styles.addButton}
            disabled={isSubmitting}
          >
            Add Ingredient
          </button>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="instructions">Instructions</label>
          <textarea
            id="instructions"
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            required
            rows="6"
            disabled={isSubmitting}
            placeholder="Enter each step on a new line"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tags">Tags (comma-separated)</label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="e.g., vegetarian, quick, healthy"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="image">Image URL (optional)</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            disabled={isSubmitting}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Publishing...' : forkedRecipe ? 'Publish Fork' : recipeId ? 'Save Changes' : 'Create Recipe'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/home')}
            className={styles.cancelButton}
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
} 