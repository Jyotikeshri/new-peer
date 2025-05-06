// src/contexts/matchingStore.js
import { create } from 'zustand';

const useMatchingStore = create((set, get) => ({
  // Matches state
  matches: [],
  filteredMatches: [],
  isLoading: false,
  error: null,
  currentFilter: 'best-matches',
  
  // Stats for the matching dashboard
  stats: {
    potentialMatches: 0,
    highCompatibility: 0,
    connectedWeek: 0,
    studySessions: 0
  },
  
  // Set current filter
  setFilter: (filter) => {
    set({ currentFilter: filter });
    get().applyFilter(filter);
  },
  
  // Apply filter to matches
  applyFilter: (filter) => {
    const { matches } = get();
    let filtered = [...matches];
    
    // Apply different filtering logic based on the selected filter
    switch (filter) {
      case 'best-matches':
        // Already sorted by score
        break;
      case 'interests':
        // Sort by similarity in interests (assuming this is reflected in the score)
        filtered.sort((a, b) => (b.interestScore || 0) - (a.interestScore || 0));
        break;
      case 'strengths':
        // Sort by complementary strengths
        filtered.sort((a, b) => (b.strengthScore || 0) - (a.strengthScore || 0));
        break;
      case 'needs-help':
        // Sort by how well the user can help with what the match needs
        filtered.sort((a, b) => (b.needsHelpScore || 0) - (a.needsHelpScore || 0));
        break;
      case 'school':
        // Put users from the same school first
        filtered.sort((a, b) => {
          const aSchool = a.user.school || '';
          const bSchool = b.user.school || '';
          const userSchool = get().userSchool || '';
          
          const aIsSameSchool = aSchool.toLowerCase() === userSchool.toLowerCase();
          const bIsSameSchool = bSchool.toLowerCase() === userSchool.toLowerCase();
          
          if (aIsSameSchool && !bIsSameSchool) return -1;
          if (!aIsSameSchool && bIsSameSchool) return 1;
          return b.score - a.score; // Default to score sorting
        });
        break;
      default:
        break;
    }
    
    set({ filteredMatches: filtered });
  },
  
  // Fetch all matches
  fetchMatches: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const response = await fetch('http://localhost:8000/api/users/matches', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch matches');
      }
      
      const matchesData = await response.json();
      
      // Process matches to add derived data
      const processedMatches = matchesData.map(match => ({
        ...match,
        // Normalize score to 0-1 range if not already
        score: match.score > 1 ? match.score / 4 : match.score, // Assuming max possible score is 4
        // Calculate sub-scores for different aspects (these would ideally come from the API)
        interestScore: Math.random() * 0.5 + 0.5, // Mock data between 0.5-1.0
        strengthScore: Math.random() * 0.5 + 0.5,
        needsHelpScore: Math.random() * 0.5 + 0.5,
        // Flag if already connected
        connected: match.user.friends && match.user.friends.includes(localStorage.getItem('userId'))
      }));
      
      // Calculate stats
      const highCompatibilityCount = processedMatches.filter(match => match.score > 0.9).length;
      
      // Set user school for school-based filtering
      const userSchool = processedMatches.length > 0 && processedMatches[0].user.school 
        ? processedMatches[0].user.school 
        : '';
      
      set({
        matches: processedMatches,
        filteredMatches: processedMatches, // Start with all matches
        userSchool,
        stats: {
          potentialMatches: processedMatches.length,
          highCompatibility: highCompatibilityCount,
          connectedWeek: 5, // Mock data - ideally from API
          studySessions: 12 // Mock data - ideally from API
        },
        isLoading: false
      });
      
      return processedMatches;
    } catch (error) {
      console.error('Error fetching matches:', error);
      set({ error: error.message, isLoading: false });
      return [];
    }
  },
  
  // Connect with a peer
  connectWithPeer: async (peerId) => {
    try {
      set({ isLoading: true, error: null });
      
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated');
      }
      
      const response = await fetch('http://localhost:8000/api/users/add-friend', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId,
          friendId: peerId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to connect with peer');
      }
      
      // Update the matches state to reflect the new connection
      set(state => {
        const updatedMatches = state.matches.map(match => 
          match.user._id === peerId 
            ? { ...match, connected: true } 
            : match
        );
        
        const updatedFilteredMatches = state.filteredMatches.map(match => 
          match.user._id === peerId 
            ? { ...match, connected: true } 
            : match
        );
        
        return {
          matches: updatedMatches,
          filteredMatches: updatedFilteredMatches,
          isLoading: false
        };
      });
      
      return true;
    } catch (error) {
      console.error('Error connecting with peer:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },
  
  // Disconnect from a peer
  disconnectFromPeer: async (peerId) => {
    try {
      set({ isLoading: true, error: null });
      
      // Note: You'd need to implement a disconnect/remove-friend API endpoint
      const response = await fetch('http://localhost:8000/api/users/remove-friend', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          friendId: peerId
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to disconnect from peer');
      }
      
      // Update the matches state to reflect the disconnection
      set(state => {
        const updatedMatches = state.matches.map(match => 
          match.user._id === peerId 
            ? { ...match, connected: false } 
            : match
        );
        
        const updatedFilteredMatches = state.filteredMatches.map(match => 
          match.user._id === peerId 
            ? { ...match, connected: false } 
            : match
        );
        
        return {
          matches: updatedMatches,
          filteredMatches: updatedFilteredMatches,
          isLoading: false
        };
      });
      
      return true;
    } catch (error) {
      console.error('Error disconnecting from peer:', error);
      set({ error: error.message, isLoading: false });
      return false;
    }
  },
  
  // Clear all matches data
  clearMatches: () => set({ 
    matches: [], 
    filteredMatches: [], 
    stats: {
      potentialMatches: 0,
      highCompatibility: 0,
      connectedWeek: 0,
      studySessions: 0
    }
  })
}));

export default useMatchingStore;
