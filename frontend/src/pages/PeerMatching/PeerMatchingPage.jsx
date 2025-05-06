import { useEffect } from 'react';
import { Box, Container, Typography } from '@mui/material';
import Sidebar from '../Dashboard/components/Sidebar';
import Header from '../Dashboard/components/Header';
import FilterSection from './components/FilterSection';
import StatsOverview from './components/StatsOverview';
import PeerGrid from './components/PeerGrid';
import MatchingLoadingScreen from './components/MatchingLoadingScreen'; // Import the new component
import useUserStore from '../../contexts/userStore';
import useMatchingStore from '../../contexts/matchingStore';

const PeerMatchingPage = () => {
  const { user, isLoading: userLoading, error: userError, fetchUser } = useUserStore();
  const {
    filteredMatches,
    stats,
    isLoading: matchesLoading,
    error: matchesError,
    currentFilter,
    fetchMatches,
    setFilter
  } = useMatchingStore();

  // Load user data if not available
  useEffect(() => {
    if (!user) {
      fetchUser();
    }
    
    // Store user ID in localStorage for matching store to use
    if (user && user._id) {
      localStorage.setItem('userId', user._id);
    }
  }, [user, fetchUser]);

  // Load matches data
  useEffect(() => {
    if (user) {
      fetchMatches();
    }
  }, [user, fetchMatches]);

  const handleFilterChange = (filter) => {
    setFilter(filter);
  };

  // Use the new loading screen component instead of CircularProgress
  if (userLoading || matchesLoading) {
    return <MatchingLoadingScreen />;
  }

  if (userError || matchesError) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'error.main' }}>
        Error loading peer matching: {userError || matchesError}
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F7F9FC' }}>
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {/* Header */}
        <Header />
        
        {/* Main section */}
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {/* Page Title */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h4" sx={{ fontWeight: 600, color: '#07092F', mb: 0.5 }}>
              Find Your Perfect Study Partners
            </Typography>
            <Typography variant="body1" sx={{ color: '#5A6282' }}>
              Match with peers based on complementary skills and learning goals
            </Typography>
          </Box>
          
          {/* Filter Section */}
          <FilterSection activeFilter={currentFilter} onFilterChange={handleFilterChange} />
          
          {/* Stats Overview */}
          <StatsOverview stats={stats} />
          
          {/* Peer Grid */}
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#07092F' }}>
                Recommended Peers
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: '#3672F8',
                  cursor: 'pointer',
                  textDecoration: 'underline'
                }}
              >
                View All
              </Typography>
            </Box>
            
            <PeerGrid matches={filteredMatches} />
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default PeerMatchingPage;