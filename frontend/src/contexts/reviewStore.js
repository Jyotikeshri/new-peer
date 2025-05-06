// src/contexts/reviewStore.js
import { create } from 'zustand';

// Helper function to validate MongoDB ObjectId format
const isValidObjectId = (id) => {
  if (!id) return false;
  return /^[0-9a-fA-F]{24}$/.test(id.toString());
};

// Get current user's ID from local storage
const getCurrentUserId = () => {
  try {
    const userDataStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (userDataStr) {
      const userData = JSON.parse(userDataStr);
      return userData._id || null;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving current user ID:', error);
    return null;
  }
};

const useReviewStore = create((set, get) => ({
  reviews: [],
  userReviews: {}, // Keyed by userId, to cache user reviews
  isLoading: false,
  isSubmitting: false,
  error: null,
  
  resetError: () => set({ error: null }),
  
  // Get all reviews for the logged-in user
  fetchMyReviews: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/reviews`,
        { credentials: 'include' }
      );
      
      // Handle HTTP errors but treat 404 (no reviews) as a success with empty array
      if (!response.ok && response.status !== 404) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch reviews');
      }
      
      // Return empty array for 404 response
      if (response.status === 404) {
        set({ reviews: [], isLoading: false });
        return [];
      }
      
      const data = await response.json();
      set({ reviews: data, isLoading: false });
      return data;
    } catch (err) {
      console.error('Error fetching reviews:', err);
      set({ error: err.message, isLoading: false });
      return [];
    }
  },
  
  // Get reviews for a specific user
  fetchUserReviews: async (userId) => {
    try {
      // Validate userId before proceeding
      if (!userId || !isValidObjectId(userId)) {
        set({ error: 'Invalid user ID', isLoading: false });
        return [];
      }
      
      set({ isLoading: true, error: null });
      
      // If we already have this user's reviews cached and they're recent, use the cache
      const cachedReviews = get().userReviews[userId];
      const cacheTime = get().userReviews[`${userId}_timestamp`];
      const cacheIsValid = cacheTime && (Date.now() - cacheTime < 5 * 60 * 1000); // 5 minutes cache
      
      if (cachedReviews && cacheIsValid) {
        set({ isLoading: false });
        return cachedReviews;
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/reviews/${userId}`,
        { credentials: 'include' }
      );
      
      // Handle HTTP errors but treat 404 as empty array
      if (!response.ok && response.status !== 404) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch user reviews');
      }
      
      // If 404, return empty array
      let data = [];
      if (response.status !== 404) {
        data = await response.json();
      }
      
      // Cache this user's reviews with timestamp
      set((state) => ({
        userReviews: {
          ...state.userReviews,
          [userId]: data,
          [`${userId}_timestamp`]: Date.now()
        },
        isLoading: false
      }));
      
      return data;
    } catch (err) {
      console.error('Error fetching user reviews:', err);
      set({ error: err.message, isLoading: false });
      return [];
    }
  },
  
  // Submit a review
  submitReview: async (reviewData) => {
    try {
      // Validate revieweeId
      if (!reviewData.revieweeId || !isValidObjectId(reviewData.revieweeId)) {
        throw new Error('Invalid reviewee ID');
      }
      
      set({ isSubmitting: true, error: null });
      
      // First check if user has already reviewed this person
      const hasAlreadyReviewed = await get().hasReviewed(reviewData.revieweeId);
      
      if (hasAlreadyReviewed) {
        throw new Error('You have already reviewed this person');
      }
      
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/reviews`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(reviewData),
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to submit review');
      }
      
      // Clear cached reviews for this user to force a refresh on next fetch
      if (reviewData.revieweeId) {
        set((state) => {
          const newUserReviews = { ...state.userReviews };
          delete newUserReviews[reviewData.revieweeId];
          delete newUserReviews[`${reviewData.revieweeId}_timestamp`];
          return { userReviews: newUserReviews };
        });
      }
      
      set({ isSubmitting: false });
      return true;
    } catch (err) {
      console.error('Error submitting review:', err);
      set({ error: err.message, isSubmitting: false });
      throw err;
    }
  },
  
  // Check if current user has already reviewed a specific user
  hasReviewed: async (revieweeId) => {
    try {
      // Validate revieweeId
      if (!revieweeId || !isValidObjectId(revieweeId)) {
        console.warn('Invalid reviewee ID passed to hasReviewed:', revieweeId);
        return false;
      }
      
      // Method 1: Check using the direct API endpoint
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/reviews/check/${revieweeId}`,
          { credentials: 'include' }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.hasReviewed !== undefined) {
            return data.hasReviewed;
          }
        }
      } catch (directCheckError) {
        console.log('Direct check failed, falling back to reviews list:', directCheckError);
        // Continue to fallback methods if the direct check fails
      }
      
      // Method 2: First check my reviews in the store
      let myReviews = get().reviews;
      
      // If we don't have reviews loaded yet, fetch them
      if (!myReviews || myReviews.length === 0) {
        myReviews = await get().fetchMyReviews();
      }
      
      // Check if we have any reviews for this reviewee
      const reviewForUser = myReviews.find(
        review => (review.reviewee === revieweeId || 
                 (review.reviewee && review.reviewee._id === revieweeId))
      );
      
      if (reviewForUser) {
        return true;
      }
      
      // Method 3: Check the user's reviews to see if our ID is in there
      const userReviews = await get().fetchUserReviews(revieweeId);
      
      if (!userReviews || userReviews.length === 0) {
        return false;
      }
      
      // Get the current user's ID 
      const currentUserId = getCurrentUserId();
      
      if (!currentUserId) {
        return false;
      }
      
      // Check if any of the user's reviews were written by the current user
      const myReviewInList = userReviews.find(review => 
        (review.reviewer && review.reviewer._id === currentUserId) ||
        review.reviewer === currentUserId
      );
      
      return !!myReviewInList;
    } catch (error) {
      console.error('Error checking if user has reviewed:', error);
      return false;
    }
  }
}));

export default useReviewStore;