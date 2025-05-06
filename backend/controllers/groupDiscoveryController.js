// controllers/groupDiscoveryController.js
import Group from '../models/Group.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import streamClient from '../config/stream.js';

const { ObjectId } = mongoose.Types;

/**
 * Get recommended groups based on user profile
 * @route GET /api/groups/discovery/recommended
 * @access Private
 */
export async function getRecommendedGroups(req, res) {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Extract user interests, skills, and learning goals
    const userInterests = user.interests || [];
    const userStrengths = user.strengths || [];
    const userNeeds = user.needsHelpWith || [];
    
    // Build a query to find groups that match user's profile
    // Using MongoDB aggregation for more sophisticated matching
    const recommendedGroups = await Group.aggregate([
      // Match groups the user isn't already a member of
      { 
        $match: { 
          members: { $not: { $elemMatch: { $eq: new ObjectId(req.user.id) } } },
          isPublic: true
        } 
      },
      // Add fields for scoring
      { 
        $addFields: {
          // Score based on topic matches with user interests
          interestScore: {
            $size: {
              $setIntersection: ["$topics", userInterests]
            }
          },
          // Score based on topic matches with user strengths
          strengthScore: {
            $size: {
              $setIntersection: ["$topics", userStrengths]
            }
          },
          // Score based on topic matches with user learning needs
          needsScore: {
            $size: {
              $setIntersection: ["$topics", userNeeds]
            }
          }
        } 
      },
      // Calculate total relevance score
      {
        $addFields: {
          relevanceScore: {
            $add: [
              "$interestScore",
              { $multiply: ["$strengthScore", 0.8] },
              { $multiply: ["$needsScore", 1.2] }, // Prioritize learning needs
            ]
          }
        }
      },
      // Sort by relevance score (descending)
      { $sort: { relevanceScore: -1 } },
      // Limit to top 20 recommendations
      { $limit: 20 },
      // Lookup group members
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'memberDetails'
        }
      },
      // Project only necessary fields
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          topics: 1,
          avatar: 1,
          coverImage: 1,
          channelId: 1,
          members: {
            $map: {
              input: { $slice: ["$memberDetails", 10] }, // Limit to 10 members for preview
              as: "member",
              in: {
                _id: "$$member._id",
                username: "$$member.username",
                avatar: "$$member.avatar"
              }
            }
          },
          memberCount: { $size: "$members" },
          createdAt: 1,
          interestScore: 1,
          strengthScore: 1,
          needsScore: 1,
          relevanceScore: 1,
          isPopular: { $cond: [{ $gte: [{ $size: "$members" }, 10] }, true, false] }
        }
      }
    ]);
    
    return res.json(recommendedGroups);
  } catch (error) {
    console.error('Error getting recommended groups:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Get trending groups based on activity and growth
 * @route GET /api/groups/discovery/trending
 * @access Private
 */
export async function getTrendingGroups(req, res) {
  try {
    // First, try to get active groups from Stream
    let activeChannels = [];
    try {
      // Query recent messages from all group channels - fixing the Stream query
      // Stream doesn't support $contains, use a different approach
      const filter = { type: 'messaging' };
      const sort = { last_message_at: -1 };
      const options = { limit: 30, state: false, message_limit: 0 };
      
      // Get channels from Stream
      const channelsResponse = await streamClient.queryChannels(filter, sort, options);
      
      // Filter for group channels client-side
      if (channelsResponse && channelsResponse.length > 0) {
        activeChannels = channelsResponse
          .filter(channel => channel.id && channel.id.includes('group-'))
          .map(channel => channel.id);
      }
    } catch (streamError) {
      console.warn('Warning: Could not get trending channels from Stream:', streamError);
    }
    
    // Query trending groups from database
    const trendingGroups = await Group.aggregate([
      {
        $match: {
          isPublic: true,
          // Include either active channels or any public group
          $or: [
            { channelId: { $in: activeChannels } },
            { members: { $not: { $elemMatch: { $eq: new ObjectId(req.user.id) } } } }
          ]
        }
      },
      // Add trend score based on member count and join rate
      {
        $addFields: {
          // Boost score for groups active on Stream
          streamActivityBoost: {
            $cond: [
              { $in: ["$channelId", activeChannels] },
              10, // Boost score for active channels
              0
            ]
          }
        }
      },
      // Add trend score calculation
      {
        $addFields: {
          trendScore: {
            $add: [
              { $size: "$members" }, // Base score on member count
              "$streamActivityBoost" // Add activity boost
            ]
          }
        }
      },
      // Sort by trend score
      { $sort: { trendScore: -1 } },
      // Limit results
      { $limit: 12 },
      // Lookup group members
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'memberDetails'
        }
      },
      // Project fields for response
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          topics: 1,
          avatar: 1,
          coverImage: 1,
          channelId: 1,
          members: {
            $map: {
              input: { $slice: ["$memberDetails", 10] },
              as: "member",
              in: {
                _id: "$$member._id",
                username: "$$member.username",
                avatar: "$$member.avatar"
              }
            }
          },
          memberCount: { $size: "$members" },
          createdAt: 1,
          isPopular: true
        }
      }
    ]);
    
    return res.json(trendingGroups);
  } catch (error) {
    console.error('Error getting trending groups:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Get personalized group recommendations based on learning goals
 * @route GET /api/groups/discovery/for-you
 * @access Private
 */
export async function getForYouGroups(req, res) {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's learning goals and project interests
    const learningGoals = user.needsHelpWith || [];
    const currentProjects = user.projects || [];
    
    // Extract technologies from user's projects
    let projectTechnologies = [];
    if (currentProjects.length > 0) {
      projectTechnologies = currentProjects.reduce((techs, project) => {
        if (project.technologies && Array.isArray(project.technologies)) {
          return [...techs, ...project.technologies];
        }
        return techs;
      }, []);
    }
    
    // Combine learning goals and project technologies
    const relevantTopics = [...new Set([...learningGoals, ...projectTechnologies])];
    
    // Query for groups that match user's current learning and project needs
    const forYouGroups = await Group.aggregate([
      // Match groups user isn't in
      {
        $match: {
          members: { $not: { $elemMatch: { $eq: new ObjectId(req.user.id) } } },
          isPublic: true
        }
      },
      // Calculate topic match score
      {
        $addFields: {
          topicMatchCount: {
            $size: {
              $setIntersection: ["$topics", relevantTopics]
            }
          }
        }
      },
      // Only include groups with at least one matching topic
      {
        $match: {
          topicMatchCount: { $gt: 0 }
        }
      },
      // Add additional personalization factors
      {
        $addFields: {
          // Check if group has members with similar skill level
          skillLevelFit: {
            $cond: [
              { $eq: ["$skillLevel", user.skillLevel] },
              3,  // Bonus for matching skill level
              0
            ]
          },
          // Boost for groups focused on learning
          learningFocus: {
            $cond: [
              { $eq: ["$groupType", "learning"] },
              2,  // Bonus for learning-focused groups
              0
            ]
          }
        }
      },
      // Calculate final personalization score
      {
        $addFields: {
          personalScore: {
            $add: [
              "$topicMatchCount",
              "$skillLevelFit",
              "$learningFocus"
            ]
          }
        }
      },
      // Sort by personalization score
      { $sort: { personalScore: -1 } },
      // Limit results
      { $limit: 12 },
      // Lookup group members
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'memberDetails'
        }
      },
      // Project fields for response
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          topics: 1,
          avatar: 1,
          coverImage: 1,
          channelId: 1,
          members: {
            $map: {
              input: { $slice: ["$memberDetails", 10] },
              as: "member",
              in: {
                _id: "$$member._id",
                username: "$$member.username",
                avatar: "$$member.avatar"
              }
            }
          },
          memberCount: { $size: "$members" },
          createdAt: 1,
          isPopular: { $cond: [{ $gte: [{ $size: "$members" }, 10] }, true, false] }
        }
      }
    ]);
    
    return res.json(forYouGroups);
  } catch (error) {
    console.error('Error getting personalized groups:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Get groups where user's friends are members
 * @route GET /api/groups/discovery/with-friends
 * @access Private
 */
export async function getWithFriendsGroups(req, res) {
  try {
    const user = await User.findById(req.user.id).populate('friends');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get user's friends
    const friendIds = user.friends ? user.friends.map(friend => friend._id) : [];
    
    if (friendIds.length === 0) {
      return res.json([]);
    }
    
    // Convert friend IDs to ObjectId instances
    const friendObjectIds = friendIds.map(id => new ObjectId(id.toString()));
    
    // Find groups where at least one friend is a member
    const friendGroups = await Group.aggregate([
      {
        $match: {
          isPublic: true,
          // Group has at least one friend as member but user is not a member
          members: { 
            $in: friendObjectIds,
            $not: { $elemMatch: { $eq: new ObjectId(req.user.id) } }
          }
        }
      },
      // Count how many friends are in each group
      {
        $addFields: {
          friendCount: {
            $size: {
              $setIntersection: [
                "$members",
                friendObjectIds
              ]
            }
          }
        }
      },
      // Sort by friend count (descending)
      { $sort: { friendCount: -1 } },
      // Limit results
      { $limit: 12 },
      // Lookup group members
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'memberDetails'
        }
      },
      // Project fields for response
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          topics: 1,
          avatar: 1,
          coverImage: 1,
          channelId: 1,
          members: {
            $map: {
              input: { $slice: ["$memberDetails", 10] },
              as: "member",
              in: {
                _id: "$$member._id",
                username: "$$member.username",
                avatar: "$$member.avatar"
              }
            }
          },
          memberCount: { $size: "$members" },
          friendCount: 1,
          createdAt: 1,
          isPopular: { $cond: [{ $gte: [{ $size: "$members" }, 10] }, true, false] }
        }
      }
    ]);
    
    return res.json(friendGroups);
  } catch (error) {
    console.error('Error getting groups with friends:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Search groups by name, description, or topics
 * @route GET /api/groups/discovery/search
 * @access Private
 */
export async function searchGroups(req, res) {
  try {
    const searchQuery = req.query.q;
    
    if (!searchQuery) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Prepare search regex (case insensitive)
    const searchRegex = new RegExp(searchQuery, 'i');
    
    // Search for groups matching the query
    const searchResults = await Group.aggregate([
      {
        $match: {
          isPublic: true,
          $or: [
            { name: searchRegex },
            { description: searchRegex },
            { topics: searchRegex }
          ]
        }
      },
      // Add search relevance score
      {
        $addFields: {
          nameMatch: { $cond: [{ $regexMatch: { input: "$name", regex: searchRegex } }, 3, 0] },
          descMatch: { $cond: [{ $regexMatch: { input: "$description", regex: searchRegex } }, 1, 0] },
          topicMatch: {
            $size: {
              $filter: {
                input: "$topics",
                as: "topic",
                cond: { $regexMatch: { input: "$$topic", regex: searchRegex } }
              }
            }
          }
        }
      },
      // Calculate total match score
      {
        $addFields: {
          matchScore: { $add: ["$nameMatch", "$descMatch", { $multiply: ["$topicMatch", 2] }] }
        }
      },
      // Sort by match score
      { $sort: { matchScore: -1 } },
      // Limit results
      { $limit: 20 },
      // Lookup group members
      {
        $lookup: {
          from: 'users',
          localField: 'members',
          foreignField: '_id',
          as: 'memberDetails'
        }
      },
      // Project fields for response
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          topics: 1,
          avatar: 1,
          coverImage: 1,
          channelId: 1,
          members: {
            $map: {
              input: { $slice: ["$memberDetails", 10] },
              as: "member",
              in: {
                _id: "$$member._id",
                username: "$$member.username",
                avatar: "$$member.avatar"
              }
            }
          },
          memberCount: { $size: "$members" },
          createdAt: 1,
          isPopular: { $cond: [{ $gte: [{ $size: "$members" }, 10] }, true, false] }
        }
      }
    ]);
    
    return res.json(searchResults);
  } catch (error) {
    console.error('Error searching groups:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}

/**
 * Join a group
 * @route POST /api/groups/discovery/join
 * @access Private
 */
export async function joinGroup(req, res) {
  try {
    const { groupId } = req.body;
    
    if (!groupId) {
      return res.status(400).json({ message: 'Group ID is required' });
    }
    
    // Find the group
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }
    
    // Check if user is already a member
    if (group.members.some(id => id.toString() === req.user.id)) {
      return res.status(400).json({ message: 'You are already a member of this group' });
    }
    
    // Check if group is private and user is not invited
    if (!group.isPublic && !group.invites.some(id => id.toString() === req.user.id)) {
      return res.status(403).json({ message: 'This is a private group. You need an invitation to join.' });
    }
    
    // Check if group is at capacity
    if (group.isAtCapacity && group.isAtCapacity()) {
      return res.status(400).json({ message: 'This group is already at maximum capacity.' });
    }
    
    // Add user to group members
    group.members.push(req.user.id);
    
    // If user was invited, remove from invites
    if (group.invites.some(id => id.toString() === req.user.id)) {
      group.invites = group.invites.filter(id => id.toString() !== req.user.id);
    }
    
    await group.save();
    
    // Add user to Stream Chat channel
    try {
      // Get the user from database
      const user = await User.findById(req.user.id);
      
      // Add user to the Stream Chat channel
      const channel = streamClient.channel('messaging', group.channelId);
      
      await channel.addMembers([req.user.id.toString()], {
        text: `${user.username} joined the group`,
        user_id: req.user.id.toString()
      });
      
      // Send a welcome message
      await channel.sendMessage({
        text: `Welcome to the group, ${user.username}! 👋`,
        user_id: 'system',
        pinned: true,
        pinned_by: 'system',
        pinned_at: new Date().toISOString()
      });
    } catch (streamErr) {
      console.error('Error adding user to Stream channel:', streamErr);
      // Continue anyway as the user is already added to the group in our database
    }
    
    // Also add group to user's groups array
    await User.findByIdAndUpdate(req.user.id, {
      $addToSet: { groups: groupId }
    });
    
    return res.json({ 
      success: true, 
      message: 'Successfully joined the group',
      channelId: group.channelId
    });
  } catch (error) {
    console.error('Error joining group:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}