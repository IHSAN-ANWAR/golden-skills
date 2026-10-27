import mongoose from 'mongoose';

const userCourseCompletionSchema = new mongoose.Schema({
  courseLinkAssignmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CourseLinkAssignment',
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    enum: ['premium', 'pro', 'lite'],
    required: true
  },
  courseTitle: {
    type: String,
    trim: true,
    default: ''
  },
  // Certificate — auto-generated when admin approves
  certificateUrl: {
    type: String,
    trim: true,
    default: null
  },
  certificateFilename: {
    type: String,
    trim: true,
    default: null
  },
  status: {
    type: String,
    enum: ['submitted', 'approved', 'rejected'],
    default: 'submitted'
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date,
    default: null
  }
});

export default mongoose.model('UserCourseCompletion', userCourseCompletionSchema);
