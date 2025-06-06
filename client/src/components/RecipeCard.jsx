import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LikeButton from './LikeButton';
import styles from '../pages/Home.module.css';
import { API_BASE_URL } from '../config';

const LOCAL_RATINGS_KEY = 'dev_ratings';

//displays a single recipe in the feed
export default function RecipeCard({ id, title, cuisine, author, authorId, avatar, about, image, onView }) {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/recipes/${id}/likes`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch like status');
        }
        
        const data = await response.json();
        setIsLiked(data.isLiked);
        setLikeCount(data.likeCount);
      } catch (error) {
        console.error('Error checking like status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLikeStatus();
  }, [id, user, token]);

  const handleLikeToggle = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/recipes/${id}/${isLiked ? 'unlike' : 'like'}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isLiked ? 'unlike' : 'like'} recipe`);
      }
      
      const data = await response.json();
      setIsLiked(!isLiked);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleAuthorClick = (e) => {
    e.stopPropagation();
    if (authorId) {
      navigate(`/profile/${authorId}`);
    }
  };

  const handleViewClick = (e) => {
    e.stopPropagation();
    if (id) {
      navigate(`/recipe/${id}`);
    }
  };
  
  // Calculate average rating from localStorage
  const getAverageRating = () => {
    try {
      const storedRatings = localStorage.getItem(LOCAL_RATINGS_KEY);
      if (!storedRatings) return 0;
      
      const ratingsData = JSON.parse(storedRatings);
      const recipeRatings = ratingsData[String(id)] || {};
      const ratings = Object.values(recipeRatings);
      
      if (ratings.length === 0) return 0;
      return ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length;
    } catch (e) {
      console.error('Error calculating rating:', e);
      return 0;
    }
  };
  
  const averageRating = getAverageRating();
  
  return (
    <div className={styles.recipeCard}>
      <div className={styles.authorSection}>
        <img
          src={avatar || 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png'}
          alt="author avatar"
          className={styles.authorAvatar}
          onClick={handleAuthorClick}
        />
        <div 
          className={styles.authorName}
          onClick={handleAuthorClick}
        >
          {author || 'Anonymous'}
        </div>
      </div>

      <div className={styles.recipeImage}>
        {image ? (
          <img 
            src={image} 
            alt={title} 
          />
        ) : (
          <div className={styles.placeholderImage}>No Image Provided</div>
        )}
      </div>

      <div className={styles.recipeContent}>
        <h3 className={styles.recipeTitle}>
          {title || 'Untitled Recipe'}
        </h3>
        
        <p className={styles.cuisine}>
          <strong>Cuisine:</strong> {cuisine || 'Unspecified'}
        </p>

        {about && about.trim() && (
          <p className={styles.recipeDescription}>
            {about}
          </p>
        )}
        
        <div className={styles.recipeFooter}>
          {averageRating > 0 && (
            <div className={styles.cardRating}>
              <span className={styles.ratingValue}>{averageRating.toFixed(1)}</span>
              <span className={styles.stars}>
                {'★'.repeat(Math.round(averageRating))}
                {'☆'.repeat(5 - Math.round(averageRating))}
              </span>
            </div>
          )}
          {user && (
            <LikeButton
              isLiked={isLiked}
              likeCount={likeCount}
              onLikeToggle={handleLikeToggle}
              disabled={loading}
            />
          )}
        </div>
        
        <button className={styles.viewButton} onClick={handleViewClick}>
          View Recipe
        </button>
      </div>
    </div>
  );
} 