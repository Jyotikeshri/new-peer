// src/pages/UserReviews/UserReviewsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Divider,
  Grid,
  Avatar,
  Card,
  CardContent,
  Rating,
  CircularProgress,
  Chip,
  Button,
  Breadcrumbs,
  Paper,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import StarIcon from '@mui/icons-material/Star';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import useReviewStore from '../contexts/reviewStore';
import useUserStore from '../contexts/userStore';

const StyledRatingBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(1),
  '& .MuiRating-root': {
    marginRight: theme.spacing(1),
  },
}));

const CategoryRating = ({ label, value }) => (
  <StyledRatingBox>
    <Typography variant="body2" sx={{ width: 120 }}>
      {label}:
    </Typography>
    <Rating
      value={value || 0}
      precision={0.5}
      readOnly
      size="small"
      emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
    />
    <Typography variant="body2" sx={{ ml: 1 }}>
      {value ? value.toFixed(1) : 'N/A'}
    </Typography>
  </StyledRatingBox>
);

const UserReviewsPage = () => {
  const { userId } = useParams();
  const { fetchUserReviews, isLoading } = useReviewStore();
  const { fetchUser } = useUserStore();
  
  const [userData, setUserData] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRatings, setAverageRatings] = useState({
    overall: 0,
    collaboration: 0,
    skill: 0,
    communication: 0,
    teamwork: 0,
    punctuality: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch the user data
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/${userId}`,
          { credentials: 'include' }
        );
        
        if (response.ok) {
          const user = await response.json();
          setUserData(user);
        }
        
        // Fetch the user's reviews
        const reviewsData = await fetchUserReviews(userId);
        if (reviewsData && reviewsData.length > 0) {
          setReviews(reviewsData);
          calculateAverageRatings(reviewsData);
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };
    
    if (userId) {
      loadData();
    }
  }, [userId, fetchUserReviews, fetchUser]);

  const calculateAverageRatings = (reviewsData) => {
    if (!reviewsData || reviewsData.length === 0) {
      return;
    }
    
    const totals = {
      collaboration: 0,
      skill: 0,
      communication: 0,
      teamwork: 0,
      punctuality: 0,
      count: {
        collaboration: 0,
        skill: 0,
        communication: 0,
        teamwork: 0,
        punctuality: 0,
      }
    };
    
    reviewsData.forEach(review => {
      if (review.ratings) {
        Object.keys(totals.count).forEach(category => {
          if (review.ratings[category]) {
            totals[category] += review.ratings[category];
            totals.count[category]++;
          }
        });
      }
    });
    
    const averages = {
      collaboration: totals.count.collaboration > 0 ? totals.collaboration / totals.count.collaboration : 0,
      skill: totals.count.skill > 0 ? totals.skill / totals.count.skill : 0,
      communication: totals.count.communication > 0 ? totals.communication / totals.count.communication : 0,
      teamwork: totals.count.teamwork > 0 ? totals.teamwork / totals.count.teamwork : 0,
      punctuality: totals.count.punctuality > 0 ? totals.punctuality / totals.count.punctuality : 0,
    };
    
    // Calculate overall average from the category averages
    const nonZeroCategories = Object.values(averages).filter(val => val > 0);
    const overall = nonZeroCategories.length > 0
      ? nonZeroCategories.reduce((acc, val) => acc + val, 0) / nonZeroCategories.length
      : 0;
    
    setAverageRatings({
      ...averages,
      overall,
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
            Home
          </Link>
          <Link to="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
            Profile
          </Link>
          <Typography color="text.primary">Reviews</Typography>
        </Breadcrumbs>
        
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton component={Link} to="/profile" sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Reviews for {userData?.username || 'User'}
          </Typography>
        </Box>
      </Box>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3, borderRadius: 2, position: 'sticky', top: 20 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Avatar
                src={userData?.avatar}
                alt={userData?.username}
                sx={{ width: 80, height: 80, mr: 2 }}
              />
              <Box>
                <Typography variant="h6">
                  {userData?.username || 'User'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Rating 
                    value={averageRatings.overall} 
                    precision={0.5} 
                    readOnly 
                    size="small" 
                    sx={{ mr: 1 }}
                  />
                  <Typography variant="body2">
                    {averageRatings.overall.toFixed(1)}/5
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ my: 2 }} />
            
            <Typography variant="subtitle1" gutterBottom>
              Rating Breakdown
            </Typography>
            
            <CategoryRating label="Collaboration" value={averageRatings.collaboration} />
            <CategoryRating label="Technical Skills" value={averageRatings.skill} />
            <CategoryRating label="Communication" value={averageRatings.communication} />
            <CategoryRating label="Teamwork" value={averageRatings.teamwork} />
            <CategoryRating label="Punctuality" value={averageRatings.punctuality} />
            
            <Divider sx={{ my: 2 }} />
            
            {userData?.strengths && userData.strengths.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Strengths
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {userData.strengths.map((strength, index) => (
                    <Chip 
                      key={index} 
                      label={strength} 
                      size="small" 
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}
            
            <Button 
              component={Link} 
              to={`/profile/${userId}`} 
              variant="outlined" 
              fullWidth 
              sx={{ mt: 2 }}
            >
              View Full Profile
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={8}>
          {reviews.length === 0 ? (
            <Paper elevation={2} sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
              <Typography variant="h6" color="text.secondary">
                No reviews yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                This user hasn't received any reviews yet.
              </Typography>
            </Paper>
          ) : (
            reviews.map((review, index) => (
              <Card 
                key={review._id || index} 
                elevation={2} 
                sx={{ mb: 3, borderRadius: 2 }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
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
                          value={review.ratings.overall || 
                            ((review.ratings.collaboration + review.ratings.skill) / 2)} 
                          readOnly 
                          size="small" 
                          sx={{ mr: 1 }} 
                        />
                        <Typography variant="body2" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Grid container spacing={1}>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            Collaboration:
                          </Typography>
                          <Rating value={review.ratings.collaboration} readOnly size="small" />
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                            Technical:
                          </Typography>
                          <Rating value={review.ratings.skill} readOnly size="small" />
                        </Box>
                      </Grid>
                      {review.ratings.communication > 0 && (
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                              Communication:
                            </Typography>
                            <Rating value={review.ratings.communication} readOnly size="small" />
                          </Box>
                        </Grid>
                      )}
                      {review.ratings.teamwork > 0 && (
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                              Teamwork:
                            </Typography>
                            <Rating value={review.ratings.teamwork} readOnly size="small" />
                          </Box>
                        </Grid>
                      )}
                      {review.ratings.punctuality > 0 && (
                        <Grid item xs={6}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                              Punctuality:
                            </Typography>
                            <Rating value={review.ratings.punctuality} readOnly size="small" />
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                  
                  {review.text && (
                    <Box sx={{ mt: 2, display: 'flex' }}>
                      <FormatQuoteIcon sx={{ transform: 'rotate(180deg)', opacity: 0.3, mr: 1 }} />
                      <Typography variant="body1">
                        {review.text}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserReviewsPage;