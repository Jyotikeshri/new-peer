// src/services/streamNotificationService.js
import { StreamChat } from 'stream-chat';

class StreamNotificationService {
  constructor() {
    this.apiKey = import.meta.env.VITE_STREAM_API_KEY;
    this.client = null;
    this.currentUser = null;
  }

  // Initialize Stream client with user token
  async init(userId, userToken) {
    if (!this.apiKey) {
      console.error('Stream API key is missing');
      return false;
    }

    try {
      this.client = StreamChat.getInstance(this.apiKey);
      
      // Check if already connected with the same user
      if (this.client.userID === userId) {
        return true;
      }
      
      // Disconnect if already connected as a different user
      if (this.client.userID) {
        await this.disconnect();
      }
      
      // Connect with the current user
      await this.client.connectUser(
        { id: userId },
        userToken,
      );
      
      this.currentUser = userId;
      console.log('Connected to Stream as user:', userId);
      return true;
    } catch (error) {
      console.error('Error connecting to Stream:', error);
      return false;
    }
  }

  // Disconnect from Stream
  async disconnect() {
    if (this.client) {
      try {
        await this.client.disconnectUser();
        this.currentUser = null;
        return true;
      } catch (error) {
        console.error('Error disconnecting from Stream:', error);
        return false;
      }
    }
    return true;
  }

  // Send a friend request notification
  async sendFriendRequestNotification(targetUserId, senderData) {
    if (!this.client) {
      console.error('Stream client not initialized');
      return false;
    }

    try {
      // Create a notification channel for the target user
      const channel = this.client.channel('messaging', `notifications:${targetUserId}`, {
        members: [targetUserId],
        created_by_id: this.currentUser,
      });

      // Send a custom event for friend request
      await channel.sendEvent({
        type: 'friend_request',
        user: { _id: targetUserId },
        sender: {
          _id: this.currentUser,
          name: senderData.username,
          image: senderData.avatar,
        },
        message: `${senderData.username} sent you a friend request`,
      });

      return true;
    } catch (error) {
      console.error('Error sending friend request notification:', error);
      return false;
    }
  }

  // Send a friend request accepted notification
  async sendFriendRequestAcceptedNotification(targetUserId, userData) {
    if (!this.client) {
      console.error('Stream client not initialized');
      return false;
    }

    try {
      // Create a notification channel for the target user
      const channel = this.client.channel('messaging', `notifications:${targetUserId}`, {
        members: [targetUserId],
        created_by_id: this.currentUser,
      });

      // Send a custom event for friend request accepted
      await channel.sendEvent({
        type: 'friend_request_accepted',
        user: { _id: targetUserId },
        accepter: {
          _id: this.currentUser,
          name: userData.username,
          image: userData.avatar,
        },
        message: `${userData.username} accepted your friend request`,
      });

      return true;
    } catch (error) {
      console.error('Error sending friend request accepted notification:', error);
      return false;
    }
  }

  // Subscribe to notifications
  subscribeToNotifications(callback) {
    if (!this.client) {
      console.error('Stream client not initialized');
      return null;
    }

    // Listen for notification events
    const listener = this.client.on(event => {
      if (event.type === 'notification.message_new' || 
          event.type.startsWith('notification.')) {
        callback(event);
      }
    });

    return listener;
  }

  // Get Stream client instance
  getClient() {
    return this.client;
  }
}

// Create a singleton instance
const streamNotificationService = new StreamNotificationService();
export default streamNotificationService;