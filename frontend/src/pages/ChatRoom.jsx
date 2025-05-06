// src/pages/ChatRoom.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { StreamChat } from "stream-chat";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
  TypingIndicator
} from "stream-chat-react";
import toast from "react-hot-toast";
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VideoCallIcon from '@mui/icons-material/VideoCall';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import 'stream-chat-react/dist/css/v2/index.css';
import useUserStore from "../contexts/userStore";
import GroupInfoPanel from '../components/chat/GroupInfoPanel';
import CallNotification from "../components/calls/CallNotification";
import { MessageSimple } from 'stream-chat-react';
import Chip from '@mui/material/Chip';


// API function to get stream token
const getStreamToken = async () => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/chat/token`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get stream token: ${response.status}`);
  }
  
  return response.json();
};

const CustomMessage = (props) => {
  const { message, formatDate, theme } = props;

  // Render a centered “system” bubble for our call events
  if (message.type === 'call.accepted' || message.type === 'call.rejected') {
    const label =
      message.type === 'call.accepted'
        ? `✅ Call accepted at ${formatDate(message.created_at, 'time')}`
        : `❌ Call rejected at ${formatDate(message.created_at, 'time')}`;

    return (
      <Box
        display="flex"
        justifyContent="center"
        my={1}
      >
        <Chip
          label={label}
          variant="outlined"
          sx={{ fontWeight: 'bold' }}
        />
      </Box>
    );
  }

  // Fallback to the default Stream renderer
  return <MessageSimple {...props} />;
};




// Get group details from API
const getGroupDetails = async (groupId) => {
  const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/groups/${groupId}`, {
    credentials: 'include'
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get group details: ${response.status}`);
  }
  
  return response.json();
};

// Chat loader component
const ChatLoader = () => (
  <Box className="flex flex-col items-center justify-center h-screen">
    <CircularProgress size={40} />
    <Typography variant="body1" className="mt-4">
      Connecting to chat...
    </Typography>
  </Box>
);

// Custom ChannelHeader component with integrated call button
const CustomChannelHeader = ({ channel, client, isGroup, groupData, onLeaveGroup, onViewGroupInfo, onStartCall }) => {
  const navigate = useNavigate();
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [leaveGroupDialogOpen, setLeaveGroupDialogOpen] = useState(false);
  
  const openMenu = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };
  
  const closeMenu = () => {
    setMenuAnchorEl(null);
  };
  
  const handleBack = () => {
    navigate('/messages');
  };
  
  const handleViewGroupInfo = () => {
    closeMenu();
    if (onViewGroupInfo) {
      onViewGroupInfo();
    }
  };
  
  const handleLeaveGroupDialog = () => {
    closeMenu();
    setLeaveGroupDialogOpen(true);
  };
  
  const handleLeaveGroup = async () => {
    setLeaveGroupDialogOpen(false);
    if (onLeaveGroup) {
      onLeaveGroup();
    }
  };
  
  return (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      p: 1, 
      borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
    }}>
      <IconButton onClick={handleBack} size="small" sx={{ mr: 1 }}>
        <ArrowBackIcon />
      </IconButton>
      
      {isGroup ? (
        // Group chat header
        <>
          <Avatar 
            src={channel.data?.image || groupData?.avatar} 
            sx={{ 
              width: 40, 
              height: 40, 
              mr: 1.5,
              bgcolor: 'primary.main'
            }}
          >
            {(channel.data?.name || groupData?.name || 'G').charAt(0).toUpperCase()}
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="subtitle1">
              {channel.data?.name || groupData?.name || 'Group Chat'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {groupData?.members?.length || Object.keys(channel.state.members).length} members
            </Typography>
          </Box>
          
          {/* Call Button */}
          <Tooltip title="Start video call">
            <IconButton 
              onClick={onStartCall}
              color="primary"
              sx={{ mr: 1 }}
            >
              <VideoCallIcon />
            </IconButton>
          </Tooltip>
          
          <IconButton onClick={openMenu}>
            <MoreVertIcon />
          </IconButton>
          
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={closeMenu}
          >
            <MenuItem onClick={handleViewGroupInfo}>Group Info</MenuItem>
            <MenuItem onClick={handleLeaveGroupDialog}>Leave Group</MenuItem>
          </Menu>
          
          {/* Leave Group Dialog */}
          <Dialog
            open={leaveGroupDialogOpen}
            onClose={() => setLeaveGroupDialogOpen(false)}
          >
            <DialogTitle>Leave Group</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Are you sure you want to leave this group? You'll need to be added back by an admin to rejoin.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setLeaveGroupDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleLeaveGroup} color="error">
                Leave Group
              </Button>
            </DialogActions>
          </Dialog>
        </>
      ) : (
        // Direct message header
        <>
          {/* Find the other user in the conversation */}
          {(() => {
            const otherMember = Object.values(channel.state.members).find(
              member => member.user.id !== client.user.id
            );
            
            if (!otherMember) return null;
            
            const user = otherMember.user;
            
            return (
              <>
                <Avatar 
                  src={user.image} 
                  sx={{ width: 40, height: 40, mr: 1.5 }}
                >
                  {(user.name || 'U').charAt(0).toUpperCase()}
                </Avatar>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1">
                    {user.name || 'User'}
                  </Typography>
                  <TypingIndicator />
                </Box>
                
                {/* Call Button */}
                <Tooltip title="Start video call">
                  <IconButton 
                    onClick={onStartCall}
                    color="primary"
                    sx={{ mr: 1 }}
                  >
                    <VideoCallIcon />
                  </IconButton>
                </Tooltip>
              </>
            );
          })()}
        </>
      )}
    </Box>
  );
};

