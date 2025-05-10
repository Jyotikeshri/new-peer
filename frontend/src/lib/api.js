// src/utils/apiClient.js - UPDATED VERSION
import { axiosInstance, getCurrentUserId } from "./axios";

/**
 * Get Stream chat token
 */
export async function getStreamToken() {
  try {
    const response = await axiosInstance.get("/chat/token");
    return response.data;
  } catch (error) {
    console.error("[API] Error getting stream token:", error);
    throw error;
  }
}

/**
 * Get all friend requests for the current user
 */
export async function getFriendRequests() {
  try {
    const response = await axiosInstance.get("/users/friend-requests");
    return response.data;
  } catch (error) {
    console.error("[API] Error getting friend requests:", error);
    throw error;
  }
}

/**
 * Get outgoing friend requests sent by the current user
 */
export async function getOutgoingFriendReqs() {
  try {
    const response = await axiosInstance.get("/users/outgoing-friend-requests");
    return response.data;
  } catch (error) {
    console.error("[API] Error getting outgoing friend requests:", error);
    throw error;
  }
}

/**
 * Send a friend request to another user
 */
export async function sendFriendRequest(targetUserId) {
  try {
    const response = await axiosInstance.post("/users/friend-request", {
      targetUserId
    });
    return response.data;
  } catch (error) {
    console.error("[API] Error sending friend request:", error);
    throw error;
  }
}

/**
 * Accept a friend request
 */
export async function acceptFriendRequest(requesterId) {
  try {
    const response = await axiosInstance.post("/users/friend-request/accept", {
      requesterId
    });
    return response.data;
  } catch (error) {
    console.error("[API] Error accepting friend request:", error);
    throw error;
  }
}

/**
 * Reject a friend request
 */
export async function rejectFriendRequest(requesterId) {
  try {
    const response = await axiosInstance.post("/users/friend-request/reject", {
      requesterId
    });
    return response.data;
  } catch (error) {
    console.error("[API] Error rejecting friend request:", error);
    throw error;
  }
}

/**
 * Remove a friend with improved error handling
 */
export async function removeFriend(friendId) {
  try {
    const userId = getCurrentUserId();
    
    if (!userId) {
      const error = new Error("User ID not available. Please log in again.");
      console.error("[API] Cannot remove friend: No user ID found");
      throw error;
    }
    
    // console.log("[API] Removing friend. User ID:", userId, "Friend ID:", friendId);
    
    const response = await axiosInstance.put("/users/remove-friend", {
      userId,
      friendId
    });
    
    return response.data;
  } catch (error) {
    console.error("[API] Error removing friend:", error);
    throw error;
  }
}

/**
 * Get the friends list for the current user
 */
export async function getFriendsList() {
  try {
    const response = await axiosInstance.get("/users/friends");
    return response.data;
  } catch (error) {
    console.error("[API] Error getting friends list:", error);
    throw error;
  }
}

/**
 * Legacy fetchWithAuth function - updated to use axiosInstance
 * Keep this for backward compatibility with existing code
 */
export const fetchWithAuth = async (url, options = {}) => {
  // Parse the URL to get just the endpoint part
  let endpoint = url;
  if (url.includes('/api/')) {
    endpoint = url.split('/api/')[1];
  }
  
  try {
    // Extract method, body from options
    const { method = 'GET', body, headers = {} } = options;
    
    // Convert fetch options to axios options
    const axiosOptions = {
      method,
      headers,
      data: body ? (typeof body === 'string' ? JSON.parse(body) : body) : undefined
    };
    
    // Make the request
    const response = await axiosInstance(endpoint, axiosOptions);
    
    // Return a fetch-like response for compatibility
    return {
      ok: response.status >= 200 && response.status < 300,
      status: response.status,
      statusText: response.statusText,
      json: () => Promise.resolve(response.data),
      text: () => Promise.resolve(JSON.stringify(response.data))
    };
  } catch (error) {
    console.error(`[API] fetchWithAuth error for ${endpoint}:`, error);
    
    // Return a fetch-like error response
    return {
      ok: false,
      status: error.response?.status || 500,
      statusText: error.response?.statusText || error.message,
      json: () => Promise.resolve(error.response?.data || { message: error.message })
    };
  }
};