

// Let's create a socket.io service on the server side to handle connections

// services/socketService.js
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { Message, Conversation } from '../models/MessageModel.js';

let io;

// Initialize Socket.io with the HTTP server
export const initializeSocket = (httpServer) => {
io = new Server(httpServer, {
cors: {
origin: process.env.FRONTEND_URL || 'http://localhost:5173',
methods: ['GET', 'POST'],
credentials: true
}
});

// Authentication middleware
io.use((socket, next) => {
       const token = socket.handshake.auth.token;
     
       if (!token) {
         return next(new Error("Authentication error: Token not provided"));
       }
     
       // optional: verify token using jwt.verify
       try {
         const decoded = jwt.verify(token, process.env.JWT_SECRET);
         socket.user = decoded; // you can attach user data to socket
         next();
       } catch (err) {
         return next(new Error("Authentication error: Invalid token"));
       }
     });

// Connection handler
io.on('connection', (socket) => {
console.log(`User connected: ${socket.user._id}`);

// Add user to their own room for receiving direct messages
socket.join(socket.user._id.toString());

// Notify other users that this user is online
socket.broadcast.emit('user_status_change', {
userId: socket.user._id,
status: 'online'
});

// Handle joining conversation rooms
socket.on('join_conversation', async (conversationId) => {
try {
// Verify the user is a participant of this conversation
const conversation = await Conversation.findById(conversationId);

if (!conversation) {
socket.emit('error', { message: 'Conversation not found' });
return;
}

if (!conversation.participants.some(p => p.toString() === socket.user._id.toString())) {
socket.emit('error', { message: 'Not authorized to join this conversation' });
return;
}

// Join the conversation room
socket.join(conversationId);
console.log(`User ${socket.user._id} joined conversation: ${conversationId}`);
} catch (error) {
console.error('Error joining conversation:', error);
socket.emit('error', { message: 'Error joining conversation' });
}
});

// Handle new messages
socket.on('send_message', async (messageData) => {
  try {
    // Verify the message data
    if (!messageData.conversationId) {
      socket.emit('error', { message: 'Invalid message data' });
      return;
    }
    
    // Get the conversation
    const conversation = await Conversation.findById(messageData.conversationId);
    if (!conversation) {
      socket.emit('error', { message: 'Conversation not found' });
      return;
    }
    
    // Create message in DB if needed (this might already be done via API)
    // Only do this if your frontend calls socket directly instead of API
    
    // Emit to ALL users in the conversation INCLUDING the sender
    io.to(messageData.conversationId).emit('receive_message', {
      ...messageData,
      sender: {
        _id: socket.user._id,
        name: socket.user.name,
        username: socket.user.username,
        avatar: socket.user.avatar
      },
      createdAt: messageData.createdAt || new Date().toISOString()
    });
    
    // Confirm message sent to sender
    socket.emit('message_sent', { 
      id: messageData._id,
      status: 'sent'
    });
  } catch (error) {
    console.error('Error sending message via socket:', error);
    socket.emit('message_error', { 
      error: error.message,
      messageId: messageData._id
    });
  }
});

// Handle typing status
socket.on('typing', (data) => {
try {
if (!data.conversationId) {
return;
}

socket.to(data.conversationId).emit('user_typing', {
userId: socket.user._id,
username: socket.user.name,
conversationId: data.conversationId
});
} catch (error) {
console.error('Error with typing notification:', error);
}
});

// Handle read receipts
socket.on('mark_read', async (data) => {
try {
if (!data.conversationId || !data.messageId) {
return;
}

// Update read status in database
await Message.findByIdAndUpdate(
data.messageId,
{ $addToSet: { readBy: socket.user._id } }
);

// Emit to conversation participants
socket.to(data.conversationId).emit('message_read', {
userId: socket.user._id,
conversationId: data.conversationId,
messageId: data.messageId
});
} catch (error) {
console.error('Error marking message as read:', error);
}
});

// Handle disconnection
socket.on('disconnect', () => {
console.log(`User disconnected: ${socket.user._id}`);

// Update user's offline status
io.emit('user_status_change', {
userId: socket.user._id,
status: 'offline'
});
});
});

return io;
};

// Get the Socket.io instance
export const getIO = () => {
if (!io) {
throw new Error('Socket.io not initialized');
}
return io;
};