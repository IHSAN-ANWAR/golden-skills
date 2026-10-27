import mongoose from 'mongoose';

const userPlanSubmissionSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: true,
    sparse: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  planTitle: {
    type: String,
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
    type: String, // URL or base64 image
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
  },
  // Track karo ke is specific submission ke approve hone pe referral count ho chuka hai ya nahi
  // hasActivatedPlan per-user flag tha — yeh per-submission hai taake multiple plans sahi kaam karen
  referralCounted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model('UserPlanSubmission', userPlanSubmissionSchema);
