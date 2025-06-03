import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';
import styles from './Home.module.css';

const LOCAL_RECIPES_KEY = 'dev_recipes';
const LOCAL_PROFILE_KEY = 'dev_profile';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [profile, setProfile] = useState(null);

  // Load recipes and profile info from localStorage
  useEffect(() => {
    const storedRecipes = localStorage.getItem(LOCAL_RECIPES_KEY);
    setRecipes(storedRecipes ? JSON.parse(storedRecipes) : []);
    const storedProfile = localStorage.getItem(LOCAL_PROFILE_KEY);
    setProfile(storedProfile ? JSON.parse(storedProfile) : null);
  }, []);

  // Listen for new recipes added in dev mode
  useEffect(() => {
    const handleStorage = () => {
      const storedRecipes = localStorage.getItem(LOCAL_RECIPES_KEY);
      setRecipes(storedRecipes ? JSON.parse(storedRecipes) : []);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to Recipe Share</h1>
      <p className={styles.subtitle}>
        Hello, {profile?.name || user.name}! Your go-to app for discovering and sharing amazing recipes.
      </p>
      <div className={styles.buttonContainer}>
        <button className={styles.button} onClick={() => navigate('/create-recipe')}>
          Create Recipe
        </button>
        <button 
          className={`${styles.button} ${styles.logoutButton}`}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
      <h2 className={styles.feedTitle}>Your Recipe Feed</h2>
      <div className={styles.feed}>
        {recipes.length === 0 && <div className={styles.emptyFeed}>No recipes yet. Create one!</div>}
        {recipes.map(recipe => (
          <RecipeCard
            key={recipe.id}
            title={recipe.title}
            cuisine={recipe.cuisine}
            author={profile?.name || recipe.author || user.name}
            avatar={profile?.avatar}
            instructions={recipe.instructions}
            onView={() => navigate(`/recipe/${recipe.id}`)}
          />
        ))}
      </div>
    </div>
  );
}