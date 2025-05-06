// src/components/chat/CreateGroupModal.jsx
import { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Checkbox from '@mui/material/Checkbox';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import toast from 'react-hot-toast';
import useUserStore from '../../contexts/userStore';
import React from 'react';

export default function CreateGroupModal({ open, onClose, onGroupCreated }) {
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingFriends, setFetchingFriends] = useState(false);
  const { user, friends, fetchFriends } = useUserStore();
  
  // Fetch friends when the modal opens if they're not already loaded
  useEffect(() => {
    const loadFriends = async () => {
      // If modal is open and we don't have friends data or friends is empty
      if (open && (!friends || friends.length === 0)) {
        try {
          setFetchingFriends(true);
          
          // Use the dedicated fetchFriends method from the store
          await fetchFriends();
        } catch (error) {
          console.error('Error fetching friends:', error);
          toast.error('Failed to load friends. Please try again.');
        } finally {
          setFetchingFriends(false);
        }
      }
    };
    
    loadFriends();
  }, [open, friends, fetchFriends]);
  
  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      setGroupName('');
      setDescription('');
      setSelectedFriends([]);
      setSearchTerm('');
    }
  }, [open]);
  
  // Filter and sort friends based on search term and online status
  const filteredAndSortedFriends = React.useMemo(() => {
    // First filter by search term
    const filtered = friends?.filter(friend => 
      (friend?.username || friend?.fullName || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    ) || [];
    
    // Then sort by online status (online first)
    return filtered.sort((a, b) => {
      // If one is online and the other isn't, the online one comes first
      if (a.isOnline && !b.isOnline) return -1;
      if (!a.isOnline && b.isOnline) return 1;
      
      // Both have the same online status, sort alphabetically by username
      const aName = a.username || a.fullName || '';
      const bName = b.username || b.fullName || '';
      return aName.localeCompare(bName);
    });
  }, [friends, searchTerm]);
  
  // Handle selecting/deselecting friends
  const handleToggleFriend = (friendId) => {
    if (selectedFriends.includes(friendId)) {
      setSelectedFriends(prev => prev.filter(id => id !== friendId));
    } else {
      setSelectedFriends(prev => [...prev, friendId]);
    }
  };
  
  // Handle selecting all online friends
  const handleSelectAllOnlineFriends = () => {
    const onlineFriendIds = friends
      ?.filter(friend => friend.isOnline)
      .map(friend => friend._id) || [];
    
    if (onlineFriendIds.length === 0) {
      toast.info('No online friends available');
      return;
    }
    
    setSelectedFriends(onlineFriendIds);
    toast.success(`Selected ${onlineFriendIds.length} online friends`);
  };
  
  // Handle clearing all selections
  const handleClearSelections = () => {
    setSelectedFriends([]);
  };
  
  // Handle creating the group
  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error('Please enter a group name');
      return;
    }
    
    if (selectedFriends.length === 0) {
      toast.error('Please select at least one friend');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/groups/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: groupName,
          description,
          members: selectedFriends,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to create group' }));
        throw new Error(error.message || 'Failed to create group');
      }
      
      // Parse the response, with error handling for malformed JSON
      let newGroup;
      try {
        newGroup = await response.json();
      } catch (parseError) {
        console.error('Error parsing group response:', parseError);
        // If we can't parse the response but the request was successful,
        // still treat it as a success
        toast.success('Group created successfully!');
        onClose();
        return;
      }
      
      toast.success('Group created successfully!');
      
      // Reset form
      setGroupName('');
      setDescription('');
      setSelectedFriends([]);
      
      // Notify parent component if we have a valid group object
      if (onGroupCreated && newGroup && newGroup._id) {
        onGroupCreated(newGroup);
      }
      
      // Close modal
      onClose();
      
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error(error.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };
  
  // Display selected friends as chips
  const renderSelectedFriends = () => {
    if (selectedFriends.length === 0) return null;
    
    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
        {selectedFriends.map(friendId => {
          const friend = friends?.find(f => f._id === friendId);
          if (!friend) return null;
          
          return (
            <Chip
              key={friend._id}
              avatar={
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                  sx={{
                    '& .MuiBadge-badge': {
                      backgroundColor: friend.isOnline ? 'success.main' : 'grey.500',
                      color: friend.isOnline ? 'success.main' : 'grey.500',
                      boxShadow: `0 0 0 2px white`,
                      width: 8,
                      height: 8,
                      borderRadius: '50%'
                    }
                  }}
                >
                  <Avatar src={friend.avatar} alt={friend.username || friend.fullName} />
                </Badge>
              }
              label={friend.username || friend.fullName}
              onDelete={() => handleToggleFriend(friend._id)}
              color="primary"
              variant="outlined"
            />
          );
        })}
      </Box>
    );
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Create New Group</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          {/* Group Name */}
          <TextField
            fullWidth
            label="Group Name"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            margin="normal"
            required
          />
          
          {/* Group Description */}
          <TextField
            fullWidth
            label="Group Description (Optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            margin="normal"
            multiline
            rows={2}
          />
          
          {/* Selected Friends */}
          <Box sx={{ mt: 2, mb: 1 }}>
            {selectedFriends.length > 0 && (
              <Typography variant="caption" color="text.secondary" component="div" mb={1}>
                {selectedFriends.length} {selectedFriends.length === 1 ? 'friend' : 'friends'} selected
              </Typography>
            )}
            {renderSelectedFriends()}
          </Box>
          
          {/* Friend Search */}
          <TextField
            fullWidth
            label="Search Friends"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            margin="normal"
          />
          
          {/* Friend List */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, mb: 1 }}>
            <Typography variant="subtitle2">
              Select Friends to Add
            </Typography>
            <Box>
              <Button 
                size="small" 
                onClick={handleSelectAllOnlineFriends}
                disabled={fetchingFriends || loading}
                sx={{ mr: 1 }}
              >
                Select Online
              </Button>
              <Button 
                size="small" 
                onClick={handleClearSelections}
                disabled={fetchingFriends || loading || selectedFriends.length === 0}
              >
                Clear
              </Button>
            </Box>
          </Box>
          
          {fetchingFriends ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <List sx={{ 
              maxHeight: 200, 
              overflow: 'auto', 
              border: '1px solid #e0e0e0', 
              borderRadius: 1 
            }}>
              {filteredAndSortedFriends.length > 0 ? (
                <>
                  {/* Optional section header for online friends */}
                  {filteredAndSortedFriends.some(friend => friend.isOnline) && (
                    <ListItem sx={{ py: 0 }}>
                      <Typography variant="caption" color="success.main" fontWeight="medium">
                        Online
                      </Typography>
                    </ListItem>
                  )}
                  
                  {/* Map through and render friends */}
                  {filteredAndSortedFriends.map((friend, index) => {
                    const isSelected = selectedFriends.includes(friend._id);
                    const isFirstOffline = friend.isOnline === false && 
                      (index === 0 || filteredAndSortedFriends[index-1].isOnline === true);
                    
                    return (
                      <React.Fragment key={friend._id}>
                        {/* Add a section header when we transition to offline friends */}
                        {isFirstOffline && (
                          <ListItem sx={{ py: 0 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="medium">
                              Offline
                            </Typography>
                          </ListItem>
                        )}
                        
                        <ListItem 
                          button 
                          onClick={() => handleToggleFriend(friend._id)}
                          selected={isSelected}
                          sx={{ 
                            borderRadius: 1,
                            mb: 0.5,
                            bgcolor: isSelected ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                          }}
                        >
                          <Checkbox 
                            edge="start"
                            checked={isSelected}
                            disableRipple
                          />
                          <ListItemAvatar>
                            <Badge
                              overlap="circular"
                              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                              variant="dot"
                              sx={{
                                '& .MuiBadge-badge': {
                                  backgroundColor: friend.isOnline ? 'success.main' : 'grey.500',
                                  color: friend.isOnline ? 'success.main' : 'grey.500',
                                  boxShadow: `0 0 0 2px white`,
                                }
                              }}
                            >
                              <Avatar 
                                src={friend.avatar} 
                                alt={friend.username || friend.fullName}
                                sx={{ bgcolor: friend.isOnline ? 'primary.main' : 'grey.400' }}
                              >
                                {(friend.username || friend.fullName || 'U').charAt(0).toUpperCase()}
                              </Avatar>
                            </Badge>
                          </ListItemAvatar>
                          <ListItemText 
                            primary={friend.username || friend.fullName}
                            secondary={friend.isOnline ? 'Online' : 'Offline'} 
                            primaryTypographyProps={{
                              fontWeight: friend.isOnline ? 'medium' : 'normal',
                            }}
                            secondaryTypographyProps={{
                              color: friend.isOnline ? 'success.main' : 'text.secondary',
                            }}
                          />
                        </ListItem>
                      </React.Fragment>
                    );
                  })}
                </>
              ) : (
                <ListItem>
                  <ListItemText 
                    primary={
                      searchTerm 
                        ? "No matching friends found" 
                        : "No friends available to add"
                    } 
                    primaryTypographyProps={{ align: 'center', color: 'text.secondary' }}
                  />
                </ListItem>
              )}
            </List>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading || fetchingFriends}>
          Cancel
        </Button>
        <Button 
          onClick={handleCreateGroup} 
          color="primary" 
          variant="contained"
          disabled={loading || fetchingFriends || !groupName.trim() || selectedFriends.length === 0}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Creating...' : 'Create Group'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}