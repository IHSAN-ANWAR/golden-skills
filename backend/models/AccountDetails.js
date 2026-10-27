import mongoose from 'mongoose';

const accountDetailsSchema = new mongoose.Schema({
  // Account label / title (e.g. "JazzCash", "Easypaisa", "Bank Account")
  accountTitle: {
    type: String,
    required: true,
    trim: true
  },
  // Bank or service name
  bankName: {
    type: String,
    required: true,
    trim: true
  },
  // Account holder name
  accountHolderName: {
    type: String,
    required: true,
    trim: true
  },
  // Account number / IBAN / mobile number
  accountNumber: {
    type: String,
    required: true,
    trim: true
  },
  // Optional: IBAN for bank transfers
  iban: {
    type: String,
    trim: true,
    default: ''
  },
  // Account type: bank | jazzcash | easypaisa | other
  accountType: {
    type: String,
    enum: ['bank', 'jazzcash', 'easypaisa', 'other'],
    default: 'bank'
  },
  // Additional instructions shown to users
  instructions: {
    type: String,
    trim: true,
    default: ''
  },
  // Whether this account is active / visible on mobile app
  isActive: {
    type: Boolean,
    default: true
  },
  // Display order
  displayOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const AccountDetails = mongoose.model('AccountDetails', accountDetailsSchema);
export default AccountDetails;
