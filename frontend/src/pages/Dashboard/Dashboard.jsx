// src/pages/Dashboard/Dashboard.jsx
import { useEffect } from 'react';
import { Box, Container, CircularProgress } from '@mui/material';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import WelcomeSection from './components/WelcomeSection';
import StatsCards from './components/StatsCards';
import LearningProgress from './components/LearningProgress';
import RecommendedPeers from './components/peers/RecommendedPeers';
import useUserStore from '../../contexts/userStore';

const Dashboard = () => {
  const { user, isLoading, error, fetchUser } = useUserStore();
  
  useEffect(() => {
    // Fetch user data using Zustand store if not already loaded
    if (!user) {
      fetchUser();
    }
  }, [user, fetchUser]);
  
  // Mock data for the dashboard
  const statsData = {
    studyStreak: 14,
    activeGroups: user?.groups?.length || 0,
    earnedBadges: user?.badges?.length || 0
  };
  
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'error.main' }}>
        Error loading dashboard: {error}
      </Box>
    );
  }
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* Header */}
        <Header />
        
        {/* Main dashboard content */}
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Welcome section */}
          <WelcomeSection />
          
          {/* Stats cards */}
          <StatsCards data={statsData} />
          
          {/* Charts and recommendations section */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, mt: 4, gap: 3 }}>
            <Box sx={{ flex: 2 }}>
              {/* <LearningProgress /> */}
            </Box>
            <Box sx={{ flex: 1 }}>
              <RecommendedPeers />
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;