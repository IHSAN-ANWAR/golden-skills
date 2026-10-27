import mongoose from 'mongoose';

const blacklistSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    default: 'Unknown',
    trim: true
  },
  reason: {
    type: String,
    default: 'Reported for fraudulent activities using our company name',
    trim: true
  },
  addedBy: {
    type: String,
    default: 'Admin'
  }
}, {
  timestamps: true
});

const Blacklist = mongoose.model('Blacklist', blacklistSchema);
export default Blacklist;
