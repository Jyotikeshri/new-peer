// src/components/groups/CreateGroupForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Divider,
  Chip,
  Avatar,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Grid,
  IconButton,
  Autocomplete,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import useUserStore from '../../contexts/userStore';
import toast from 'react-hot-toast';

// Common technology/topic options
const TOPIC_OPTIONS = [
  'JavaScript', 'Python', 'React', 'Node.js', 'Angular', 'Vue.js', 
  'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Swift', 'Kotlin', 'Go',
  'Machine Learning', 'Data Science', 'Web Development', 'Mobile Development',
  'DevOps', 'Cloud Computing', 'Blockchain', 'Cybersecurity',
  'UI/UX Design', 'Game Development', 'Database', 'Networking',
  'Algorithms', 'System Design', 'Frontend', 'Backend'
];

// Skill level options
const SKILL_LEVELS = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'all', label: 'All Levels' }
];

// Group type options
const GROUP_TYPES = [
  { value: 'learning', label: 'Learning & Study Group' },
  { value: 'project', label: 'Project Collaboration' },
  { value: 'networking', label: 'Networking & Community' },
  { value: 'general', label: 'General Discussion' }
];

const CreateGroupForm = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [loading, setLoading] = useState(false);
  const [groupData, setGroupData] = useState({
    name: '',
    description: '',
    topics: [],
    isPublic: true,
    skillLevel: 'all',
    groupType: 'general',
    members: [],
    avatar: null,
    coverImage: null
  });
  const [errors, setErrors] = useState({});
  const [newTopic, setNewTopic] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  
  // Handle text input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setGroupData({
      ...groupData,
      [name]: value
    });
    
    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };
  
  // Handle topic addition
  const handleTopicAdd = () => {
    if (newTopic && !groupData.topics.includes(newTopic)) {
      setGroupData({
        ...groupData,
        topics: [...groupData.topics, newTopic]
      });
      setNewTopic('');
    }
  };
  
  // Handle topic removal
  const handleTopicRemove = (topicToRemove) => {
    setGroupData({
      ...groupData,
      topics: groupData.topics.filter(topic => topic !== topicToRemove)
    });
  };
  
  // Handle avatar upload
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupData({
        ...groupData,
        avatar: file
      });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle cover image upload
  const handleCoverUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setGroupData({
        ...groupData,
        coverImage: file
      });
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!groupData.name.trim()) {
      newErrors.name = 'Group name is required';
    } else if (groupData.name.length < 3) {
      newErrors.name = 'Group name must be at least 3 characters';
    }
    
    if (!groupData.description.trim()) {
      newErrors.description = 'Group description is required';
    } else if (groupData.description.length < 20) {
      newErrors.description = 'Description should be at least 20 characters';
    }
    
    if (groupData.topics.length === 0) {
      newErrors.topics = 'Add at least one topic';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }
    
    try {
      setLoading(true);
      
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add text fields
      formData.append('name', groupData.name);
      formData.append('description', groupData.description);
      formData.append('isPublic', groupData.isPublic);
      formData.append('skillLevel', groupData.skillLevel);
      formData.append('groupType', groupData.groupType);
      
      // Add topics as JSON string
      formData.append('topics', JSON.stringify(groupData.topics));
      
      // Include current user as admin
      formData.append('admin', user._id);
      
      // Add members array (empty for now as people will join later)
      formData.append('members', JSON.stringify([user._id]));
      
      // Add files if they exist
      if (groupData.avatar) {
        formData.append('avatar', groupData.avatar);
      }
      
      if (groupData.coverImage) {
        formData.append('coverImage', groupData.coverImage);
      }
      
      // Send request to create group
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/groups`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create group');
      }
      
      const data = await response.json();
      
      toast.success('Group created successfully!');
      
      // Navigate to the new group chat
      navigate(`/chat/${data.channelId}`);
    } catch (error) {
      console.error('Error creating group:', error);
      toast.error(error.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: 'auto', my: 4 }}>
      <Typography variant="h4" fontWeight="bold" sx={{ mb: 4 }}>
        Create a New Group
      </Typography>
      
      {/* Group Cover Image */}
      <Paper 
        sx={{ 
          height: 200, 
          width: '100%', 
          mb: 4, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundImage: coverPreview ? `url(${coverPreview})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {!coverPreview && (
          <Button
            component="label"
            variant="outlined"
            startIcon={<PhotoCameraIcon />}
          >
            Add Cover Image
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleCoverUpload}
            />
          </Button>
        )}
        
        {coverPreview && (
          <IconButton
            sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.4)', color: 'white' }}
            onClick={() => {
              setGroupData({ ...groupData, coverImage: null });
              setCoverPreview(null);
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Paper>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          {/* Group Avatar */}
          <Paper
            sx={{
              width: '100%',
              aspectRatio: '1/1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            {avatarPreview ? (
              <>
                <Avatar
                  src={avatarPreview}
                  sx={{ width: '100%', height: '100%' }}
                />
                <IconButton
                  sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.4)', color: 'white' }}
                  onClick={() => {
                    setGroupData({ ...groupData, avatar: null });
                    setAvatarPreview(null);
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </>
            ) : (
              <Button
                component="label"
                variant="outlined"
                startIcon={<PhotoCameraIcon />}
              >
                Group Avatar
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleAvatarUpload}
                />
              </Button>
            )}
          </Paper>
          
          {/* Group Settings */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Group Type</InputLabel>
            <Select
              name="groupType"
              value={groupData.groupType}
              label="Group Type"
              onChange={handleChange}
            >
              {GROUP_TYPES.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>What is the primary purpose of this group?</FormHelperText>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Skill Level</InputLabel>
            <Select
              name="skillLevel"
              value={groupData.skillLevel}
              label="Skill Level"
              onChange={handleChange}
            >
              {SKILL_LEVELS.map(level => (
                <MenuItem key={level.value} value={level.value}>
                  {level.label}
                </MenuItem>
              ))}
            </Select>
            <FormHelperText>Who is this group best suited for?</FormHelperText>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Visibility</InputLabel>
            <Select
              name="isPublic"
              value={groupData.isPublic}
              label="Visibility"
              onChange={(e) => setGroupData({
                ...groupData,
                isPublic: e.target.value === 'true'
              })}
            >
              <MenuItem value={'true'}>Public (Anyone can find and join)</MenuItem>
              <MenuItem value={'false'}>Private (Invitation only)</MenuItem>
            </Select>
            <FormHelperText>Control who can find and join your group</FormHelperText>
          </FormControl>
        </Grid>
        
        <Grid item xs={12} md={8}>
          {/* Group Details */}
          <TextField
            fullWidth
            label="Group Name"
            name="name"
            value={groupData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name || 'Choose a clear, descriptive name'}
            sx={{ mb: 3 }}
          />
          
          <TextField
            fullWidth
            label="Description"
            name="description"
            multiline
            rows={4}
            value={groupData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description || 'Explain what your group is about'}
            sx={{ mb: 3 }}
          />
          
          {/* Topics/Tags */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="medium" sx={{ mb: 1 }}>
              Topics
            </Typography>
            
            <Box sx={{ display: 'flex', mb: 2 }}>
              <Autocomplete
                freeSolo
                options={TOPIC_OPTIONS}
                value={newTopic}
                inputValue={newTopic}
                onInputChange={(_, value) => setNewTopic(value)}
                sx={{ flexGrow: 1, mr: 1 }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Add topic or technology"
                    error={!!errors.topics}
                    helperText={errors.topics}
                  />
                )}
              />
              <Button
                variant="contained"
                onClick={handleTopicAdd}
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {groupData.topics.map(topic => (
                <Chip
                  key={topic}
                  label={topic}
                  onDelete={() => handleTopicRemove(topic)}
                />
              ))}
            </Box>
          </Box>
          
          <Divider sx={{ my: 4 }} />
          
          {/* Submit Button */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
            >
              {loading ? 'Creating...' : 'Create Group'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CreateGroupForm;