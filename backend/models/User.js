// Updated User model
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String },
  avatar: { type: String },
  interests: [{ type: String }],
  strengths: [{ type: String }],
  needsHelpWith: [{ type: String }],
  rating: { type: Number, default: 0 },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  github: { type: String },
  linkedin: { type: String },
  leetcode: { type: String },
  portfolio: { type: String },
  groups: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Group' }],
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
  isOnline: { type: Boolean, default: false },
  isOnboarded: { type: Boolean, required: true, default: false },
  
  // Friend request fields
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sentFriendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;