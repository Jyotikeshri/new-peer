// config/stream.js
import { StreamChat } from "stream-chat";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or Secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("Error upserting Stream user:", error);
  }
};

export const generateStreamToken = (userId) => {
  try {
    // ensure userId is a string
    const userIdStr = userId.toString();
    
    // Set expiration to one hour from now (in seconds)
    const expirationTime = Math.floor(Date.now() / 1000) + (60 * 60);
    
    // Pass the expiration time directly
    const token = streamClient.createToken(userIdStr, expirationTime);
    
    return token;
  } catch (error) {
    console.error("Error generating Stream token:", error);
    throw error;
  }
};

// Helper function to create a direct message channel
export const createDirectChannel = async (user1Id, user2Id) => {
  try {
    // Convert IDs to strings and sort them for consistent channel ID
    const members = [user1Id.toString(), user2Id.toString()];
    const channelId = members.sort().join('__');
    
    // Check if channel already exists
    try {
      const existingChannel = await streamClient.queryChannels({ 
        id: channelId,
        type: 'messaging' 
      });
      
      if (existingChannel && existingChannel.length > 0) {
        // Channel already exists, ensure both users are members
        await existingChannel[0].addMembers(members);
        return channelId;
      }
    } catch (error) {
      // Channel doesn't exist, continue to creation
      console.log("Channel doesn't exist yet, creating new one");
    }
    
    // Create a new channel with both users as members
    const channel = streamClient.channel('messaging', channelId, {
      members: members,
      created_by_id: user1Id.toString()
    });
    
    // Create the channel
    await channel.create();
    
    return channelId;
  } catch (error) {
    console.error("Error creating/updating direct channel:", error);
    throw error;
  }
};

export default streamClient;