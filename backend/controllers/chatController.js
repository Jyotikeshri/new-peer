// controllers/chatController.js
import { generateStreamToken, createDirectChannel } from "../config/stream.js";

// Generate and return a Stream Chat token for the authenticated user
export async function getStreamToken(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const token = generateStreamToken(req.user.id);
    
    // Check if token is valid
    if (!token) {
      return res.status(500).json({ message: "Failed to generate Stream token" });
    }
    
    console.log(`Generated token for user: ${req.user.id}, token prefix: ${token.substring(0, 15)}...`);
    
    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error: " + error.message });
  }
}

// Create a direct message channel between two users
export async function createDirectMessageChannel(req, res) {
  try {
    const { targetUserId } = req.body;
    
    if (!targetUserId) {
      return res.status(400).json({ message: "Target user ID is required" });
    }
    
    // Get the current user ID from the authentication middleware
    const currentUserId = req.user.id;
    
    // Create the channel
    const channelId = await createDirectChannel(currentUserId, targetUserId);
    
    res.status(200).json({ channelId });
  } catch (error) {
    console.error("Error creating direct message channel:", error);
    res.status(500).json({ message: "Failed to create direct message channel" });
  }
}