// src/pages/Profile/Profile.jsx
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useChatContext } from 'stream-chat-react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Button,
  Chip,
  Divider,
  IconButton,
  Link,
  Rating,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Snackbar,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CodeIcon from '@mui/icons-material/Code';
import LanguageIcon from '@mui/icons-material/Language';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ReviewsIcon from '@mui/icons-material/Reviews';
import Sidebar from '../Dashboard/components/Sidebar';

import ProfileEditForm from './components/ProfileEditForm';
import BadgesList from './components/BadgesList';
import FriendsList from './components/FriendsList';
import ReviewsList from './components/ReviewsList';

// import FriendRequestButton from './components/FriendRequestButton';
import useUserStore from '../../contexts/userStore';
import Header from '../Dashboard/components/Header';
import GroupList from './components/GroupsList';
import { StreamChat } from 'stream-chat';
import { fetchWithAuth } from '../../utils/apiClient';

const Profile = () => {
  
  const { id } = useParams(); // Get profile ID from URL params
  const { user, isLoading, error, fetchUser, updateProfile } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
  const [profileLoading, setProfileLoading] = useState(true);

  // console.log(user);

  // Check if viewing own profile
  const isOwnProfile = !id || (user && user._id === id);

  useEffect(() => {
    const loadProfile = async () => {
      setProfileLoading(true);
      if (isOwnProfile) {
        if (!user) await fetchUser();
        setProfileUser(user);
        setProfileLoading(false);
        return;
      }
      try {
        const response = await fetchWithAuth(
          `${import.meta.env.VITE_API_BASE_URL || 'https://new-peer-1.onrender.com/api'}/users/${id}`,
          { credentials: 'include' }
        );
        if (!response.ok) throw new Error('Failed to fetch user profile');
        const userData = await response.json();
        setProfileUser(userData);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setNotification({ open: true, message: 'Failed to load user profile', type: 'error' });
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, [id, user, isOwnProfile, fetchUser]);

  useEffect(() => {
    if (error) {
      setNotification({ open: true, message: `Error: ${error}`, type: 'error' });
    }
  }, [error]);

  const handleTabChange = (event, newValue) => setTabValue(newValue);
  const handleEditToggle = () => setIsEditing(!isEditing);

  const handleFormUpdate = async (updatedData) => {
    setIsSubmitting(true);
    try {
      const updatedUser = await updateProfile(updatedData);
      if (updatedUser) {
        setIsEditing(false);
        setProfileUser(updatedUser);
        setNotification({ open: true, message: 'Profile updated successfully', type: 'success' });
      } else throw new Error('Failed to update profile');
    } catch (err) {
      console.error('Error updating profile:', err);
      setNotification({ open: true, message: 'Failed to update profile', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseNotification = () => setNotification({ ...notification, open: false });

  if (isLoading || profileLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!profileUser) {
    return (
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
          <Header />
          <Container maxWidth="xl" sx={{ py: 3 }}>
            <Alert severity="error">User profile not found</Alert>
          </Container>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <Header />
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {isEditing ? (
            <ProfileEditForm
              user={profileUser}
              onSubmit={handleFormUpdate}
              onCancel={handleEditToggle}
              isSubmitting={isSubmitting}
            />
          ) : (
            <>
             
<Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
  <Grid container spacing={3}>
    {/* Left side - Avatar and actions */}
    <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Avatar
        src={profileUser?.avatar || '/default-avatar.png'}
        alt={profileUser?.username || 'User'}
        sx={{ width: 150, height: 150, mb: 2, border: '3px solid #3f51b5' }}
      />
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', textAlign: 'center' }}>
        {profileUser?.name || profileUser?.username || 'User Name'}
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        @{profileUser?.username || 'username'}
      </Typography>
      
      {isOwnProfile ? (
        <Button
          variant="outlined"
          startIcon={<EditIcon />}
          onClick={handleEditToggle}
          size="small"
          sx={{ mt: 1 }}
        >
          Edit Profile
        </Button>
      ) : (
        <Button
          variant="contained"
          color="primary"
          size="small"
          sx={{ mt: 1 }}
        >
          Add Friend
        </Button>
      )}
    </Grid>

    {/* Right side - Bio and other details */}
    <Grid item xs={12} md={9}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>About Me</Typography>
        <Typography variant="body1" paragraph sx={{ color: 'text.secondary' }}>
          {profileUser?.bio || 'No bio provided yet.'}
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {/* Interests */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Interests</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {profileUser?.interests?.length > 0 ? (
              profileUser.interests.map((interest, index) => (
                <Chip key={index} label={interest} size="small" sx={{ mb: 0.5 }} />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">None specified</Typography>
            )}
          </Box>
        </Grid>

        {/* Strengths */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Strengths</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {profileUser?.strengths?.length > 0 ? (
              profileUser.strengths.map((strength, index) => (
                <Chip 
                  key={index} 
                  label={strength} 
                  size="small" 
                  color="primary" 
                  variant="outlined" 
                  sx={{ mb: 0.5 }} 
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">None specified</Typography>
            )}
          </Box>
        </Grid>

        {/* Needs Help With */}
        <Grid item xs={12} md={4}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Needs Help With</Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {profileUser?.needsHelpWith?.length > 0 ? (
              profileUser.needsHelpWith.map((item, index) => (
                <Chip 
                  key={index} 
                  label={item} 
                  size="small" 
                  color="secondary" 
                  variant="outlined" 
                  sx={{ mb: 0.5 }} 
                />
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">None specified</Typography>
            )}
          </Box>
        </Grid>
      </Grid>

      <Divider sx={{ my: 2 }} />

      {/* Social Links */}
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>Social Links</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {profileUser?.github && (
            <Button 
              startIcon={<GitHubIcon />} 
              variant="outlined" 
              size="small"
              component="a" 
              href={profileUser.github} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              GitHub
            </Button>
          )}
          {profileUser?.linkedin && (
            <Button 
              startIcon={<LinkedInIcon />} 
              variant="outlined" 
              size="small"
              component="a" 
              href={profileUser.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              LinkedIn
            </Button>
          )}
          {profileUser?.leetcode && (
            <Button 
              startIcon={<CodeIcon />} 
              variant="outlined" 
              size="small"
              component="a" 
              href={profileUser.leetcode} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              LeetCode
            </Button>
          )}
          {profileUser?.portfolio && (
            <Button 
              startIcon={<LanguageIcon />} 
              variant="outlined" 
              size="small"
              component="a" 
              href={profileUser.portfolio} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              Portfolio
            </Button>
          )}
          {!profileUser?.github && !profileUser?.linkedin && !profileUser?.leetcode && !profileUser?.portfolio && (
            <Typography variant="body2" color="text.secondary">No social links provided</Typography>
          )}
        </Box>
      </Box>

      {/* Join Date */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Typography variant="caption" color="text.secondary">
          Member since: {profileUser?.createdAt
            ? new Date(profileUser.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })
            : 'Unknown'}
        </Typography>
      </Box>
    </Grid>
  </Grid>
</Paper>

              <Paper sx={{ borderRadius: 2 }}>
                <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth" sx={{ borderBottom: 1, borderColor: 'divider' }}>
                  <Tab icon={<EmojiEventsIcon />} label="Badges" iconPosition="start" />
                  <Tab icon={<GroupIcon />} label="Friends" iconPosition="start" />
                  <Tab icon={<ReviewsIcon />} label="Reviews" iconPosition="start" />
                  <Tab icon={<GroupIcon />} label="Groups" iconPosition="start" />
                </Tabs>
                <Box sx={{ p: 3 }}>
                  {tabValue === 0 && <BadgesList badges={profileUser?.badges || []} />}
                  {tabValue === 1 && <FriendsList friends={profileUser?.friends || []} />}
                  {tabValue === 2 && <ReviewsList reviews={profileUser?.reviews || []} />}
                  {tabValue === 3 && (
                    <GroupList
                      
                      userGroups={profileUser?.groups || []}
                    />
                  )}
                </Box>
              </Paper>
            </>
          )}
        </Container>
      </Box>
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseNotification} severity={notification.type} variant="filled" sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
