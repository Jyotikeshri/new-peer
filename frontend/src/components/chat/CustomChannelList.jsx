// src/components/chat/CustomChannelList.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Badge from '@mui/material/Badge';

// This component will manually handle the channel preview rendering
const CustomChannelList = ({ client, filters, sort }) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch channels when the component mounts
  useEffect(() => {
    if (!client) return;

    const fetchChannels = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Query channels from Stream
        const response = await client.queryChannels(
          filters,
          sort,
          {
            watch: true, // watch channels for new messages
            state: true, // retrieve channel state
            presence: true, // include presence info (online/offline)
            message_limit: 30, // limit to last 30 messages
          }
        );
        
        console.log('Fetched channels:', response);
        
        setChannels(response);
      } catch (err) {
        console.error('Error fetching channels:', err);
        setError('Failed to load conversations');
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();

    // Set up event listeners for new messages and channel updates
    const handleMessageNew = (event) => {
      console.log('New message event:', event);
      // Refresh channels to update the list with new messages
      client.queryChannels(filters, sort, {
        watch: true,
        state: true,
      }).then(updatedChannels => {
        console.log('Updated channels after new message:', updatedChannels);
        setChannels(updatedChannels);
      });
    };

    // Listen for new messages
    client.on('message.new', handleMessageNew);

    // Clean up event listeners
    return () => {
      client.off('message.new', handleMessageNew);
    };
  }, [client, filters, sort]);

  // Navigate to a specific channel
  const handleChannelClick = (channel) => {
    navigate(`/chat/${channel.id}`);
  };

  // Check if a channel is a group chat based on ID format and other properties
  const isGroupChat = (channel) => {
    // First check: If channel ID starts with 'group-', it's definitely a group chat
    // Example: "group-1746125090172"
    if (channel.id && channel.id.startsWith('group-')) {
      return true;
    }
    
    // Second check: If channel ID contains double underscore, it's a direct message
    // Example: "68133a71f12c4dc734abd325__68136b56c52a6dc86ebe28a0"
    if (channel.id && channel.id.includes('__')) {
      return false;
    }
    
    // Fallback checks if the ID format is not conclusive:
    
    // Check for groupInfo in channel data
    if (channel.data && (channel.data.groupInfo || channel.data.isGroup)) {
      return true;
    }

    // If more than 2 members, it's likely a group chat
    const memberCount = Object.keys(channel.state.members).length;
    if (memberCount > 2) {
      return true;
    }
    
    // If we get here and can't determine, default to not a group
    return false;
  };

  // Render a channel preview
  const renderChannelPreview = (channel) => {
    console.log('Rendering channel:', channel.id, channel.data);
    
    const isGroup = isGroupChat(channel);
    let displayName, avatarSrc, subtitle;
    
    if (isGroup) {
      // It's a group chat
      displayName = channel.data.name || 'Group Chat';
      avatarSrc = channel.data.image;
      
      // Count members for the subtitle
      const memberCount = Object.keys(channel.state.members).length;
      subtitle = `${memberCount} members`;
    } else {
      // It's a direct message - find the other user
      const otherMember = Object.values(channel.state.members).find(
        member => member.user.id !== client.user.id
      );
      
      // Bail early if something's still not right
      if (!otherMember) return null;
      
      const user = otherMember.user;
      
      displayName = user.name || 'User';
      avatarSrc = user.image;
      subtitle = null; // No subtitle for direct messages
    }
    
    // Get the last message
    const lastMessage = channel.state.messages[channel.state.messages.length - 1];
    
    // Get unread count
    const unreadCount = channel.countUnread();
  
    // Format the last message time
    const formatMessageTime = (date) => {
      if (!date) return '';
      const messageDate = new Date(date);
      const now = new Date();
      const isToday = messageDate.toDateString() === now.toDateString();
      
      if (isToday) {
        return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else {
        return messageDate.toLocaleDateString();
      }
    };
    
    // Get the last message text or placeholder
    let lastMessageText = 'No messages yet';
    
    if (lastMessage) {
      if (lastMessage.deleted_at) {
        lastMessageText = 'Message deleted';
      } else if (lastMessage.text) {
        lastMessageText = lastMessage.text;
      } else if (lastMessage.attachments && lastMessage.attachments.length) {
        lastMessageText = 'Sent an attachment';
      }
    }
    
    // Get sender name for group chats
    let senderPrefix = '';
    if (isGroup && lastMessage && lastMessage.user) {
      const isCurrentUser = lastMessage.user.id === client.user.id;
      const senderName = isCurrentUser ? 'You' : (lastMessage.user.name || 'User').split(' ')[0];
      senderPrefix = `${senderName}: `;
    }
  
    return (
      <ListItem
        key={channel.id}
        button
        onClick={() => handleChannelClick(channel)}
        sx={{ 
          borderRadius: 1, 
          mb: 0.5,
          bgcolor: unreadCount > 0 ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
          '&:hover': {
            bgcolor: 'rgba(0, 0, 0, 0.04)'
          }
        }}
      >
        <ListItemAvatar>
          <Avatar 
            src={avatarSrc}
            alt={displayName}
            sx={{ 
              bgcolor: isGroup ? 'primary.main' : undefined
            }}
          >
            {isGroup ? 'G' : (displayName ? displayName.charAt(0).toUpperCase() : 'U')}
          </Avatar>
        </ListItemAvatar>
        <ListItemText 
          primary={
            <Typography 
              variant="body1" 
              fontWeight={unreadCount > 0 ? 'bold' : 'normal'}
            >
              {displayName}
            </Typography>
          }
          secondary={
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {isGroup && (
                <Typography variant="caption" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
              <Typography 
                variant="body2" 
                noWrap
                sx={{ 
                  color: unreadCount > 0 ? 'text.primary' : 'text.secondary',
                  fontWeight: unreadCount > 0 ? 'medium' : 'normal'
                }}
              >
                {isGroup && lastMessage ? senderPrefix : ''}{lastMessageText}
              </Typography>
            </Box>
          }
        />
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          {lastMessage && (
            <Typography variant="caption" color="text.secondary">
              {formatMessageTime(lastMessage.created_at)}
            </Typography>
          )}
          {unreadCount > 0 && (
            <Box 
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white', 
                borderRadius: '50%',
                minWidth: 20,
                height: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                mt: 0.5
              }}
            >
              {unreadCount}
            </Box>
          )}
        </Box>
      </ListItem>
    );
  };

  if (loading) {
    return (
      <Box className="flex justify-center p-4">
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-4 text-center">
        <Typography variant="body2" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  if (channels.length === 0) {
    return (
      <Box className="p-4 text-center">
        <Typography variant="body2" color="textSecondary">
          No conversations yet
        </Typography>
      </Box>
    );
  }

  // Log all channels for debugging
  // console.log('All channels with data:', channels.map(c => ({
  //   id: c.id,
  //   data: c.data,
  //   isGroup: isGroupChat(c)
  // })));

  return (
    <List sx={{ px: 1 }}>
      {channels?.map(channel => renderChannelPreview(channel))}
    </List>
  );
};

export default CustomChannelList;