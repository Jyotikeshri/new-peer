import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Paper,
  Avatar,
  Rating,
  Divider,
  List,
  ListItem,
  Card,
  CardContent,
  Button,
  Pagination,
  Alert
} from '@mui/material';
import ReviewsIcon from '@mui/icons-material/Reviews';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import useReviewStore from '../../../contexts/reviewStore';

// Helper function to filter out ID fields from ratings objects
const filterRatings = (ratings) => {
  if (!ratings) return {};
  
  const filteredRatings = {...ratings};
  
  // Remove any ID fields from the ratings object
  if (filteredRatings._id) delete filteredRatings._id;
  if (filteredRatings.id) delete filteredRatings.id;
  
  return filteredRatings;
};

const ReviewsList = ({ userId, limit = 3 }) => {
  const { fetchMyReviews, fetchUserReviews, isLoading, error } = useReviewStore();
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const reviewsPerPage = limit;

  useEffect(() => {
    const loadReviews = async () => {
      try {
        let reviewsData;
        
        // If userId is provided, fetch reviews for that user
        // Otherwise, fetch the current user's reviews
        if (userId) {
          reviewsData = await fetchUserReviews(userId);
        } else {
          reviewsData = await fetchMyReviews();
        }
        
        if (reviewsData && reviewsData.length > 0) {
          // Process reviews to remove _id fields
          const processedReviews = reviewsData.map(review => {
            // Remove _id field if it exists
            const { _id, id, ...reviewWithoutId } = review;
            
            // Also filter ratings to remove _id
            if (reviewWithoutId.ratings) {
              reviewWithoutId.ratings = filterRatings(reviewWithoutId.ratings);
            }
            
            return reviewWithoutId;
          });
          
          setReviews(processedReviews);
        } else {
          setReviews([]);
        }
      } catch (error) {
        console.error('Error loading reviews:', error);
      }
    };
    
    loadReviews();
  }, [userId, fetchMyReviews, fetchUserReviews]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <ReviewsIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          No reviews yet
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Reviews from your peers will appear here
        </Typography>
      </Box>
    );
  }

  // Calculate pagination
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const currentReviews = reviews.slice(
    (page - 1) * reviewsPerPage,
    page * reviewsPerPage
  );

  return (
    <Box>
      <List sx={{ width: '100%' }}>
        {currentReviews.map((review, index) => (
          <ListItem key={`review-${index}`} sx={{ px: 0, py: 2, display: 'block' }}>
            <Card elevation={0} sx={{ bgcolor: 'background.default', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
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
                        value={
                          // Use the skill rating as main display
                          review.ratings?.skill || 
                          // Or calculate an average if skill is not available
                          (review.ratings ? 
                            Object.values(review.ratings).reduce((a, b) => 
                              typeof a === 'number' && typeof b === 'number' ? a + b : 0, 0) / 
                            Object.values(review.ratings).filter(val => typeof val === 'number').length : 
                            0)
                        } 
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
                
                <Box sx={{ display: 'flex' }}>
                  <FormatQuoteIcon sx={{ transform: 'rotate(180deg)', opacity: 0.3, mr: 1, alignSelf: 'flex-start' }} />
                  <Typography variant="body1">
                    {review.text || "No written review provided."}
                  </Typography>
                </Box>
                
                {review.ratings && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                    {Object.entries(review.ratings).map(([category, rating]) => (
                      // Only render if it's not an ID field and it's a number
                      category !== '_id' && category !== 'id' && typeof rating === 'number' && (
                        <Typography 
                          key={`${category}-${index}`} 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            mr: 2,
                            textTransform: 'capitalize' 
                          }}
                        >
                          {`${category}: ${rating}/5`}
                        </Typography>
                      )
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
            {index < currentReviews.length - 1 && <Divider />}
          </ListItem>
        ))}
      </List>
      
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination 
            count={totalPages} 
            page={page} 
            onChange={handleChangePage} 
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
};

export default ReviewsList;