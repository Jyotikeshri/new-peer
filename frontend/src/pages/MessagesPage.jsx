// src/pages/MessagesPage.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StreamChat } from "stream-chat";
import { Chat } from "stream-chat-react";
import toast from "react-hot-toast";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import 'stream-chat-react/dist/css/v2/index.css';
import useUserStore from "../contexts/userStore";
import CustomChannelList from "../components/chat/CustomChannelList";
import CreateGroupModal from "../components/chat/CreateGroupModal";

// API calls
const getStreamToken = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/token`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get stream token: ${response.status}`);
  }
  
  return response.json();
};

const getFriends = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/friends`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get friends: ${response.status}`);
  }
  
  return response.json();
};

const getGroups = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/groups`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get groups: ${response.status}`);
  }
  
  return response.json();
};

// Chat loader component
const ChatLoader = () => (
  <Box className="flex flex-col items-center justify-center h-screen">
    <CircularProgress size={40} />
    <Typography variant="body1" className="mt-4">
      Loading messages...
    </Typography>
  </Box>
);

// Custom empty conversations component
const NoConversations = () => (
  <Box className="flex items-center justify-center h-full">
    <Typography variant="body1" color="textSecondary">
      Select a conversation to start chatting
    </Typography>
  </Box>
);

export default function MessagesPage() {
  const navigate = useNavigate();
  const [chatClient, setChatClient] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0); // 0 = Chats, 1 = Friends
  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  
  // Get user from userStore
  const { user, friends: storeFriends } = useUserStore();
  
  // Fetch stream token using React Query
  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useQuery({
    queryKey: ['streamToken'],
    queryFn: getStreamToken,
    enabled: !!user?._id, // Only run when we have a user with an ID
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Use friends from store if available, otherwise fetch them
  const { data: friendsData, isLoading: friendsLoading, error: friendsError } = useQuery({
    queryKey: ['friends'],
    queryFn: getFriends,
    enabled: !!user?._id && !storeFriends?.length, // Only fetch if no friends in store
    retry: 1,
  });
  
  // Fetch user's groups
  const { 
    data: groups, 
    isLoading: groupsLoading, 
    error: groupsError,
    refetch: refetchGroups
  } = useQuery({
    queryKey: ['groups'],
    queryFn: getGroups,
    enabled: !!user?._id,
    retry: 1,
  });
  
  // Use friends from store if available, otherwise use fetched data
  const friends = storeFriends?.length ? storeFriends : friendsData;
  
  // Initialize chat when we have the token and user
  useEffect(() => {
    if (!tokenData?.token || !user?._id) {
      console.log("Missing token or user ID, not initializing chat");
      return;
    }
    
    const initChat = async () => {
      try {
        console.log("Initializing stream chat...");
        
        // Get Stream API key from env
        const apiKey = import.meta.env.VITE_STREAM_API_KEY;
        if (!apiKey) {
          throw new Error("Stream API key is missing");
        }
        
        // Initialize the client
        const client = StreamChat.getInstance(apiKey);
        
        console.log("Connecting user:", {
          id: user._id,
          name: user.username,
          image: user.avatar
        });
        
        // Connect the user with detailed logging
        try {
          await client.connectUser(
            {
              id: String(user._id),
              name: user.username || user.fullName, 
              image: user.avatar || user.profilePic
            },
            tokenData.token
          );
          console.log("Connected to Stream chat successfully");
        } catch (connErr) {
          console.error("Error connecting user to Stream:", connErr);
          throw connErr;
        }
        
        // Set the client in state
        setChatClient(client);
        setError(null);
      } catch (err) {
        console.error("Error initializing chat:", err);
        setError(err.message || "Failed to connect to chat service");
        toast.error("Could not connect to chat. Please try again.");
      }
    };
    
    initChat();
    
    // Clean up on unmount
    return () => {
      if (chatClient) {
        console.log("Disconnecting chat client");
        chatClient.disconnectUser().catch(err => {
          console.error("Error disconnecting:", err);
        });
      }
    };
  }, [tokenData, user]);
  
  // Create channels for friends and groups
  useEffect(() => {
    if (!chatClient || !user?._id) {
      console.log("Missing chat client or user ID, not creating channels");
      return;
    }
    
    // Update the initializeChannels function in MessagesPage.jsx
    const initializeChannels = async () => {
      try {
        console.log("Initializing channels...");
        
        // Initialize friend channels - REMOVE THIS SECTION
        // Direct messages will be created when user clicks on a friend
        
        // Initialize group channels
        if (groups?.length) {
          console.log("Initializing channels for groups...");
          
          const groupPromises = groups.map(async (group) => {
            try {
              console.log("Loading channel for group:", {
                groupId: group._id,
                groupName: group.name,
                channelId: group.channelId
              });
              
              // Initialize the channel without trying to create it
              // Just query for the channel that should already exist on the server
              const channel = chatClient.channel('messaging', group.channelId);
              
              // Watch the channel to receive updates
              await channel.watch();
              console.log(`Group channel loaded: ${group.channelId}`);
            } catch (err) {
              console.error(`Error loading group channel ${group.channelId}:`, err);
              // Don't throw error to allow other channels to load
            }
          });
          
          await Promise.all(groupPromises);
        }
      } catch (err) {
        console.error("Error initializing channels:", err);
      }
    };
    
    initializeChannels();
  }, [chatClient, friends, groups, user]);
  
  // Handle authentication errors
  if (!user?._id) {
    console.log("No user ID found");
    return (
      <Box className="flex flex-col items-center justify-center h-screen p-4">
        <Typography variant="h6" className="mb-4 text-red-600">
          Authentication Required
        </Typography>
        <Typography variant="body1" className="mb-4 text-center">
          You need to be logged in to access your messages.
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => navigate('/login')}
        >
          Log In
        </Button>
      </Box>
    );
  }
  
  // Handle token fetch errors
  if (tokenError) {
    return (
      <Box className="flex flex-col items-center justify-center h-screen p-4">
        <Typography variant="h6" className="mb-4 text-red-600">
          Connection Error
        </Typography>
        <Typography variant="body1" className="mb-4 text-center">
          Failed to connect to chat service: {tokenError.message}
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </Box>
    );
  }
  
  // Show loading state
  if (tokenLoading || !chatClient) {
    return <ChatLoader />;
  }
  
  // Show connection errors
  if (error) {
    return (
      <Box className="flex flex-col items-center justify-center h-screen p-4">
        <Typography variant="h6" className="mb-4 text-red-600">
          Chat Error
        </Typography>
        <Typography variant="body1" className="mb-4 text-center">
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => window.location.reload()}
        >
          Reconnect
        </Button>
      </Box>
    );
  }
  
  // Filter items based on search and tab
  const filteredFriends = friends?.filter(friend => 
    (friend?.username || friend?.fullName || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  ) || [];
  
  const filteredGroups = groups?.filter(group => 
    (group?.name || '')
      .toLowerCase()
      .includes(search.toLowerCase())
  ) || [];
  
  // Set up filters for channel list
  const filters = {
    type: 'messaging',
    members: { $in: [String(user._id)] }
  };
  
  const sort = { last_message_at: -1 };
  
  // Create a channel with a friend
  const handleChatWithFriend = async (friend) => {
    try {
      // First try to create/get the channel through the backend
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/direct`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          targetUserId: friend._id
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create chat channel');
      }
      
      const data = await response.json();
      navigate(`/chat/${data.channelId}`);
    } catch (error) {
      console.error('Error creating direct message:', error);
      
      // Fallback - use client-side sorting (less reliable)
      const channelId = [user._id, friend._id].sort().join('__');
      
      try {
        // Try to get or create the channel on client side
        const channel = chatClient.channel('messaging', channelId, {
          members: [user._id.toString(), friend._id.toString()]
        });
        
        // Watch the channel to make sure it exists
        await channel.watch();
        navigate(`/chat/${channelId}`);
      } catch (channelError) {
        console.error('Error creating channel:', channelError);
        toast.error('Failed to start conversation. Please try again.');
      }
    }
  };
  
  // Navigate to a group chat
  const handleChatWithGroup = (group) => {
    navigate(`/chat/${group.channelId}`);
  };
  
  // Handle search input change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };
  
  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  // Handle group creation completion
  const handleGroupCreated = (newGroup) => {
    refetchGroups();
    toast.success(`Group "${newGroup.name}" created successfully!`);
  };
  
  // Render the messages page with sidebar
  return (
    <Box className="h-screen flex">
      <Paper
        elevation={0}
        sx={{ 
          width: 300, 
          borderRight: '1px solid #e0e0e0', 
          display: 'flex', 
          flexDirection: 'column',
          height: '100%',
          zIndex: 1
        }}
      >
        <Box className="p-4">
          <Typography variant="h6" className="mb-4">
            Messages
          </Typography>
          
          <TextField
            fullWidth
            label="Search"
            variant="outlined"
            size="small"
            value={search}
            onChange={handleSearchChange}
            className="mb-2"
          />
          
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="fullWidth"
            className="mb-2"
          >
            <Tab label="Chats" />
            <Tab label="Friends" />
            <Tab label="Groups" />
          </Tabs>
        </Box>
        
        {/* Tab Content */}
        <Box className="flex-1 overflow-y-auto px-2">
          {/* Chats Tab */}
          {tabValue === 0 && (
            <Chat client={chatClient} theme="str-chat__theme-light">
              <CustomChannelList 
                client={chatClient} 
                filters={filters} 
                sort={sort} 
              />
            </Chat>
          )}
          
          {/* Friends Tab */}
          {tabValue === 1 && (
            <>
              {friendsLoading && (
                <Box className="flex justify-center p-4">
                  <CircularProgress size={24} />
                </Box>
              )}
              
              {friendsError && (
                <Typography variant="body2" color="error" className="p-4 text-center">
                  Error loading friends: {friendsError.message}
                </Typography>
              )}
              
              {!friendsLoading && filteredFriends.length === 0 && (
                <Typography variant="body2" color="textSecondary" className="p-4 text-center">
                  {search ? 'No friends match your search' : 'You haven\'t added any friends yet'}
                </Typography>
              )}
              
              <List>
                {filteredFriends.map((friend) => (
                  <ListItem
                    key={friend._id}
                    button
                    onClick={() => handleChatWithFriend(friend)}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={friend.avatar || friend.profilePic} 
                        alt={friend.username || friend.fullName || 'User'}
                      >
                        {(friend.username || friend.fullName || 'U').charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={friend.username || friend.fullName || 'Unknown User'} 
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
          
          {/* Groups Tab */}
          {tabValue === 2 && (
            <>
              {groupsLoading && (
                <Box className="flex justify-center p-4">
                  <CircularProgress size={24} />
                </Box>
              )}
              
              {groupsError && (
                <Typography variant="body2" color="error" className="p-4 text-center">
                  Error loading groups: {groupsError.message}
                </Typography>
              )}
              
              {!groupsLoading && filteredGroups.length === 0 && (
                <Typography variant="body2" color="textSecondary" className="p-4 text-center">
                  {search ? 'No groups match your search' : 'You haven\'t joined any groups yet'}
                </Typography>
              )}
              
              <List>
                {filteredGroups.map((group) => (
                  <ListItem
                    key={group._id}
                    button
                    onClick={() => handleChatWithGroup(group)}
                    sx={{ borderRadius: 1, mb: 0.5 }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={group.avatar} 
                        alt={group.name || 'Group'}
                        sx={{ bgcolor: 'primary.main' }}
                      >
                        {(group.name || 'G').charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={group.name || 'Unnamed Group'}
                      secondary={`${group.members.length} members`}
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Box>
        
        {/* New group button */}
        <Box className="p-4">
          <Button 
            variant="contained" 
            fullWidth 
            onClick={() => setCreateGroupModalOpen(true)}
          >
            New Group
          </Button>
        </Box>
      </Paper>
      
      <Box className="flex-1 bg-gray-50">
        <NoConversations />
      </Box>
      
      {/* Create Group Modal */}
      <CreateGroupModal
        open={createGroupModalOpen}
        onClose={() => setCreateGroupModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </Box>
  );
}