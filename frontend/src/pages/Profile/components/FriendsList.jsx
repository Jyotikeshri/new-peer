// src/pages/Profile/components/FriendsList.jsx
import { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  CircularProgress, 
  Paper,
  Avatar,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Divider,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import MessageIcon from '@mui/icons-material/Message';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import useUserStore from "../../../contexts/userStore";
import { useFriends } from "../../../hooks/useFriends";

const FriendsList = ({ friends = [] }) => {
  // For snackbar notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Get user from store
  const { user } = useUserStore();
  
  // Use our custom hook for real-time friend management
  const { 
    friends: friendsData, 
    isLoading, 
    removeFriend, 
    isRemovingFriend 
  } = useFriends();
  
  // Track which friend is being removed
  const [removingFriendId, setRemovingFriendId] = useState(null);

  const handleDisconnect = async (friendId, username) => {
    if (removingFriendId) return; // Prevent multiple clicks
    
    setRemovingFriendId(friendId);
    try {
      // Use the mutation function from our custom hook
      await removeFriend(friendId);
      
      // Show success message
      setSnackbar({
        open: true,
        message: `Disconnected from ${username}`,
        severity: 'info'
      });
      
      console.log(`Disconnected from ${username}`);
    } catch (error) {
      console.error('Disconnection error:', error);
      
      // Show error message
      setSnackbar({
        open: true,
        message: `Failed to disconnect: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setRemovingFriendId(null);
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // After loading is complete, if we have no friends data, show the empty state
  if (!isLoading && (!friendsData || friendsData.length === 0)) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <GroupIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No friends yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Connect with peers to expand your network
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Grid container spacing={2}>
        {friendsData.map((friend) => (
          <Grid item xs={12} sm={6} md={4} key={friend.id || friend._id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              borderRadius: 2,
            }}>
              <Box sx={{ p: 2, display: 'flex', alignItems: 'flex-start' }}>
                <Box sx={{ position: 'relative' }}>
                  <Avatar 
                    src={friend.avatar} 
                    alt={friend.username} 
                    sx={{ width: 70, height: 70 }}
                  />
                  {friend.isOnline && (
                    <Box 
                      sx={{
                        position: 'absolute',
                        bottom: 3,
                        right: 3,
                        width: 14,
                        height: 14,
                        bgcolor: '#4CAF50',
                        borderRadius: '50%',
                        border: '2px solid white'
                      }}
                    />
                  )}
                </Box>
                <Box sx={{ ml: 2, flex: 1 }}>
                  <Typography variant="h6">
                    {friend.username}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                      Rating: {friend.rating}/5
                    </Typography>
                    <Chip 
                      label={friend.isOnline ? 'Online' : 'Offline'} 
                      size="small" 
                      color={friend.isOnline ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Box>
                </Box>
              </Box>
              
              <Divider />
              
              <CardContent sx={{ flexGrow: 1, pt: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Strengths:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {friend.strengths && friend.strengths.map((strength, index) => (
                    <Chip key={index} label={strength} size="small" />
                  ))}
                </Box>
              </CardContent>
              
              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button 
                  startIcon={<MessageIcon />} 
                  variant="outlined" 
                  size="small"
                  fullWidth
                >
                  Message
                </Button>
                <IconButton 
                  color="error" 
                  size="small" 
                  onClick={() => handleDisconnect(friend._id || friend.id, friend.username)}
                  disabled={removingFriendId === (friend._id || friend.id) || isRemovingFriend}
                >
                  {removingFriendId === (friend._id || friend.id) ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <PersonRemoveIcon />
                  )}
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default FriendsList;