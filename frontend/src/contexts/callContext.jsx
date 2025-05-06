import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CallNotification from '../components/calls/CallNotification';
import { StreamChat } from 'stream-chat';

// Create the context
export const CallContext = createContext();

// Custom hook for consuming the context
export function useCallContext() {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error('useCallContext must be used within a CallContextProvider');
  }
  return context;
}

// Provider component
export function CallContextProvider({ children, chatClient, user, token }) {
  const [incoming, setIncoming] = useState(null);

  useEffect(() => {
    if (!user || !token) return;

    // Connect the user to Stream Chat
    chatClient.connectUser(
      { id: user._id, name: user.username },
      token
    ).catch(console.error);

    // Handler for incoming messages
    const handler = event => {
      const text = event.message.text || '';
      const from = event.message.user;
      if (text.startsWith('CALL_REQUEST:')) {
        const data = JSON.parse(text.replace('CALL_REQUEST:', ''));
        if (data.callerId !== user._id) {
          setIncoming({ caller: from, callId: data.callId });
        }
      }
    };

    chatClient.on('message.new', handler);
    return () => {
      chatClient.off('message.new', handler);
    };
  }, [chatClient, user, token]);

  return (
    <CallContext.Provider value={{ incoming, setIncoming, chatClient }}>
      {children}
    </CallContext.Provider>
  );
}

// Global notification component
export function GlobalCallNotification() {
  const { incoming, setIncoming, chatClient } = useCallContext();
  const navigate = useNavigate();

  if (!incoming) return null;

  const handleAccept = async () => {
    // Send CALL_ACCEPTED
    const channel = chatClient.channel('messaging', incoming.callId);
    await channel.sendMessage({
      text: `CALL_ACCEPTED:${JSON.stringify({
        userId: user._id,
        callId: incoming.callId,
        timestamp: new Date().toISOString()
      })}`
    });
    setIncoming(null);
    navigate(`/call/${incoming.callId}`);
  };

  const handleReject = async () => {
    // Send CALL_REJECTED
    const channel = chatClient.channel('messaging', incoming.callId);
    await channel.sendMessage({
      text: `CALL_REJECTED:${JSON.stringify({
        userId: user._id,
        callId: incoming.callId,
        timestamp: new Date().toISOString()
      })}`
    });
    setIncoming(null);
  };

  return (
    <CallNotification
      open={!!incoming}
      caller={incoming.caller}
      callId={incoming.callId}
      onClose={() => setIncoming(null)}
      onAccept={handleAccept}
      onReject={handleReject}
    />
  );
}
