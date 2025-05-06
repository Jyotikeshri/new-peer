// src/contexts/authStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import useUserStore from './userStore';

// Define the auth store with improved persistence
const useAuthStore = create(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      token: null,
      isLoading: false,
      error: null,

      // Set authentication status manually
      setAuthenticated: (status) => set({ isAuthenticated: status }),

      // Login user
      login: async (email, password) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await fetch('http://localhost:8000/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include', // Important for cookie-based auth
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

          // Explicitly handle token storage
          const token = data.token;
          
          // For debugging - remove in production
          console.log("Login successful, received token:", token ? "Token received" : "No token in response");

          // Set token in the store
          set({ 
            isAuthenticated: true,
            token: token,
            isLoading: false,
            error: null
          });

          // Backup in localStorage (as fallback)
          if (token) {
            localStorage.setItem('backup_token', token);
          }

          return true;
        } catch (error) {
          console.error('Login error:', error);
          set({ error: error.message, isLoading: false, isAuthenticated: false });
          return false;
        }
      },

      // Register user
      register: async (userData) => {
        try {
          set({ isLoading: true, error: null });

          const response = await fetch('http://localhost:8000/api/auth/register', {
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

          // Explicitly handle token storage
          const token = data.token;
          
          // For debugging - remove in production
          console.log("Registration successful, received token:", token ? "Token received" : "No token in response");

          set({
            isAuthenticated: true,
            token: token,
            isLoading: false,
            error: null
          });

          // Backup in localStorage (as fallback)
          if (token) {
            localStorage.setItem('backup_token', token);
          }

          return true;
        } catch (error) {
          console.error('Registration error:', error);
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      // Logout user
      logout: async () => {
        try {
          set({ isLoading: true });

          await fetch('http://localhost:8000/api/auth/logout', {
            method: 'POST',
            credentials: 'include',
          });

          useUserStore.getState().clearUser();

          // Clear token backup
          localStorage.removeItem('backup_token');

          set({
            isAuthenticated: false,
            token: null,
            isLoading: false,
            error: null
          });

          return true;
        } catch (error) {
          console.error('Logout error:', error);
          set({ error: error.message, isLoading: false });
          return false;
        }
      },

      // Check authentication status and refresh token if needed
      checkAuth: async () => {
        try {
          set({ isLoading: true });

          const response = await fetch('http://localhost:8000/api/users/profile', {
            credentials: 'include',
            headers: {
              // Try to send token if we have it in the store
              ...(get().token ? { 'Authorization': `Bearer ${get().token}` } : {})
            }
          });

          if (!response.ok) {
            set({ isAuthenticated: false, isLoading: false, token: null });
            useUserStore.getState().clearUser();
            localStorage.removeItem('backup_token');
            return false;
          }

          const userData = await response.json();
          useUserStore.getState().setUser(userData);

          // If the API response includes a token, update it
          if (userData.token) {
            set({ token: userData.token });
            localStorage.setItem('backup_token', userData.token);
          } else {
            // If no token in response but we have a backup, restore it
            const backupToken = localStorage.getItem('backup_token');
            if (backupToken && !get().token) {
              set({ token: backupToken });
            }
          }

          set({ isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          console.error('Authentication check error:', error);
          set({ isAuthenticated: false, isLoading: false, token: null });
          useUserStore.getState().clearUser();
          localStorage.removeItem('backup_token');
          return false;
        }
      },

      // Get token with fallback to localStorage if store value is null
      getToken: () => {
        const storeToken = get().token;
        if (storeToken) return storeToken;
        
        // Try to get from backup in localStorage
        const backupToken = localStorage.getItem('backup_token');
        if (backupToken) {
          // Restore the token to the store
          set({ token: backupToken });
          return backupToken;
        }
        
        return null;
      },

      // Set token manually
      setToken: (token) => {
        set({ token });
        if (token) {
          localStorage.setItem('backup_token', token);
        } else {
          localStorage.removeItem('backup_token');
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage), // Explicitly using localStorage
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    }
  )
);

export default useAuthStore;