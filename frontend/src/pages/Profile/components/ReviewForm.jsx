// src/pages/Profile/components/ReviewForm.jsx
import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Rating, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText,
  CircularProgress,
  Grid,
  Alert
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import useUserStore from "../../../contexts/userStore";
import useReviewStore from "../../../contexts/reviewStore";

const labels = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good', 
  4: 'Very Good',
  5: 'Excellent',
};

const ReviewForm = ({ open, onClose, reviewee }) => {
  const { user } = useUserStore();
  const { submitReview, isSubmitting, error, resetError } = useReviewStore();
  
  const [formState, setFormState] = useState({
    collaboration: 0,
    skill: 0,
    communication: 0,
    teamwork: 0,
    punctuality: 0,
  });
  
  const [review, setReview] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [success, setSuccess] = useState(false);
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setFormState({
        collaboration: 0,
        skill: 0,
        communication: 0,
        teamwork: 0,
        punctuality: 0,
      });
      setReview('');
      setFormErrors({});
      setSuccess(false);
      resetError();
    }
  }, [open, resetError]);

  const handleRatingChange = (category, value) => {
    setFormState(prev => ({
      ...prev,
      [category]: value,
    }));
    
    // Clear error for this field if it exists
    if (formErrors[category]) {
      setFormErrors(prev => ({
        ...prev,
        [category]: null,
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    // Check if required ratings are provided
    ["collaboration", "skill"].forEach(field => {
      if (!formState[field]) {
        errors[field] = "This rating is required";
        isValid = false;
      }
    });
    
    setFormErrors(errors);
    return isValid;
  };

  // console.log(reviewee);

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      await submitReview({
        revieweeId: reviewee.id,
        ratings: formState,
        text: review,
      });
      
      setSuccess(true);
      
      // Close the dialog after a short delay
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error("Error submitting review:", err);
    }
  };
  
  const getLabelText = (value) => {
    return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="md"
    >
      <DialogTitle>
        Review {reviewee?.username || 'Peer'}
      </DialogTitle>
      <DialogContent dividers>
        {success ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Your review has been submitted successfully!
          </Alert>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}
        
        <Typography variant="subtitle2" gutterBottom>
          Share your experience working with this peer
        </Typography>
        
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {/* Rating Categories */}
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography component="legend" variant="subtitle2" sx={{ mb: 0.5 }}>
                Collaboration Skills*
              </Typography>
              <Rating
                name="collaboration"
                value={formState.collaboration}
                onChange={(event, newValue) => {
                  handleRatingChange('collaboration', newValue);
                }}
                precision={1}
                getLabelText={getLabelText}
                icon={<StarIcon fontSize="inherit" />}
              />
              {formErrors.collaboration && (
                <FormHelperText error>{formErrors.collaboration}</FormHelperText>
              )}
              <Typography variant="body2" color="text.secondary">
                {formState.collaboration > 0 ? labels[formState.collaboration] : 'Not rated'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography component="legend" variant="subtitle2" sx={{ mb: 0.5 }}>
                Technical Skills*
              </Typography>
              <Rating
                name="skill"
                value={formState.skill}
                onChange={(event, newValue) => {
                  handleRatingChange('skill', newValue);
                }}
                precision={1}
                getLabelText={getLabelText}
                icon={<StarIcon fontSize="inherit" />}
              />
              {formErrors.skill && (
                <FormHelperText error>{formErrors.skill}</FormHelperText>
              )}
              <Typography variant="body2" color="text.secondary">
                {formState.skill > 0 ? labels[formState.skill] : 'Not rated'}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box sx={{ mb: 3 }}>
              <Typography component="legend" variant="subtitle2" sx={{ mb: 0.5 }}>
                Communication
              </Typography>
              <Rating
                name="communication"
                value={formState.communication}
                onChange={(event, newValue) => {
                  handleRatingChange('communication', newValue);
                }}
                precision={1}
                getLabelText={getLabelText}
                icon={<StarIcon fontSize="inherit" />}
              />
              <Typography variant="body2" color="text.secondary">
                {formState.communication > 0 ? labels[formState.communication] : 'Not rated'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography component="legend" variant="subtitle2" sx={{ mb: 0.5 }}>
                Teamwork
              </Typography>
              <Rating
                name="teamwork"
                value={formState.teamwork}
                onChange={(event, newValue) => {
                  handleRatingChange('teamwork', newValue);
                }}
                precision={1}
                getLabelText={getLabelText}
                icon={<StarIcon fontSize="inherit" />}
              />
              <Typography variant="body2" color="text.secondary">
                {formState.teamwork > 0 ? labels[formState.teamwork] : 'Not rated'}
              </Typography>
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography component="legend" variant="subtitle2" sx={{ mb: 0.5 }}>
                Punctuality
              </Typography>
              <Rating
                name="punctuality"
                value={formState.punctuality}
                onChange={(event, newValue) => {
                  handleRatingChange('punctuality', newValue);
                }}
                precision={1}
                getLabelText={getLabelText}
                icon={<StarIcon fontSize="inherit" />}
              />
              <Typography variant="body2" color="text.secondary">
                {formState.punctuality > 0 ? labels[formState.punctuality] : 'Not rated'}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Written Review */}
        <Box sx={{ mt: 3 }}>
          <Typography component="legend" variant="subtitle2" sx={{ mb: 1 }}>
            Your Review
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            placeholder="Share your experience working with this peer..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={isSubmitting || success}
          startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewForm;