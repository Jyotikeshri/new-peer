// src/hooks/useStreamClient.js
import { useState, useEffect } from 'react';
import { StreamChat } from 'stream-chat';

export function useStreamClient(userId, userName) {
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Don't attempt to connect without user info
    if (!userId || !userName) {
      setLoading(false);
      return;
    }

    let chatClient;
    let isMounted = true; // For cleanup/unmount handling

    async function connectToStream() {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch token from your backend
        console.log('Fetching Stream token...');
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/chat/token`,
          { credentials: 'include' }
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch token: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        
        if (!data.token) {
          throw new Error('No token returned from the server');
        }

        console.log('Token received, connecting to Stream...');

        // 2. Instantiate & connect
        chatClient = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);
        
        await chatClient.connectUser(
          { 
            id: userId, 
            name: userName 
          }, 
          data.token
        );
        
        console.log('Successfully connected to Stream');
        
        // Only update state if component is still mounted
        if (isMounted) {
          setClient(chatClient);
          setError(null);
        }
      } catch (err) {
        console.error('Error connecting to Stream:', err);
        
        // Only update state if component is still mounted
        if (isMounted) {
          setError(err);
        }
        
        // Cleanup if initialization failed
        if (chatClient) {
          chatClient.disconnectUser().catch(e => 
            console.error('Error disconnecting after failed connection:', e)
          );
        }
      } finally {
        // Only update state if component is still mounted
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    connectToStream();

    // Cleanup function
    return () => {
      isMounted = false; // Prevent state updates after unmount
      
      if (chatClient) {
        console.log('Disconnecting from Stream...');
        chatClient.disconnectUser().catch(err => 
          console.error('Error disconnecting from Stream:', err)
        );
      }
    };
  }, [userId, userName]);

  // Return an object with all states
  return { client, loading, error };
}