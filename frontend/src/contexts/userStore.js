// src/contexts/userStore.js (updated with friends state)
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      error: null,
      friends: [], // Added separate friends array for better management

      // Basic user data methods
      setUser: (userData) => {
        // Save to localStorage when setting user
        if (userData) {
          localStorage.setItem("user", JSON.stringify(userData));
        }
        set({ user: userData, error: null });
      },
      
      clearUser: () => {
        // Clear from localStorage when clearing user
        localStorage.removeItem("user");
        set({ user: null, error: null, friends: [] });
      },
      
      updateUser: (updateData) => {
        set((state) => {
          const updatedUser = { ...state.user, ...updateData };
          // Update localStorage with the new user data
          localStorage.setItem("user", JSON.stringify(updatedUser));
          return { user: updatedUser, error: null };
        });
      },
      
      // Friends management methods
      setFriends: (friendsData) => set({ friends: friendsData }),
      
      // Profile methods
      updateAvatar: (avatarUrl) => set((state) => { 
        if (!state.user) return { user: null };
        
        const updatedUser = { ...state.user, avatar: avatarUrl };
        // Update localStorage with the new avatar
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return { user: updatedUser };
      }),

      fetchUser: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/profile`,
            { credentials: 'include' }
          );
          if (!response.ok) throw new Error('Failed to fetch user data');
          const userData = await response.json();
          
          // Save to localStorage and update state
          localStorage.setItem("user", JSON.stringify(userData));
          set({ user: userData, isLoading: false });
          
          // After fetching user, fetch detailed friends data
          const friendsResponse = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/friends`,
            { credentials: 'include' }
          ).catch(err => {
            console.error('Error fetching friends:', err);
            return null;
          });
          
          if (friendsResponse && friendsResponse.ok) {
            const friendsData = await friendsResponse.json();
            set({ friends: friendsData });
          }
          
          return userData;
        } catch (err) {
          console.error('Error fetching user data:', err);
          set({ error: err.message, isLoading: false });
          return null;
        }
      },

      updateProfile: async (profileData) => {
        try {
          set({ isLoading: true, error: null });
          const isFormData = profileData instanceof FormData;
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/profile`,
            {
              method: 'PUT',
              headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: isFormData ? profileData : JSON.stringify(profileData),
            }
          );
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to update profile');
          }
          const updatedUser = await response.json();
          set({ user: updatedUser, isLoading: false });
          return updatedUser;
        } catch (err) {
          console.error('Error updating profile:', err);
          set({ error: err.message, isLoading: false });
          return null;
        }
      },

      // Friend request methods
      sendFriendRequest: async (targetUserId) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/friend-request`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ targetUserId }),
            }
          );
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to send friend request');
          }
          
          // Update the local state to reflect the pending request
          set((state) => ({
            user: {
              ...state.user,
              sentFriendRequests: [...(state.user.sentFriendRequests || []), targetUserId]
            },
            isLoading: false,
          }));
          
          return true;
        } catch (err) {
          console.error('Error sending friend request:', err);
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      acceptFriendRequest: async (requesterId) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/friend-request/accept`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ requesterId }),
            }
          );
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to accept friend request');
          }
          
          // Get the accepted friend's details
          const friendResponse = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/${requesterId}`,
            { credentials: 'include' }
          );
          
          let newFriend = null;
          if (friendResponse.ok) {
            newFriend = await friendResponse.json();
          }
          
          // Update local state: remove from requests, add to friends
          set((state) => {
            // Get current lists, ensuring they're arrays
            const friendRequests = Array.isArray(state.user.friendRequests) 
              ? state.user.friendRequests 
              : [];
            const userFriends = Array.isArray(state.user.friends) 
              ? state.user.friends 
              : [];
            const storedFriends = Array.isArray(state.friends)
              ? state.friends
              : [];
            
            return {
              user: {
                ...state.user,
                friends: [...userFriends, requesterId],
                friendRequests: friendRequests.filter(id => id !== requesterId),
              },
              // If we got the friend details, add them to friends array
              friends: newFriend 
                ? [...storedFriends, newFriend] 
                : storedFriends,
              isLoading: false,
            };
          });
          
          return true;
        } catch (err) {
          console.error('Error accepting friend request:', err);
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      rejectFriendRequest: async (requesterId) => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/friend-request/reject`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ requesterId }),
            }
          );
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to reject friend request');
          }
          
          // Update local state: remove from requests
          set((state) => ({
            user: {
              ...state.user,
              friendRequests: (state.user.friendRequests || []).filter(id => id !== requesterId),
            },
            isLoading: false,
          }));
          
          return true;
        } catch (err) {
          console.error('Error rejecting friend request:', err);
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      addFriend: async (friendId) => {
        try {
          set({ isLoading: true, error: null });
          const { user } = get();
          if (!user) throw new Error('Authentication required');
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/add-friend`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ userId: user._id, friendId }),
            }
          );
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to add friend');
          }
          
          // Get the new friend's details
          const friendResponse = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/${friendId}`,
            { credentials: 'include' }
          );
          
          let newFriend = null;
          if (friendResponse.ok) {
            newFriend = await friendResponse.json();
          }
          
          set((state) => ({
            user: { 
              ...state.user, 
              friends: [...(state.user.friends || []), friendId] 
            },
            // If we got the friend details, add them to friends array
            friends: newFriend 
              ? [...state.friends, newFriend] 
              : state.friends,
            isLoading: false,
          }));
          
          return true;
        } catch (err) {
          console.error('Error adding friend:', err);
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      removeFriend: async (friendId) => {
        try {
          set({ isLoading: true, error: null });
          const { user } = get();
          if (!user) throw new Error('Authentication required');
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/remove-friend`,
            {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ userId: user._id, friendId }),
            }
          );
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to remove friend');
          }
          
          set((state) => ({
            user: {
              ...state.user,
              friends: (state.user.friends || []).filter(id => {
                // Handle both string IDs and object IDs with _id property
                if (typeof id === 'string') {
                  return id !== friendId;
                }
                return id._id !== friendId;
              }),
            },
            // Also remove from friends array
            friends: state.friends.filter(friend => friend._id !== friendId),
            isLoading: false,
          }));
          
          return true;
        } catch (err) {
          console.error('Error removing friend:', err);
          set({ error: err.message, isLoading: false });
          return false;
        }
      },

      // Badge methods
      fetchBadges: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/get-badge`,
            { credentials: 'include' }
          );
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch badges');
          }
          const badgesData = await response.json();
          set((state) => ({ 
            user: { ...state.user, badges: badgesData }, 
            isLoading: false 
          }));
          return badgesData;
        } catch (err) {
          console.error('Error fetching badges:', err);
          set({ error: err.message, isLoading: false });
          return null;
        }
      },
      
      // Fetch just friends data
      fetchFriends: async () => {
        try {
          set({ isLoading: true, error: null });
          const response = await fetch(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'}/users/friends`,
            { credentials: 'include' }
          );
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch friends');
          }
          const friendsData = await response.json();
          set({ friends: friendsData, isLoading: false });
          return friendsData;
        } catch (err) {
          console.error('Error fetching friends:', err);
          set({ error: err.message, isLoading: false });
          return null;
        }
      },
    }),
    {
      name: 'user-storage',
      partialize: (state) => ({ 
        user: state.user,
        friends: state.friends
      }),
    }
  )
);

export default useUserStore;