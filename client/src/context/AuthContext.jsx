import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Development mode flag - set to true to bypass authentication
const DEV_MODE = true;

// Mock user data for development
const MOCK_USER = {
  _id: 'dev-user-id',
  name: 'Developer User',
  email: 'dev@example.com'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(DEV_MODE ? MOCK_USER : null);
  const [token, setToken] = useState(DEV_MODE ? 'dev-token' : null);
  const [loading, setLoading] = useState(!DEV_MODE);

  useEffect(() => {
    if (!DEV_MODE) {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    }
    
    setLoading(false);
  }, []);

  const login = (userData, authToken) => {
    if (!DEV_MODE) {
      setUser(userData);
      setToken(authToken);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    if (!DEV_MODE) {
      setUser(null);
      setToken(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const value = {
    user,
    token,
    login,
    logout,
    loading,
    isDevMode: DEV_MODE
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 