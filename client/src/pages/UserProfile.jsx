import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SocialLinks from '../components/SocialLinks';
import styles from './UserProfile.module.css';

const LOCAL_RECIPES_KEY = 'dev_recipes';
const LOCAL_PROFILE_KEY = 'dev_profile';
const LOCAL_FOLLOWS_KEY = 'dev_follows';
const LOCAL_LIKES_KEY = 'dev_likes';

export default function UserProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('recipes');

  const isOwnProfile = !username || (user && username === user.name);
  const displayUsername = username || (user && user.name) || '';

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (!token) {
          throw new Error('Authentication required');
        }

        // Fetch user profile
        const profileResponse = await fetch(
          `http://localhost:3000/api/users/${isOwnProfile ? 'me' : username}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        console.log('Profile response status:', profileResponse.status);
        
        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          throw new Error(errorData.message || 'Failed to fetch profile');
        }

        const profileData = await profileResponse.json();
        console.log('Received profile data:', profileData);
        setProfile(profileData);

        // Fetch user's recipes
        const recipesResponse = await fetch(
          `http://localhost:3000/api/users/${isOwnProfile ? 'me' : username}/recipes`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!recipesResponse.ok) {
          throw new Error('Failed to fetch recipes');
        }

        const recipesData = await recipesResponse.json();
        setRecipes(recipesData.recipes || []);
        console.log('recipesData', recipesData.recipes);

        // Fetch followers and following
        const followersResponse = await fetch(
          `http://localhost:3000/api/users/${isOwnProfile ? 'me' : username}/followers`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (followersResponse.ok) {
          const followersData = await followersResponse.json();
          setFollowers(followersData.followers || []);
        }

        const followingResponse = await fetch(
          `http://localhost:3000/api/users/${isOwnProfile ? 'me' : username}/following`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (followingResponse.ok) {
          const followingData = await followingResponse.json();
          setFollowing(followingData.following || []);
        }

        // Check if current user is following this profile
        if (!isOwnProfile) {
          const isFollowingResponse = await fetch(
            `http://localhost:3000/api/users/${username}/is-following`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (isFollowingResponse.ok) {
            const isFollowingData = await isFollowingResponse.json();
            setIsFollowing(isFollowingData.isFollowing);
          }
        }

        // Fetch liked recipes
        const likedResponse = await fetch(
          `http://localhost:3000/api/users/${isOwnProfile ? 'me' : username}/liked-recipes`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (likedResponse.ok) {
          const likedData = await likedResponse.json();
          setLikedRecipes(likedData.recipes || []);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (displayUsername) {
      fetchProfileData();
    }
  }, [displayUsername, isOwnProfile, token, username, user]);

  const handleFollow = async () => {
    if (!user || isOwnProfile) return;
    
    try {
      if (isOwnProfile) {
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
          <h1 className={styles.username}>{displayUsername}</h1>
          {profile?.bio && <p className={styles.bio}>{profile.bio}</p>}
          
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
          
          <div className={styles.actions}>
            {isOwnProfile ? (
              <button 
                className={styles.editButton}
                onClick={() => navigate('/edit-profile')}
              >
                Edit Profile
              </button>
            ) : (
              <button 
                className={isFollowing ? styles.unfollowButton : styles.followButton}
                onClick={handleFollow}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}
            {profile?.socialLinks && <SocialLinks socialLinks={profile.socialLinks} />}
          </div>
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
                <div key={recipe._id} className={styles.recipeCard} onClick={() => handleViewRecipe(recipe._id)}>
                  <div className={styles.recipeImage}>
                    {recipe.currentVersion.images[0] ? (
                      <img src={recipe.currentVersion.images[0].url} alt={recipe.title} />
                    ) : (
                      <div className={styles.placeholderImage}></div>
                    )}
                  </div>
                  <div className={styles.recipeInfo}>
                    <h3 className={styles.recipeTitle}>{recipe.name}</h3>
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