import mongoose from 'mongoose';

// A single promotion task assigned to a user
const promotionTaskSchema = new mongoose.Schema({
  taskTitle: { type: String, required: true, trim: true },
  taskDescription: { type: String, required: true },
  taskDeadline: { type: Date, required: true },
  status: {
    type: String,
    enum: ['assigned', 'in-progress', 'completed', 'approved', 'rejected'],
    default: 'assigned'
  },
  submissionData: { type: String, default: '' },
  userNotes: { type: String, default: '' },
  completedAt: { type: Date, default: null },
  adminNotes: { type: String, default: '' }
}, { _id: true });

const userPromotionSchema = new mongoose.Schema({
  // User info
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: { type: String, required: true, trim: true },
  userEmail: { type: String, required: true, trim: true },
  userPhone: { type: String, default: '' },

  // Plan purchase proof (payment screenshot)
  userImage: { type: String, default: '' },

  // Plan details
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true
  },
  planTitle: { type: String, required: true },
  planPrice: { type: String, required: true },

  // Promotion reference
  promotionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Promotion',
    default: null
  },
  promotionTitle: { type: String, default: '' },
  rewardAmount: { type: String, default: '' },

  // Payment verification status (admin approves plan purchase)
  paymentStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  paymentNotes: { type: String, default: '' },

  // Multiple promotion tasks assigned by admin
  tasks: [promotionTaskSchema],

  // Overall promotion status
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'reward-approved', 'rejected'],
    default: 'pending'
  },

  // Reward payment approval
  rewardStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rewardNotes: { type: String, default: '' },
  rewardApprovedAt: { type: Date, default: null },

  submittedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model('UserPromotion', userPromotionSchema);
