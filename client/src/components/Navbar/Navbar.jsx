import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, token, logout, isDevMode } = useAuth();

  const handleLogout = async () => {
    try {
      if (!isDevMode) {
        // Call logout endpoint
        const response = await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Logout failed');
        }
      }
      
      // Clear auth context and local storage
      logout();
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Still logout locally even if server request fails
      logout();
      navigate('/login');
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>Recipe Share</div>
      <div className={styles.navLinks}>
        {user && (
          <>
            <span className={styles.userName}>Welcome, {user.name}</span>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
} 