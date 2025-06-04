import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, isDevMode } = useAuth();
  const location = useLocation();

  // Allow access in development mode or if user is authenticated
  if (isDevMode || user) {
    return children;
  }

  // Redirect to login while preserving the intended destination
  return <Navigate to="/login" state={{ from: location }} replace />;
} 