// src/pages/Profile/components/ProfileEditForm.jsx
import { useState } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
  Avatar, 
  IconButton,
  Chip,
  InputAdornment,
  CircularProgress,
  FormHelperText
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import GitHubIcon from '@mui/icons-material/GitHub';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CodeIcon from '@mui/icons-material/Code';
import LanguageIcon from '@mui/icons-material/Language';
import useUserStore from '../../../contexts/userStore';

const ProfileEditForm = ({ onSubmit, onCancel, isSubmitting }) => {
  // Get user from Zustand store
  const { user, updateAvatar } = useUserStore();

  console.log(user);
  
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    interests: user?.interests || [],
    strengths: user?.strengths || [],
    needsHelpWith: user?.needsHelpWith || [],
    github: user?.github || '',
    linkedin: user?.linkedin || '',
    leetcode: user?.leetcode || '',
    portfolio: user?.portfolio || ''
  });
  
  // Add state for handling avatar file and preview
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  
  const [newInterest, setNewInterest] = useState('');
  const [newStrength, setNewStrength] = useState('');
  const [newNeedHelp, setNewNeedHelp] = useState('');
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    // Check if there are any errors
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Create FormData to handle file upload
    const profileData = new FormData();
    
    // Add the avatar file if it exists
    if (avatarFile) {
      profileData.append('avatar', avatarFile);
    }
    
    // Add the rest of the form fields
    profileData.append('username', formData.username);
    profileData.append('bio', formData.bio);
    
    // Arrays need to be stringified for FormData
    profileData.append('interests', JSON.stringify(formData.interests));
    profileData.append('strengths', JSON.stringify(formData.strengths));
    profileData.append('needsHelpWith', JSON.stringify(formData.needsHelpWith));
    
    // Add social links
    profileData.append('github', formData.github);
    profileData.append('linkedin', formData.linkedin);
    profileData.append('leetcode', formData.leetcode);
    profileData.append('portfolio', formData.portfolio);
    
    // Pass the FormData up to the parent component for submission
    onSubmit(profileData);
  };

  // Handle array fields (interests, strengths, needsHelpWith)
  const handleAddItem = (field, newItem, setter) => {
    if (newItem.trim()) {
      setFormData({
        ...formData,
        [field]: [...formData[field], newItem.trim()]
      });
      setter('');
    }
  };

  const handleRemoveItem = (field, index) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    });
  };
  
  // Updated avatar change handler
  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      // Store the file for later submission
      const file = e.target.files[0];
      setAvatarFile(file);
      
      // Create a preview URL for display
      const reader = new FileReader();
      reader.onload = (event) => {
        const previewUrl = event.target.result;
        setAvatarPreview(previewUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Paper sx={{ p: 3, borderRadius: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Edit Profile</Typography>
        <Box>
          <Button 
            variant="outlined" 
            startIcon={<CancelIcon />} 
            onClick={onCancel}
            sx={{ mr: 1 }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />} 
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Profile Picture */}
          <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Avatar
              src={avatarPreview}
              alt={formData.username}
              sx={{ width: 150, height: 150, mb: 2 }}
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="avatar-upload"
              type="file"
              onChange={handleAvatarChange}
            />
            <label htmlFor="avatar-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<PhotoCameraIcon />}
                size="small"
              >
                Change Photo
              </Button>
            </label>
            {avatarFile && (
              <Typography variant="caption" sx={{ mt: 1 }}>
                {avatarFile.name} ({Math.round(avatarFile.size / 1024)} KB)
              </Typography>
            )}
          </Grid>
          
          {/* Basic Info */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  error={!!errors.username}
                  helperText={errors.username}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  multiline
                  rows={4}
                  placeholder="Tell others about yourself..."
                />
              </Grid>
            </Grid>
          </Grid>
          
          {/* Social Links */}
          <Grid item xs={12}>
            <Typography variant="h6" sx={{ mb: 2 }}>Social Links</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GitHub Profile"
                  name="github"
                  value={formData.github}
                  onChange={handleChange}
                  placeholder="https://github.com/yourusername"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <GitHubIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="LinkedIn Profile"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourusername"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LinkedInIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="LeetCode Profile"
                  name="leetcode"
                  value={formData.leetcode}
                  onChange={handleChange}
                  placeholder="https://leetcode.com/yourusername"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <CodeIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Portfolio Website"
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  placeholder="https://yourportfolio.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LanguageIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Grid>
          
          {/* Interests */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2 }}>Interests</Typography>
            <Box sx={{ display: 'flex', mb: 1 }}>
              <TextField
                fullWidth
                placeholder="Add an interest"
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem('interests', newInterest, setNewInterest);
                  }
                }}
              />
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => handleAddItem('interests', newInterest, setNewInterest)}
                sx={{ ml: 1 }}
              >
                <AddIcon />
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {formData.interests.map((interest, index) => (
                <Chip
                  key={index}
                  label={interest}
                  onDelete={() => handleRemoveItem('interests', index)}
                />
              ))}
            </Box>
          </Grid>
          
          {/* Strengths */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2 }}>Strengths</Typography>
            <Box sx={{ display: 'flex', mb: 1 }}>
              <TextField
                fullWidth
                placeholder="Add a strength"
                value={newStrength}
                onChange={(e) => setNewStrength(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem('strengths', newStrength, setNewStrength);
                  }
                }}
              />
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => handleAddItem('strengths', newStrength, setNewStrength)}
                sx={{ ml: 1 }}
              >
                <AddIcon />
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {formData.strengths.map((strength, index) => (
                <Chip
                  key={index}
                  label={strength}
                  onDelete={() => handleRemoveItem('strengths', index)}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>
          
          {/* Needs Help With */}
          <Grid item xs={12} md={4}>
            <Typography variant="h6" sx={{ mb: 2 }}>Needs Help With</Typography>
            <Box sx={{ display: 'flex', mb: 1 }}>
              <TextField
                fullWidth
                placeholder="Add an area you need help with"
                value={newNeedHelp}
                onChange={(e) => setNewNeedHelp(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddItem('needsHelpWith', newNeedHelp, setNewNeedHelp);
                  }
                }}
              />
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => handleAddItem('needsHelpWith', newNeedHelp, setNewNeedHelp)}
                sx={{ ml: 1 }}
              >
                <AddIcon />
              </Button>
            </Box>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
              {formData.needsHelpWith.map((item, index) => (
                <Chip
                  key={index}
                  label={item}
                  onDelete={() => handleRemoveItem('needsHelpWith', index)}
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Box>
          </Grid>
        </Grid>
      </form>
    </Paper>
  );
};

export default ProfileEditForm;