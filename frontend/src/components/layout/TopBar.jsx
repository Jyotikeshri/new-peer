// src/components/layout/TopBar.jsx
// ------------------------------
import React from 'react';
import { IconButton, Badge, Box } from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../../contexts/notificationStore';

const TopBar = () => {
  const notifications = useNotificationStore((s) => s.notifications);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" p={1}>
      {/* existing logo, nav, etc. */}
      <IconButton component={Link} to="/notifications" color="inherit">
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
    </Box>
  );
};

export default TopBar;
