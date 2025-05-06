// routes/groupRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as groupController from '../controllers/groupController.js';
import * as discoveryController from '../controllers/groupDiscoveryController.js';
import { groupUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Discovery routes - place these BEFORE the :groupId route to avoid conflicts
router.get('/discovery/recommended', protect, discoveryController.getRecommendedGroups);
router.get('/discovery/trending', protect, discoveryController.getTrendingGroups);
router.get('/discovery/for-you', protect, discoveryController.getForYouGroups);
router.get('/discovery/with-friends', protect, discoveryController.getWithFriendsGroups);
router.get('/discovery/search', protect, discoveryController.searchGroups);
router.post('/discovery/join', protect, discoveryController.joinGroup);

// Base group routes
router.post('/', protect, groupUpload, groupController.createGroup); // Apply upload middleware
router.get('/user', protect, groupController.getUserGroups);
router.post('/member', protect, groupController.addGroupMember);
router.delete('/member', protect, groupController.removeGroupMember);

// :groupId route should be LAST to avoid conflicts with other routes
router.get('/:groupId', protect, groupController.getGroupById);
router.delete('/:groupId', protect, groupController.deleteGroup);

export default router;