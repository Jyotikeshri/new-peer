// src/pages/Dashboard/components/StatsCards.jsx
import { Box, Grid, Paper, Typography } from '@mui/material';
import {
  LocalFireDepartment as FireIcon,
  Group as GroupIcon,
  EmojiEvents as BadgeIcon,
  CheckCircle as CheckIcon,
  Link as LinkIcon,
  Warning as WarningIcon,
  People
} from '@mui/icons-material';
import useUserStore from '../../../contexts/userStore';

const StatCard = ({ title, value, icon, color, bgColor }) => {
  return (
    <Paper
      elevation={4} // Increased elevation for a more prominent shadow effect
      sx={{
        p: 5, // Increased padding for more space inside the card
        borderRadius: 3, // Slightly more rounded corners
        backgroundColor: bgColor,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 3, // Enhanced box-shadow for better depth
        transition: 'transform 0.3s ease, box-shadow 0.3s ease', // Added hover effect
        '&:hover': {
          transform: 'scale(1.05)',
          boxShadow: 6,
        },
      }}
    >
      <Box  sx={{ cursor : 'pointer' ,  display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 'medium' }}>
            {title}
          </Typography>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
            {value}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 50, // Increased size for the icon container
            height: 50,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: `${color}30`, // Slightly more transparent background
            color: color,
            marginLeft: 2, // Added margin for spacing
          }}
        >
          {icon}
        </Box>
      </Box>
    </Paper>
  );
};

const StatsCards = ({ data }) => {
  let { studyStreak, activeGroups, earnedBadges } = data;
  studyStreak = studyStreak || 0;
  activeGroups = activeGroups || 0;
  earnedBadges = earnedBadges || 0;
  const {user} = useUserStore();

  return (
    <Grid container spacing={5}> {/* Increased spacing between cards for better layout */}
      <Grid item xs={12} sm={6} md={4}> {/* Responsive design for better layout */}
        <StatCard
          title="Connections"
          value={`${user?.friends?.length} Friends`}
          icon={<People />} // Updated icon
          color="#4CAF50"
          bgColor="#e8f5e9"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard
          title="Study Groups"
          value={`${activeGroups} active`}
          icon={<GroupIcon />} // Updated icon
          color="#2196F3"
          bgColor="#e3f2fd"
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <StatCard
          title="Earned Badges"
          value={`${earnedBadges} total`}
          icon={<BadgeIcon />} // Updated icon
          color="#F44336"
          bgColor="#ffebee"
        />
      </Grid>
    </Grid>
  );
};

export default StatsCards;
