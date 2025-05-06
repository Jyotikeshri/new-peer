import { StreamChat } from 'stream-chat';

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

export const sendCallNotification = async (channelId, callerId, callerName) => {
  try {
    const chatClient = StreamChat.getInstance(STREAM_API_KEY);
    
    if (!chatClient.user) {
      throw new Error('User not connected to chat');
    }
    
    const channel = chatClient.channel('messaging', channelId);
    
    const callData = {
      callerId,
      callerName,
      callId: channelId,
      timestamp: new Date().toISOString()
    };
    
    await channel.sendMessage({
      text: `CALL_NOTIFICATION:${JSON.stringify(callData)}`,
    });
    
    return true;
  } catch (error) {
    console.error('Error sending call notification:', error);
    return false;
  }
};

export const sendCallRejection = async (channelId, userId, callId) => {
  try {
    const chatClient = StreamChat.getInstance(STREAM_API_KEY);
    
    if (!chatClient.user) {
      throw new Error('User not connected to chat');
    }
    
    const channel = chatClient.channel('messaging', channelId);
    
    await channel.sendMessage({
      text: `CALL_REJECTED:${JSON.stringify({
        userId,
        callId,
        timestamp: new Date().toISOString()
      })}`,
    });
    
    return true;
  } catch (error) {
    console.error('Error sending call rejection:', error);
    return false;
  }
};

export default {
  sendCallNotification,
  sendCallRejection
};