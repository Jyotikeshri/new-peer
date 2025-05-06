import mongoose from 'mongoose';

const studyLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },  // The date of the study session
  duration: { type: Number, required: true },  // Duration in minutes
  subject: { type: String, required: true }  // Subject being studied
}, { timestamps: true });

export default mongoose.model('StudyLog', studyLogSchema);
