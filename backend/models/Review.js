import mongoose from 'mongoose';

// Define the ratings schema as a sub-schema
const ratingsSchema = new mongoose.Schema({
  collaboration: { type: Number, min: 1, max: 5, required: true },
  skill: { type: Number, min: 1, max: 5, required: true },
  communication: { type: Number, min: 1, max: 5 },
  teamwork: { type: Number, min: 1, max: 5 },
  punctuality: { type: Number, min: 1, max: 5 }
});

// Define the main review schema
const reviewSchema = new mongoose.Schema({
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  ratings: { type: ratingsSchema, required: true },  // Use the sub-schema here
  text: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
