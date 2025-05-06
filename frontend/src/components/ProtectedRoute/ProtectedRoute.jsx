import { Navigate, Outlet, useLocation } from 'react-router-dom'; // <-- import Outlet
import { useState, useEffect } from 'react';
import { CircularProgress, Box } from '@mui/material';
import useAuthStore from '../../contexts/authStore';

const ProtectedRoute = () => {
  const location = useLocation();
  const { isAuthenticated, checkAuth, isLoading } = useAuthStore();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        if (!isAuthenticated) {
          await checkAuth();
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
      } finally {
        setAuthChecked(true);
      }
    };

    verifyAuth();
  }, [isAuthenticated, checkAuth]);

  if (isLoading || !authChecked) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🔥 THIS IS THE FIX: render nested routes inside ProtectedRoute
  return <Outlet />;
};

export default ProtectedRoute;
