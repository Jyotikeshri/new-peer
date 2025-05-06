import mongoose from 'mongoose';

const badgeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badgeType: { type: String, required: true },  // Type of badge (e.g., "Top Reviewer", "Veteran")
  description: { type: String, required: true }, // Description of the badge
  awardedAt: { type: Date, default: Date.now }   // When the badge was awarded
});

export default mongoose.model('Badge', badgeSchema);
