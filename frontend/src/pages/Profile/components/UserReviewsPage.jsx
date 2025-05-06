import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Card, 
  CardContent, 
  Avatar, 
  Rating, 
  Divider, 
  Button, 
  CircularProgress,
  Grid,
  List,
  ListItem,
  Chip,
  IconButton,
  Pagination,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
// import useUserStore from '../../contexts/userStore';
import useReviewStore from '../../../contexts/reviewStore';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  if (!id) return false;
  return /^[0-9a-fA-F]{24}$/.test(id.toString());
};

// Helper function to filter out ID fields from ratings objects
const filterRatings = (ratings) => {
  if (!ratings) return {};
  
  const filteredRatings = {...ratings};
  
  // Remove any ID fields from the ratings object
  if (filteredRatings._id) delete filteredRatings._id;
  if (filteredRatings.id) delete filteredRatings.id;
  
  return filteredRatings;
};

const UserReviewsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { fetchUserReviews, isLoading, error } = useReviewStore();
  
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userLoading, setUserLoading] = useState(true);
  const [userError, setUserError] = useState(null);
  const [page, setPage] = useState(1);
  const reviewsPerPage = 5;
  
  // Validate userId on component mount
  useEffect(() => {
    if (!userId || !isValidObjectId(userId)) {
      setUserError('Invalid user ID format');
      setUserLoading(false);
    }
  }, [userId]);

  // Fetch user details
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!userId || !isValidObjectId(userId)) {
        return; // Skip if invalid ID
      }

      try {
        setUserLoading(true);
        setUserError(null);

        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/${userId}`,
          { credentials: 'include' }
        );
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('User not found');
          } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch user');
          }
        }
        
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Error fetching user:', error);
        setUserError(error.message || 'Error loading user data');
      } finally {
        setUserLoading(false);
      }
    };
    
    if (userId) {
      fetchUserDetails();
    }
  }, [userId]);
  
  // Fetch reviews for the user
  useEffect(() => {
    const getReviews = async () => {
      if (userId && isValidObjectId(userId) && !userError) {
        try {
          const reviewsData = await fetchUserReviews(userId);
          
          // Process reviews to remove ID fields
          if (reviewsData && reviewsData.length > 0) {
            const processedReviews = reviewsData.map(review => {
              // Create a new object without the _id field
              const { _id, id, ...reviewWithoutId } = review;
              
              // Filter ratings to remove any ID fields
              if (reviewWithoutId.ratings) {
                reviewWithoutId.ratings = filterRatings(reviewWithoutId.ratings);
              }
              
              return reviewWithoutId;
            });
            
            setReviews(processedReviews);
          } else {
            setReviews([]);
          }
        } catch (err) {
          console.error('Error in component getting reviews:', err);
          setReviews([]);
        }
      }
    };
    
    getReviews();
  }, [userId, fetchUserReviews, userError]);
  
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  
  const handleGoBack = () => {
    navigate(-1);
  };
  
  // Calculate pagination
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const currentReviews = reviews.slice(
    (page - 1) * reviewsPerPage,
    page * reviewsPerPage
  );
  
  // Calculate average ratings per category
  const calcCategoryAverages = () => {
    if (!reviews || reviews.length === 0) return {};
    
    const totals = reviews.reduce((acc, review) => {
      if (review.ratings) {
        // Only process non-ID fields
        Object.entries(review.ratings).forEach(([key, value]) => {
          // Skip any ID fields
          if (key === '_id' || key === 'id') return;
          
          if (!acc[key]) acc[key] = 0;
          acc[key] += value;
        });
      }
      return acc;
    }, {});
    
    const averages = {};
    Object.entries(totals).forEach(([key, value]) => {
      // Skip any ID fields
      if (key !== '_id' && key !== 'id') {
        averages[key] = value / reviews.length;
      }
    });
    
    return averages;
  };
  
  const categoryAverages = calcCategoryAverages();
  
  // Display loading state
  if (userLoading || isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Display error state
  if (userError || error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{userError || error}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack} 
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }
  
  // Display when user not found
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="warning">User not found</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack} 
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack} 
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        
        <Card sx={{ mb: 4, borderRadius: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar 
                src={user.avatar} 
                alt={user.username}
                sx={{ width: 80, height: 80, mr: 2 }}
              />
              <Box>
                <Typography variant="h5" fontWeight={600}>
                  {user.username}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Member since {new Date(user.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Typography variant="h6" sx={{ mb: 2 }}>
              Reviews & Ratings
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Overall Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Rating 
                      value={user.rating || 0} 
                      precision={0.5} 
                      readOnly 
                      size="large"
                    />
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {user.rating ? user.rating.toFixed(1) : '0'}/5
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Based on {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                  Category Ratings
                </Typography>
                <Box>
                  {Object.entries(categoryAverages).map(([category, average]) => (
                    // Only render if it's not an ID field
                    category !== '_id' && category !== 'id' && (
                      <Box key={category} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2" sx={{ width: 120, textTransform: 'capitalize' }}>
                          {category}:
                        </Typography>
                        <Rating 
                          value={average} 
                          precision={0.5} 
                          readOnly 
                          size="small"
                        />
                        <Typography variant="body2" sx={{ ml: 1 }}>
                          {average.toFixed(1)}
                        </Typography>
                      </Box>
                    )
                  ))}
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        <Typography variant="h6" sx={{ mb: 2 }}>
          {reviews.length} {reviews.length === 1 ? 'Review' : 'Reviews'}
        </Typography>
        
        {reviews.length === 0 ? (
          <Card sx={{ borderRadius: 2, p: 4, textAlign: 'center' }}>
            <AccountCircleIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No reviews yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              This user hasn't received any reviews yet
            </Typography>
          </Card>
        ) : (
          <>
            <List sx={{ mb: 3 }}>
              {currentReviews.map((review, index) => (
                <ListItem key={`review-${index}`} disablePadding sx={{ mb: 2 }}>
                  <Card sx={{ width: '100%', borderRadius: 2 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <Avatar 
                          src={review.reviewer?.avatar} 
                          alt={review.reviewer?.username}
                          sx={{ mr: 2 }}
                        />
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1">
                            {review.reviewer?.username || 'Anonymous'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Rating 
                              value={review.ratings?.skill || 0} // Using skill rating as primary
                              readOnly 
                              size="small" 
                              sx={{ mr: 1 }} 
                            />
                            <Typography variant="body2" color="text.secondary">
                              {new Date(review.createdAt || review.date || Date.now()).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      
                      <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
                        <Box sx={{ display: 'flex' }}>
                          <FormatQuoteIcon sx={{ transform: 'rotate(180deg)', opacity: 0.3, mr: 1, alignSelf: 'flex-start' }} />
                          <Typography variant="body1">
                            {review.text || "No written review provided."}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {review.ratings && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {Object.entries(review.ratings).map(([category, rating]) => (
                            // Only render if it's not an ID field
                            category !== '_id' && category !== 'id' && (
                              <Chip 
                                key={`${category}-${index}`}
                                label={`${category.charAt(0).toUpperCase() + category.slice(1)}: ${rating}/5`}
                                size="small"
                                variant="outlined"
                              />
                            )
                          ))}
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                </ListItem>
              ))}
            </List>
            
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination 
                  count={totalPages} 
                  page={page} 
                  onChange={handleChangePage} 
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default UserReviewsPage;