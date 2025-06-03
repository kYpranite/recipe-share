//recipeForm: Handles recipe creation. In dev mode, saves to localStorage; in production, posts to backend.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './RecipeForm.module.css';

const LOCAL_RECIPES_KEY = 'dev_recipes';

export default function RecipeForm() {
  const navigate = useNavigate();
  const { token, user, isDevMode } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    ingredients: [''],
    instructions: '',
    image: null,
    cuisine: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    tags: []
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isDevMode) {
        // Save to localStorage in dev mode
        const newRecipe = {
          ...formData,
          id: Date.now().toString(),
          author: user?.name || 'Anonymous',
        };
        const stored = localStorage.getItem(LOCAL_RECIPES_KEY);
        const recipes = stored ? JSON.parse(stored) : [];
        recipes.unshift(newRecipe);
        localStorage.setItem(LOCAL_RECIPES_KEY, JSON.stringify(recipes));
        window.dispatchEvent(new Event('storage'));
        navigate('/home');
        return;
      }
      // Production: send to backend
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'ingredients' || key === 'tags') {
          formDataToSend.append(key, JSON.stringify(formData[key]));
        } else if (key === 'image' && formData[key]) {
          formDataToSend.append(key, formData[key]);
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });
      const response = await fetch('http://localhost:3000/api/recipes', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create recipe');
      }
      navigate(`/recipe/${data.recipe._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle ingredient changes
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

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  // Handle tags input
  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(tag => tag.trim());
    setFormData(prev => ({
      ...prev,
      tags
    }));
  };

  return (
    <div className={styles.container}>
      <div className={styles.formBox}>
        <h1>Create New Recipe</h1>
        <p>Share your favorite recipe with the community!</p>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.inputGroup}>
            <label htmlFor="title">Recipe Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Grandma's Apple Pie"
              required
              disabled={isLoading}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="cuisine">Cuisine Type</label>
            <input
              type="text"
              id="cuisine"
              name="cuisine"
              value={formData.cuisine}
              onChange={handleChange}
              placeholder="e.g., Italian, Mexican, etc."
              required
              disabled={isLoading}
            />
          </div>
          <div className={styles.timeGroup}>
            <div className={styles.inputGroup}>
              <label htmlFor="prepTime">Prep Time (minutes)</label>
              <input
                type="number"
                id="prepTime"
                name="prepTime"
                value={formData.prepTime}
                onChange={handleChange}
                placeholder="Prep time"
                required
                min="0"
                disabled={isLoading}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="cookTime">Cook Time (minutes)</label>
              <input
                type="number"
                id="cookTime"
                name="cookTime"
                value={formData.cookTime}
                onChange={handleChange}
                placeholder="Cook time"
                required
                min="0"
                disabled={isLoading}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="servings">Servings</label>
              <input
                type="number"
                id="servings"
                name="servings"
                value={formData.servings}
                onChange={handleChange}
                placeholder="Number of servings"
                required
                min="1"
                disabled={isLoading}
              />
            </div>
          </div>
          <div className={styles.inputGroup}>
            <label>Ingredients</label>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className={styles.ingredientInput}>
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleIngredientChange(index, e.target.value)}
                  placeholder={`Ingredient ${index + 1}`}
                  required
                  disabled={isLoading}
                />
                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className={styles.removeButton}
                    disabled={isLoading}
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
              disabled={isLoading}
            >
              Add Ingredient
            </button>
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="instructions">Instructions</label>
            <textarea
              id="instructions"
              name="instructions"
              value={formData.instructions}
              onChange={handleChange}
              placeholder="Step-by-step instructions"
              required
              rows="6"
              disabled={isLoading}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags.join(', ')}
              onChange={handleTagsChange}
              placeholder="e.g., vegetarian, quick, healthy"
              disabled={isLoading}
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="image">Recipe Image</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              disabled={isLoading}
            />
          </div>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Recipe...' : 'Create Recipe'}
          </button>
        </form>
      </div>
    </div>
  );
} 