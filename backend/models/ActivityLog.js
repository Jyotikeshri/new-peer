import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activityType: { type: String, required: true }, // "study group", "chat", etc.
  startTime: { type: Date, required: true },  // When the activity started
  endTime: { type: Date },  // When the activity ended
  duration: { type: Number },  // Duration in minutes
  isActive: { type: Boolean, default: true }  // If the activity is still active
}, { timestamps: true });

export default mongoose.model('ActivityLog', activityLogSchema);
