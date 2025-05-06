// src/components/ProfileSummary/ProfileSummary.jsx
import { Box, Typography, Paper, Divider, Avatar } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

const ProfileSummary = ({ user }) => {
  // Mock data - replace with actual user data from API
  const profileData = {
    name: user?.username || "Jyoti Keshri",
    batch: "AC4",
    coins: 23040,
    rewards: 0,
    classesAttended: 74,
    problemsSolved: 521,
    mentorSessions: 5,
    streak: 0
  };

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        borderRadius: 2,
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider',
        width: '100%',
        mb: 3
      }}
    >
      {/* Profile Header */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          {profileData.name}
        </Typography>
        <Box 
          sx={{ 
            py: 1, 
            px: 2, 
            borderRadius: 1,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Batch : {profileData.batch}
          </Typography>
        </Box>
      </Box>

      <Divider />

      {/* Coins */}
      <Box 
        sx={{ 
          p: 2, 
          borderBottom: '4px solid #FFC107',
          borderLeft: '1px solid #FFC107',
          borderRight: '1px solid #FFC107',
          bgcolor: '#FFFDE7',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <Avatar 
          sx={{ 
            bgcolor: '#FFC107', 
            width: 40, 
            height: 40, 
            mb: 1 
          }}
        >
          <AttachMoneyIcon sx={{ color: '#FFFFFF' }} />
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#FFC107' }}>
          {profileData.coins.toLocaleString()}
        </Typography>
      </Box>

      {/* Rewards */}
      <Box 
        sx={{ 
          p: 2,
          borderBottom: '4px solid #03A9F4',
          borderLeft: '1px solid #03A9F4',
          borderRight: '1px solid #03A9F4',
          bgcolor: '#E1F5FE',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column'
        }}
      >
        <Avatar 
          sx={{ 
            bgcolor: '#03A9F4', 
            width: 40, 
            height: 40, 
            mb: 1 
          }}
        >
          <WorkspacePremiumIcon sx={{ color: '#FFFFFF' }} />
        </Avatar>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#03A9F4' }}>
          {profileData.rewards}
        </Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ p: 2, bgcolor: '#F8F9FA' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: 2 
          }}
        >
          <Avatar 
            sx={{ 
              bgcolor: '#3F51B5', 
              width: 24, 
              height: 24, 
              mr: 1,
              '& .MuiSvgIcon-root': { fontSize: '0.8rem' }
            }}
          >
            <AddIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {profileData.classesAttended}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Classes Attended
            </Typography>
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mb: 2 
          }}
        >
          <Avatar 
            sx={{ 
              bgcolor: '#3F51B5', 
              width: 24, 
              height: 24, 
              mr: 1,
              '& .MuiSvgIcon-root': { fontSize: '0.8rem' }
            }}
          >
            <AddIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {profileData.problemsSolved}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Problems solved
            </Typography>
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            mb: 2 
          }}
        >
          <Avatar 
            sx={{ 
              bgcolor: '#3F51B5', 
              width: 24, 
              height: 24, 
              mr: 1,
              '& .MuiSvgIcon-root': { fontSize: '0.8rem' }
            }}
          >
            <AddIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {profileData.mentorSessions}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Mentor sessions taken
            </Typography>
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center' 
          }}
        >
          <Avatar 
            sx={{ 
              bgcolor: '#3F51B5', 
              width: 24, 
              height: 24, 
              mr: 1,
              '& .MuiSvgIcon-root': { fontSize: '0.8rem' }
            }}
          >
            <AddIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {profileData.streak}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Streak
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Illustration at bottom */}
      <Box 
        sx={{ 
          p: 2, 
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <img 
          src="/assets/images/teacher-illustration.png" 
          alt="Teacher illustration" 
          style={{ 
            maxWidth: '100%', 
            height: 'auto',
            opacity: 0.8
          }} 
        />
      </Box>
    </Paper>
  );
};

export default ProfileSummary;