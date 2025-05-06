// src/pages/Profile/components/PeerCard.jsx
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button,
  Avatar,
  alpha,
  Tooltip,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import useUserStore from '../../../contexts/userStore';
import PeerProfileModal from './PeerProfileModal';
import { useFriends } from '../../../hooks/useFriends';

const SkillTag = styled(Box)(({ theme, type }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  padding: '2px 10px',
  borderRadius: 11,
  fontSize: '0.6875rem',
  margin: '0 3px 5px 0',
  whiteSpace: 'nowrap',
  ...(type === 'strength' ? {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
  } : {
    backgroundColor: '#FFF4E5',
    color: '#F59E0B'
  })
}));

const PeerCard = ({ peer }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Get user data from the store
  const { user } = useUserStore();
  
  // Use our custom hook for real-time friend management
  const { 
    sendRequest, 
    removeFriend, 
    isSendingRequest, 
    isRemovingFriend 
  } = useFriends();
  
  // Check if this peer is already connected to the current user
  const [isConnected, setIsConnected] = useState(false);
  
  // Check connection status when user or peer data changes
  useEffect(() => {
    if (user && user.friends && peer) {
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
  
  // Handle connecting with a peer
  const handleConnect = async (e) => {
    if (e) e.stopPropagation();
    
    const peerId = peer.id || peer._id;
    if (!peerId || isSendingRequest) return;
    
    try {
      // Use the mutation function from our custom hook
      await sendRequest(peerId);
      
      setSnackbar({
        open: true,
        message: `Friend request sent to ${peer.name || peer.username}!`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Error connecting with peer:', error);
      setSnackbar({
        open: true,
        message: 'Failed to send friend request. Please try again.',
        severity: 'error'
      });
    }
  };
  
  // Handle disconnecting from a peer
  const handleDisconnect = async (e) => {
    if (e) e.stopPropagation();
    
    const peerId = peer.id || peer._id;
    if (!peerId || isRemovingFriend) return;
    
    try {
      // Use the mutation function from our custom hook
      await removeFriend(peerId);
      
      setSnackbar({
        open: true,
        message: `Disconnected from ${peer.name || peer.username}`,
        severity: 'info'
      });
    } catch (error) {
      console.error('Error disconnecting from peer:', error);
      setSnackbar({
        open: true,
        message: 'Failed to disconnect. Please try again.',
        severity: 'error'
      });
    }
  };
  
  // Handle toggle connection
  const handleConnectToggle = (e) => {
    if (isConnected) {
      handleDisconnect(e);
    } else {
      handleConnect(e);
    }
  };
  
  // Determine if this component is in a loading state
  const isLoading = isSendingRequest || isRemovingFriend;
  
  // Format the score as a percentage for display
  const matchPercentage = peer.score ? `${Math.round(peer.score * 100)}%` : '';
  
  // Get initials for the avatar
  const getInitials = (name) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  // Open the profile modal
  const handleCardClick = () => {
    setModalOpen(true);
  };

  return (
    <>
      <Box
        onClick={handleCardClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{
          position: 'relative',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          backgroundColor: 'white',
          overflow: 'hidden',
          transition: 'transform 0.2s ease, box-shadow 0.3s ease',
          height: '100%',
          cursor: 'pointer',
          ...(isHovered && {
            transform: 'translateY(-4px)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
          }),
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 2,
            left: 2,
            right: 2,
            bottom: 2,
            borderRadius: 1.5,
            zIndex: -1,
            backgroundColor: '#C8D5F7',
            opacity: 0.1,
          }
        }}
      >
        {/* Match percentage badge */}
        {matchPercentage && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 60,
              height: 24,
              backgroundColor: '#3672F8',
              borderRadius: '0 0 12px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: 'white',
                fontWeight: 600,
              }}
            >
              {matchPercentage}
            </Typography>
          </Box>
        )}
        
        {/* Connect Button */}
        {user && peer && user._id !== peer._id && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              right: 10,
              zIndex: 1,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}
          >
            <Button
              size="small"
              variant={isConnected ? "outlined" : "contained"}
              color="primary"
              onClick={handleConnectToggle}
              disabled={isLoading}
              sx={{
                borderRadius: 6,
                px: 2,
                py: 0.5,
                minWidth: 'auto',
                fontSize: '0.7rem',
                textTransform: 'none',
                ...(isConnected ? {
                  borderColor: '#14F1D9',
                  color: '#07092F',
                } : {
                  backgroundColor: '#14F1D9',
                  color: '#07092F',
                  '&:hover': {
                    backgroundColor: alpha('#14F1D9', 0.9),
                  }
                })
              }}
            >
              {isLoading ? (
                <CircularProgress size={16} sx={{ color: isConnected ? '#07092F' : 'inherit' }} />
              ) : (
                isConnected ? 'Connected' : 'Connect'
              )}
            </Button>
          </Box>
        )}

        {/* Card Content - Unchanged */}
        <Box sx={{ p: 2.5, pt: 3 }}>
          {/* Profile info */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, position: 'relative' }}>
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: peer.avatarColor || '#3672F8',
                fontSize: '1.25rem',
                fontWeight: 600,
                ...(peer.isOnline && {
                  border: '2px solid #44b700'
                })
              }}
              src={peer.avatar || null}
            >
              {!peer.avatar && getInitials(peer.name || peer.username)}
            </Avatar>
            <Box sx={{ ml: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#07092F' }}>
                  {peer.name || peer.username}
                </Typography>
                
                {/* Online indicator */}
                {peer.isOnline && (
                  <Box 
                    sx={{ 
                      width: 8, 
                      height: 8, 
                      bgcolor: '#44b700', 
                      borderRadius: '50%', 
                      ml: 1,
                      boxShadow: '0 0 0 2px white'
                    }} 
                  />
                )}
              </Box>
              <Tooltip title={peer.field || peer.bio || ''} placement="bottom-start">
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: '#5A6282',
                    width: '180px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {peer.field || peer.bio || ''}
                </Typography>
              </Tooltip>
            </Box>
          </Box>

          {/* Skills */}
          {peer.strengths && peer.strengths.length > 0 && (
            <Box sx={{ mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#07092F', display: 'block', mb: 0.5 }}>
                Strengths:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {peer.strengths.slice(0, 4).map((skill, index) => (
                  <SkillTag key={`strength-${index}`} type="strength">
                    {skill}
                  </SkillTag>
                ))}
              </Box>
            </Box>
          )}

          {/* Needs help with */}
          {peer.needsHelpWith && peer.needsHelpWith.length > 0 && (
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 600, color: '#07092F', display: 'block', mb: 0.5, mt: 1 }}>
                Needs Help With:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {peer.needsHelpWith.slice(0, 3).map((skill, index) => (
                  <SkillTag key={`need-${index}`} type="help">
                    {skill}
                  </SkillTag>
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      
      
      {/* Profile Modal */}
      <PeerProfileModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        peer={peer}
        isConnected={isConnected}
        connecting={isSendingRequest}
        disconnecting={isRemovingFriend}
        handleConnect={handleConnect}
        handleDisconnect={handleDisconnect}
        setSnackbar={setSnackbar}
      />
      
      {/* Snackbar */}
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

export default PeerCard;