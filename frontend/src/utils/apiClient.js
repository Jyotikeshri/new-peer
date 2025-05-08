import useAuthStore from '../contexts/authStore';

// Helper for attaching auth token to requests
export const getAuthHeader = () => {
  const token = useAuthStore.getState().getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Standard fetch with auth
export const fetchWithAuth = async (url, options = {}) => {
    const token = useAuthStore.getState().getToken();
    
    const headers = {
      ...options.headers,
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Keep cookies as fallback
    });
  
    return response;
};