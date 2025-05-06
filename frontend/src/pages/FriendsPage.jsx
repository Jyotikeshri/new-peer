// src/pages/Friends/FriendsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Avatar, 
  Button,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  IconButton,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  InputAdornment
} from '@mui/material';
import MessageIcon from '@mui/icons-material/Message';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import Sidebar from '../Dashboard/components/Sidebar';
import Header from '../Dashboard/components/Header';
import useUserStore from '../../contexts/userStore';

const FriendsPage = () => {
  const navigate = useNavigate();
  const { user, fetchUser, removeFriend, acceptFriendRequest, rejectFriendRequest, isLoading, error } = useUserStore();
  const [tabValue, setTabValue] = useState(0);
  const [friends, setFriends] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });

  useEffect(() => {
    // Fetch user data if not already loaded
    const loadData = async () => {
      setLoading(true);
      if (!user) {
        await fetchUser();
      }
      setLoading(false);
    };
    
    loadData();
  }, [user, fetchUser]);

  useEffect(() => {
    // Fetch friend details
    const fetchFriendDetails = async () => {
      if (!user?.friends || user.friends.length === 0) {
        setFriends([]);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/friends`,
          { credentials: 'include' }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch friends');
        }

        const friendsData = await response.json();
        setFriends(friendsData);
      } catch (err) {
        console.error('Error fetching friends:', err);
        setNotification({
          open: true,
          message: 'Error fetching friends',
          type: 'error'
        });
      }
    };

    // Fetch friend request details
    const fetchFriendRequests = async () => {
      if (!user?.friendRequests || user.friendRequests.length === 0) {
        setFriendRequests([]);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/friend-requests`,
          { credentials: 'include' }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch friend requests');
        }

        const requestsData = await response.json();
        setFriendRequests(requestsData);
      } catch (err) {
        console.error('Error fetching friend requests:', err);
      }
    };

    if (user) {
      fetchFriendDetails();
      fetchFriendRequests();
    }
  }, [user]);

  // Show error notification if userStore has an error
  useEffect(() => {
    if (error) {
      setNotification({
        open: true,
        message: `Error: ${error}`,
        type: 'error'
      });
    }
  }, [error]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMessageUser = (userId) => {
    // Navigate to chat with this user
    navigate(`/messages/${userId}`);
  };

  const handleRemoveFriend = async (friendId, friendName) => {
    if (window.confirm(`Are you sure you want to remove ${friendName} from your friends?`)) {
      try {
        const success = await removeFriend(friendId);
        if (success) {
          setFriends(friends.filter(friend => friend._id !== friendId));
          setNotification({
            open: true,
            message: `${friendName} has been removed from your friends`,
            type: 'success'
          });
        } else {
          setNotification({
            open: true,
            message: 'Failed to remove friend',
            type: 'error'
          });
        }
      } catch (err) {
        console.error('Error removing friend:', err);
        setNotification({
          open: true,
          message: 'An error occurred while removing the friend',
          type: 'error'
        });
      }
    }
  };

  const handleAcceptRequest = async (requesterId) => {
    try {
      const success = await acceptFriendRequest(requesterId);
      if (success) {
        // Move the user from requests to friends
        const acceptedUser = friendRequests.find(req => req._id === requesterId);
        if (acceptedUser) {
          setFriends([...friends, acceptedUser]);
          setFriendRequests(friendRequests.filter(req => req._id !== requesterId));
        }
        
        setNotification({
          open: true,
          message: 'Friend request accepted',
          type: 'success'
        });
      } else {
        setNotification({
          open: true,
          message: 'Failed to accept friend request',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error accepting friend request:', err);
      setNotification({
        open: true,
        message: 'An error occurred while accepting the friend request',
        type: 'error'
      });
    }
  };

  const handleRejectRequest = async (requesterId) => {
    try {
      const success = await rejectFriendRequest(requesterId);
      if (success) {
        setFriendRequests(friendRequests.filter(req => req._id !== requesterId));
        setNotification({
          open: true,
          message: 'Friend request rejected',
          type: 'info'
        });
      } else {
        setNotification({
          open: true,
          message: 'Failed to reject friend request',
          type: 'error'
        });
      }
    } catch (err) {
      console.error('Error rejecting friend request:', err);
      setNotification({
        open: true,
        message: 'An error occurred while rejecting the friend request',
        type: 'error'
      });
    }
  };

  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false });
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const filteredFriends = searchTerm 
    ? friends.filter(friend => 
        friend.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (friend.bio && friend.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (friend.interests && friend.interests.some(interest => 
          interest.toLowerCase().includes(searchTerm.toLowerCase())
        ))
      )
    : friends;

  const renderFriendCards = (friendsToRender) => {
    if (friendsToRender.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 5 }}>
          <PeopleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {tabValue === 0 ? "You don't have any friends yet" : "No friend requests"}
          </Typography>
          {tabValue === 0 && (
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={() => navigate('/matches')}
            >
              Find Matches
            </Button>
          )}
        </Box>
      );
    }

    return (
      <Grid container spacing={3}>
        {friendsToRender.map(friend => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={friend._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 2 }}>
              <Box 
                sx={{ 
                  p: 2, 
                  display: 'flex', 
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => navigate(`/profile/${friend._id}`)}
              >
                <Avatar 
                  src={friend.avatar} 
                  alt={friend.username} 
                  sx={{ width: 60, height: 60, mr: 2 }}
                />
                <Box>
                  <Typography variant="h6" noWrap>
                    {friend.username}
                  </Typography>
                  {friend.isOnline && (
                    <Chip 
                      label="Online" 
                      size="small" 
                      color="success" 
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  )}
                </Box>
              </Box>
              
              <CardContent sx={{ flexGrow: 1, pt: 0 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1, height: 40, overflow: 'hidden' }}>
                  {friend.bio || 'No bio available'}
                </Typography>
                
                {friend.strengths && friend.strengths.length > 0 && (
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Skills:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {friend.strengths.slice(0, 3).map((skill, index) => (
                        <Chip 
                          key={index} 
                          label={skill} 
                          size="small" 
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      ))}
                      {friend.strengths.length > 3 && (
                        <Chip 
                          label={`+${friend.strengths.length - 3}`} 
                          size="small" 
                          variant="outlined"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </Box>
                )}
              </CardContent>
              
              <Divider />
              
              <CardActions>
                {tabValue === 0 ? (
                  // Actions for friends tab
                  <>
                    <Button 
                      size="small" 
                      startIcon={<MessageIcon />}
                      onClick={() => handleMessageUser(friend._id)}
                      fullWidth
                    >
                      Message
                    </Button>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleRemoveFriend(friend._id, friend.username)}
                    >
                      <PersonRemoveIcon fontSize="small" />
                    </IconButton>
                  </>
                ) : (
                  // Actions for requests tab
                  <>
                    <Button 
                      size="small" 
                      variant="contained"
                      color="primary"
                      startIcon={<PersonAddIcon />}
                      onClick={() => handleAcceptRequest(friend._id)}
                      sx={{ flex: 1 }}
                    >
                      Accept
                    </Button>
                    <Button 
                      size="small" 
                      variant="outlined"
                      color="error"
                      onClick={() => handleRejectRequest(friend._id)}
                      sx={{ ml: 1 }}
                    >
                      Decline
                    </Button>
                  </>
                )}
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  };

  if (loading || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
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
        
        {/* Main friends content */}
        <Container maxWidth="xl" sx={{ py: 3 }}>
          <Paper sx={{ mb: 3, p: 2, borderRadius: 2 }}>
            <Typography variant="h4" sx={{ mb: 2 }}>
              Friends
            </Typography>
            
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              sx={{ mb: 3 }}
            >
              <Tab 
                icon={<PeopleIcon />} 
                label={`Friends (${friends.length})`} 
                iconPosition="start"
              />
              <Tab 
                icon={<PersonAddIcon />} 
                label={`Requests (${friendRequests.length})`} 
                iconPosition="start"
                disabled={friendRequests.length === 0}
              />
            </Tabs>
            
            {tabValue === 0 && (
              <TextField
                fullWidth
                placeholder="Search friends..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            )}
            
            {tabValue === 0 ? renderFriendCards(filteredFriends) : renderFriendCards(friendRequests)}
          </Paper>
        </Container>
      </Box>

      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={6000} 
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseNotification} 
          severity={notification.type} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FriendsPage;