import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login/Login';
import Signup from './pages/Signup/Signup';
import Home from './pages/Home';
import CreateRecipe from './pages/CreateRecipe';
import EditProfile from './pages/EditProfile';
import RecipeDetail from './pages/RecipeDetail';
import UserProfile from './pages/UserProfile';
import UserProfileDetail from './pages/UserProfile/UserProfileDetail';
import UserSearch from './pages/UserSearch/UserSearch';
import NavBar from './components/NavBar';
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/create-recipe" 
              element={
                <ProtectedRoute>
                  <CreateRecipe />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit-recipe/:id" 
              element={
                <ProtectedRoute>
                  <CreateRecipe />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/edit-profile" 
              element={
                <ProtectedRoute>
                  <EditProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recipe/:id" 
              element={
                <ProtectedRoute>
                  <RecipeDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <UserProfile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile/:userId" 
              element={
                <ProtectedRoute>
                  <UserProfileDetail />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/search-users" 
              element={
                <ProtectedRoute>
                  <UserSearch />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </Router>
    </AuthProvider>
  );
}

export default App;