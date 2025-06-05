import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CommentSection from '../components/CommentSection';
import RatingStars from '../components/RatingStars';
import LikeButton from '../components/LikeButton';
import VersionHistoryModal from '../components/VersionHistoryModal';
import styles from './RecipeDetail.module.css';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [versions, setVersions] = useState([]);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [versionHistoryVisible, setVersionHistoryVisible] = useState(false);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        // Fetch recipe data
        const response = await fetch(`http://localhost:3000/api/recipes/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Recipe not found');
        }

        const data = await response.json();
        
        // Transform the data to match the component's expected format
        const transformedRecipe = {
          id: data._id,
          title: data.name,
          author: data.originalAuthor.name,
          authorAvatar: data.originalAuthor.profilePicture,
          description: data.description,
          ingredients: data.currentVersion.ingredients,
          instructions: data.currentVersion.instructions,
          cuisine: data.cuisine,
          prepTime: data.currentVersion.cookingTime?.prep?.value || 0,
          cookTime: data.currentVersion.cookingTime?.cook?.value || 0,
          servings: data.currentVersion.servings,
          image: data.currentVersion.images?.[0]?.url,
          createdAt: data.createdAt,
          tags: data.tags,
          originalAuthor: data.originalAuthor._id
        };

        setRecipe(transformedRecipe);
        
        // Fetch version history
        const versionsResponse = await fetch(`http://localhost:3000/api/recipes/${id}/versions`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (versionsResponse.ok) {
          const versionsData = await versionsResponse.json();
          setVersions(versionsData.versions || []);
        }

      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, user]);

  const handleFork = async () => {
    if (!recipe) return;

    try {
      const response = await fetch(`http://localhost:3000/api/recipes/${id}/fork`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fork recipe');
      }

      const data = await response.json();
      window.scrollTo(0, 0);
      navigate(`/edit-recipe/${data.recipe._id}`);
    } catch (err) {
      console.error('Error forking recipe:', err);
      setError(err.message);
    }
  };

  const handleViewVersion = async (version) => {
    setSelectedVersion(version);
    try {
      const response = await fetch(`http://localhost:3000/api/recipes/${id}/versions/${version._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch version');
      }

      const data = await response.json();
      setRecipe(prev => ({
        ...prev,
        ingredients: data.ingredients,
        instructions: data.instructions,
        prepTime: data.cookingTime?.prep?.value || 0,
        cookTime: data.cookingTime?.cook?.value || 0,
        servings: data.servings
      }));
    } catch (err) {
      console.error('Error fetching version:', err);
      setError(err.message);
    }
  };

  const handleRevert = async (version) => {
    if (!user) {
      setError('You must be logged in to revert versions');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/recipes/${id}/revert`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ versionId: version._id })
      });

      if (!response.ok) {
        throw new Error('Failed to revert recipe');
      }

      const data = await response.json();
      setRecipe(data.recipe);
      setVersions(data.versions);
      setSelectedVersion(null);
    } catch (err) {
      console.error('Error reverting recipe:', err);
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
        <div className={styles.authorInfo}>
          <img
            src={recipe.authorAvatar || 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png'}
            alt="author avatar"
            className={styles.authorAvatar}
          />
          <span 
            className={styles.authorName}
            onClick={() => navigate(`/profile/${recipe.originalAuthor}`)}
            style={{ cursor: 'pointer' }}
          >
            {recipe.author}
          </span>
        </div>
      </div>

      <div className={styles.recipeImage}>
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.title} />
        ) : (
          <div className={styles.placeholderImage}>No image available</div>
        )}
      </div>

      {recipe.description && (
        <div className={styles.aboutSection}>
          <h2>About this Recipe</h2>
          <p>{recipe.description}</p>
        </div>
      )}

      <div className={styles.recipeInfo}>
        <div className={styles.infoItem}>
          <span className={styles.label}>Cuisine:</span>
          <span>{recipe.cuisine || 'Unspecified'}</span>
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
              <li key={index}>
                {ingredient.amount} {ingredient.unit} {ingredient.name}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.instructions}>
          <h2>Instructions</h2>
          <ol>
            {recipe.instructions.map((instruction, index) => (
              <li key={index}>{instruction.description}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className={styles.actions}>
        <button className={styles.forkButton} onClick={handleFork}>
          <span>Fork Recipe</span>
        </button>
        {user && user.id === recipe.originalAuthor && (
          <button 
            className={styles.editButton} 
            onClick={() => navigate(`/edit-recipe/${id}`)}
          >
            <span>Edit Recipe</span>
          </button>
        )}
        <button 
          className={styles.versionButton} 
          onClick={() => setVersionHistoryVisible(!versionHistoryVisible)}
        >
          <span>Version History</span>
        </button>
        <button className={styles.backButton} onClick={() => navigate('/home')}>
          <span>Back to Feed</span>
        </button>
      </div>

      <VersionHistoryModal
        isOpen={versionHistoryVisible}
        onClose={() => setVersionHistoryVisible(false)}
        versions={versions}
        currentVersion={selectedVersion || recipe.currentVersion}
        onVersionSelect={handleViewVersion}
        onFork={handleFork}
        onRevert={handleRevert}
        isAuthor={user && user.id === recipe.originalAuthor}
      />

      <CommentSection recipeId={id} />
    </div>
  );
} 