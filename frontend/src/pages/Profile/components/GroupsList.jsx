// src/pages/Profile/components/GroupsList.jsx
import React, { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  Button,
  Chip,
  Avatar,
  AvatarGroup,
  Divider,
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import GroupsIcon from '@mui/icons-material/Groups';
import PeopleIcon from '@mui/icons-material/People';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import toast from 'react-hot-toast';
import useUserStore from '../../../contexts/userStore';

/**
 * GroupsList uses the Stream Chat client to fetch and display group channels.
 * Instead of requiring group IDs as props, it fetches all channels and filters for groups.
 */
const GroupsList = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [client, setClient] = useState(null);
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Format meeting date
  const formatMeetingDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // Get Stream-specific token
  useEffect(() => {
    if (!user || !user._id) return;

    const fetchStreamToken = async () => {
      try {
        setLoading(true);
        // Fetch a Stream-specific token from your backend
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/token`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to get Stream chat token');
        }

        const data = await response.json();
        if (!data.token) {
          throw new Error('No Stream token returned from server');
        }

        // Initialize the Stream client with the token
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        if (!apiKey) throw new Error('Stream API key is missing');

        const streamClient = StreamChat.getInstance(apiKey);
        
        // Make sure user ID is a string
        const userId = String(user._id);
        
        await streamClient.connectUser(
          { 
            id: userId,
            name: user.username,
            image: user.avatar || undefined 
          },
          data.token
        );
        
        console.log("Successfully connected to Stream Chat");
        setClient(streamClient);
        
        // After client is initialized, fetch channels
        await fetchGroupChannels(streamClient);
      } catch (err) {
        console.error('Error setting up Stream Chat:', err);
        setError('Failed to connect to chat service: ' + err.message);
        setLoading(false);
      }
    };

    fetchStreamToken();

    // Clean up on unmount
    return () => {
      if (client) {
        client.disconnectUser().catch(console.error);
      }
    };
  }, [user]);

  // Fetch all group channels using approach from CustomChannelList
  const fetchGroupChannels = async (streamClient) => {
    if (!streamClient) return;

    try {
      // Query all channels the user is a member of
      const response = await streamClient.queryChannels(
        { 
          members: { $in: [String(user._id)] },
          type: 'messaging'
        },
        { last_message_at: -1 },
        {
          watch: true,
          state: true,
          presence: true,
          message_limit: 1,
        }
      );
      
      // Filter to only include group channels (using the same logic as CustomChannelList)
      const groupChannels = response.filter(channel => isGroupChat(channel));
      console.log('Fetched group channels:', groupChannels);
      
      setChannels(groupChannels);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching group channels:', err);
      setError('Failed to load groups: ' + err.message);
      setLoading(false);
    }
  };

  // Helper function to determine if a channel is a group chat (from CustomChannelList)
  const isGroupChat = (channel) => {
    // First check: If channel ID starts with 'group-', it's definitely a group chat
    if (channel.id && channel.id.startsWith('group-')) {
      return true;
    }
    
    // Second check: If channel ID contains double underscore, it's a direct message
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

  // Setup events to update group list when new messages arrive
  useEffect(() => {
    if (!client) return;

    const handleNewMessage = () => {
      fetchGroupChannels(client);
    };

    client.on('message.new', handleNewMessage);

    return () => {
      client.off('message.new', handleNewMessage);
    };
  }, [client]);

  const handleViewGroup = (channel) => {
    navigate(`/chat/${channel.id}`);
  };

  const handleRetryConnection = () => {
    setLoading(true);
    setError(null);
    // Force refresh of the component
    navigate('/profile', { replace: true });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress color="primary" size={32} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="error" sx={{ mb: 2 }}>{error}</Typography>
        <Button variant="outlined" onClick={handleRetryConnection}>
          Retry Connection
        </Button>
      </Box>
    );
  }

  if (!channels.length) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <GroupsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">No groups joined yet</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Join study groups to collaborate with peers
        </Typography>
        <Button
          variant="contained" 
          startIcon={<GroupIcon />}
          onClick={() => navigate('/groups')}
        >Find Groups</Button>
      </Box>
    );
  }

  const renderGroupCard = (channel) => {
    const data = channel.data || {};
    const members = Object.values(channel.state.members || {}).map(m => m.user);
    const lastMessage = channel.state.messages[channel.state.messages.length - 1];

    return (
      <Grid item xs={12} key={channel.id}>
        <Card sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', overflow: 'visible' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box>
                <Typography variant="h5" fontWeight="600" sx={{ mb: 0.5 }}>{data.name || 'Group Chat'}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon sx={{ fontSize: 18, mr: 0.5, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">{members.length} members</Typography>
                </Box>
              </Box>
              {data.nextMeeting && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarTodayIcon sx={{ fontSize: 18, mr: 1, color: 'primary.main' }} />
                  <Typography variant="body2" color="primary.main">
                    Next: {formatMeetingDate(data.nextMeeting)}
                  </Typography>
                </Box>
              )}
            </Box>
            <Typography variant="body1" sx={{ mb: 2 }}>{data.description || 'No description available.'}</Typography>
            
            {/* Latest message preview */}
            {lastMessage && (
              <Box sx={{ mb: 2, bgcolor: 'rgba(0,0,0,0.03)', p: 1.5, borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {lastMessage.user?.name || 'Someone'}: {lastMessage.text || (lastMessage.attachments?.length ? 'Sent an attachment' : 'New message')}
                </Typography>
              </Box>
            )}
            
            {Array.isArray(data.topics) && data.topics.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {data.topics.map((topic, idx) => (
                  <Chip
                    key={idx}
                    label={topic}
                    size="small"
                    sx={{ bgcolor: 'rgba(54, 114, 248, 0.1)', color: 'primary.main' }}
                  />
                ))}
              </Box>
            )}
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <AvatarGroup max={5}>
                {members.slice(0, 5).map((member, idx) => (
                  <Avatar key={member.id || idx} src={member.image} alt={member.name || 'Member'}>
                    {(member.name || 'M')[0].toUpperCase()}
                  </Avatar>
                ))}
              </AvatarGroup>
              <Button
                variant="contained"
                size="medium"
                onClick={() => handleViewGroup(channel)}
              >View Group</Button>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  };

  return <Grid container spacing={2}>{channels.map(renderGroupCard)}</Grid>;
};

export default GroupsList;