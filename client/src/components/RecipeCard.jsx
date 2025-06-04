import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LikeButton from './LikeButton';
import styles from '../pages/Home.module.css';

const LOCAL_RATINGS_KEY = 'dev_ratings';

//displays a single recipe in the feed
export default function RecipeCard({ id, title, cuisine, author, authorId, avatar, about, onView }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.5rem' }}>
        <img
          src={avatar || 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png'}
          alt="author avatar"
          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #ffecb3' }}
          onClick={handleAuthorClick}
        />
        <div 
          style={{ 
            fontWeight: 600, 
            color: '#ff9800', 
            fontSize: '1.08rem',
            fontFamily: "'Roboto Mono', monospace",
            cursor: 'pointer'
          }}
          onClick={handleAuthorClick}
        >
          {author || 'Anonymous'}
        </div>
      </div>
      <h3 style={{ 
        color: '#232323',
        fontFamily: "'Judson', serif",
        marginBottom: '0.5rem'
      }}>
        {title || 'Untitled Recipe'}
      </h3>
      <p style={{ 
        margin: 0, 
        color: '#666', 
        fontWeight: 500,
        fontFamily: "'Roboto Mono', monospace"
      }}>
        <strong>Cuisine:</strong> {cuisine || 'Unspecified'}
      </p>
      {about && about.trim() && (
        <p style={{ 
          margin: '0.5rem 0 0.7rem 0', 
          color: '#232323',
          fontFamily: "'Roboto Mono', monospace",
          fontSize: '0.95rem',
          lineHeight: '1.4'
        }}>
          {about}
        </p>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', marginTop: '0.5rem' }}>
        {averageRating > 0 && (
          <div className={styles.cardRating}>
            <span className={styles.ratingValue}>{averageRating.toFixed(1)}</span>
            <span className={styles.stars}>
              {'★'.repeat(Math.round(averageRating))}
              {'☆'.repeat(5 - Math.round(averageRating))}
            </span>
          </div>
        )}
        {user && <LikeButton recipeId={id} />}
      </div>
      
      <button className={styles.viewButton} onClick={handleViewClick}>
        View Recipe
      </button>
    </div>
  );
} 