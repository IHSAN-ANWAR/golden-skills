import mongoose from 'mongoose';

const planSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  tutorialVideoUrl: {
    type: String,
    trim: true,
    default: ''
  }, // ← Optional YouTube tutorial link for plan guidance
  taxAmount: {
    type: Number,
    default: 0  // admin sets this per plan e.g. 97, 100, 103
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

export default mongoose.model('Plan', planSchema);
