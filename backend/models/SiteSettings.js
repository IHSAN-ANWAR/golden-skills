import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'main'
  },
  whatsappNumber: {
    type: String,
    default: ''
  },
  whatsappMessage: {
    type: String,
    default: 'Hello! I am interested in Golden Skills.'
  },
  whatsappEnabled: {
    type: Boolean,
    default: true
  },
  // FBR NTN Number
  ntnNumber: {
    type: String,
    default: ''
  },
  // Social Media Links
  socialLinks: {
    facebook: {
      type: String,
      default: ''
    },
    instagram: {
      type: String,
      default: 'https://www.instagram.com/golden.skillscompany?igsh=NTVsNXA3aTdoZHlz'
    },
    youtube: {
      type: String,
      default: 'https://youtube.com/@goldenskillscompanyoffical?si=fJ-6A7GWVqQd6UYh'
    },
    tiktok: {
      type: String,
      default: 'https://www.tiktok.com/@earnwithriya?_r=1&_t=ZS-93v7aSaTZ4u'
    },
    twitter: {
      type: String,
      default: ''
    },
    linkedin: {
      type: String,
      default: ''
    }
  }
}, { timestamps: true });

const SiteSettings = mongoose.model('SiteSettings', siteSettingsSchema);
export default SiteSettings;
