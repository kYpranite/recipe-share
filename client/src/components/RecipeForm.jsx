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
    about: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    ingredients: [{
      name: '',
      amount: '',
      unit: ''
    }],
    instructions: [''],
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
        about: forkedRecipe.about || '',
        prepTime: forkedRecipe.prepTime,
        cookTime: forkedRecipe.cookTime,
        servings: forkedRecipe.servings,
        ingredients: forkedRecipe.ingredients,
        instructions: Array.isArray(forkedRecipe.instructions) 
          ? forkedRecipe.instructions 
          : [forkedRecipe.instructions],
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
          about: recipe.about || '',
          prepTime: recipe.prepTime,
          cookTime: recipe.cookTime,
          servings: recipe.servings,
          ingredients: recipe.ingredients,
          instructions: Array.isArray(recipe.instructions) 
            ? recipe.instructions 
            : [recipe.instructions],
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

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      ingredients: newIngredients
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { name: '', amount: '', unit: '' }]
    }));
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData(prev => ({
      ...prev,
      instructions: newInstructions
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const formattedIngredients = formData.ingredients
        .filter(ing => ing.name.trim() && ing.amount && ing.unit)
        .map(ingredient => ({
          name: ingredient.name.trim(),
          amount: parseFloat(ingredient.amount),
          unit: ingredient.unit
        }));

      const formattedInstructions = formData.instructions
        .filter(step => step.trim())
        .map((step, index) => ({
          stepNumber: index + 1,
          description: step
        }));

      // Prepare the recipe data according to the API schema
      const recipeData = {
        name: formData.title,
        description: formData.about || `A delicious ${formData.cuisine} recipe`,
        isPrivate: false,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        versionData: {
          ingredients: formattedIngredients,
          instructions: formattedInstructions,
          cookingTime: {
            prep: {
              value: parseInt(formData.prepTime),
              unit: 'minutes'
            },
            cook: {
              value: parseInt(formData.cookTime),
              unit: 'minutes'
            }
          },
          servings: parseInt(formData.servings),
          images: formData.image ? [{ url: formData.image, caption: formData.title }] : [],
          changelog: 'Initial version'
        }
      };

      // If this is a fork, add the forked from reference
      if (forkedRecipe) {
        recipeData.forkedFrom = forkedRecipe.originalRecipeId || forkedRecipe.id;
      }

      // Make API call to create recipe
      const response = await fetch('http://localhost:3000/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(recipeData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to create recipe');
      }

      const data = await response.json();
      console.log('Recipe created successfully:', data);

      // Clear any stored fork data if this was a fork
      if (forkedRecipe) {
        localStorage.removeItem('forked_recipe');
      }

      // Navigate to home page after successful creation
      navigate('/home');
    } catch (err) {
      console.error('Error creating recipe:', err);
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

        <div className={styles.formGroup}>
          <label htmlFor="about">About this Recipe (optional)</label>
          <textarea
            id="about"
            name="about"
            value={formData.about}
            onChange={handleChange}
            rows="3"
            disabled={isSubmitting}
            placeholder="Tell us about your recipe - what makes it special?"
            className={styles.aboutTextarea}
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
              <div className={styles.ingredientFields}>
                <input
                  type="number"
                  value={ingredient.amount}
                  onChange={(e) => handleIngredientChange(index, 'amount', e.target.value)}
                  placeholder="Quantity"
                  className={styles.quantityInput}
                  required
                  disabled={isSubmitting}
                  min="0"
                  step="0.01"
                />
                <select
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                  className={styles.unitSelect}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select unit</option>
                  <option value="g">grams</option>
                  <option value="kg">kilograms</option>
                  <option value="oz">ounces</option>
                  <option value="lb">pounds</option>
                  <option value="cup">cups</option>
                  <option value="tbsp">tablespoons</option>
                  <option value="tsp">teaspoons</option>
                  <option value="ml">milliliters</option>
                  <option value="l">liters</option>
                  <option value="piece">pieces</option>
                  <option value="unit">units</option>
                </select>
                <input
                  type="text"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  placeholder="Ingredient name"
                  className={styles.ingredientNameInput}
                  required
                  disabled={isSubmitting}
                />
              </div>
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
          <label>Instructions</label>
          {formData.instructions.map((instruction, index) => (
            <div key={index} className={styles.instructionInput}>
              <div className={styles.stepNumber}>{index + 1}.</div>
              <textarea
                value={instruction}
                onChange={(e) => handleInstructionChange(index, e.target.value)}
                required
                disabled={isSubmitting}
                placeholder={`Step ${index + 1}`}
                rows="3"
              />
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeInstruction(index)}
                  className={styles.removeButton}
                  disabled={isSubmitting}
                >
                  Remove Step
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addInstruction}
            className={styles.addButton}
            disabled={isSubmitting}
          >
            Add Step
          </button>
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