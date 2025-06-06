import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './UserProfileDetail.module.css';
import { API_BASE_URL } from '../../config';

export default function UserProfileDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token, user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('recipes');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!token) {
          throw new Error('Authentication required');
        }

        // Fetch user profile
        const profileResponse = await fetch(`${API_BASE_URL}/api/users/profile/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!profileResponse.ok) {
          throw new Error('Failed to load user profile');
        }

        const profileData = await profileResponse.json();
        setUser(profileData);

        // Fetch user's recipes
        const recipesResponse = await fetch(`${API_BASE_URL}/api/users/${userId}/recipes`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (recipesResponse.ok) {
          const recipesData = await recipesResponse.json();
          setRecipes(recipesData.recipes || []);
        }

        // Fetch followers
        const followersResponse = await fetch(`${API_BASE_URL}/api/users/${userId}/followers`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (followersResponse.ok) {
          const followersData = await followersResponse.json();
          setFollowers(followersData.followers || []);
        }

        // Fetch following
        const followingResponse = await fetch(`${API_BASE_URL}/api/users/${userId}/following`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (followingResponse.ok) {
          const followingData = await followingResponse.json();
          setFollowing(followingData.following || []);
        }

        // Check if current user is following this user
        if (currentUser && currentUser.id !== userId) {
          const isFollowingResponse = await fetch(`${API_BASE_URL}/api/users/${userId}/is-following`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (isFollowingResponse.ok) {
            const { isFollowing } = await isFollowingResponse.json();
            setIsFollowing(isFollowing);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [userId, token, currentUser]);

  const handleFollow = async () => {
    if (!currentUser || currentUser.id === userId) return;

    try {
      const endpoint = isFollowing ? 'unfollow' : 'follow';
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to ${endpoint} user`);
      }

      setIsFollowing(!isFollowing);
      // Update the user's follower count
      setUser(prev => ({
        ...prev,
        followerCount: isFollowing ? prev.followerCount - 1 : prev.followerCount + 1
      }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewRecipe = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading profile...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!user) {
    return <div className={styles.error}>User not found</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.profileHeader}>
        <img
          src={user.profilePicture || 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png'}
          alt="Profile"
          className={styles.avatar}
        />
        <div className={styles.profileInfo}>
          <h1 className={styles.username}>{user.name}</h1>
          {user.bio && <p className={styles.bio}>{user.bio}</p>}
          
          <div className={styles.stats}>
            <div 
              className={styles.stat} 
              onClick={() => setActiveTab('recipes')}
              style={{ cursor: 'pointer' }}
            >
              <span className={styles.statNumber}>{user.recipeCount || 0}</span>
              <span className={styles.statLabel}>Recipes</span>
            </div>
            <div 
              className={styles.stat}
              onClick={() => setActiveTab('followers')}
              style={{ cursor: 'pointer' }}
            >
              <span className={styles.statNumber}>{user.followerCount || 0}</span>
              <span className={styles.statLabel}>Followers</span>
            </div>
            <div 
              className={styles.stat}
              onClick={() => setActiveTab('following')}
              style={{ cursor: 'pointer' }}
            >
              <span className={styles.statNumber}>{user.followingCount || 0}</span>
              <span className={styles.statLabel}>Following</span>
            </div>
          </div>
          
          {currentUser && currentUser.id !== userId && (
            <button 
              className={isFollowing ? styles.unfollowButton : styles.followButton}
              onClick={handleFollow}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
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