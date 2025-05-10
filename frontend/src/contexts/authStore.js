// src/contexts/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import useUserStore from './userStore';
import { fetchWithAuth } from '../utils/apiClient';

// Define the auth store with improved persistence and token handling
const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      isLoading: false,
      error: null,

      // Set authentication status manually
      setAuthenticated: (status) => set({ isAuthenticated: status }),

      // Consistent auth header generation
      getAuthHeaders: () => {
        const token = get().getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
      },

      // Improved and simplified token getter with better logging
      getToken: () => {
        const storeToken = get().token;
        const backupToken = localStorage.getItem('backup_token');
        
        // For debugging - useful to track token issues
        // console.log('[Auth] Token check - Store token:', storeToken ? 'Present' : 'Missing');
        // console.log('[Auth] Token check - Backup token:', backupToken ? 'Present' : 'Missing');
        
        // Return store token if it exists, otherwise try backup
        if (storeToken) return storeToken;
        
        // If backup exists but store doesn't, restore it to the store
        if (backupToken) {
          // console.log('[Auth] Restoring token from backup to store');
          set({ token: backupToken });
          return backupToken;
        }
        
        console.warn('[Auth] No authentication token found');
        return null;
      },
      
      // Improved setToken with consistent storage and clear logging
      setToken: (token) => {
        // console.log('[Auth] Setting token:', token ? 'Present' : 'Missing');
        
        // Update store
        set({ token });
        
        // Always keep localStorage in sync
        if (token) {
          localStorage.setItem('backup_token', token);
        } else {
          localStorage.removeItem('backup_token');
        }
      },

      // Login user with improved token handling
      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          // Clear any existing tokens first to prevent inconsistency
          get().setToken(null);
          localStorage.removeItem('auth_token');
          
          const response = await fetch('https://new-peer-1.onrender.com/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ email, password }),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Login failed');
          }

          // Store user in userStore
          if (data.user) {
            useUserStore.getState().setUser(data.user);
          }

          // Get token from response
          const token = data.token;
          
          // console.log("[Auth] Login successful, token received:", token ? "Yes" : "No");
          
          if (!token) {
            console.error("[Auth] No token received in login response");
            throw new Error('No authentication token received');
          }
          
          // Use the setToken method for consistent storage
          get().setToken(token);
          
          // Set authenticated flag
          set({ 
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          return true;
        } catch (error) {
          console.error('[Auth] Login error:', error);
          set({ 
            isAuthenticated: false, 
            token: null,
            error: error.message, 
            isLoading: false
          });
          return false;
        }
      },

      // Register user with improved token handling
      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });

          // Clear any existing tokens first
          get().setToken(null);
          localStorage.removeItem('auth_token');
          
          const response = await fetch('https://new-peer-1.onrender.com/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(userData),
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
          }

          // Store user in userStore
          if (data.user) {
            useUserStore.getState().setUser(data.user);
          }

          // Get token from response
          const token = data.token;
          
          // console.log("[Auth] Registration successful, token received:", token ? "Yes" : "No");
          
          if (!token) {
            console.error("[Auth] No token received in registration response");
            throw new Error('No authentication token received');
          }
          
          // Use setToken method for consistent storage
          get().setToken(token);
          
          set({
            isAuthenticated: true,
            isLoading: false,
            error: null
          });

          return true;
        } catch (error) {
          console.error('[Auth] Registration error:', error);
          set({ 
            isAuthenticated: false, 
            token: null,
            error: error.message, 
            isLoading: false
          });
          return false;
        }
      },

      // Logout user with thorough cleanup
      logout: async () => {
        try {
          set({ isLoading: true });

          try {
            // Try to call logout API but don't fail if it doesn't work
            await fetch('https://new-peer-1.onrender.com/api/auth/logout', {
              method: 'POST',
              credentials: 'include',
              headers: get().getAuthHeaders()
            });
          } catch (logoutError) {
            console.warn('[Auth] API logout failed, continuing with local logout:', logoutError);
          }

          // Clear user state
          useUserStore.getState().clearUser();

          // Clear all tokens
          localStorage.removeItem('auth_token');
          localStorage.removeItem('backup_token');
          
          // Use setToken to clear token in store
          get().setToken(null);

          set({
            isAuthenticated: false,
            isLoading: false,
            error: null
          });

          return true;
        } catch (error) {
          console.error('[Auth] Logout error:', error);
          // Still try to clean up locally even if API call failed
          localStorage.removeItem('auth_token');
          localStorage.removeItem('backup_token');
          get().setToken(null);
          
          set({ 
            isAuthenticated: false, 
            token: null,
            error: error.message, 
            isLoading: false
          });
          return false;
        }
      },

      // Check authentication status with improved token handling
      checkAuth: async () => {
        try {
          set({ isLoading: true });

          // Get current token using our getter
          const currentToken = get().getToken();
          
          const headers = {
            'Content-Type': 'application/json',
            ...(currentToken ? { 'Authorization': `Bearer ${currentToken}` } : {})
          };

          const response = await fetch('https://new-peer-1.onrender.com/api/users/profile', {
            credentials: 'include',
            headers: headers
          });

          if (!response.ok) {
            console.warn(`[Auth] Auth check failed with status: ${response.status}`);
            // Clear all auth state on failed check
            set({ isAuthenticated: false, isLoading: false });
            get().setToken(null);
            useUserStore.getState().clearUser();
            localStorage.removeItem('auth_token');
            localStorage.removeItem('backup_token');
            return false;
          }

          const userData = await response.json();
          useUserStore.getState().setUser(userData);

          // If API returned a new token, update it
          if (userData.token) {
            // console.log('[Auth] Received new token from profile API');
            get().setToken(userData.token);
          }

          set({ isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          console.error('[Auth] Authentication check error:', error);
          // Clear all auth state on error
          set({ isAuthenticated: false, isLoading: false });
          get().setToken(null);
          useUserStore.getState().clearUser();
          localStorage.removeItem('auth_token');
          localStorage.removeItem('backup_token');
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    }
  )
);

export default useAuthStore;