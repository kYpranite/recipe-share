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
        
        // Dummy version history data
        const dummyVersions = [
          {
            id: 'v1',
            versionNumber: 1,
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
            changelog: 'Initial version',
            author: { name: data.originalAuthor.name, profilePicture: data.originalAuthor.profilePicture }
          },
          {
            id: 'v2',
            versionNumber: 2,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            changelog: 'Updated cooking time and ingredients',
            author: { name: data.originalAuthor.name, profilePicture: data.originalAuthor.profilePicture }
          },
          {
            id: 'v3',
            versionNumber: 3,
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            changelog: 'Added new instructions and improved formatting',
            author: { name: data.originalAuthor.name, profilePicture: data.originalAuthor.profilePicture }
          }
        ];
        
        setVersions(dummyVersions);
        setSelectedVersion(dummyVersions[0]); // Set current version as selected

      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, user]);

  const handleViewVersion = (version) => {
    setSelectedVersion(version);
    // In a real implementation, this would fetch the specific version's data
    console.log('Viewing version:', version);
  };

  const handleFork = async () => {
    if (!recipe) return;
    // In a real implementation, this would create a fork
    console.log('Forking recipe:', recipe);
  };

  const handleRevert = async (version) => {
    if (!user) {
      setError('You must be logged in to revert versions');
      return;
    }
    // In a real implementation, this would revert to the selected version
    console.log('Reverting to version:', version);
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
            src={recipe.authorAvatar || '/default-avatar.png'} 
            alt={recipe.author} 
            className={styles.authorAvatar}
          />
          <span>{recipe.author}</span>
        </div>
      </div>

      <div className={styles.recipeImage}>
        {recipe.image ? (
          <img src={recipe.image} alt={recipe.title} />
        ) : (
          <div className={styles.noImage}>No image available</div>
        )}
      </div>

      <div className={styles.recipeInfo}>
        <div className={styles.infoItem}>
          <span className={styles.label}>Cuisine</span>
          <span>{recipe.cuisine}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Prep Time</span>
          <span>{recipe.prepTime} mins</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Cook Time</span>
          <span>{recipe.cookTime} mins</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Servings</span>
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
          onClick={() => setVersionHistoryVisible(true)}
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
        currentVersion={selectedVersion}
        onVersionSelect={handleViewVersion}
        onFork={handleFork}
        onRevert={handleRevert}
        isAuthor={user && user.id === recipe.originalAuthor}
      />

      <CommentSection recipeId={id} />
    </div>
  );
} 