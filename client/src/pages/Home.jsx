import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import RecipeCard from "../components/RecipeCard";
import styles from "./Home.module.css";

const LOCAL_PROFILE_KEY = "dev_profile";

export default function Home() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [trendingRecipes, setTrendingRecipes] = useState([]);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("recent");
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch recent recipes from API
  const fetchRecentRecipes = async () => {
    try {
      const API_URL = 'http://localhost:3000/api/recipes/recent';
      console.log('Fetching from:', API_URL);
      const response = await fetch(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('Response status:', response.status);
      if (!response.ok) {
        throw new Error(`Failed to fetch recipes: ${response.status} ${response.statusText}`);
      }

      const responseText = await response.text();
      const recipesData = JSON.parse(responseText);
      console.log("Recipes data:", recipesData);
      setRecipes(recipesData);
      setFilteredRecipes(recipesData);
      // currently just taking most recent 3 as trending, add algo later
      setTrendingRecipes(recipesData.slice(0, 3));
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  //Load recipes from API and profile info from localStorage
  useEffect(() => {
    fetchRecentRecipes();
    const storedProfile = localStorage.getItem(LOCAL_PROFILE_KEY);
    setProfile(storedProfile ? JSON.parse(storedProfile) : null);
  }, []);

  //Handle search parameters from URL
  useEffect(() => {
    const searchTerm = searchParams.get("search");
    const searchType = searchParams.get("type");

    if (searchTerm && searchType) {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = recipes.filter((recipe) => {
        switch (searchType) {
          case "name":
            return recipe.name.toLowerCase().includes(searchTermLower);
          case "cuisine":
            return recipe.cuisine.toLowerCase().includes(searchTermLower);
          case "ingredient":
            return recipe.currentVersion.ingredients.some((ingredient) =>
              ingredient.name.toLowerCase().includes(searchTermLower)
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

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayRecipes = isSearching ? filteredRecipes : recipes;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome to Recipe Share</h1>
        <p className={styles.subtitle}>
          Hello, {profile?.name || user.name}! Your go-to app for discovering
          and sharing amazing recipes.
        </p>
        <div className={styles.buttonContainer}>
          <button
            className={styles.button}
            onClick={() => navigate("/create-recipe")}
          >
            Create Recipe
          </button>
        </div>
      </div>

      {!isSearching && (
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "recent" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("recent")}
          >
            Recent Recipes
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "trending" ? styles.activeTab : ""
            }`}
            onClick={() => setActiveTab("trending")}
          >
            Trending
          </button>
        </div>
      )}

      {!isSearching && activeTab === "trending" && (
        <div className={styles.trendingSection}>
          <h2 className={styles.sectionTitle}>Trending Now</h2>
          <div className={styles.trendingGrid}>
            {isLoading ? (
              <div className={styles.emptyFeed}>Loading recipes...</div>
            ) : trendingRecipes.length === 0 ? (
              <div className={styles.emptyFeed}>
                No trending recipes yet. Be the first to create one!
              </div>
            ) : (
              trendingRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe._id}
                  id={recipe._id}
                  title={recipe.name}
                  cuisine={recipe.cuisine}
                  author={recipe.originalAuthor.name}
                  avatar={recipe.originalAuthor.profilePicture}
                  about={recipe.description}
                  onView={() => navigate(`/recipe/${recipe._id}`)}
                />
              ))
            )}
          </div>
        </div>
      )}

      <div className={styles.feedSection}>
        <h2 className={styles.sectionTitle}>
          {isSearching
            ? "Search Results"
            : activeTab === "recent"
            ? "Recent Recipes"
            : "All Recipes"}
        </h2>
        <div className={styles.feed}>
          {isLoading ? (
            <div className={styles.emptyFeed}>Loading recipes...</div>
          ) : displayRecipes.length === 0 ? (
            <div className={styles.emptyFeed}>
              {isSearching
                ? "No recipes found matching your search."
                : "No recipes yet. Create one!"}
            </div>
          ) : (
            displayRecipes.map((recipe) => (
              <RecipeCard
                key={recipe._id}
                id={recipe._id}
                title={recipe.name}
                cuisine={recipe.cuisine}
                author={recipe.originalAuthor.name}
                avatar={recipe.originalAuthor.profilePicture}
                about={recipe.description}
                onView={() => navigate(`/recipe/${recipe._id}`)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
