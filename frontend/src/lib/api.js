import { axiosInstance } from "./axios";

export async function getStreamToken() {
  const response = await axiosInstance.get("/chat/token");
  return response.data;
}

// API client functions for friend requests

/**
 * Get outgoing friend requests sent by the current user
 * @returns {Promise<Array>} Array of outgoing friend requests
 */
export async function getOutgoingFriendReqs() {
  const response = await axiosInstance.get("/users/outgoing-friend-requests");
  return response.data;
}

/**
 * Send a friend request to another user
 * @param {string} targetUserId - ID of the user to send a request to
 * @returns {Promise<Object>} The created friend request
 */
export async function sendFriendRequest(targetUserId) {
  const response = await axiosInstance.post("/users/friend-request", { 
    targetUserId 
  });
  return response.data;
}

/**
 * Get all friend requests for the current user
 * @returns {Promise<Object>} Object containing incomingReqs and acceptedReqs arrays
 */
export async function getFriendRequests() {
  const response = await axiosInstance.get("/users/friend-requests");
  return response.data;
}

/**
 * Accept a friend request
 * @param {string} requesterId - ID of the user who sent the request
 * @returns {Promise<Object>} Response data
 */
export async function acceptFriendRequest(requesterId) {
  const response = await axiosInstance.post("/users/friend-request/accept", {
    requesterId
  });
  return response.data;
}

/**
 * Reject a friend request
 * @param {string} requesterId - ID of the user who sent the request
 * @returns {Promise<Object>} Response data
 */
export async function rejectFriendRequest(requesterId) {
  const response = await axiosInstance.post("/users/friend-request/reject", {
    requesterId
  });
  return response.data;
}

/**
 * Remove a friend
 * @param {string} friendId - ID of the friend to remove
 * @returns {Promise<Object>} Response data
 */
export async function removeFriend(friendId) {
  const userId = getUserId();
  
  if (!userId) {
    console.error("Cannot remove friend: No user ID found");
    throw new Error("User ID not available. Please log in again.");
  }
  
  console.log("Removing friend. User ID:", userId, "Friend ID:", friendId);
  
  const response = await axiosInstance.put("/users/remove-friend", {
    userId: userId,
    friendId
  });
  return response.data;
}

/**
 * Get the current user's ID from local storage or context
 * @returns {string|null} Current user ID or null if not available
 */
function getUserId() {
  try {
    // Always get the most current user data
    const userData = localStorage.getItem("user");
    if (!userData) return null;
    
    const user = JSON.parse(userData);
    return user?._id || null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
}

/**
 * Get the friends list for the current user
 * @returns {Promise<Array>} Array of friend objects
 */
export async function getFriendsList() {
  const response = await axiosInstance.get("/users/friends");
  return response.data;
}