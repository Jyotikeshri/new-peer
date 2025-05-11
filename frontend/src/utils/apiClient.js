// src/utils/apiClient.js
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
    
    // Create a copy of the options to avoid mutating the original
    const finalOptions = { ...options };
    
    // IMPORTANT: Set headers based on the content type
    // Don't set Content-Type for FormData (let browser handle it)
    const headers = {};
    
    // If the request has a body and it's FormData, don't set Content-Type
    // Otherwise set the appropriate Content-Type based on the method and body
    if (!(finalOptions.body instanceof FormData)) {
        if (finalOptions.method === 'POST' || finalOptions.method === 'PUT' || finalOptions.method === 'PATCH') {
            headers['Content-Type'] = 'application/json';
        }
    }
    
    // Add any custom headers
    if (options.headers) {
        Object.assign(headers, options.headers);
    }
    
    // Add Authorization header if token exists
    if (effectiveToken) {
        headers['Authorization'] = `Bearer ${effectiveToken}`;
    }
    
    // Set the headers in finalOptions
    finalOptions.headers = headers;
    
    // If the body is an object but not FormData, stringify it
    if (finalOptions.body && typeof finalOptions.body === 'object' && !(finalOptions.body instanceof FormData)) {
        finalOptions.body = JSON.stringify(finalOptions.body);
    }
    
    // Ensure credentials are included for cross-origin requests
    finalOptions.credentials = finalOptions.credentials || 'include';
    
    try {
        // Log request details for debugging (uncomment if needed)
        /*
        console.log(`[API] Request to ${url.split('/').pop()}`, {
            method: finalOptions.method || 'GET',
            hasToken: !!effectiveToken,
            withCredentials: finalOptions.credentials === 'include',
            isFormData: finalOptions.body instanceof FormData
        });
        */
        
        const response = await fetch(url, finalOptions);
        
        // Log response status (uncomment if needed)
        /*
        console.log(`[API] Response from ${url.split('/').pop()}:`, {
            status: response.status,
            ok: response.ok
        });
        */
        
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