export default function ChatRoom() {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState(null);
  const [isGroup, setIsGroup] = useState(false);
  const [groupId, setGroupId] = useState(null);
  const [groupInfoOpen, setGroupInfoOpen] = useState(false);

  const [incomingCall, setIncomingCall] = useState(false);
  const [currentCaller, setCurrentCaller] = useState(null);
  const [incomingCallId, setIncomingCallId] = useState(null);
  const [callResponse, setCallResponse] = useState(null);
  
  // Get user from store
  const { user } = useUserStore();
  
  // Fetch stream token using React Query
  const { data: tokenData, isLoading: tokenLoading, error: tokenError } = useQuery({
    queryKey: ['streamToken'],
    queryFn: getStreamToken,
    enabled: !!user?._id, // Only run when we have a user
    retry: 2,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  useEffect(() => {
    if (!channel || !chatClient || !user) return;
    
    const handleNewMessage = event => {
      const message = event.message;
      
      // Check if it's a call-related message
      if (message.text) {
        // Handle incoming call notification
        if (message.text.includes('CALL_REQUEST:')) {
          try {
            const callData = JSON.parse(message.text.replace('CALL_REQUEST:', ''));
            
            // Only show notification if the call is from someone else
            if (callData.callerId !== user._id) {
              console.log('Incoming call from:', message.user.name);
              
              setCurrentCaller({
                id: callData.callerId,
                name: message.user.name,
                image: message.user.image
              });
              setIncomingCallId(callData.callId);
              setIncomingCall(true);
            }
          } catch (err) {
            console.error('Error parsing call request:', err);
          }
        }
        // Handle call rejection
        else if (message.text.includes('CALL_REJECTED:')) {
          try {
            const rejectionData = JSON.parse(message.text.replace('CALL_REJECTED:', ''));
            
            // Only show rejection notification if it's not from the current user
            if (rejectionData.userId !== user._id) {
              toast.info(`${message.user.name || 'User'} declined the call`);
            }
          } catch (err) {
            console.error('Error parsing call rejection:', err);
          }
        }
        // Handle call acceptance
        else if (message.text.includes('CALL_ACCEPTED:')) {
          try {
            const acceptanceData = JSON.parse(message.text.replace('CALL_ACCEPTED:', ''));
            
            // Show acceptance notification if it's not from the current user
            if (acceptanceData.userId !== user._id) {
              toast.success(`${message.user.name || 'User'} joined the call`);
            }
          } catch (err) {
            console.error('Error parsing call acceptance:', err);
          }
        }
      }
    };
    
    // Listen for new messages
    chatClient.on('message.new', handleNewMessage);
    
    // Cleanup on unmount
    return () => {
      chatClient.off('message.new', handleNewMessage);
    };
  }, [channel, chatClient, user]);
  
  // Check if the channel is a group chat
  useEffect(() => {
    if (!channelId) return;
    
    // If channel ID starts with "group-", it's a group chat
    if (channelId.startsWith('group-')) {
      setIsGroup(true);
      
      // Extract group ID from the database - we'll need to fetch it
      fetch(`${import.meta.env.VITE_API_BASE_URL}/groups`, {
        credentials: 'include'
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch groups');
        return res.json();
      })
      .then(groups => {
        // Find the group with matching channelId
        const group = groups.find(g => g.channelId === channelId);
        if (group) {
          setGroupId(group._id);
        }
      })
      .catch(err => {
        console.error('Error determining group:', err);
      });
    } else {
      setIsGroup(false);
      setGroupId(null);
    }
  }, [channelId]);
  
  // Fetch group details if it's a group chat
  const { 
    data: groupData, 
    isLoading: groupLoading,
    refetch: refetchGroupData
  } = useQuery({
    queryKey: ['group', groupId],
    queryFn: () => getGroupDetails(groupId),
    enabled: !!groupId && !!user?._id, // Only run for group chats
    retry: 1,
  });
  
  // Initialize chat when we have the token and user
  useEffect(() => {
    if (!tokenData?.token || !user || !channelId) {
      console.log("Missing required data:", { 
        hasToken: !!tokenData?.token, 
        hasUser: !!user, 
        channelId 
      });
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
        
        // Connect the user
        await client.connectUser(
          {
            id: String(user._id),
            name: user.username,
            image: user.avatar || undefined
          },
          tokenData.token
        );
        
        console.log("Connected to Stream chat");
        
        // Check if the channel exists and the user is a member
        try {
          // Try to get the user's channels
          const userChannels = await client.queryChannels({
            members: { $in: [String(user._id)] }
          });
          
          // Check if the requested channel is in the user's channels
          const channelExists = userChannels.some(ch => ch.id === channelId);
          console.log(`Channel ${channelId} exists for user: ${channelExists}`);
          
          if (!channelExists && !channelId.includes('__')) {
            // If it's a group chat but doesn't exist for this user
            console.error("User is not a member of this group channel");
            setError("You are not a member of this group");
            return;
          }
        } catch (checkError) {
          console.error("Error checking channel access:", checkError);
        }
        
        // Initialize the channel
        const currentChannel = client.channel('messaging', channelId);
        
        // Watch the channel to receive messages
        await currentChannel.watch();
        console.log("Watching channel:", channelId);
        
        // Set the client and channel in state
        setChatClient(client);
        setChannel(currentChannel);
        setError(null);
      } catch (err) {
        console.error("Error initializing chat:", err);
        
        // Provide a more user-friendly error message
        let errorMessage = "Failed to connect to chat service";
        
        if (err.code === 17) {
          errorMessage = "You don't have permission to access this conversation";
        } else if (err.code === 4) {
          errorMessage = "This conversation doesn't exist or has been deleted";
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
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
  }, [tokenData, user, channelId]);
  
  // Handle leaving a group
  const handleLeaveGroup = async () => {
    try {
      // Call API to leave the group
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/groups/member`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          groupId: groupId,
          userId: user._id
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to leave group');
      }
      
      toast.success('You have left the group');
      navigate('/messages');
    } catch (error) {
      console.error('Error leaving group:', error);
      toast.error(error.message || 'Failed to leave group');
    }
  };

  // Handle starting a video call
  const handleStartVideoCall = () => {
    if (channel && channelId) {
      toast.success('Initiating call...');
      
      // Create call data object
      const callData = {
        callerId: user._id,
        callerName: user.username,
        callId: channelId,
        timestamp: new Date().toISOString()
      };
      
      // Send a call request notification
      channel.sendMessage({
        text: `CALL_REQUEST:${JSON.stringify(callData)}`,
      }).catch(err => {
        console.error('Error sending call notification:', err);
        toast.error('Failed to initiate call');
      });
      
      // Navigate to call page after a short delay
      setTimeout(() => {
        navigate(`/call/${channelId}`);
      }, 500);
    }
  };

  const handleAcceptCall = async () => {
    if (!channel || !incomingCallId) return;
  
    // Notify the other side (optional)
    await channel.sendMessage({
      text: `Call accepted`,
      type: 'call.accepted',
      // you can also include metadata if you need timestamps etc.
      // customType: 'call.accepted',
      // metadata: { callId: incomingCallId },
    });
  
    // clear the incoming-call UI
    setIncomingCall(false);
  };
  
  const handleRejectCall = async () => {
    if (!channel || !incomingCallId) return;
  
    await channel.sendMessage({
      text: `Call rejected`,
      type: 'call.rejected',
    });
  
    setIncomingCall(false);
  };
  
  // Handle authentication errors
  if (!user) {
    return (
      <Box className="flex flex-col items-center justify-center h-screen p-4">
        <Typography variant="h6" className="mb-4 text-red-600">
          Authentication Required
        </Typography>
        <Typography variant="body1" className="mb-4 text-center">
          You need to be logged in to access the chat.
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
  if (tokenLoading || !chatClient || !channel) {
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
  
  // Finally, render the chat interface
  return (
    <Box className="h-screen">
      <Chat client={chatClient} theme="str-chat__theme-light">
        <Channel channel={channel}>
          <Window>
            {/* Use custom ChannelHeader with integrated call button */}
            <CustomChannelHeader 
              channel={channel} 
              client={chatClient} 
              isGroup={isGroup}
              groupData={groupData}
              onLeaveGroup={handleLeaveGroup}
              onViewGroupInfo={() => setGroupInfoOpen(true)}
              onStartCall={handleStartVideoCall}
            />
            <MessageList />
            <MessageInput focus />
          </Window>
          <Thread />
        </Channel>
      </Chat>
      
      {/* Group Info Panel */}
      {isGroup && groupData && (
        <GroupInfoPanel 
          open={groupInfoOpen}
          onClose={() => setGroupInfoOpen(false)}
          groupData={groupData}
          refetchGroup={refetchGroupData}
          isAdmin={user._id === groupData.admin._id}
        />
      )}

<CallNotification
        open={incomingCall}
        onClose={() => setIncomingCall(false)}
        caller={currentCaller}
        callId={incomingCallId}
        onAccept={handleAcceptCall}
        onReject={handleRejectCall}
      />
      <Dialog
  open={callResponse === 'accepted' || callResponse === 'rejected'}
  onClose={() => setCallResponse(null)}
>
  <DialogTitle>
    {callResponse === 'accepted' ? 'Call Accepted' : 'Call Rejected'}
  </DialogTitle>
  <DialogContent>
    <Typography>
      {callResponse === 'accepted'
        ? 'You have joined the call.'
        : 'You have declined the call.'}
    </Typography>
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setCallResponse(null)} autoFocus>
      OK
    </Button>
  </DialogActions>
</Dialog>
    </Box>
  );
}