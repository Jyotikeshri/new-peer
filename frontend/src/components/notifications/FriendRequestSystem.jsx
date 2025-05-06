// src/pages/Profile/components/FriendRequestButton.jsx
import { useState, useEffect } from 'react';
import { 
  Button, 
  CircularProgress, 
  Tooltip,
  Box,
  Snackbar,
  Alert
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckIcon from '@mui/icons-material/Check';
import PeopleIcon from '@mui/icons-material/People';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import useUserStore from '../../../contexts/userStore';

const FriendRequestButton = ({ profileUserId }) => {
  const { user, fetchUser } = useUserStore();
  const [friendshipStatus, setFriendshipStatus] = useState('loading'); // 'loading', 'none', 'pending_sent', 'pending_received', 'friends', 'self'
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    type: 'success'
  });

  // Check friendship status when component mounts or user/profileUserId changes
  useEffect(() => {
    if (!user || !profileUserId) {
      setFriendshipStatus('loading');
      return;
    }
    
    // Check if viewing own profile
    if (user._id === profileUserId) {
      setFriendshipStatus('self');
      return;
    }
    
    // Check if already friends
    const isFriend = user.friends?.some(friendId => {
      if (typeof friendId === 'string') {
        return friendId === profileUserId;
      }
      return friendId?._id === profileUserId;
    });
    
    if (isFriend) {
      setFriendshipStatus('friends');
      return;
    }
    
    // Check if user sent a request to profile user
    // Your model may not have sentFriendRequests field, so check first
    if (user.sentFriendRequests && user.sentFriendRequests.includes(profileUserId)) {
      setFriendshipStatus('pending_sent');
      return;
    }
    
    // Check if profile user sent a request to user
    if (user.friendRequests?.includes(profileUserId)) {
      setFriendshipStatus('pending_received');
      return;
    }
    
    // Otherwise, not connected
    setFriendshipStatus('none');
  }, [user, profileUserId]);

  // Close notification
  const handleCloseNotification = () => {
    setNotification({
      ...notification,
      open: false
    });
  };

  // Send friend request
  const handleSendRequest = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      // Direct API call instead of using the store function
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/friend-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetUserId: profileUserId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to send friend request');
      }
      
      // Update local state
      setFriendshipStatus('pending_sent');
      
      // Display notification
      setNotification({
        open: true,
        message: 'Friend request sent',
        type: 'success'
      });
      
      // Fetch updated user data
      await fetchUser();
    } catch (error) {
      console.error('Error sending friend request:', error);
      setNotification({
        open: true,
        message: error.message || 'Failed to send friend request',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Accept friend request
  const handleAcceptRequest = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/friend-request/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ requesterId: profileUserId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to accept friend request');
      }
      
      // Update local state
      setFriendshipStatus('friends');
      
      // Display notification
      setNotification({
        open: true,
        message: 'Friend request accepted',
        type: 'success'
      });
      
      // Fetch updated user data
      await fetchUser();
    } catch (error) {
      console.error('Error accepting friend request:', error);
      setNotification({
        open: true,
        message: error.message || 'Failed to accept friend request',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Reject friend request
  const handleRejectRequest = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/friend-request/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ requesterId: profileUserId }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to reject friend request');
      }
      
      // Update local state
      setFriendshipStatus('none');
      
      // Display notification
      setNotification({
        open: true,
        message: 'Friend request rejected',
        type: 'info'
      });
      
      // Fetch updated user data
      await fetchUser();
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      setNotification({
        open: true,
        message: error.message || 'Failed to reject friend request',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove friend
  const handleRemoveFriend = async () => {
    if (isLoading) return;
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/remove-friend`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          userId: user._id, 
          friendId: profileUserId 
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to remove friend');
      }
      
      // Update local state
      setFriendshipStatus('none');
      
      // Display notification
      setNotification({
        open: true,
        message: 'Friend removed',
        type: 'info'
      });
      
      // Fetch updated user data
      await fetchUser();
    } catch (error) {
      console.error('Error removing friend:', error);
      setNotification({
        open: true,
        message: error.message || 'Failed to remove friend',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Render loading state
  if (friendshipStatus === 'loading') {
    return <CircularProgress size={24} />;
  }

  // Don't render anything on own profile
  if (friendshipStatus === 'self') {
    return null;
  }

  // Render appropriate button based on friendship status
  return (
    <>
      {friendshipStatus === 'none' && (
        <Button
          variant="contained"
          color="primary"
          startIcon={<PersonAddIcon />}
          onClick={handleSendRequest}
          disabled={isLoading}
        >
          {isLoading ? <CircularProgress size={24} /> : 'Send Friend Request'}
        </Button>
      )}
      
      {friendshipStatus === 'pending_sent' && (
        <Tooltip title="Friend request sent">
          <Button
            variant="outlined"
            color="primary"
            startIcon={<CheckIcon />}
            disabled
          >
            Request Sent
          </Button>
        </Tooltip>
      )}
      
      {friendshipStatus === 'pending_received' && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<CheckIcon />}
            onClick={handleAcceptRequest}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Accept Request'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            onClick={handleRejectRequest}
            disabled={isLoading}
          >
            Decline
          </Button>
        </Box>
      )}
      
      {friendshipStatus === 'friends' && (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<PeopleIcon />}
            sx={{ mr: 1 }}
            disabled
          >
            Friends
          </Button>
          <Tooltip title="Remove Friend">
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={handleRemoveFriend}
              disabled={isLoading}
            >
              <PersonRemoveIcon fontSize="small" />
            </Button>
          </Tooltip>
        </Box>
      )}
      
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
    </>
  );
};

export default FriendRequestButton;