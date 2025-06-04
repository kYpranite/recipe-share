import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './UserSearch.module.css';

function UserSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { token } = useAuth();
  const navigate = useNavigate();

  // Load initial users when component mounts
  useEffect(() => {
    loadInitialUsers();
  }, []);

  // Filter users whenever searchTerm changes
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(allUsers);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = allUsers.filter(user => 
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, allUsers]);

  const loadInitialUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:3000/api/users/initial?page=1&limit=9`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      setAllUsers(data.users);
      setFilteredUsers(data.users);
      setHasMore(data.hasMore);
      setCurrentPage(data.currentPage);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    const nextPage = currentPage + 1;

    try {
      const response = await fetch(
        `http://localhost:3000/api/users/initial?page=${nextPage}&limit=9`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to load more users');
      }

      const data = await response.json();
      setAllUsers(prev => [...prev, ...data.users]);
      setFilteredUsers(prev => [...prev, ...data.users]);
      setHasMore(data.hasMore);
      setCurrentPage(data.currentPage);
    } catch (err) {
      setError('Failed to load more users. Please try again.');
      console.error('Load more error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/profile/${userId}`);
  };

  return (
    <div className={styles.container}>
      <h1>Search Users</h1>
      
      <div className={styles.searchForm}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by username or name..."
          className={styles.searchInput}
        />
      </div>

      {isLoading && currentPage === 1 && <p>Loading...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.results}>
        {filteredUsers.length === 0 && !isLoading ? (
          <p>No users found</p>
        ) : (
          <>
            {filteredUsers.map(user => (
              <div 
                key={user._id} 
                className={styles.userCard}
                onClick={() => handleUserClick(user._id)}
              >
                <img 
                  src={user.profilePicture || '/default-avatar.png'} 
                  alt={user.name}
                  className={styles.avatar}
                />
                <div className={styles.userInfo}>
                  <h3>{user.name}</h3>
                  <p className={styles.username}>{user.email}</p>
                  {user.bio && <p className={styles.bio}>{user.bio}</p>}
                </div>
                <button 
                  className={styles.followButton}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent card click when clicking follow button
                    // TODO: Implement follow functionality
                  }}
                >
                  Follow
                </button>
              </div>
            ))}
            {hasMore && (
              <button 
                onClick={loadMore} 
                className={styles.loadMoreButton}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UserSearch; 