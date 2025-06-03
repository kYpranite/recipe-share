import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import styles from './UserProfile.module.css';

const LOCAL_RECIPES_KEY = 'dev_recipes';
const LOCAL_PROFILE_KEY = 'dev_profile';
const LOCAL_FOLLOWS_KEY = 'dev_follows';
const LOCAL_LIKES_KEY = 'dev_likes';

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, isDevMode } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('recipes');

  const isOwnProfile = !username || (user && user.name === username);
  const displayUsername = isOwnProfile ? user?.name : username;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (isDevMode) {
          // Get profile data from localStorage
          let profileData = null;
          
          if (isOwnProfile) {
            // For own profile, use user data and any stored profile data
            const storedProfile = localStorage.getItem(LOCAL_PROFILE_KEY);
            profileData = storedProfile ? JSON.parse(storedProfile) : { name: user.name };
          } else {
            // For other users, we'll simulate finding them
            // In a real app, this would be an API call
            profileData = { name: username, bio: `This is ${username}'s profile` };
          }
          
          setProfile(profileData);
          
          // Get recipes
          const storedRecipes = localStorage.getItem(LOCAL_RECIPES_KEY);
          const allRecipes = storedRecipes ? JSON.parse(storedRecipes) : [];
          const userRecipes = allRecipes.filter(r => r.author === displayUsername);
          setRecipes(userRecipes);
          
          // Get follows data
          const storedFollows = localStorage.getItem(LOCAL_FOLLOWS_KEY);
          const followsData = storedFollows ? JSON.parse(storedFollows) : { followers: {}, following: {} };
          
          // Get followers and following for this profile
          const profileFollowers = followsData.followers[displayUsername] || [];
          const profileFollowing = followsData.following[displayUsername] || [];
          
          setFollowers(profileFollowers);
          setFollowing(profileFollowing);
          
          // Check if current user is following this profile
          if (!isOwnProfile && user) {
            const currentUserFollowing = followsData.following[user.name] || [];
            setIsFollowing(currentUserFollowing.includes(displayUsername));
          }
          
          // Get liked recipes
          const storedLikes = localStorage.getItem(LOCAL_LIKES_KEY);
          const likesData = storedLikes ? JSON.parse(storedLikes) : {};
          const userLikes = likesData[displayUsername] || [];
          
          // Find the full recipe objects for liked recipes
          const likedRecipeObjects = allRecipes.filter(recipe => userLikes.includes(recipe.id));
          setLikedRecipes(likedRecipeObjects);
        } else {
          // In production, fetch from API
          const profileResponse = await fetch(`http://localhost:3000/api/users/${isOwnProfile ? 'me' : username}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          
          if (!profileResponse.ok) {
            throw new Error('Failed to fetch profile');
          }
          
          const profileData = await profileResponse.json();
          setProfile(profileData);
          
          // Fetch recipes
          const recipesResponse = await fetch(`http://localhost:3000/api/users/${isOwnProfile ? 'me' : username}/recipes`);
          const recipesData = await recipesResponse.json();
          setRecipes(recipesData.recipes);
          
          // Fetch followers and following
          const followersResponse = await fetch(`http://localhost:3000/api/users/${isOwnProfile ? 'me' : username}/followers`);
          const followersData = await followersResponse.json();
          setFollowers(followersData.followers);
          
          const followingResponse = await fetch(`http://localhost:3000/api/users/${isOwnProfile ? 'me' : username}/following`);
          const followingData = await followingResponse.json();
          setFollowing(followingData.following);
          
          // Check if current user is following this profile
          if (!isOwnProfile) {
            const isFollowingResponse = await fetch(`http://localhost:3000/api/users/${username}/is-following`, {
              headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const isFollowingData = await isFollowingResponse.json();
            setIsFollowing(isFollowingData.isFollowing);
          }
          
          // Fetch liked recipes
          const likedResponse = await fetch(`http://localhost:3000/api/users/${isOwnProfile ? 'me' : username}/liked-recipes`);
          const likedData = await likedResponse.json();
          setLikedRecipes(likedData.recipes);
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [displayUsername, isDevMode, isOwnProfile, user]);

  const handleFollow = async () => {
    if (!user || isOwnProfile) return;
    
    try {
      if (isDevMode) {
        // Update follows in localStorage
        const storedFollows = localStorage.getItem(LOCAL_FOLLOWS_KEY);
        const followsData = storedFollows ? JSON.parse(storedFollows) : { followers: {}, following: {} };
        
        // Initialize arrays if they don't exist
        if (!followsData.followers[displayUsername]) followsData.followers[displayUsername] = [];
        if (!followsData.following[user.name]) followsData.following[user.name] = [];
        
        if (isFollowing) {
          // Unfollow
          followsData.followers[displayUsername] = followsData.followers[displayUsername].filter(f => f !== user.name);
          followsData.following[user.name] = followsData.following[user.name].filter(f => f !== displayUsername);
        } else {
          // Follow
          followsData.followers[displayUsername].push(user.name);
          followsData.following[user.name].push(displayUsername);
        }
        
        localStorage.setItem(LOCAL_FOLLOWS_KEY, JSON.stringify(followsData));
        
        // Update state
        setIsFollowing(!isFollowing);
        setFollowers(followsData.followers[displayUsername]);
      } else {
        // In production, call API
        const response = await fetch(`http://localhost:3000/api/users/${displayUsername}/${isFollowing ? 'unfollow' : 'follow'}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
        }
        
        const data = await response.json();
        setIsFollowing(!isFollowing);
        setFollowers(data.followers);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewRecipe = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };

  if (loading) {
    return <div className={styles.loading}>Loading profile...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!profile) {
    return <div className={styles.error}>Profile not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <img
          src={profile.avatar || 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png'}
          alt="Profile"
          className={styles.avatar}
        />
        <div className={styles.profileInfo}>
          <h1 className={styles.username}>{profile.name}</h1>
          {profile.bio && <p className={styles.bio}>{profile.bio}</p>}
          
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{recipes.length}</span>
              <span className={styles.statLabel}>Recipes</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{followers.length}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>{following.length}</span>
              <span className={styles.statLabel}>Following</span>
            </div>
          </div>
          
          {!isOwnProfile && user && (
            <button 
              className={isFollowing ? styles.unfollowButton : styles.followButton}
              onClick={handleFollow}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          )}
          
          {isOwnProfile && (
            <button 
              className={styles.editButton}
              onClick={() => navigate('/edit-profile')}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
      
      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'recipes' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('recipes')}
        >
          Recipes
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'liked' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('liked')}
        >
          Liked Recipes
        </button>
      </div>
      
      <div className={styles.content}>
        {activeTab === 'recipes' ? (
          recipes.length > 0 ? (
            <div className={styles.recipeGrid}>
              {recipes.map(recipe => (
                <div key={recipe.id} className={styles.recipeCard} onClick={() => handleViewRecipe(recipe.id)}>
                  <div className={styles.recipeImage}>
                    {recipe.image ? (
                      <img src={recipe.image} alt={recipe.title} />
                    ) : (
                      <div className={styles.placeholderImage}></div>
                    )}
                  </div>
                  <div className={styles.recipeInfo}>
                    <h3 className={styles.recipeTitle}>{recipe.title}</h3>
                    <p className={styles.recipeCuisine}>{recipe.cuisine}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>No recipes yet</p>
          )
        ) : (
          likedRecipes.length > 0 ? (
            <div className={styles.recipeGrid}>
              {likedRecipes.map(recipe => (
                <div key={recipe.id} className={styles.recipeCard} onClick={() => handleViewRecipe(recipe.id)}>
                  <div className={styles.recipeImage}>
                    {recipe.image ? (
                      <img src={recipe.image} alt={recipe.title} />
                    ) : (
                      <div className={styles.placeholderImage}></div>
                    )}
                  </div>
                  <div className={styles.recipeInfo}>
                    <h3 className={styles.recipeTitle}>{recipe.title}</h3>
                    <p className={styles.recipeCuisine}>{recipe.cuisine}</p>
                    <p className={styles.recipeAuthor}>by {recipe.author}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className={styles.emptyState}>No liked recipes yet</p>
          )
        )}
      </div>
    </div>
  );
} 