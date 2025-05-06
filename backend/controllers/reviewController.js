import Review from "../models/Review.js";
import User from "../models/User.js";
import mongoose from "mongoose";

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id) && /^[0-9a-fA-F]{24}$/.test(id);
};

// Helper function to remove ID fields from reviews and their nested objects
const removeIdFields = (review) => {
  if (!review) return null;
  
  // Convert to plain object if it's a Mongoose document
  const plainReview = review.toObject ? review.toObject() : {...review};
  
  // Remove top-level _id
  delete plainReview._id;
  delete plainReview.id;
  
  // Remove _id from ratings
  if (plainReview.ratings) {
    delete plainReview.ratings._id;
    delete plainReview.ratings.id;
  }
  
  // Remove _id from reviewer if it exists and is an object
  if (plainReview.reviewer && typeof plainReview.reviewer === 'object') {
    delete plainReview.reviewer._id;
    delete plainReview.reviewer.id;
  }
  
  // Remove _id from reviewee if it exists and is an object
  if (plainReview.reviewee && typeof plainReview.reviewee === 'object') {
    delete plainReview.reviewee._id;
    delete plainReview.reviewee.id;
  }
  
  return plainReview;
};

export const submitReview = async (req, res) => {
    try {
        const { revieweeId, ratings, text } = req.body;

        // Validate revieweeId
        if (!revieweeId || !isValidObjectId(revieweeId)) {
            return res.status(400).json({ message: 'Valid reviewee ID is required' });
        }

        if (!ratings) {
            return res.status(400).json({ message: 'Ratings are required' });
        }

        // Destructure the ratings object to ensure we pass individual values
        const { collaboration, skill, communication, teamwork, punctuality } = ratings;

        // Ensure all ratings values are numbers between 1 and 5
        if (
            [collaboration, skill, communication, teamwork, punctuality].some(
                rating => typeof rating !== 'number' || rating < 1 || rating > 5
            )
        ) {
            return res.status(400).json({ message: 'Ratings must be numbers between 1 and 5' });
        }

        // Check if reviewee exists
        const reviewee = await User.findById(revieweeId);
        if (!reviewee) {
            return res.status(404).json({ message: 'Reviewee not found' });
        }

        // Check if this user has already reviewed this peer
        const existingReview = await Review.findOne({
            reviewer: req.user._id,
            reviewee: revieweeId
        });

        if (existingReview) {
            return res.status(400).json({ 
                message: 'You have already reviewed this person'
            });
        }

        // Create the review with individual ratings fields
        const review = new Review({
            reviewer: req.user._id,
            reviewee: revieweeId,
            ratings: {
                collaboration,
                skill,
                communication,
                teamwork,
                punctuality
            },
            text
        });

        await review.save();

        // Update reviewee's average ratings
        await updateUserRating(revieweeId);

        res.status(201).json({ message: 'Review submitted successfully' });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ message: error.message });
    }
};

// Function to update user rating based on reviews
const updateUserRating = async (userId) => {
    if (!isValidObjectId(userId)) {
        console.error('Invalid userId provided to updateUserRating:', userId);
        return;
    }

    try {
        const reviews = await Review.find({ reviewee: userId });

        // If there are no reviews, don't update the rating
        if (reviews.length === 0) {
            return;
        }

        // Calculate the average for each rating category
        const avgRatings = {
            collaboration: reviews.reduce((sum, r) => sum + r.ratings.collaboration, 0) / reviews.length,
            skill: reviews.reduce((sum, r) => sum + r.ratings.skill, 0) / reviews.length,
            communication: reviews.reduce((sum, r) => sum + r.ratings.communication, 0) / reviews.length,
            teamwork: reviews.reduce((sum, r) => sum + r.ratings.teamwork, 0) / reviews.length,
            punctuality: reviews.reduce((sum, r) => sum + r.ratings.punctuality, 0) / reviews.length
        };

        // Calculate the overall average rating from the individual ratings
        const overallAverageRating = (
            avgRatings.collaboration + 
            avgRatings.skill + 
            avgRatings.communication + 
            avgRatings.teamwork + 
            avgRatings.punctuality
        ) / 5; 
        
        console.log(userId , overallAverageRating);// You can adjust the divisor based on your rating structure

        // Update the user rating with the overall average rating
        await User.findByIdAndUpdate(userId, { rating: overallAverageRating });
    } catch (error) {
        console.error('Error updating user rating:', error);
    }
};

export const getReviewsForUser = async (req, res) => {
    try {
        // Get the userId from the URL parameter
        const userId = req.params.userId;

        // Validate userId
        if (!userId || !isValidObjectId(userId)) {
            return res.status(400).json({ 
                message: 'Valid User ID is required' 
            });
        }

        // Check if user exists first
        const userExists = await User.findById(userId);
        if (!userExists) {
            return res.status(404).json({ message: 'User not found' });
        }

        const reviews = await Review.find({ reviewee: userId })
            .populate('reviewer', 'username avatar bio') // Populate reviewer details with more info
            .sort({ createdAt: -1 }); // Sort by most recent review
        
        // Return empty array instead of 404 when no reviews found
        if (!reviews || reviews.length === 0) {
            return res.status(200).json([]);
        }
    
        // Clean up reviews to remove all _id fields
        const cleanReviews = reviews.map(review => removeIdFields(review));

        res.status(200).json(cleanReviews);
    } catch (error) {
        console.error('Error fetching reviews for user:', error);
        res.status(500).json({ message: error.message });
    }
};

export const getAllReviews = async (req, res) => {
    try {
        // Validate user ID
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'User not authenticated properly' });
        }

        // Fetch reviews for the user (using user ID from the token)
        const reviews = await Review.find({ reviewee: req.user._id })
            .populate('reviewer', 'username avatar bio') // Get reviewer details with more info
            // Removed session population since it doesn't exist in schema
            .sort({ createdAt: -1 }); // Sort by most recent review
    
        // Return empty array instead of 404 when no reviews found
        if (!reviews || reviews.length === 0) {
            return res.status(200).json([]);
        }
    
        // Clean up reviews to remove all _id fields
        const cleanReviews = reviews.map(review => removeIdFields(review));

        res.status(200).json(cleanReviews);
    } catch (error) {
        console.error('Error fetching all reviews:', error);
        res.status(500).json({ message: error.message });
    }
};

// Check if a user has already reviewed another user
export const checkHasReviewed = async (req, res) => {
    try {
        const { revieweeId } = req.params;
        
        // Validate revieweeId
        if (!revieweeId || !isValidObjectId(revieweeId)) {
            return res.status(400).json({ 
                message: 'Valid Reviewee ID is required',
                hasReviewed: false 
            });
        }
        
        // Check if both users exist
        const reviewee = await User.findById(revieweeId);
        if (!reviewee) {
            return res.status(404).json({ 
                message: 'Reviewee not found',
                hasReviewed: false
            });
        }
        
        // Find if a review already exists
        const existingReview = await Review.findOne({
            reviewer: req.user._id,
            reviewee: revieweeId
        });
        
        res.status(200).json({ 
            hasReviewed: !!existingReview
        });
    } catch (error) {
        console.error('Error checking if user has reviewed:', error);
        res.status(500).json({ 
            message: error.message,
            hasReviewed: false
        });
    }
};