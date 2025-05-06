// src/pages/Profile/components/PeerItem.jsx
import { useEffect, useState } from 'react';
import {
  Avatar,
  Button,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  CircularProgress
} from '@mui/material';
import useUserStore from '../../../../contexts/userStore';
import { useFriends } from '../../../../hooks/useFriends';

export default function PeerItem({ peer, onSnackbar }) {
  // Get user data from the store
  const { user } = useUserStore();
  
  // Use our custom hook for real-time friend management
  const { 
    sendRequest, 
    removeFriend, 
    isSendingRequest, 
    isRemovingFriend 
  } = useFriends();
  
  const [isConnected, setIsConnected] = useState(false);
  
  useEffect(() => {
    if (user && user.friends && peer) {
      // Determine the peer ID consistently
      const peerId = peer.id || peer._id;
      
      if (peerId) {
        const connected = user.friends.some(
          friendId => {
            if (typeof friendId === 'string') {
              return friendId === peerId;
            } else if (friendId && typeof friendId === 'object') {
              return friendId._id === peerId || friendId.id === peerId;
            }
            return false;
          }
        );
        
        setIsConnected(connected);
      }
    }
  }, [user, peer]);
  
  const handleConnect = async (e) => {
    e.stopPropagation();
    const peerId = peer.id || peer._id;
    
    if (!peerId || isSendingRequest) return;
    
    try {
      // Use the mutation function from our custom hook
      await sendRequest(peerId);
      onSnackbar(`Friend request sent to ${peer.username}!`, 'success');
    } catch (error) {
      console.error('Connection error:', error);
      onSnackbar('Failed to send friend request', 'error');
    }
  };
  
  const handleDisconnect = async (e) => {
    e.stopPropagation();
    const peerId = peer.id || peer._id;
    
    if (!peerId || isRemovingFriend) return;
    
    try {
      // Use the mutation function from our custom hook
      await removeFriend(peerId);
      onSnackbar(`Disconnected from ${peer.username}`, 'info');
    } catch (error) {
      console.error('Disconnection error:', error);
      onSnackbar('Failed to disconnect', 'error');
    }
  };
  
  const handleToggle = (e) => {
    return isConnected ? handleDisconnect(e) : handleConnect(e);
  };
  
  // Determine if this component is in a loading state
  const isLoading = isSendingRequest || isRemovingFriend;
  
  return (
    <>
      <ListItem onClick={() => {/* open modal, etc */}}>
        <ListItemAvatar>
          <Avatar src={peer.avatar}>
            {!peer.avatar && peer.username?.charAt(0)}
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={peer.username}
          secondary={peer.field}
        />
        <Button
          variant={isConnected ? 'outlined' : 'contained'}
          size="small"
          disabled={isLoading}
          onClick={handleToggle}
          endIcon={
            isLoading ?
            <CircularProgress size={16} color="inherit" /> :
            null
          }
        >
          {isConnected ? 'Connected' : 'Connect'}
        </Button>
      </ListItem>
      <Divider component="li" />
    </>
  );
}