// models/Group.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const GroupSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  topics: {
    type: [String],
    default: []
  },
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  moderators: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  avatar: {
    type: String,
    default: null
  },
  // Store Cloudinary public_id for avatar
  avatarPublicId: {
    type: String,
    default: null
  },
  coverImage: {
    type: String,
    default: null
  },
  // Store Cloudinary public_id for cover image
  coverImagePublicId: {
    type: String,
    default: null
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  invites: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  channelId: {
    type: String,
    required: true,
    unique: true
  },
  rules: {
    type: String,
    default: ''
  },
  skillLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'all'],
    default: 'all'
  },
  groupType: {
    type: String,
    enum: ['learning', 'project', 'networking', 'general'],
    default: 'general'
  },
  maxMembers: {
    type: Number,
    default: 100
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  // Study group specific fields
  meetingSchedule: {
    type: String,
    default: null
  },
  nextMeeting: {
    type: Date,
    default: null
  },
  learningResources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['article', 'video', 'course', 'book', 'other'],
      default: 'other'
    }
  }]
});

// Update the updatedAt timestamp on save
GroupSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-save hook to ensure channelId follows expected format
GroupSchema.pre('save', function(next) {
  if (!this.isNew) {
    return next();
  }
  
  // If a new group is being created and channelId isn't set or doesn't follow format
  if (!this.channelId || !this.channelId.startsWith('group-')) {
    this.channelId = `group-${Date.now()}`;
  }
  
  next();
});

// Virtual for member count
GroupSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Method to check if a user is a member
GroupSchema.methods.isMember = function(userId) {
  return this.members.some(memberId => memberId.equals(userId));
};

// Method to check if a user is an admin
GroupSchema.methods.isAdmin = function(userId) {
  return this.admin.equals(userId);
};

// Method to check if a user is a moderator
GroupSchema.methods.isModerator = function(userId) {
  return this.moderators.some(modId => modId.equals(userId));
};

// Method to check if group is at capacity
GroupSchema.methods.isAtCapacity = function() {
  return this.members.length >= this.maxMembers;
};

const Group = mongoose.model('Group', GroupSchema);

export default Group;