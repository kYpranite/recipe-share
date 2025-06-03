import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import RecipeCard from '../components/RecipeCard';
import styles from './Home.module.css';

const LOCAL_RECIPES_KEY = 'dev_recipes';
const LOCAL_PROFILE_KEY = 'dev_profile';

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [trendingRecipes, setTrendingRecipes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('recent');
  const [isSearching, setIsSearching] = useState(false);

  //Load recipes and profile info from localStorage
  useEffect(() => {
    const storedRecipes = localStorage.getItem(LOCAL_RECIPES_KEY);
    const recipesData = storedRecipes ? JSON.parse(storedRecipes) : [];
    setRecipes(recipesData);
    setFilteredRecipes(recipesData);
    
    // we'll just take the most recent 3 recipes as "trending"
    setTrendingRecipes(recipesData.slice(0, 3));
    
    const storedProfile = localStorage.getItem(LOCAL_PROFILE_KEY);
    setProfile(storedProfile ? JSON.parse(storedProfile) : null);
  }, []);

  //Handle search parameters from URL
  useEffect(() => {
    const searchTerm = searchParams.get('search');
    const searchType = searchParams.get('type');

    if (searchTerm && searchType) {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = recipes.filter(recipe => {
        switch (searchType) {
          case 'name':
            return recipe.title.toLowerCase().includes(searchTermLower);
          case 'cuisine':
            return recipe.cuisine.toLowerCase().includes(searchTermLower);
          case 'ingredient':
            return recipe.ingredients.some(ingredient => 
              ingredient.toLowerCase().includes(searchTermLower)
            );
          default:
            return true;
        }
      });

      setFilteredRecipes(filtered);
      setIsSearching(true);
    } else {
      setFilteredRecipes(recipes);
      setIsSearching(false);
    }
  }, [searchParams, recipes]);

  //Listen for new recipes added in dev mode
  useEffect(() => {
    const handleStorage = () => {
      const storedRecipes = localStorage.getItem(LOCAL_RECIPES_KEY);
      const recipesData = storedRecipes ? JSON.parse(storedRecipes) : [];
      setRecipes(recipesData);
      setFilteredRecipes(recipesData);
      setTrendingRecipes(recipesData.slice(0, 3));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const displayRecipes = isSearching ? filteredRecipes : recipes;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
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
      </div>

      {!isSearching && (
        <div className={styles.tabs}>
          <button 
            className={`${styles.tab} ${activeTab === 'recent' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('recent')}
          >
            Recent Recipes
          </button>
          <button 
            className={`${styles.tab} ${activeTab === 'trending' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('trending')}
          >
            Trending
          </button>
        </div>
      )}

      {!isSearching && activeTab === 'trending' && (
        <div className={styles.trendingSection}>
          <h2 className={styles.sectionTitle}>Trending Now</h2>
          <div className={styles.trendingGrid}>
            {trendingRecipes.length === 0 ? (
              <div className={styles.emptyFeed}>No trending recipes yet. Be the first to create one!</div>
            ) : (
              trendingRecipes.map(recipe => (
                <RecipeCard
                  key={recipe.id}
                  title={recipe.title}
                  cuisine={recipe.cuisine}
                  author={profile?.name || recipe.author || user.name}
                  avatar={profile?.avatar}
                  instructions={recipe.instructions}
                  onView={() => navigate(`/recipe/${recipe.id}`)}
                />
              ))
            )}
          </div>
        </div>
      )}

      <div className={styles.feedSection}>
        <h2 className={styles.sectionTitle}>
          {isSearching 
            ? 'Search Results' 
            : activeTab === 'recent' 
              ? 'Recent Recipes' 
              : 'More Recipes'}
        </h2>
        <div className={styles.feed}>
          {displayRecipes.length === 0 ? (
            <div className={styles.emptyFeed}>
              {isSearching 
                ? 'No recipes found matching your search.' 
                : 'No recipes yet. Create one!'}
            </div>
          ) : (
            displayRecipes.map(recipe => (
              <RecipeCard
                key={recipe.id}
                title={recipe.title}
                cuisine={recipe.cuisine}
                author={profile?.name || recipe.author || user.name}
                avatar={profile?.avatar}
                instructions={recipe.instructions}
                onView={() => navigate(`/recipe/${recipe.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}