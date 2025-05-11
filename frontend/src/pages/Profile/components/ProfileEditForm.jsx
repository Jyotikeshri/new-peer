// src/pages/Profile/components/ProfileEditForm.jsx
import { useState, useEffect } from 'react';
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
  FormHelperText,
  Alert,
  Snackbar,
  LinearProgress
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

// Maximum file size in bytes (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Allowed file types
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg'];

const ProfileEditForm = ({ onSubmit, onCancel, isSubmitting }) => {
  // Get user from Zustand store
  const { user, updateAvatar } = useUserStore();
  
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
  const [fileError, setFileError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  
  const [newInterest, setNewInterest] = useState('');
  const [newStrength, setNewStrength] = useState('');
  const [newNeedHelp, setNewNeedHelp] = useState('');
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // Clean up object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Only revoke if it's an object URL (not a Cloudinary URL)
      if (avatarPreview && avatarPreview.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

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

  // Handle avatar change with validation and optimization
  const handleAvatarChange = async (e) => {
    setFileError('');
    if (!e.target.files || !e.target.files[0]) return;
    
    const file = e.target.files[0];
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError(`File is too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }
    
    // Show preview using createObjectURL instead of FileReader for performance
    const objectUrl = URL.createObjectURL(file);
    
    // If there was a previous blob URL, revoke it to prevent memory leaks
    if (avatarPreview && avatarPreview.startsWith('blob:')) {
      URL.revokeObjectURL(avatarPreview);
    }
    
    setAvatarPreview(objectUrl);
    
    try {
      // Resize image before uploading if it's large
      if (file.size > 1024 * 1024) { // If larger than 1MB
        setSnackbar({
          open: true,
          message: 'Optimizing image for upload...',
          severity: 'info'
        });
        
        const optimizedFile = await resizeImage(file, 800, 800);
        setAvatarFile(optimizedFile);
        
        setSnackbar({
          open: true,
          message: `Image optimized: ${(file.size / (1024 * 1024)).toFixed(2)}MB → ${(optimizedFile.size / (1024 * 1024)).toFixed(2)}MB`,
          severity: 'success'
        });
      } else {
        setAvatarFile(file);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      setAvatarFile(file); // Fall back to original file if optimization fails
    }
  };

  // Resize image to reduce size
  const resizeImage = (file, maxWidth, maxHeight) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          // Calculate dimensions while maintaining aspect ratio
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }
          
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with quality adjustment for JPEG
          canvas.toBlob((blob) => {
            resolve(new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            }));
          }, file.type, 0.85); // 85% quality
        };
        img.onerror = reject;
        img.src = event.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Form validation
    const newErrors = {};
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    // Check for URL format in social links
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    
    if (formData.github && !urlRegex.test(formData.github)) {
      newErrors.github = 'Please enter a valid URL';
    }
    if (formData.linkedin && !urlRegex.test(formData.linkedin)) {
      newErrors.linkedin = 'Please enter a valid URL';
    }
    if (formData.leetcode && !urlRegex.test(formData.leetcode)) {
      newErrors.leetcode = 'Please enter a valid URL';
    }
    if (formData.portfolio && !urlRegex.test(formData.portfolio)) {
      newErrors.portfolio = 'Please enter a valid URL';
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
    
    try {
      // Start progress indicator for visual feedback
      setShowProgress(true);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      // Pass the FormData up to the parent component for submission
      await onSubmit(profileData);
      
      // Finalize progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => {
        setShowProgress(false);
        setUploadProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setSnackbar({
        open: true,
        message: 'Error updating profile. Please try again.',
        severity: 'error'
      });
    }
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
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
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
            disabled={isSubmitting || !!fileError}
          >
            Save Changes
          </Button>
        </Box>
      </Box>
      
      {showProgress && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress variant="determinate" value={uploadProgress} />
        </Box>
      )}
      
      {/* Error Messages */}
      {fileError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {fileError}
        </Alert>
      )}
      
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
              accept="image/png, image/jpeg, image/gif"
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
            <FormHelperText>
              Max size: 5MB. Formats: JPG, PNG, GIF
            </FormHelperText>
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
                  error={!!errors.github}
                  helperText={errors.github}
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
                  error={!!errors.linkedin}
                  helperText={errors.linkedin}
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
                  error={!!errors.leetcode}
                  helperText={errors.leetcode}
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
                  error={!!errors.portfolio}
                  helperText={errors.portfolio}
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
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default ProfileEditForm;