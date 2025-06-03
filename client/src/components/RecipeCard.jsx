import styles from '../pages/Home.module.css';

// RecipeCard: displays a single recipe in the feed
export default function RecipeCard({ title, cuisine, author, avatar, instructions, onView }) {
  return (
    <div className={styles.recipeCard}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', marginBottom: '0.5rem' }}>
        <img
          src={avatar || 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png'}
          alt="author avatar"
          style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #ffecb3' }}
        />
        <div style={{ fontWeight: 600, color: '#ff9800', fontSize: '1.08rem' }}>{author}</div>
      </div>
      <h3>{title}</h3>
      <p style={{ margin: 0, color: '#6d4c1b', fontWeight: 500 }}><strong>Cuisine:</strong> {cuisine}</p>
      <p style={{ margin: '0.5rem 0 0.7rem 0', color: '#232323' }}>{instructions.slice(0, 80)}...</p>
      <button className={styles.viewButton} onClick={onView}>
        View Recipe
      </button>
    </div>
  );
} 