import mongoose from 'mongoose';

const searchTrackingSchema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  searchCount: {
    type: Number,
    default: 1
  },
  isSuspicious: {
    type: Boolean,
    default: false
  },
  searches: [
    {
      ip: { type: String, default: 'unknown' },
      userAgent: { type: String, default: '' },
      searchedAt: { type: Date, default: Date.now }
    }
  ],
  lastSearchedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

const SearchTracking = mongoose.model('SearchTracking', searchTrackingSchema);
export default SearchTracking;
