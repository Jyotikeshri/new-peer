import React from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import { useNavigate } from 'react-router-dom';

function CallButton({ handleVideoCall, channelId }) {
  const navigate = useNavigate();

  // Modified to directly navigate to call page
  const startVideoCall = () => {
    if (channelId) {
      // Navigate directly to call page
      navigate(`/call/${channelId}`);
    }
  };

  return (
    <Box
      sx={{
        padding: 2,
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        maxWidth: '1200px', // equivalent to max-w-7xl
        mx: 'auto',
        width: '100%',
        position: 'relative', // Changed from absolute to relative
        zIndex: 10
      }}
    >
      <Tooltip title="Start video call">
        <IconButton
          onClick={startVideoCall}
          color="primary"
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            padding: '8px'
          }}
        >
          <VideoCallIcon fontSize="medium" />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default CallButton;