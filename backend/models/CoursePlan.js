import mongoose from 'mongoose';

// ======================================================
// COURSE PLAN MODEL - Defines course subscription plans
// ======================================================
// Purpose: Store course-specific plans (Premium, Pro, Lite)
// Separate from task plans to allow independent pricing
// ======================================================
const coursePlanSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['premium', 'pro', 'lite'],
    required: true
  },
  icon: {
    type: String,
    default: 'FaBook'
  },
  price: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  features: [{
    type: String,
    trim: true
  }],
  courseLink: {
    type: String,
    default: '',
    trim: true
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

export default mongoose.model('CoursePlan', coursePlanSchema);
