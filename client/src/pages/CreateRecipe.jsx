import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm';

export default function CreateRecipe() {
  const { user } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <RecipeForm />;
} 