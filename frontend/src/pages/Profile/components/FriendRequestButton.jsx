// src/pages/Profile/components/FriendRequestButton.jsx
import { useState, useEffect } from 'react';
import { Button, CircularProgress, Tooltip } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckIcon from '@mui/icons-material/Check';
import PeopleIcon from '@mui/icons-material/People';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import useUserStore from '../../../contexts/userStore';

const FriendRequestButton = ({ profileUserId }) => {
  const { user, sendFriendRequest, acceptFriendRequest, rejectFriendRequest, removeFriend, isLoading } = useUserStore();
  const [friendshipStatus, setFriendshipStatus] = useState('loading'); // 'loading', 'none', 'pending_sent', 'pending_received', 'friends', 'self'
  
  useEffect(() => {
    // Determine friendship status whenever user data changes
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
    const isRequestSent = user.sentFriendRequests?.includes(profileUserId);
    if (isRequestSent) {
      setFriendshipStatus('pending_sent');
      return;
    }
    
    // Check if profile user sent a request to user
    const isRequestReceived = user.friendRequests?.includes(profileUserId);
    if (isRequestReceived) {
      setFriendshipStatus('pending_received');
      return;
    }
    
    // Otherwise, not connected
    setFriendshipStatus('none');
  }, [user, profileUserId]);
  
  const handleSendRequest = async () => {
    if (isLoading) return;
    const success = await sendFriendRequest(profileUserId);
    if (success) {
      setFriendshipStatus('pending_sent');
    }
  };
  
  const handleAcceptRequest = async () => {
    if (isLoading) return;
    const success = await acceptFriendRequest(profileUserId);
    if (success) {
      setFriendshipStatus('friends');
    }
  };
  
  const handleRejectRequest = async () => {
    if (isLoading) return;
    const success = await rejectFriendRequest(profileUserId);
    if (success) {
      setFriendshipStatus('none');
    }
  };
  
  const handleRemoveFriend = async () => {
    if (isLoading) return;
    if (window.confirm('Are you sure you want to remove this friend?')) {
      const success = await removeFriend(profileUserId);
      if (success) {
        setFriendshipStatus('none');
      }
    }
  };
  
  if (friendshipStatus === 'loading') {
    return <CircularProgress size={24} />;
  }
  
  if (friendshipStatus === 'self') {
    return null; // Don't show any button on own profile
  }
  
  if (friendshipStatus === 'none') {
    return (
      <Button
        variant="contained"
        color="primary"
        startIcon={<PersonAddIcon />}
        onClick={handleSendRequest}
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Send Friend Request'}
      </Button>
    );
  }
  
  if (friendshipStatus === 'pending_sent') {
    return (
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
    );
  }
  
  if (friendshipStatus === 'pending_received') {
    return (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<CheckIcon />}
          onClick={handleAcceptRequest}
          disabled={isLoading}
        >
          Accept Request
        </Button>
        <Button
          variant="outlined"
          color="error"
          onClick={handleRejectRequest}
          disabled={isLoading}
        >
          Decline
        </Button>
      </div>
    );
  }
  
  if (friendshipStatus === 'friends') {
    return (
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<PeopleIcon />}
          style={{ marginRight: '8px' }}
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
      </div>
    );
  }
  
  return null;
};

export default FriendRequestButton;