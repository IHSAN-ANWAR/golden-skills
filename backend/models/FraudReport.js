import mongoose from 'mongoose';

const fraudReportSchema = new mongoose.Schema({
  reporterName: {
    type: String,
    required: true,
    trim: true
  },
  reporterPhone: {
    type: String,
    required: true,
    trim: true
  },
  scammerPhone: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  screenshot: {
    type: String, // base64 or file path
    default: null
  },
  screenshotName: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'actioned'],
    default: 'pending'
  },
  adminNote: {
    type: String,
    default: ''
  }
}, { timestamps: true });

const FraudReport = mongoose.model('FraudReport', fraudReportSchema);
export default FraudReport;
