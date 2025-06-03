import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './RatingStars.module.css';

const LOCAL_RATINGS_KEY = 'dev_ratings';

export default function RatingStars({ recipeId, initialRating = 0, readOnly = false, onRatingChange }) {
  const [hoveredRating, setHoveredRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(initialRating);
  const { user, isDevMode } = useAuth();

  const handleRatingClick = async (rating) => {
    if (readOnly || !user) return;

    setSelectedRating(rating);
    
    try {
      if (isDevMode) {
        // Store rating in localStorage
        const storedRatings = localStorage.getItem(LOCAL_RATINGS_KEY);
        const ratingsData = storedRatings ? JSON.parse(storedRatings) : {};
        
        // Structure: { recipeId: { userId: rating } }
        if (!ratingsData[recipeId]) {
          ratingsData[recipeId] = {};
        }
        
        ratingsData[recipeId][user.name] = rating;
        localStorage.setItem(LOCAL_RATINGS_KEY, JSON.stringify(ratingsData));
      } else {
        // In production, call API
        const response = await fetch(`http://localhost:3000/api/recipes/${recipeId}/rate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ rating })
        });
        
        if (!response.ok) {
          throw new Error('Failed to submit rating');
        }
      }
      
      // Notify parent component if callback provided
      if (onRatingChange) {
        onRatingChange(rating);
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  const handleMouseEnter = (rating) => {
    if (readOnly) return;
    setHoveredRating(rating);
  };

  const handleMouseLeave = () => {
    if (readOnly) return;
    setHoveredRating(0);
  };

  const renderStar = (position) => {
    const filled = position <= (hoveredRating || selectedRating);
    
    return (
      <span
        key={position}
        className={`${styles.star} ${filled ? styles.filled : ''} ${readOnly ? styles.readOnly : ''}`}
        onClick={() => handleRatingClick(position)}
        onMouseEnter={() => handleMouseEnter(position)}
        onMouseLeave={handleMouseLeave}
      >
        ★
      </span>
    );
  };

  return (
    <div className={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map(renderStar)}
      {!readOnly && (
        <span className={styles.ratingText}>
          {hoveredRating > 0 ? (
            `Rate ${hoveredRating} star${hoveredRating !== 1 ? 's' : ''}`
          ) : selectedRating > 0 ? (
            `Your rating: ${selectedRating} star${selectedRating !== 1 ? 's' : ''}`
          ) : (
            'Rate this recipe'
          )}
        </span>
      )}
    </div>
  );
} 