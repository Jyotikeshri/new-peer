// src/utils/apiClient.js - FIXED VERSION
import useAuthStore from '../contexts/authStore';

/**
 * Enhanced fetch function that properly handles authentication
 * @param {string} url - The URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} - The fetch response
 */
export const fetchWithAuth = async (url, options = {}) => {
    // Get token using the store's getToken method
    const authStore = useAuthStore.getState();
    const token = authStore.token;
    
    // Double check token in localStorage as backup
    const backupToken = localStorage.getItem('backup_token');
    const effectiveToken = token || backupToken;
    
    // Prepare headers - IMPORTANT: Ensure content-type is set for POST requests
    const headers = {
        'Content-Type': options.method === 'POST' ? 'application/json' : 'application/x-www-form-urlencoded',
        ...options.headers,
    };
    
    // Add Authorization header if token exists
    if (effectiveToken) {
        headers['Authorization'] = `Bearer ${effectiveToken}`;
    }
    
    // Log request details for debugging
    // console.log(`[API] Request to ${url.split('/').pop()}`, {
    //     method: options.method || 'GET',
    //     hasToken: !!effectiveToken,
    //     withCredentials: options.credentials === 'include'
    // });
    
    try {
        // Ensure credentials are included for cross-origin requests
        const response = await fetch(url, {
            ...options,
            headers,
            credentials: options.credentials || 'include', // Default to include credentials
        });
        
        // Log response status
        // console.log(`[API] Response from ${url.split('/').pop()}:`, {
        //     status: response.status,
        //     ok: response.ok
        // });
        
        // If response indicates auth problem, trigger auth check
        if (response.status === 401) {
            console.warn('[API] Authentication failed (401), will try to refresh auth');
            
            // Try to refresh auth state after a short delay
            setTimeout(() => {
                authStore.checkAuth().catch(err => {
                    console.error('[API] Auth refresh failed:', err);
                    // Force logout if auth refresh failed
                    if (authStore.isAuthenticated) {
                        authStore.logout();
                    }
                });
            }, 100);
        }
        
        return response;
    } catch (error) {
        console.error(`[API] Fetch error for ${url}:`, error);
        throw error;
    }
};

/**
 * Gets authentication headers with the current token
 */
export const getAuthHeader = () => {
    const token = useAuthStore.getState().getToken();
    // console.log('[API] Getting auth header, token present:', !!token);
    return token ? { Authorization: `Bearer ${token}` } : {};
};