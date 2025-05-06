// src/pages/Groups/GroupsDiscoveryPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  AvatarGroup,
  Chip,
  Divider,
  CircularProgress,
  Tabs,
  Tab,
  Skeleton,
  Badge,
  useTheme,
  alpha,
  Paper,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import FavoriteIcon from '@mui/icons-material/Favorite';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FilterListIcon from '@mui/icons-material/FilterList';
import CreateIcon from '@mui/icons-material/Create';
import useUserStore from '../../contexts/userStore';
import toast from 'react-hot-toast';

// Tab panel component for different group categories
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`group-tabpanel-${index}`}
      aria-labelledby={`group-tab-${index}`}
      {...other}
      style={{ minHeight: '60vh' }}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const GroupsDiscoveryPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState({
    recommended: [],
    trending: [],
    forYou: [],
    withFriends: []
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [joining, setJoining] = useState(null);

  // Fetch groups when component mounts
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        setLoading(true);
        
        // Use the correct discovery endpoint URLs
        // Note the /discovery/ in the path that was missing before
        const recommendedResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/groups/discovery/recommended`, {
          credentials: 'include'
        });
        
        const trendingResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/groups/discovery/trending`, {
          credentials: 'include'
        });
        
        const forYouResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/groups/discovery/for-you`, {
          credentials: 'include'
        });
        
        const withFriendsResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/groups/discovery/with-friends`, {
          credentials: 'include'
        });
        
        // Check responses and display appropriate errors
        if (!recommendedResponse.ok) {
          console.error('Recommended response error:', await recommendedResponse.text());
        }
        if (!trendingResponse.ok) {
          console.error('Trending response error:', await trendingResponse.text());
        }
        if (!forYouResponse.ok) {
          console.error('For You response error:', await forYouResponse.text());
        }
        if (!withFriendsResponse.ok) {
          console.error('With Friends response error:', await withFriendsResponse.text());
        }
        
        if (!recommendedResponse.ok || !trendingResponse.ok || !forYouResponse.ok || !withFriendsResponse.ok) {
          throw new Error('Failed to fetch groups');
        }
        
        const recommendedData = await recommendedResponse.json();
        const trendingData = await trendingResponse.json();
        const forYouData = await forYouResponse.json();
        const withFriendsData = await withFriendsResponse.json();
        
        setGroups({
          recommended: recommendedData,
          trending: trendingData,
          forYou: forYouData,
          withFriends: withFriendsData
        });
      } catch (error) {
        console.error('Error fetching groups:', error);
        toast.error('Failed to load groups. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchGroups();
  }, []);

  // Handle search query changes
  useEffect(() => {
    const searchGroups = async () => {
      if (!searchQuery.trim()) {
        setIsSearching(false);
        setSearchResults([]);
        return;
      }
      
      try {
        setIsSearching(true);
        
        // Updated search endpoint
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/groups/discovery/search?q=${encodeURIComponent(searchQuery)}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Search failed');
        }
        
        const data = await response.json();
        setSearchResults(data);
      } catch (error) {
        console.error('Error searching groups:', error);
        toast.error('Search failed. Please try again.');
      } finally {
        setIsSearching(false);
      }
    };
    
    // Debounce search to avoid too many requests
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        searchGroups();
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle joining a group
  const handleJoinGroup = async (groupId) => {
    try {
      setJoining(groupId);
      
      // Updated join endpoint
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/groups/discovery/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ groupId }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to join group');
      }
      
      const data = await response.json();
      
      toast.success('Successfully joined the group!');
      
      // Navigate to the group chat
      navigate(`/chat/${data.channelId}`);
    } catch (error) {
      console.error('Error joining group:', error);
      toast.error(error.message || 'Failed to join group');
    } finally {
      setJoining(null);
    }
  };

  // Render a group card
  const renderGroupCard = (group) => {
    const hasCommonInterests = user && group.topics && user.interests && 
      group.topics.some(topic => user.interests.includes(topic));
    
    const hasFriends = group.members && group.members.some(member => 
      user.friends && user.friends.includes(member._id));

    return (
      <Card 
        key={group._id} 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-5px)',
            boxShadow: '0 12px 20px rgba(0, 0, 0, 0.1)',
          }
        }}
      >
        <Box 
          sx={{ 
            height: 140, 
            overflow: 'hidden', 
            bgcolor: group.coverImage ? 'transparent' : alpha(theme.palette.primary.main, 0.1),
            backgroundImage: group.coverImage ? `url(${group.coverImage})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          {!group.coverImage && (
            <GroupIcon sx={{ fontSize: 60, color: alpha(theme.palette.primary.main, 0.4) }} />
          )}
        </Box>
        
        <CardContent sx={{ flexGrow: 1, pt: 3, position: 'relative' }}>
          <Avatar
            src={group.avatar}
            sx={{
              width: 64,
              height: 64,
              position: 'absolute',
              top: -32,
              left: 16,
              border: `4px solid ${theme.palette.background.paper}`,
              bgcolor: theme.palette.primary.main
            }}
          >
            {group.name ? group.name[0].toUpperCase() : 'G'}
          </Avatar>
          
          <Box sx={{ pl: '80px', mb: 2, mt: -1 }}>
            <Typography variant="h6" fontWeight="bold" noWrap>
              {group.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {group.members?.length || 0} members
            </Typography>
          </Box>
          
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2, height: 60, overflow: 'hidden' }}>
            {group.description}
          </Typography>
          
          {/* Match indicators */}
          <Box sx={{ mb: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {hasCommonInterests && (
              <Chip 
                icon={<FavoriteIcon fontSize="small" />} 
                label="Matches interests" 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            )}
            {hasFriends && (
              <Chip 
                icon={<PeopleAltIcon fontSize="small" />} 
                label="Friends inside" 
                size="small" 
                color="secondary" 
                variant="outlined"
              />
            )}
            {group.isPopular && (
              <Chip 
                icon={<TrendingUpIcon fontSize="small" />} 
                label="Popular" 
                size="small" 
                color="error" 
                variant="outlined"
              />
            )}
          </Box>
          
          <Divider sx={{ mb: 2 }} />
          
          {/* Topic tags */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {group.topics?.slice(0, 3).map((topic, idx) => (
              <Chip
                key={idx}
                label={topic}
                size="small"
                sx={{ 
                  bgcolor: alpha(theme.palette.primary.main, 0.1), 
                  color: theme.palette.primary.main 
                }}
              />
            ))}
            {group.topics?.length > 3 && (
              <Chip
                label={`+${group.topics.length - 3} more`}
                size="small"
                sx={{ 
                  bgcolor: alpha(theme.palette.grey[500], 0.1), 
                  color: theme.palette.grey[700] 
                }}
              />
            )}
          </Box>
          
          {/* Member preview */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <AvatarGroup max={5} sx={{ '& .MuiAvatar-root': { width: 30, height: 30, fontSize: '0.85rem' } }}>
              {group.members?.slice(0, 5).map((member, idx) => (
                <Avatar 
                  key={idx} 
                  src={member.avatar} 
                  alt={member.username}
                  sx={{ 
                    border: hasFriends && user.friends?.includes(member._id) ? 
                      `2px solid ${theme.palette.secondary.main}` : undefined
                  }}
                >
                  {member.username ? member.username[0].toUpperCase() : 'U'}
                </Avatar>
              ))}
            </AvatarGroup>
          </Box>
        </CardContent>
        
        <CardActions sx={{ p: 2, pt: 0 }}>
          <Button 
            fullWidth 
            variant="contained" 
            startIcon={<PersonAddIcon />}
            onClick={() => handleJoinGroup(group._id)}
            disabled={joining === group._id}
          >
            {joining === group._id ? 'Joining...' : 'Join Group'}
          </Button>
        </CardActions>
      </Card>
    );
  };

  // Render skeleton loaders while fetching data
  const renderSkeletons = (count) => {
    return Array(count).fill(0).map((_, idx) => (
      <Grid item xs={12} sm={6} md={4} key={idx}>
        <Card sx={{ height: '100%' }}>
          <Skeleton variant="rectangular" height={140} />
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="circular" width={40} height={40} sx={{ mr: 2 }} />
              <Box sx={{ width: '70%' }}>
                <Skeleton variant="text" height={24} />
                <Skeleton variant="text" height={20} width="60%" />
              </Box>
            </Box>
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={20} />
            <Skeleton variant="text" height={20} width="80%" />
            <Box sx={{ mt: 2 }}>
              <Skeleton variant="rectangular" height={32} width="30%" sx={{ mr: 1, display: 'inline-block', borderRadius: 16 }} />
              <Skeleton variant="rectangular" height={32} width="40%" sx={{ mr: 1, display: 'inline-block', borderRadius: 16 }} />
            </Box>
          </CardContent>
          <CardActions>
            <Skeleton variant="rectangular" height={36} width="100%" sx={{ borderRadius: 1 }} />
          </CardActions>
        </Card>
      </Grid>
    ));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" fontWeight="bold">
          Discover Groups
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<CreateIcon />}
          onClick={() => navigate('/groups/create')}
        >
          Create Group
        </Button>
      </Box>
      
      {/* Search bar */}
      <Paper 
        elevation={3} 
        sx={{ 
          p: 2, 
          mb: 4, 
          display: 'flex', 
          alignItems: 'center' 
        }}
      >
        <TextField
          fullWidth
          placeholder="Search for groups by name, topic, or technologies..."
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: isSearching ? (
              <InputAdornment position="end">
                <CircularProgress size={20} />
              </InputAdornment>
            ) : null
          }}
          sx={{ mr: 2 }}
        />
        <IconButton color="primary">
          <FilterListIcon />
        </IconButton>
      </Paper>
      
      {/* Search results */}
      {searchQuery.trim() && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Search Results
          </Typography>
          
          {searchResults.length === 0 && !isSearching ? (
            <Paper sx={{ p: 3, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
              <Typography variant="body1">
                No groups found matching "{searchQuery}". Try different keywords or create a new group!
              </Typography>
              <Button 
                variant="outlined" 
                sx={{ mt: 2 }}
                startIcon={<CreateIcon />}
                onClick={() => navigate('/groups/create')}
              >
                Create Group
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {isSearching ? 
                renderSkeletons(6) : 
                searchResults.map(group => (
                  <Grid item xs={12} sm={6} md={4} key={group._id}>
                    {renderGroupCard(group)}
                  </Grid>
                ))
              }
            </Grid>
          )}
        </Box>
      )}
      
      {/* Group tabs */}
      {!searchQuery.trim() && (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="scrollable"
              scrollButtons="auto"
              aria-label="group discovery tabs"
            >
              <Tab 
                icon={<StarIcon />} 
                label="Recommended" 
                id="group-tab-0" 
                aria-controls="group-tabpanel-0" 
              />
              <Tab 
                icon={<TrendingUpIcon />} 
                label="Trending" 
                id="group-tab-1" 
                aria-controls="group-tabpanel-1" 
              />
              <Tab 
                icon={<FavoriteIcon />} 
                label="For You" 
                id="group-tab-2" 
                aria-controls="group-tabpanel-2" 
              />
              <Tab 
                icon={<PeopleAltIcon />} 
                label="With Friends" 
                id="group-tab-3" 
                aria-controls="group-tabpanel-3" 
              />
            </Tabs>
          </Box>
          
          {/* Recommended groups tab */}
          <TabPanel value={tabValue} index={0}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Groups recommended based on your profile, interests, and learning goals.
            </Typography>
            
            <Grid container spacing={3}>
              {loading ? 
                renderSkeletons(6) : 
                groups.recommended.map(group => (
                  <Grid item xs={12} sm={6} md={4} key={group._id}>
                    {renderGroupCard(group)}
                  </Grid>
                ))
              }
              
              {!loading && groups.recommended.length === 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      We need more information about your interests to make better recommendations.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate('/profile')}
                    >
                      Update Your Profile
                    </Button>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </TabPanel>
          
          {/* Trending groups tab */}
          <TabPanel value={tabValue} index={1}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              The most active and fastest-growing groups on the platform.
            </Typography>
            
            <Grid container spacing={3}>
              {loading ? 
                renderSkeletons(6) : 
                groups.trending.map(group => (
                  <Grid item xs={12} sm={6} md={4} key={group._id}>
                    {renderGroupCard(group)}
                  </Grid>
                ))
              }
            </Grid>
          </TabPanel>
          
          {/* For You groups tab */}
          <TabPanel value={tabValue} index={2}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Groups tailored to your learning goals and current projects.
            </Typography>
            
            <Grid container spacing={3}>
              {loading ? 
                renderSkeletons(6) : 
                groups.forYou.map(group => (
                  <Grid item xs={12} sm={6} md={4} key={group._id}>
                    {renderGroupCard(group)}
                  </Grid>
                ))
              }
            </Grid>
          </TabPanel>
          
          {/* With Friends groups tab */}
          <TabPanel value={tabValue} index={3}>
            <Typography variant="body1" sx={{ mb: 3 }}>
              Groups where your friends and connections are already members.
            </Typography>
            
            <Grid container spacing={3}>
              {loading ? 
                renderSkeletons(6) : 
                groups.withFriends.map(group => (
                  <Grid item xs={12} sm={6} md={4} key={group._id}>
                    {renderGroupCard(group)}
                  </Grid>
                ))
              }
              
              {!loading && groups.withFriends.length === 0 && (
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, textAlign: 'center', bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      Connect with other users to see groups they're part of.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate('/matching')}
                    >
                      Find People
                    </Button>
                  </Paper>
                </Grid>
              )}
            </Grid>
          </TabPanel>
        </>
      )}
    </Container>
  );
};

export default GroupsDiscoveryPage;