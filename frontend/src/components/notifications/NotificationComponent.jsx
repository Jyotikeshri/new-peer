// src/components/NotificationComponent.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Avatar,
  Divider,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useNotificationStore } from '../../contexts/notificationStore';
import  useUserStore  from '../../contexts/userStore';
import streamNotificationService from '../../services/streamNotificationService';
import {
  acceptFriendRequest,
  rejectFriendRequest
} from '../../services/friendService';

const NotificationComponent = () => {
  const navigate = useNavigate();
  const {user} = useUserStore();
  const notifications = useNotificationStore((s) => s.notifications);
  const removeNotification = useNotificationStore((s) => s.removeNotification);

  const [anchorEl, setAnchorEl] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAccept = async (notification) => {
    const requesterId = notification.sender._id;
    setActionLoading(notification.id);
    try {
      const success = await acceptFriendRequest(requesterId);
      if (success) {
        // Notify the requester of acceptance
        await streamNotificationService.sendFriendRequestAcceptedNotification(
          requesterId,
          { _id: user._id, username: user.username, avatar: user.avatar }
        );
        removeNotification(notification.id);
      }
    } catch (error) {
      console.error('Error accepting friend request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (notification) => {
    const requesterId = notification.sender._id;
    setActionLoading(notification.id);
    try {
      const success = await rejectFriendRequest(requesterId);
      if (success) {
        await streamNotificationService.sendFriendRequestRejectedNotification(
          requesterId,
          { _id: user._id, username: user.username, avatar: user.avatar }
        );
        removeNotification(notification.id);
      }
    } catch (error) {
      console.error('Error rejecting friend request:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewAll = () => {
    navigate('/friends');
    handleClose();
  };

  const notificationCount = notifications.length;

  return (
    <>
      <IconButton
        color="inherit"
        onClick={handleClick}
        aria-controls="notification-menu"
        aria-haspopup="true"
      >
        <Badge badgeContent={notificationCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{ style: { width: '320px', maxHeight: '400px' } }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <Divider />

        {notifications.length > 0 ? (
          <List sx={{ width: '100%', py: 0 }}>
            {notifications.map((n) => (
              <ListItem key={n.id} sx={{ px: 2 }}>
                <ListItemAvatar>
                  <Avatar src={n.sender?.avatar} alt={n.sender?.username} />
                </ListItemAvatar>
                <ListItemText
                  primary={n.message}
                  secondary={new Date(n.createdAt).toLocaleString()}
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 'medium' }}
                  secondaryTypographyProps={{ variant: 'caption' }}
                />
                <ListItemSecondaryAction>
                  {n.type === 'friend_request' ? (
                    actionLoading === n.id ? (
                      <CircularProgress size={20} />
                    ) : (
                      <>
                        <IconButton
                          edge="end"
                          color="primary"
                          size="small"
                          onClick={() => handleAccept(n)}
                          sx={{ mr: 0.5 }}
                        >
                          <CheckIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          edge="end"
                          color="error"
                          size="small"
                          onClick={() => handleReject(n)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </>
                    )
                  ) : null}
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <MenuItem disabled>
            <Typography variant="body2">No new notifications</Typography>
          </MenuItem>
        )}

        {notifications.some((n) => n.type === 'friend_request') && (
          <Box sx={{ p: 1.5, textAlign: 'center' }}>
            <Button size="small" onClick={handleViewAll} endIcon={<PersonAddIcon />}>
              View All Requests
            </Button>
          </Box>
        )}
      </Menu>
    </>
  );
};

export default NotificationComponent;