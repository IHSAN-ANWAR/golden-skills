import mongoose from 'mongoose';

const userTaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userPlanSubmissionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserPlanSubmission',
    required: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    required: true,
    trim: true
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  planTitle: {
    type: String,
    required: true,
    trim: true
  },
  planPrice: {
    type: String,
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task'
  },
  taskTitle: {
    type: String,
    required: true,
    trim: true
  },
  taskDescription: {
    type: String,
    required: true
  },
  isCustomTask: {
    type: Boolean,
    default: false
  },
  customTaskMessage: {
    type: String,
    default: ''
  },
  taskDeadline: {
    type: Date,
    required: true
  },
  taskPoints: {
    type: Number,
    default: 10
  },

  // ── Referral Task Fields ─────────────────────────────────────────────────
  // isReferralTask: true means this task requires the user to refer N people
  // who must each purchase a package before the task is counted complete.
  isReferralTask: {
    type: Boolean,
    default: false
  },
  // How many referrals the user must bring (admin sets this — e.g. 4)
  referralTarget: {
    type: Number,
    default: 0
  },
  // Reward amount admin promises for completing this referral task (e.g. "10000")
  referralReward: {
    type: String,
    default: ''
  },
  // Package price each referred person must activate (e.g. "4000")
  referralPackagePrice: {
    type: String,
    default: ''
  },
  // How many referred users have activated a plan so far (auto-updated)
  referralProgress: {
    type: Number,
    default: 0
  },
  // ────────────────────────────────────────────────────────────────────────

  status: {
    type: String,
    enum: ['assigned', 'in-progress', 'completed', 'approved', 'rejected', 'overdue'],
    default: 'assigned'
  },
  assignedAt: {
    type: Date,
    default: Date.now
  },
  startedAt: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  approvedAt: {
    type: Date
  },
  rejectedAt: {
    type: Date
  },
  // Reward amount admin sets when approving the task (e.g. "5000")
  rewardAmount: {
    type: String,
    default: ''
  },
  adminNotes: {
    type: String,
    default: ''
  },
  userNotes: {
    type: String,
    default: ''
  },
  submissionData: {
    type: String,
    default: ''  },
  submissionImage: {
    type: String,
    default: ''  }
}, {
  timestamps: true
});

// Index for better query performance
userTaskSchema.index({ status: 1, assignedAt: -1 }); // Compound index for status + sorting
userTaskSchema.index({ userEmail: 1, status: 1 }); // For user-specific queries
userTaskSchema.index({ planId: 1, status: 1 }); // For plan-specific queries
userTaskSchema.index({ completedAt: -1 }); // For recent completions
userTaskSchema.index({ userPlanSubmissionId: 1 }); // For submission lookups

export default mongoose.model('UserTask', userTaskSchema);