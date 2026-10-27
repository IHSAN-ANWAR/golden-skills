import mongoose from 'mongoose';

// ── Course Content Item ───────────────────────────────────────────────────────
// Ek assignment mein multiple content pieces ho sakte hain:
//   video link, PDF, Google Drive folder, YouTube, etc.
const courseContentSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['video', 'pdf', 'google_drive', 'youtube', 'other'],
    required: true
  },
  title: {
    type: String,
    trim: true,
    default: ''
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  }
}, { _id: true });

const courseLinkAssignmentSchema = new mongoose.Schema({
  userPlanSubmissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserCoursePlanSubmission',
    required: true
  },
  coursePlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CoursePlan',
    required: false // Optional for backward compatibility
  },
  userId: { type: String },
  userName: { type: String, required: true, trim: true },
  userEmail: { type: String, trim: true },
  category: {
    type: String,
    enum: ['premium', 'pro', 'lite'],
    required: true
  },
  // Legacy single link — purane data ke liye rakha
  courseLink: {
    type: String,
    required: false,
    trim: true,
    default: ''
  },
  // NEW: multiple content items (video, PDF, Google Drive, YouTube, etc.)
  courseContents: {
    type: [courseContentSchema],
    default: []
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('CourseLinkAssignment', courseLinkAssignmentSchema);
