import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, isDevMode } = useAuth();

  // Allow access in development mode or if user is authenticated
  if (isDevMode || user) {
    return children;
  }

  return <Navigate to="/login" replace />;
} 