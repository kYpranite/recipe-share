import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './LikeButton.module.css';

const LOCAL_LIKES_KEY = 'dev_likes';

export default function LikeButton({ recipeId }) {
  const { user, isDevMode } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        if (isDevMode) {
          // Check localStorage for like status
          const storedLikes = localStorage.getItem(LOCAL_LIKES_KEY);
          const likesData = storedLikes ? JSON.parse(storedLikes) : {};
          
          // Get likes for this recipe
          const recipeLikes = Object.entries(likesData)
            .filter(([_, likedRecipes]) => likedRecipes.includes(recipeId))
            .map(([username]) => username);
          
          setLikeCount(recipeLikes.length);
          setLiked(likesData[user.name]?.includes(recipeId) || false);
        } else {
          // In production, fetch from API
          const response = await fetch(`http://localhost:3000/api/recipes/${recipeId}/likes`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch like status');
          }
          
          const data = await response.json();
          setLikeCount(data.likeCount);
          setLiked(data.isLiked);
        }
      } catch (error) {
        console.error('Error checking like status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLikeStatus();
  }, [recipeId, user, isDevMode]);

  const handleLikeToggle = async () => {
    if (!user) return;

    try {
      if (isDevMode) {
        // Update likes in localStorage
        const storedLikes = localStorage.getItem(LOCAL_LIKES_KEY);
        const likesData = storedLikes ? JSON.parse(storedLikes) : {};
        
        // Initialize user's likes array if it doesn't exist
        if (!likesData[user.name]) {
          likesData[user.name] = [];
        }
        
        if (liked) {
          // Unlike: remove recipe from user's likes
          likesData[user.name] = likesData[user.name].filter(id => id !== recipeId);
          setLikeCount(prev => Math.max(0, prev - 1));
        } else {
          // Like: add recipe to user's likes
          likesData[user.name].push(recipeId);
          setLikeCount(prev => prev + 1);
        }
        
        localStorage.setItem(LOCAL_LIKES_KEY, JSON.stringify(likesData));
        setLiked(!liked);
      } else {
        // In production, call API
        const response = await fetch(`http://localhost:3000/api/recipes/${recipeId}/${liked ? 'unlike' : 'like'}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to ${liked ? 'unlike' : 'like'} recipe`);
        }
        
        const data = await response.json();
        setLiked(!liked);
        setLikeCount(data.likeCount);
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  if (loading) {
    return <div className={styles.loading}>...</div>;
  }

  return (
    <button 
      className={`${styles.likeButton} ${liked ? styles.liked : ''}`}
      onClick={handleLikeToggle}
      disabled={!user}
    >
      <span className={styles.likeIcon}>{liked ? '♥' : '♡'}</span>
      <span className={styles.likeCount}>{likeCount}</span>
    </button>
  );
} 