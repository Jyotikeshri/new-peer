// routes/userRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserBadges,
  findMatches,
  upload,
  getFriendsList,
  onboard,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendRequests,
  getOutgoingFriendReqs,
  getPendingFriendRequests,
  
  removeFriend,
  getUserById,
  addFriend,
  removeFriendHandler
} from '../controllers/userController.js';

const router = express.Router();

// User profile routes
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);
router.post('/onboarding', protect, onboard);

// User discovery routes
router.get('/', protect, getAllUsers);
router.get('/matches', protect, findMatches);

// User achievements
router.get('/get-badge', protect, getUserBadges);

// Friend management routes
router.get('/friends', protect, getFriendsList);
router.put('/add-friend', protect, async (req, res) => {
  const { userId, friendId } = req.body;
  
  if (!userId || !friendId) {
    return res.status(400).json({ message: 'User ID and Friend ID are required' });
  }
  
  try {
    await addFriend(userId, friendId);
    res.status(200).json({ message: 'Friend added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error adding friend', error: error.message });
  }
});

router.put('/remove-friend', protect, removeFriendHandler);

// Friend request routes - Updated with new implementations
router.post('/friend-request', protect, sendFriendRequest);
router.post('/friend-request/accept', protect, acceptFriendRequest);
router.post('/friend-request/reject', protect, rejectFriendRequest);

// New friend request endpoints
router.get('/friend-requests', protect, getFriendRequests);
router.get('/outgoing-friend-requests', protect, getOutgoingFriendReqs);
router.get('/pending-friend-requests', protect, getPendingFriendRequests); // For backward compatibility

// Get user by ID
router.get('/:id', protect, getUserById);

// Notification routes
// router.get('/notifications', protect, getUserNotifications);

export default router;