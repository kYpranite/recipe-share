import { useAuth } from '../context/AuthContext';
import styles from './LikeButton.module.css';

export default function LikeButton({ 
  isLiked, 
  likeCount, 
  onLikeToggle, 
  disabled = false 
}) {
  const { user } = useAuth();
  console.log(isLiked);
  return (
    <button 
      className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
      onClick={onLikeToggle}
      disabled={!user || disabled}
    >
      <span className={styles.likeIcon}>{isLiked ? '♥' : '♡'}</span>
      <span className={styles.likeCount}>{likeCount}</span>
    </button>
  );
} 