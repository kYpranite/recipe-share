import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SocialLinks from '../components/SocialLinks';
import styles from './UserProfile.module.css';
import { API_BASE_URL } from '../config';

export default function UserProfile() {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('recipes');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        if (!token) {
          throw new Error('Authentication required');
        }

        // Fetch user profile
        const profileResponse = await fetch(
          `${API_BASE_URL}/api/users/profile`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );

        if (!profileResponse.ok) {
          const errorData = await profileResponse.json();
          throw new Error(errorData.message || 'Failed to fetch profile');
        }

        const profileData = await profileResponse.json();
        setProfile(profileData);

        // Fetch user's recipes
        const recipesResponse = await fetch(
          `${API_BASE_URL}/api/users/me/recipes`,
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

        // Fetch followers and following
        const followersResponse = await fetch(
          `${API_BASE_URL}/api/users/${profileData._id}/followers`,
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
          `${API_BASE_URL}/api/users/${profileData._id}/following`,
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
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError(err.message || 'Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchProfileData();
    }
  }, [token]);

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
          src={profile?.profilePicture || 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png'}
          alt="Profile"
          className={styles.avatar}
        />
        <div className={styles.profileInfo}>
          <h1 className={styles.username}>{profile.name}</h1>
          {profile?.bio && <p className={styles.bio}>{profile.bio}</p>}
          
          <div className={styles.stats}>
            <div 
              className={styles.stat}
              onClick={() => setActiveTab('recipes')}
            >
              <span className={styles.statNumber}>{profile.recipeCount || 0}</span>
              <span className={styles.statLabel}>Recipes</span>
            </div>
            <div 
              className={styles.stat}
              onClick={() => setActiveTab('followers')}
            >
              <span className={styles.statNumber}>{profile.followerCount || 0}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>
            <div 
              className={styles.stat}
              onClick={() => setActiveTab('following')}
            >
              <span className={styles.statNumber}>{profile.followingCount || 0}</span>
              <span className={styles.statLabel}>Following</span>
            </div>
          </div>
          <div className={styles.actions}>
            <button 
              className={styles.editButton}
              onClick={() => navigate('/edit-profile')}
            >
              Edit Profile
            </button>
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
          className={`${styles.tab} ${activeTab === 'followers' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('followers')}
        >
          Followers
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'following' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('following')}
        >
          Following
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'recipes' && (
          <div className={styles.recipeGrid}>
            {recipes.map(recipe => (
              <div 
                key={recipe._id} 
                className={styles.recipeCard}
                onClick={() => handleViewRecipe(recipe._id)}
              >
                <div className={styles.recipeImage}>
                  {recipe.currentVersion?.images?.[0]?.url ? (
                    <img src={recipe.currentVersion.images[0].url} alt={recipe.name} />
                  ) : (
                    <div className={styles.placeholderImage}></div>
                  )}
                </div>
                <div className={styles.recipeInfo}>
                  <h3 className={styles.recipeTitle}>{recipe.name}</h3>
                  {recipe.cuisine && <p className={styles.recipeCuisine}>{recipe.cuisine}</p>}
                </div>
              </div>
            ))}
            {recipes.length === 0 && (
              <div className={styles.emptyState}>No recipes yet</div>
            )}
          </div>
        )}

        {activeTab === 'followers' && (
          <div className={styles.userGrid}>
            {followers.map(follower => (
              <div 
                key={follower._id} 
                className={styles.userCard}
                onClick={() => navigate(`/profile/${follower._id}`)}
              >
                <img 
                  src={follower.profilePicture || 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png'} 
                  alt={follower.name}
                  className={styles.userAvatar}
                />
                <h3>{follower.name}</h3>
              </div>
            ))}
            {followers.length === 0 && (
              <div className={styles.emptyState}>No followers yet</div>
            )}
          </div>
        )}

        {activeTab === 'following' && (
          <div className={styles.userGrid}>
            {following.map(followed => (
              <div 
                key={followed._id} 
                className={styles.userCard}
                onClick={() => navigate(`/profile/${followed._id}`)}
              >
                <img 
                  src={followed.profilePicture || 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png'} 
                  alt={followed.name}
                  className={styles.userAvatar}
                />
                <h3>{followed.name}</h3>
              </div>
            ))}
            {following.length === 0 && (
              <div className={styles.emptyState}>Not following anyone yet</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 