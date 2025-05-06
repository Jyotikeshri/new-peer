// src/utils/streamService.js
// ------------------------------
import { StreamChat } from 'stream-chat';
import useUserStore from '../contexts/userStore';

export const client = StreamChat.getInstance(import.meta.env.VITE_STREAM_API_KEY);

const fetchStreamToken = async () => {
  const response = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/chat/token`,
    { credentials: 'include' }
  );
  if (!response.ok) throw new Error(`Failed to get stream token: ${response.status}`);
  const { token } = await response.json();
  return token;
};

export const connectStreamUser = async () => {
  const currentUser = useUserStore.getState().user;
  if (!currentUser) throw new Error('No authenticated user');
  const token = await fetchStreamToken();
  await client.connectUser(
    { id: currentUser._id, name: currentUser.username, image: currentUser.avatar || '' },
    token
  );
};

export const subscribeToStreamEvents = (addNotification) => {
  const handleNewMessage = (event) =>
    addNotification({
      id: event.message.id,
      type: 'message',
      text: `${event.user.name} sent you a message: ${event.message.text}`,
      channelId: event.channel.id,
      createdAt: event.message.created_at,
      isRead: false,
    });

  const handleFriendRequest = (event) =>
    addNotification({
      id: `fr-${event.data.requestId}`,
      type: 'friend_request',
      text: `${event.user.name} sent you a friend request`,  
      userId: event.user.id,
      createdAt: new Date().toISOString(),
      isRead: false,
    });

  const handleFriendAccepted = (event) =>
    addNotification({
      id: `fa-${event.data.requestId}`,
      type: 'friend_accept',
      text: `${event.user.name} accepted your friend request`,
      userId: event.user.id,
      createdAt: new Date().toISOString(),
      isRead: false,
    });

  client.on('message.new', handleNewMessage);
  client.on('friend.request', handleFriendRequest);
  client.on('friend.accepted', handleFriendAccepted);

  return () => {
    client.off('message.new', handleNewMessage);
    client.off('friend.request', handleFriendRequest);
    client.off('friend.accepted', handleFriendAccepted);
  };
};