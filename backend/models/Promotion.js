import mongoose from 'mongoose';

const promotionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  // Required plan price to join this promotion
  requiredPlanPrice: {
    type: String,
    required: true
  },
  // Reward amount on completion
  rewardAmount: {
    type: String,
    required: true
  },
  // How many tasks user must complete before they can apply for this promotion
  // 0 means no task requirement
  requiredTaskCount: {
    type: Number,
    default: 0,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    default: 'admin'
  }
}, {
  timestamps: true
});

export default mongoose.model('Promotion', promotionSchema);
