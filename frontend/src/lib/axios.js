// src/utils/axios.js - FIXED VERSION
import axios from "axios";
import useAuthStore from "../contexts/authStore";

// Get the base URL from environment variables with fallback
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://new-peer-1.onrender.com/api";

// Create the axios instance with proper configuration
export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // Always include credentials for cookies
});

// Add request interceptor to dynamically add auth headers
axiosInstance.interceptors.request.use(
  (config) => {
    // Get the current token from auth store
    const token = useAuthStore.getState().getToken();
    
    // Log request info for debugging
    // console.log(`[API] ${config.method?.toUpperCase() || 'GET'} Request to ${config.url}`, {
    //   hasToken: !!token
    // });
    
    // Add Authorization header if token exists
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error("[API] Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
  (response) => {
    // Log successful response
    // console.log(`[API] Response from ${response.config.url}:`, {
    //   status: response.status,
    //   ok: true
    // });
    return response;
  },
  async (error) => {
    // Get original request
    const originalRequest = error.config;
    
    // Log error response
    console.error(`[API] Error response from ${originalRequest.url}:`, {
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.warn('[API] Authentication failed (401), trying to refresh auth');
      
      // Mark as retried to prevent infinite loops
      originalRequest._retry = true;
      
      try {
        // Check auth status
        const authStore = useAuthStore.getState();
        const authCheck = await authStore.checkAuth();
        
        // If auth check succeeded, retry the original request
        if (authCheck) {
          // Get fresh token
          const newToken = authStore.getToken();
          originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
        
        // If auth check failed, proceed with logout
        console.warn("[API] Auth refresh failed, logging out");
        authStore.logout();
      } catch (refreshError) {
        console.error("[API] Error during auth refresh:", refreshError);
        // Force logout
        useAuthStore.getState().logout();
      }
    }
    
    return Promise.reject(error);
  }
);

/**
 * Helper function to get the current user ID
 * with improved error handling and logging
 */
export function getCurrentUserId() {
  try {
    // First try to get from auth store for consistency
    const user = useAuthStore.getState().user;
    if (user?._id) {
      return user._id;
    }
    
    // Fallback to localStorage if needed
    const userData = localStorage.getItem("user");
    if (!userData) {
      console.warn("[API] No user data found in localStorage");
      return null;
    }
    
    const parsedUser = JSON.parse(userData);
    if (!parsedUser?._id) {
      console.warn("[API] User data exists but no ID found:", parsedUser);
      return null;
    }
    
    return parsedUser._id;
  } catch (error) {
    console.error("[API] Error getting user ID:", error);
    return null;
  }
}