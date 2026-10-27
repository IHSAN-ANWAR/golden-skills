import mongoose from 'mongoose';

const userCoursePlanSubmissionSchema = new mongoose.Schema({
  userId: {
    type: String,
    index: true  // unique hata diya — ab ek user multiple courses mein enroll kar sakta hai
  },
  coursePlanId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CoursePlan',
    required: true
  },
  planTitle: {
    type: String,
    required: true
  },
  planCategory: {
    type: String,
    enum: ['premium', 'pro', 'lite'],
    required: true
  },
  planPrice: {
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
  userPhone: {
    type: String,
    trim: true
  },
  userImage: {
    type: String, // URL or base64 image - payment proof
    default: ''
  },
  additionalData: {
    type: Map,
    of: String,
    default: {}
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

export default mongoose.model('UserCoursePlanSubmission', userCoursePlanSubmissionSchema);
