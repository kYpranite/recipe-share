import { useAuth } from '../context/AuthContext';
import { Navigate, useSearchParams } from 'react-router-dom';
import RecipeForm from '../components/RecipeForm';
import { useEffect, useState } from 'react';

const LOCAL_RECIPES_KEY = 'dev_recipes';

export default function CreateRecipe() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const isFork = searchParams.get('fork') === 'true';
  const [forkedRecipe, setForkedRecipe] = useState(null);

  useEffect(() => {
    if (isFork) {
      const storedFork = localStorage.getItem('forked_recipe');
      if (storedFork) {
        setForkedRecipe(JSON.parse(storedFork));
      }
    }
  }, [isFork]);

  //Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <RecipeForm forkedRecipe={forkedRecipe} />;
} 