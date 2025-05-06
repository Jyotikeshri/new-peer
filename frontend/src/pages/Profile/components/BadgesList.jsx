// src/pages/Profile/components/BadgesList.jsx
import { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  CircularProgress, 
  Paper,
  Tooltip,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

const BadgesList = ({ badges = [] }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [badgesData, setBadgesData] = useState([]);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        if (badges && badges.length > 0) {
          // In a real implementation, you would fetch badge details if they're not already included
          // For now, we'll just use mock data
          const mockBadgesData = [
            { 
              id: '1', 
              name: 'First Contribution', 
              description: 'Made your first contribution to a project', 
              image: '/badges/contribution.svg',
              color: '#4CAF50'
            },
            { 
              id: '2', 
              name: 'Team Player', 
              description: 'Joined 5 different study groups', 
              image: '/badges/team.svg',
              color: '#2196F3'
            },
            { 
              id: '3', 
              name: 'Problem Solver', 
              description: 'Helped solve 10 coding problems', 
              image: '/badges/problem.svg',
              color: '#9C27B0'
            },
            { 
              id: '4', 
              name: 'Active Learner', 
              description: 'Logged in for 30 consecutive days', 
              image: '/badges/learner.svg',
              color: '#FF9800'
            },
            { 
              id: '5', 
              name: 'Community Star', 
              description: 'Received 5 five-star reviews', 
              image: '/badges/star.svg',
              color: '#F44336'
            }
          ];
          
          // Filter mockBadgesData to only include the badges the user has earned
          // In a real implementation, you would use the actual data from the API
          setBadgesData(mockBadgesData);
        }
      } catch (error) {
        console.error('Error fetching badges:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBadges();
  }, [badges]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!badges || badges.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <EmojiEventsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No badges earned yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Participate in the community to earn badges
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={2}>
      {badgesData.map((badge) => (
        <Grid item xs={6} sm={4} md={3} key={badge.id}>
          <Tooltip title={badge.description} arrow placement="top">
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 2,
              transition: 'transform 0.2s',
              '&:hover': {
                transform: 'scale(1.05)'
              }
            }}>
              <Box sx={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                bgcolor: badge.color,
                height: 120,
                p: 2
              }}>
                <EmojiEventsIcon sx={{ fontSize: 64, color: 'white' }} />
              </Box>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" align="center">
                  {badge.name}
                </Typography>
              </CardContent>
            </Card>
          </Tooltip>
        </Grid>
      ))}
    </Grid>
  );
};

export default BadgesList;