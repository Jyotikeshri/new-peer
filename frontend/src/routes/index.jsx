// src/routes/index.jsx
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import SignupPage from '../pages/SignupPage';
import ErrorBoundary from '../components/errors/ErrorBoundary';
import Dashboard from '../pages/Dashboard/Dashboard';
import Profile from '../pages/Profile/Profile';
import useAuthStore from '../contexts/authStore';

// Create router with authentication check using Zustand
const createRouter = () => {
  // Get authentication state from the Zustand store
  const { isAuthenticated, checkAuth } = useAuthStore.getState();
  
  // Check authentication status
  checkAuth().catch(err => console.error("Auth check failed:", err));
  
  return createBrowserRouter([
    {
      path: '/',
      element: isAuthenticated ? <Navigate to="/dashboard" /> : <MainLayout />,
      errorElement: <ErrorBoundary />,
      children: [
        { index: true, element: isAuthenticated ? <Navigate to="/dashboard" /> : <HomePage /> },
        { path: 'login', element: isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage /> },
        { path: 'signup', element: isAuthenticated ? <Navigate to="/dashboard" /> : <SignupPage /> },
      ],
    },
    
    // Protected routes for logged-in users
    {
      path: 'dashboard',
      element: isAuthenticated ? <Dashboard /> : <Navigate to="/login" />,
    },
    
    {
      path: 'profile',
      element: isAuthenticated ? <Profile /> : <Navigate to="/login" />,
    },
    
    // Catch-all route
    {
      path: '*',
      element: <ErrorBoundary />,
    }
  ]);
};

export default createRouter;