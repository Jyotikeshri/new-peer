import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Avatar } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

const NoNotificationsFound = () => {
  return (
    <Box 
      sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        py: 8, 
        px: 2, 
        textAlign: 'center' 
      }}
    >
      <Paper 
        elevation={0}
        sx={{
          width: 70,
          height: 70,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2
        }}
      >
        <NotificationsNoneIcon sx={{ fontSize: 32, color: 'text.secondary', opacity: 0.4 }} />
      </Paper>
      
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
        No notifications yet
      </Typography>
      
      <Typography 
        variant="body2" 
        color="text.secondary"
        sx={{ 
          maxWidth: 400,
          opacity: 0.7
        }}
      >
        When you receive friend requests or messages, they'll appear here.
      </Typography>
    </Box>
  );
};

export default NoNotificationsFound;