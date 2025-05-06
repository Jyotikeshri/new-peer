// src/components/calls/CallNotification.jsx
import React, { useEffect, useRef } from 'react';
import Dialog from '@mui/material/Dialog';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import CallIcon from '@mui/icons-material/Call';
import CallEndIcon from '@mui/icons-material/CallEnd';
import { styled } from '@mui/material/styles';

// Styled buttons for better appearance
const CallButton = styled(Button)(({ theme, color }) => ({
  borderRadius: '50%',
  minWidth: '64px',
  height: '64px',
  padding: 0,
  backgroundColor: color === 'accept' ? theme.palette.success.main : theme.palette.error.main,
  '&:hover': {
    backgroundColor: color === 'accept' ? theme.palette.success.dark : theme.palette.error.dark,
  }
}));

function CallNotification({ open, onClose, caller, callId, onAccept, onReject }) {
  const navigate = useNavigate();
  const ringtoneRef = useRef(null);
  const acceptedRef = useRef(false);

  useEffect(() => {
    // Play ringtone when call notification opens
    if (open) {
      try {
        ringtoneRef.current = new Audio('/sounds/ringtone.mp3');
        ringtoneRef.current.loop = true;
        ringtoneRef.current.play().catch(err => console.error('Error playing ringtone:', err));
      } catch (err) {
        console.error('Error setting up ringtone:', err);
      }
    } else {
      // Reset accepted status when dialog closes
      acceptedRef.current = false;
    }

    return () => {
      // Stop ringtone when component unmounts or dialog closes
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current.currentTime = 0;
        ringtoneRef.current = null;
      }
    };
  }, [open]);

  const handleAccept = () => {
    // Prevent multiple accepts or user_left messages
    if (acceptedRef.current) return;
    acceptedRef.current = true;
    
    // Stop the ringtone if it's playing
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }

    // First call the acceptance handler (sends the CALL_ACCEPTED message)
    if (onAccept) {
      onAccept();
    }
    
    // Close the dialog
    onClose();
    
    // Wait a moment to ensure the CALL_ACCEPTED message goes through
    setTimeout(() => {
      // Then navigate to the call page
      navigate(`/call/${callId}`);
    }, 300);
  };

  const handleReject = () => {
    // Stop the ringtone if it's playing
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }

    // Call the rejection handler
    if (onReject) {
      onReject();
    }
    
    // Close the dialog
    onClose();
  };

  if (!open || !caller) return null;

  return (
    <Dialog
      open={open}
      onClose={handleReject}
      PaperProps={{
        sx: {
          borderRadius: 2,
          width: '100%',
          maxWidth: '400px',
        }
      }}
    >
      <Box sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Incoming Call
        </Typography>
        
        <Avatar 
          src={caller.image} 
          sx={{ width: 80, height: 80, mb: 2 }}
        >
          {caller.name ? caller.name.charAt(0).toUpperCase() : 'U'}
        </Avatar>
        
        <Typography variant="h6" gutterBottom>
          {caller.name || 'Someone'} is calling you
        </Typography>
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', gap: 6 }}>
          <CallButton
            color="reject"
            onClick={handleReject}
          >
            <CallEndIcon fontSize="large" sx={{ color: 'white' }} />
          </CallButton>
          
          <CallButton
            color="accept"
            onClick={handleAccept}
          >
            <CallIcon fontSize="large" sx={{ color: 'white' }} />
          </CallButton>
        </Box>
      </Box>
    </Dialog>
  );
}

export default CallNotification;