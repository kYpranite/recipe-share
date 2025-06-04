import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import styles from './UserSearch.module.css';

function UserSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const { token, user } = useAuth();
  const navigate = useNavigate();

  // Filter out current user from results
  const filterCurrentUser = (users) => {
    return users.filter(userData => userData._id !== user._id);
  };

  useEffect(() => {
    loadInitialUsers();
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (searchTerm.trim()) {
        handleSearch();
      } else {
        loadInitialUsers();
      }
    }, 300); 

    return () => clearTimeout(searchTimeout);
  }, [searchTerm]);

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
      // Filter out current user and sort
      const filteredUsers = filterCurrentUser(data.users);
      const sortedUsers = filteredUsers.sort((a, b) => a.name.localeCompare(b.name));
      setSearchResults(sortedUsers);
      setHasMore(data.hasMore);
      setCurrentPage(data.currentPage);
    } catch (err) {
      setError('Failed to load users. Please try again.');
      console.error('Load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadInitialUsers();
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      const response = await fetch(
        `http://localhost:3000/api/users/search?query=${encodeURIComponent(searchTerm)}&page=1&limit=9`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to search users');
      }

      const data = await response.json();
      // Filter out current user and sort
      const filteredUsers = filterCurrentUser(data.users);
      const sortedUsers = filteredUsers.sort((a, b) => a.name.localeCompare(b.name));
      setSearchResults(sortedUsers);
      setHasMore(data.hasMore);
      setCurrentPage(data.currentPage);
    } catch (err) {
      setError('Failed to search users. Please try again.');
      console.error('Search error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMore = async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    const nextPage = currentPage + 1;

    try {
      const url = searchTerm.trim()
        ? `http://localhost:3000/api/users/search?query=${encodeURIComponent(searchTerm)}&page=${nextPage}&limit=9`
        : `http://localhost:3000/api/users/initial?page=${nextPage}&limit=9`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load more users');
      }

      const data = await response.json();
      // Filter out current user from new results
      const filteredNewUsers = filterCurrentUser(data.users);
      // Filter out current user from existing results as well
      const filteredExistingUsers = filterCurrentUser(searchResults);
      // Combine and sort all users
      const combinedUsers = [...filteredExistingUsers, ...filteredNewUsers];
      const sortedUsers = combinedUsers.sort((a, b) => a.name.localeCompare(b.name));
      setSearchResults(sortedUsers);
      setHasMore(data.hasMore);
      setCurrentPage(data.currentPage);
    } catch (err) {
      setError('Failed to load more users. Please try again.');
      console.error('Load more error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = (username) => {
    navigate(`/profile/${username}`);
  };

  return (
    <div className={styles.container}>
      <h1>Discover Users</h1>
      
      <form onSubmit={(e) => e.preventDefault()} className={styles.searchForm}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by username or name..."
          className={styles.searchInput}
        />
        <button type="submit" className={styles.searchButton}>
          Search
        </button>
      </form>

      {isLoading && currentPage === 1 && (
        <div className={styles.loadingState}>
          <p>Loading users...</p>
        </div>
      )}
      
      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.results}>
        {searchResults.length === 0 && !isLoading ? (
          <p className={styles.emptyState}>No users found</p>
        ) : (
          <>
            {searchResults.map(user => (
              <div key={user._id} className={styles.userCard}>
                <img 
                  src={user.profilePicture || 'https://cdn-icons-png.flaticon.com/512/2922/2922510.png'} 
                  alt={user.name}
                  className={styles.avatar}
                  onClick={() => handleViewProfile(user.username)}
                  style={{ cursor: 'pointer' }}
                />
                <div className={styles.userInfo}>
                  <h3 onClick={() => handleViewProfile(user.username)} style={{ cursor: 'pointer' }}>
                    {user.name}
                  </h3>
                  <p className={styles.username}>{user.username}</p>
                  <p className={styles.bio}>{user.bio}</p>
                </div>
                <button 
                  className={styles.followButton}
                  onClick={() => handleViewProfile(user.username)}
                >
                  View Profile
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