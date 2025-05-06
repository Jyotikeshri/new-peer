// routes/reviewRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js'; // Protect route
import { 
  submitReview, 
  getAllReviews, 
  getReviewsForUser,
  checkHasReviewed 
} from '../controllers/reviewController.js';

const router = express.Router();

// Submit review
router.post('/', protect, submitReview);

// Get all reviews for the logged-in user
router.get('/', protect, getAllReviews);

// Get reviews for specific user
router.get('/:userId', protect, getReviewsForUser);

// Check if the current user has already reviewed a specific user
router.get('/check/:revieweeId', protect, checkHasReviewed);

export default router;