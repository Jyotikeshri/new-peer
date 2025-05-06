import multer from 'multer';
import cloudinary from 'cloudinary';
import { v2 as cloudinaryV2 } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import User from '../models/User.js';
import Badge from '../models/Badge.js';
import dotenv from 'dotenv';
dotenv.config();
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { upsertStreamUser } from '../config/stream.js';
import { StreamChat } from 'stream-chat'; 
import FriendRequest from '../models/FriendRequest.js';


// Cloudinary configuration
cloudinaryV2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dj5qqi6ly',
  api_key: process.env.CLOUDINARY_API_KEY || '712721644946881',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'N4WRbAS9GVJCpUB3M8JOqazfezM'
});

// Cloudinary storage configuration for Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinaryV2,
  params: {
    folder: 'avatars', // folder where images will be uploaded
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'], // allowed formats
  },
});

// Initialize multer with cloudinary storage
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// Simple model loading without complex memory management
let model = null;
let modelLoading = false;

async function loadModel() {
  if (model) return model;
  
  if (modelLoading) {
    // Wait for model to load
    console.log("Model is already loading, waiting...");
    while (modelLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return model;
  }
  
  try {
    modelLoading = true;
    console.log("Loading Universal Sentence Encoder model...");
    model = await use.load();
    console.log("Model loaded successfully");
    return model;
  } catch (error) {
    console.error("Failed to load model:", error);
    throw error;
  } finally {
    modelLoading = false;
  }
}

// Simple similarity computation function
async function computeSimilarity(text1, text2) {
  try {
    // Skip if either input is empty
    if (!text1 || !text2) {
      return 0;
    }
    
    // Get the model
    const useModel = await loadModel();
    
    // Embed the texts
    const embeddings = await useModel.embed([text1, text2]);
    const embedArray = await embeddings.array();
    
    // Calculate cosine similarity manually to avoid TensorFlow issues
    const vec1 = embedArray[0];
    const vec2 = embedArray[1];
    
    // Compute dot product
    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;
    
    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }
    
    // Calculate cosine similarity
    const similarity = dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    
    // Clean up tensors
    embeddings.dispose();
    
    return similarity;
  } catch (error) {
    console.error('Error computing similarity:', error);
    return 0; // Return default value if there's an error
  }
}

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update user profile with avatar upload
export const updateUserProfile = async (req, res) => {
  try {
    console.log("Request received to update profile");
    console.log("Request file:", req.file);  
    console.log("Request body:", req.body);

    // Parse JSON strings back to arrays if they were stringified
    let interests = req.body.interests;
    let strengths = req.body.strengths;
    let needsHelpWith = req.body.needsHelpWith;

    try {
      // Check if these fields are JSON strings and parse them
      if (interests && typeof interests === 'string') {
        interests = JSON.parse(interests);
      }
      if (strengths && typeof strengths === 'string') {
        strengths = JSON.parse(strengths);
      }
      if (needsHelpWith && typeof needsHelpWith === 'string') {
        needsHelpWith = JSON.parse(needsHelpWith);
      }
    } catch (parseError) {
      console.error("Error parsing JSON fields:", parseError);
      // Continue with the original values if parsing fails
    }

    const { bio, github, linkedin, leetcode, portfolio, isOnboarded } = req.body;

    // Check if avatar file is uploaded
    let avatar;
    if (req.file) {
      avatar = req.file.path; // Contains Cloudinary URL if successful
      console.log('Avatar URL:', avatar);
    } else {
      console.log('No new avatar file uploaded');
    }

    // Build the update object, only including fields that are provided
    const updatedUserData = {};
    
    if (bio !== undefined) updatedUserData.bio = bio;
    if (avatar) updatedUserData.avatar = avatar;
    if (interests) updatedUserData.interests = interests;
    if (strengths) updatedUserData.strengths = strengths;
    if (needsHelpWith) updatedUserData.needsHelpWith = needsHelpWith;
    if (github !== undefined) updatedUserData.github = github;
    if (linkedin !== undefined) updatedUserData.linkedin = linkedin;
    if (leetcode !== undefined) updatedUserData.leetcode = leetcode;
    if (portfolio !== undefined) updatedUserData.portfolio = portfolio;

    if (typeof isOnboarded !== 'undefined') {
      updatedUserData.isOnboarded = (isOnboarded === 'true' || isOnboarded === true);
    }

    console.log('Updating user with data:', updatedUserData);


    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updatedUserData,
      { new: true } // Return updated user
    ).select('-password');
    
    
    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.username,
        image: updatedUser.avatar || "",
      });
      console.log(`Stream user updated after onboarding for ${updatedUser.username}`);
    } catch (streamError) {
      console.log("Error updating Stream user during onboarding:", streamError.message);
    }
    // Exclude password field

    if (!updatedUser) {
      console.log('User not found with ID:', req.user._id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('User updated successfully:', updatedUser._id);
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all users (for admin or search feature)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get user badges
export const getUserBadges = async (req, res) => {
  try {
    const badges = await Badge.find({ user: req.user._id });

    if (badges.length === 0) {
      return res.status(404).json({ message: 'No badges earned yet.' });
    }

    res.status(200).json(badges);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add friend function
async function addFriend(userId, friendId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  // Check if the friend is already in the friends list
  if (!user.friends.includes(friendId)) {
    user.friends.push(friendId);
    await user.save();
    console.log(`User ${userId} added friend ${friendId}`);
  } else {
    console.log('Friend already added');
  }
}

// Simplified findMatches function without complex TensorFlow memory management
export const findMatches = async (req, res) => {
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`[${requestId}] Starting findMatches`);

  try {
    const user = await User.findById(req.user._id).populate('friends', '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const allUsers = await User.find({ _id: { $ne: user._id } }).populate('friends', '-password');
    console.log(`[${requestId}] Found ${allUsers.length} potential matches`);

    const matches = [];
    const threshold = 0.3; // Lowered threshold for better matching

    for (const potentialMatch of allUsers) {
      let score = 0;

      const userBio = (user.bio || '').toLowerCase();
      const matchBio = (potentialMatch.bio || '').toLowerCase();

      const userInterests = (user.interests || []).join(' ').toLowerCase();
      const matchInterests = (potentialMatch.interests || []).join(' ').toLowerCase();

      const userStrengths = (user.strengths || []).join(' ').toLowerCase();
      const matchStrengths = (potentialMatch.strengths || []).join(' ').toLowerCase();

      const userNeeds = (user.needsHelpWith || []).join(' ').toLowerCase();
      const matchNeeds = (potentialMatch.needsHelpWith || []).join(' ').toLowerCase();

      // 1. Tensorflow semantic similarity
      if (userBio && matchBio) score += await computeSimilarity(userBio, matchBio);
      if (userInterests && matchInterests) score += await computeSimilarity(userInterests, matchInterests);
      if (userStrengths && matchNeeds) score += await computeSimilarity(userStrengths, matchNeeds);
      if (matchStrengths && userNeeds) score += await computeSimilarity(matchStrengths, userNeeds);

      // 2. Fallback: Direct text inclusion bonus
      if (userStrengths && matchNeeds && (userStrengths.includes(matchNeeds) || matchNeeds.includes(userStrengths))) {
        score += 0.5;
      }
      if (matchStrengths && userNeeds && (matchStrengths.includes(userNeeds) || userNeeds.includes(matchStrengths))) {
        score += 0.5;
      }

      // 3. Mutual friends bonus
      const userFriendIds = user.friends.map(f => f._id.toString());
      const matchFriendIds = potentialMatch.friends.map(f => f._id.toString());

      const hasMutualFriends = userFriendIds.some(friendId => matchFriendIds.includes(friendId));
      if (hasMutualFriends) {
        score += 0.5;
      }

      // 4. Only include if good enough
      if (score >= threshold) {
        matches.push({
          user: {
            _id: potentialMatch._id,
            username: potentialMatch.username,
            avatar: potentialMatch.avatar,
            bio: potentialMatch.bio,
            interests: potentialMatch.interests,
            strengths: potentialMatch.strengths,
            needsHelpWith: potentialMatch.needsHelpWith,
            friends: potentialMatch.friends,
            leetcode : potentialMatch.leetcode,
            github : potentialMatch.github,
            linkedin : potentialMatch.linkedin,
            portfolio : potentialMatch.portfolio,
            badges : potentialMatch.badges,
            createdAt : potentialMatch.createdAt,
            rating : potentialMatch.rating,





          },
          score: parseFloat(score.toFixed(2))
        });
      }
    }

    // Sort descending by best match first
    matches.sort((a, b) => b.score - a.score);

    console.log(`[${requestId}] Found ${matches.length} matches after scoring`);
    res.status(200).json(matches);
    
  } catch (error) {
    console.error(`[${requestId}] Error in findMatches:`, error);
    res.status(500).json({ message: error.message || 'Error finding matches' });
  }
};

// -------------------------
// Helper: partial matcher
function stringPartialMatch(textA, textB) {
  return textA.includes(textB) || textB.includes(textA);
}


export const onboard =  async (req, res) => {
  try {
    const { isOnboarded } = req.body;
    
    if (typeof isOnboarded !== 'boolean') {
      return res.status(400).json({ message: 'isOnboarded must be a boolean value' });
    }
    
    // Get the user's ID from the authenticated session
    const userId = req.user.id;
    
    // Update only the isOnboarded field
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { isOnboarded },
      { new: true } // Return the updated document
    );

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.username,
        image: updatedUser.avatar || "",
      });
      console.log(`Stream user updated after onboarding for ${updatedUser.username}`);
    } catch (streamError) {
      console.log("Error updating Stream user during onboarding:", streamError.message);
    }
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating onboarding status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};




export const removeFriendHandler = async (req, res) => {
  try {
    console.log('Remove Friend handler called');
    console.log('Request body:', req.body);
    console.log('Request headers:', req.headers);
    
    // Check if body exists
    if (!req.body) {
      return res.status(400).json({ message: 'Request body is missing' });
    }
    
    const { userId, friendId } = req.body;
    
    console.log('Extracted IDs:', { userId, friendId });
    
    if (!userId || !friendId) {
      return res.status(400).json({ message: 'User ID and Friend ID are required' });
    }
    
    // Call the helper function that does the actual work
    await removeFriend(userId, friendId);
    
    res.status(200).json({ message: 'Friend removed successfully' });
  } catch (error) {
    console.error('Error in removeFriendHandler:', error);
    res.status(500).json({ message: 'Error removing friend', error: error.message });
  }
};

// This is the helper function that actually removes the friend
// It doesn't use res because it's not a controller
export const removeFriend = async (userId, friendId) => {
  // Remove the friend from the user's friends list
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Remove the friendId from the friends array
  user.friends = user.friends.filter(id => id.toString() !== friendId);
  await user.save();
  
  // Also remove the user from the friend's friends list for consistency
  const friend = await User.findById(friendId);
  if (friend) {
    friend.friends = friend.friends.filter(id => id.toString() !== userId);
    await friend.save();
  }

  const existingRequest = await FriendRequest.findOneAndDelete({
    $or: [
      { sender: user._id, recipient: friendId },
      { sender: friendId, recipient: user._id },
    ],
  });
};

export const getFriendsList = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('friends', '-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user.friends);
  } catch (error) {
    console.error('Error fetching friends list:', error);
    res.status(500).json({ message: 'Server error fetching friends' });
  }
};


const streamClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

export const sendFriendRequest = async (req, res) => {
  try {
    const myId = req.user._id;
    const { targetUserId } = req.body;
    
    // Prevent sending request to yourself
    if (myId.toString() === targetUserId) {
      return res.status(400).json({ message: "You can't send a friend request to yourself" });
    }
    
    const recipient = await User.findById(targetUserId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }
    
    // Check if users are already friends
    if (recipient.friends.includes(myId)) {
      return res.status(400).json({ message: "You are already friends with this user" });
    }
    
    // Check if a request already exists
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: myId, recipient: targetUserId },
        { sender: targetUserId, recipient: myId },
      ],
    });
    
    if (existingRequest) {
      return res.status(400).json({ 
        message: "A friend request already exists between you and this user",
        request: existingRequest
      });
    }
    
    // Create the friend request
    const friendRequest = await FriendRequest.create({
      sender: myId,
      recipient: targetUserId,
    });
    
    // Add to sent requests array in User model for backward compatibility
    const requester = await User.findById(myId);
    if (!requester.sentFriendRequests) {
      requester.sentFriendRequests = [];
    }
    requester.sentFriendRequests.push(targetUserId);
    await requester.save();
    
    // For backward compatibility - update recipient's friendRequests array
    if (!recipient.friendRequests) {
      recipient.friendRequests = [];
    }
    recipient.friendRequests.push(myId);
    await recipient.save();
    
    // Optional: Send notification via Stream if configured
    try {
      if (typeof upsertStreamUser === 'function' && StreamChat) {
        const streamClient = StreamChat.getInstance(
          process.env.STREAM_API_KEY,
          process.env.STREAM_API_SECRET
        );
        
        const channel = streamClient.channel('messaging', `notifications:${targetUserId}`, {
          members: [targetUserId.toString()],
          created_by_id: myId.toString(),
        });
        
        await channel.create();
        
        await channel.sendEvent({
          type: 'friend_request',
          user: { _id: targetUserId.toString() },
          sender: {
            _id: myId.toString(),
            name: requester.username,
            image: requester.avatar || '',
          }
        });
      }
    } catch (notificationError) {
      console.error('Error sending notification:', notificationError);
      // Continue even if notification fails
    }
    
    res.status(201).json(friendRequest);
  } catch (error) {
    console.error("Error in sendFriendRequest controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Accept a friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const { requesterId } = req.body;
    const myId = req.user._id;
    
    // Find the friend request
    const friendRequest = await FriendRequest.findOne({
      sender: requesterId,
      recipient: myId,
      status: 'pending'
    });
    
    if (!friendRequest) {
      // Fall back to the old method for backward compatibility
      return acceptLegacyFriendRequest(req, res);
    }
    
    // Update request status
    friendRequest.status = 'accepted';
    await friendRequest.save();
    
    // Add each user to the other's friends array
    await User.findByIdAndUpdate(friendRequest.sender, {
      $addToSet: { friends: friendRequest.recipient },
      $pull: { sentFriendRequests: friendRequest.recipient }
    });
    
    await User.findByIdAndUpdate(friendRequest.recipient, {
      $addToSet: { friends: friendRequest.sender },
      $pull: { friendRequests: friendRequest.sender }
    });
    
    res.status(200).json({ 
      message: "Friend request accepted",
      request: friendRequest
    });
  } catch (error) {
    console.error("Error in acceptFriendRequest controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Legacy method for backward compatibility
const acceptLegacyFriendRequest = async (req, res) => {
  try {
    const { requesterId } = req.body;
    const userId = req.user._id;
    
    // Find the current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if request exists in the legacy format
    if (!user.friendRequests.includes(requesterId)) {
      return res.status(400).json({ message: 'No pending friend request from this user' });
    }
    
    // Find the requester
    const requester = await User.findById(requesterId);
    if (!requester) {
      return res.status(404).json({ message: 'Requester not found' });
    }
    
    // Remove from pending requests
    user.friendRequests = user.friendRequests.filter(
      id => id.toString() !== requesterId
    );
    
    // Add to each other's friends list
    if (!user.friends.includes(requesterId)) {
      user.friends.push(requesterId);
    }
    
    if (!requester.friends.includes(userId)) {
      requester.friends.push(userId);
    }
    
    // Remove from sent requests if we're tracking that
    if (requester.sentFriendRequests) {
      requester.sentFriendRequests = requester.sentFriendRequests.filter(
        id => id.toString() !== userId.toString()
      );
    }
    
    // Save both users
    await user.save();
    await requester.save();
    
    // Create a FriendRequest record for historical purposes
    try {
      await FriendRequest.create({
        sender: requesterId,
        recipient: userId,
        status: 'accepted'
      });
    } catch (e) {
      // Ignore errors here - this is just for record keeping
      console.log('Could not create historical friend request record:', e.message);
    }
    
    res.status(200).json({ 
      message: 'Friend request accepted', 
      friends: user.friends,
      friendRequests: user.friendRequests
    });
  } catch (error) {
    console.error('Error accepting legacy friend request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reject a friend request
export const rejectFriendRequest = async (req, res) => {
  try {
    const { requesterId } = req.body;
    const myId = req.user._id;
    
    // Find the request
    const friendRequest = await FriendRequest.findOne({
      sender: requesterId,
      recipient: myId,
      status: 'pending'
    });
    
    if (!friendRequest) {
      // Fall back to legacy method
      return rejectLegacyFriendRequest(req, res);
    }
    
    // Update status
    friendRequest.status = 'rejected';
    await friendRequest.save();
    
    // Update user models for compatibility
    await User.findByIdAndUpdate(myId, {
      $pull: { friendRequests: requesterId }
    });
    
    await User.findByIdAndUpdate(requesterId, {
      $pull: { sentFriendRequests: myId }
    });
    
    res.status(200).json({ 
      message: "Friend request rejected",
      request: friendRequest
    });
  } catch (error) {
    console.error("Error in rejectFriendRequest controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Legacy method for backward compatibility
const rejectLegacyFriendRequest = async (req, res) => {
  try {
    const { requesterId } = req.body;
    const userId = req.user._id;
    
    // Find the current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if request exists
    if (!user.friendRequests.includes(requesterId)) {
      return res.status(400).json({ message: 'No pending friend request from this user' });
    }
    
    // Remove from pending requests
    user.friendRequests = user.friendRequests.filter(
      id => id.toString() !== requesterId
    );
    
    // Save user
    await user.save();
    
    // Optionally, update the requester's sent requests list if tracking that
    const requester = await User.findById(requesterId);
    if (requester && requester.sentFriendRequests) {
      requester.sentFriendRequests = requester.sentFriendRequests.filter(
        id => id.toString() !== userId.toString()
      );
      await requester.save();
    }
    
    // Create a record in the FriendRequest model for consistency
    try {
      await FriendRequest.create({
        sender: requesterId,
        recipient: userId,
        status: 'rejected'
      });
    } catch (e) {
      // Ignore errors here - this is just for record keeping
      console.log('Could not create historical friend request record:', e.message);
    }
    
    res.status(200).json({ 
      message: 'Friend request rejected', 
      friendRequests: user.friendRequests
    });
  } catch (error) {
    console.error('Error rejecting friend request:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get friend requests for the current user
export const getFriendRequests = async (req, res) => {
  try {
    const myId = req.user._id;
    
    // Get incoming pending requests
    const incomingReqs = await FriendRequest.find({
      recipient: myId,
      status: 'pending'
    }).populate('sender', 'username avatar bio interests strengths needsHelpWith');
    
    // Get outgoing accepted requests
    const acceptedReqs = await FriendRequest.find({
      sender: myId,
      status: 'accepted'
    }).populate('recipient', 'username avatar bio');
    
    // For backward compatibility, also check the user model
    const user = await User.findById(myId)
      .populate('friendRequests', 'username avatar bio interests strengths needsHelpWith');
    
    // Merge the legacy and new methods
    let combinedIncomingReqs = [...incomingReqs];
    
    // Add any requests in the user model that aren't in the FriendRequest model
    if (user && user.friendRequests && user.friendRequests.length > 0) {
      const existingRequestIds = incomingReqs.map(req => req.sender._id.toString());
      const legacyRequests = user.friendRequests.filter(
        req => !existingRequestIds.includes(req._id.toString())
      );
      
      // Format legacy requests to match FriendRequest model format
      const formattedLegacyRequests = legacyRequests.map(sender => ({
        sender,
        recipient: { _id: myId },
        status: 'pending',
        _id: 'legacy-' + sender._id, // Add prefix to distinguish legacy requests
        createdAt: new Date()
      }));
      
      combinedIncomingReqs = [...combinedIncomingReqs, ...formattedLegacyRequests];
    }
    
    res.status(200).json({ 
      incomingReqs: combinedIncomingReqs, 
      acceptedReqs 
    });
  } catch (error) {
    console.error("Error in getFriendRequests controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get outgoing friend requests
export const getOutgoingFriendReqs = async (req, res) => {
  try {
    const myId = req.user._id;
    
    // Get outgoing pending requests
    const outgoingRequests = await FriendRequest.find({
      sender: myId,
      status: 'pending'
    }).populate('recipient', 'username avatar bio interests strengths needsHelpWith');
    
    // For backward compatibility, also check the user model
    const user = await User.findById(myId);
    
    if (user && user.sentFriendRequests && user.sentFriendRequests.length > 0) {
      const existingRequestIds = outgoingRequests.map(req => req.recipient._id.toString());
      
      // Find any sent requests in the user model that aren't in FriendRequest
      const legacyRecipientIds = user.sentFriendRequests.filter(
        id => !existingRequestIds.includes(id.toString())
      );
      
      if (legacyRecipientIds.length > 0) {
        const legacyRecipients = await User.find({
          _id: { $in: legacyRecipientIds }
        }).select('username avatar bio interests strengths needsHelpWith');
        
        // Format legacy requests to match FriendRequest model
        const formattedLegacyRequests = legacyRecipients.map(recipient => ({
          sender: { _id: myId },
          recipient,
          status: 'pending',
          _id: 'legacy-' + recipient._id, // Add prefix to distinguish legacy requests
          createdAt: new Date()
        }));
        
        // Combine with the FriendRequest model requests
        const combinedOutgoingReqs = [...outgoingRequests, ...formattedLegacyRequests];
        return res.status(200).json(combinedOutgoingReqs);
      }
    }
    
    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.error("Error in getOutgoingFriendReqs controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Get incoming friend requests for backward compatibility 
export const getPendingFriendRequests = async (req, res) => {
  try {
    const myId = req.user._id;
    
    // Use the new method under the hood
    const { incomingReqs } = await getFriendRequests({ user: { _id: myId } }, { json: function(data) { return data; } });
    
    res.status(200).json(incomingReqs);
  } catch (error) {
    console.error('Error fetching friend requests:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Controller function to get a user by their ID
 * Retrieves user details while excluding sensitive information like password
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (!userId || userId === 'undefined') {
      return res.status(400).json({ message: 'Valid User ID is required' });
    }

    // Validate that userId is a valid ObjectId format
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      return res.status(400).json({ message: 'Invalid User ID format' });
    }
    
    // Fetch user excluding password
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if the requested user and current user are friends
    let isFriend = false;
    if (req.user && req.user._id) {
      isFriend = user.friends.some(
        friendId => friendId.toString() === req.user._id.toString()
      );
    }
    
    // Format the response with additional information
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      bio: user.bio,
      avatar: user.avatar,
      interests: user.interests || [],
      strengths: user.strengths || [],
      needsHelpWith: user.needsHelpWith || [],
      rating: user.rating,
      github: user.github,
      linkedin: user.linkedin,
      leetcode: user.leetcode,
      portfolio: user.portfolio,
      isOnline: user.isOnline,
      isOnboarded: user.isOnboarded,
      isFriend: isFriend,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };
    
    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export { addFriend, upload };