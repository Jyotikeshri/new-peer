// src/components/chat/GroupInfoPanel.jsx
import { useState, useEffect, useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';

// Icons
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ClearIcon from '@mui/icons-material/Clear';

import useUserStore from '../../contexts/userStore';
import toast from 'react-hot-toast';

export default function GroupInfoPanel({ 
  open, 
  onClose, 
  groupData, 
  refetchGroup, 
  isAdmin 
}) {
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, friends, fetchFriends } = useUserStore();
  
  // Fetch friends on mount
  useEffect(() => {
    if (open && (!friends || friends.length === 0)) {
      fetchFriends();
    }
  }, [open, friends, fetchFriends]);
  
  // Memoize available friends to avoid recalculation
  const availableFriends = useMemo(() => {
    if (!friends || !groupData?.members) return [];
    
    // Get all member IDs from the group
    const memberIds = groupData.members.map(member => member._id);
    
    // Filter friends who are not already members
    return friends.filter(friend => !memberIds.includes(friend._id));
  }, [friends, groupData?.members]);
  
  // Filter available friends based on search term
  const filteredFriends = useMemo(() => {
    if (!searchTerm.trim()) return availableFriends;
    
    return availableFriends.filter(friend => 
      (friend?.username || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      (friend?.fullName || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [availableFriends, searchTerm]);
  
  // Handle adding a member to the group
  const handleAddMember = async (friendId) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/groups/member`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          groupId: groupData._id,
          userId: friendId
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add member');
      }
      
      // Close dialog and refresh group data
      setAddMemberOpen(false);
      toast.success('Member added successfully');
      
      if (refetchGroup) {
        refetchGroup();
      }
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error(error.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };
  
  // Handle removing a member from the group
  const handleRemoveMember = async (memberId) => {
    try {
      // Don't allow removing self if admin
      if (memberId === groupData.admin._id) {
        toast.error("Group admin cannot be removed");
        return;
      }
      
      setLoading(true);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/groups/member`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          groupId: groupData._id,
          userId: memberId
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to remove member');
      }
      
      toast.success('Member removed successfully');
      
      if (refetchGroup) {
        refetchGroup();
      }
    } catch (error) {
      console.error('Error removing member:', error);
      toast.error(error.message || 'Failed to remove member');
    } finally {
      setLoading(false);
    }
  };
  
  const handleClearSearch = () => {
    setSearchTerm('');
  };
  
  if (!groupData) {
    return null;
  }
  
  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        sx={{
          '& .MuiDrawer-paper': { 
            width: { xs: '100%', sm: 360 },
            p: 0
          },
        }}
      >
        <Box sx={{ 
          p: 2, 
          borderRadius: 0, 
          bgcolor: 'primary.dark', // Using theme's deep navy blue
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" fontWeight="600">Group Details</Typography>
          <IconButton onClick={onClose} size="small" sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Box sx={{ 
          p: 0, 
          textAlign: 'center', 
          bgcolor: 'primary.dark',  // Match header color
          color: 'white', 
          pb: 4 
        }}>
          <Avatar
            src={groupData.avatar}
            sx={{
              width: 120,
              height: 120,
              mx: 'auto',
              mb: 2,
              bgcolor: 'primary.main', // Royal Blue from theme
              border: '4px solid',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              fontSize: '3rem',
              mt: 2
            }}
          >
            {groupData.name.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h5" fontWeight="600" color="white">{groupData.name}</Typography>
          {groupData.description && (
            <Typography variant="body1" color="rgba(255, 255, 255, 0.7)" sx={{ mt: 1 }}>
              {groupData.description}
            </Typography>
          )}
        </Box>
        
        <Divider />
        
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: -2 }}>
          <Button
            variant="contained"
            startIcon={<PersonAddIcon />}
            size="medium"
            onClick={() => setAddMemberOpen(true)}
            sx={{ 
              bgcolor: 'primary.light', // Bright Blue from theme
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.main'
              }
            }}
          >
            Add Member
          </Button>
        </Box>
        
        <Box sx={{ px: 2, pt: 3, pb: 1 }}>
          <Typography variant="subtitle1" fontWeight="600" color="white">
            {groupData.members.length} {groupData.members.length === 1 ? 'Member' : 'Members'}
          </Typography>
        </Box>
        
        <List sx={{ px: 2, pt: 0, mb: 2 }}>
          {groupData.members.map((member) => {
            const isCurrentUserAdmin = user._id === groupData.admin._id;
            const isMemberAdmin = member._id === groupData.admin._id;
            const isCurrentUser = member._id === user._id;
            
            // Determine if this member can be removed
            const canRemove = isCurrentUserAdmin && !isMemberAdmin;
            
            return (
              <ListItem 
                key={member._id}
                sx={{ 
                  borderRadius: 2,
                  mb: 0.5,
                  py: 1,
                  '&:hover': {
                    bgcolor: 'rgba(0, 0, 0, 0.04)',
                  }
                }}
              >
                <ListItemAvatar color='white'>
                  <Avatar 
                    src={member.avatar}
                    sx={{ 
                      width: 40,
                      height: 40
                    }}
                  >
                    {(member.username || 'U').charAt(0).toUpperCase()}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                
                  primary={<Typography component="div" variant="body2" color="white">
                    {member.username || 'Unknown User'}
                  </Typography>}
                  secondary={
                    isMemberAdmin ? (
                      <Typography component="span" variant="body2" color="primary.light">
                        Admin
                      </Typography>
                    ) : null
                  }
                  primaryTypographyProps={{
                    fontWeight: isMemberAdmin ? '600' : 'normal',
                  }}
                />
                {canRemove && (
                  <ListItemSecondaryAction>
                    <IconButton 
                      edge="end" 
                      aria-label="remove" 
                      size="small"
                      onClick={() => handleRemoveMember(member._id)}
                      disabled={loading}
                      sx={{ color: 'text.secondary' }}
                    >
                      <PersonRemoveIcon fontSize="small" />
                    </IconButton>
                  </ListItemSecondaryAction>
                )}
              </ListItem>
            );
          })}
        </List>
      </Drawer>
      
      {/* Add Member Dialog */}
      <Dialog
        open={addMemberOpen}
        onClose={() => !loading && setAddMemberOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          elevation: 3,
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle sx={{ 
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.default' 
        }}>
          <Typography variant="h6" fontWeight="600">Add Members</Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 3, pb: 1 }}>
          <TextField
            fullWidth
            placeholder="Search friends"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            variant="outlined"
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <IconButton
                    onClick={handleClearSearch}
                    edge="end"
                    size="small"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null
            }}
            sx={{ mb: 2 }}
          />
          
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress size={28} color="primary" />
            </Box>
          )}
          
          <Box sx={{ maxHeight: 350, overflow: 'auto' }}>
            <List disablePadding>
              {filteredFriends.length > 0 ? (
                filteredFriends.map((friend) => (
                  <ListItem
                    key={friend._id}
                    button
                    onClick={() => handleAddMember(friend._id)}
                    disabled={loading}
                    sx={{ 
                      py: 1.5,
                      borderRadius: 2,
                      mb: 0.5,
                      '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar 
                        src={friend.avatar} 
                        alt={friend.username || friend.fullName}
                      >
                        {(friend.username || friend.fullName || 'U').charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={friend.username || friend.fullName} 
                      primaryTypographyProps={{ fontWeight: '500' }}
                    />
                    <PersonAddIcon color="primary" fontSize="small" sx={{ ml: 1 }} />
                  </ListItem>
                ))
              ) : (
                <ListItem sx={{ py: 4 }}>
                  <ListItemText 
                    primary={
                      searchTerm 
                        ? "No matching friends found" 
                        : availableFriends.length === 0
                          ? "All your friends are already in this group"
                          : "No friends available to add"
                    } 
                    primaryTypographyProps={{ 
                      align: 'center', 
                      color: 'text.secondary',
                      variant: 'body2'
                    }}
                  />
                </ListItem>
              )}
            </List>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setAddMemberOpen(false)} 
            variant="text"
            disabled={loading}
            sx={{ color: 'text.secondary' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}