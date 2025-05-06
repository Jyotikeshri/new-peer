// src/pages/Dashboard/components/WelcomeSection.jsx
import { Box, Typography } from '@mui/material';
import useUserStore from '../../../contexts/userStore';

const WelcomeSection = () => {
  // Get user from Zustand store
  const { user } = useUserStore();
  
  // Get first name from username or use default
  const firstName = user?.username?.split(' ')[0] || 'Student';
  
  // Get current time of day
  const hour = new Date().getHours();
  let greeting = 'Welcome back';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';
  else greeting = 'Good evening';
  
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#0A0C40', mb: 1 }}>
        {`${greeting}, ${firstName}!`}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Here's what's happening in your network today
      </Typography>
    </Box>
  );
};

export default WelcomeSection;