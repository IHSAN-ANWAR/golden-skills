import SiteSettings from '../models/SiteSettings.js';

// GET /api/settings/whatsapp - Public
export const getWhatsappSettings = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne({ key: 'main' });
    if (!settings) {
      settings = await SiteSettings.create({ key: 'main' });
    }
    return res.status(200).json({
      success: true,
      whatsappNumber: settings.whatsappNumber,
      whatsappMessage: settings.whatsappMessage,
      whatsappEnabled: settings.whatsappEnabled
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PUT /api/settings/whatsapp - Admin only
export const updateWhatsappSettings = async (req, res) => {
  try {
    const { whatsappNumber, whatsappMessage, whatsappEnabled } = req.body;

    let settings = await SiteSettings.findOne({ key: 'main' });
    if (!settings) settings = new SiteSettings({ key: 'main' });

    if (whatsappNumber !== undefined) settings.whatsappNumber = whatsappNumber.trim();
    if (whatsappMessage !== undefined) settings.whatsappMessage = whatsappMessage.trim();
    if (whatsappEnabled !== undefined) settings.whatsappEnabled = whatsappEnabled;

    await settings.save();

    return res.status(200).json({
      success: true,
      message: 'WhatsApp settings updated successfully',
      whatsappNumber: settings.whatsappNumber,
      whatsappMessage: settings.whatsappMessage,
      whatsappEnabled: settings.whatsappEnabled
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/settings/social-links - Public
export const getSocialLinks = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne({ key: 'main' });
    if (!settings) {
      settings = await SiteSettings.create({ key: 'main' });
    }
    return res.status(200).json({
      success: true,
      socialLinks: settings.socialLinks || {}
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PUT /api/settings/social-links - Admin only
export const updateSocialLinks = async (req, res) => {
  try {
    const { facebook, instagram, youtube, tiktok, twitter, linkedin } = req.body;

    let settings = await SiteSettings.findOne({ key: 'main' });
    if (!settings) settings = new SiteSettings({ key: 'main' });

    if (!settings.socialLinks) settings.socialLinks = {};

    if (facebook !== undefined) settings.socialLinks.facebook = facebook.trim();
    if (instagram !== undefined) settings.socialLinks.instagram = instagram.trim();
    if (youtube !== undefined) settings.socialLinks.youtube = youtube.trim();
    if (tiktok !== undefined) settings.socialLinks.tiktok = tiktok.trim();
    if (twitter !== undefined) settings.socialLinks.twitter = twitter.trim();
    if (linkedin !== undefined) settings.socialLinks.linkedin = linkedin.trim();

    await settings.save();

    return res.status(200).json({
      success: true,
      message: 'Social links updated successfully',
      socialLinks: settings.socialLinks
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// GET /api/settings/ntn - Public
export const getNtnNumber = async (req, res) => {
  try {
    let settings = await SiteSettings.findOne({ key: 'main' });
    if (!settings) {
      settings = await SiteSettings.create({ key: 'main' });
    }
    return res.status(200).json({
      success: true,
      ntnNumber: settings.ntnNumber || ''
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// PUT /api/settings/ntn - Admin only
export const updateNtnNumber = async (req, res) => {
  try {
    const { ntnNumber } = req.body;

    let settings = await SiteSettings.findOne({ key: 'main' });
    if (!settings) settings = new SiteSettings({ key: 'main' });

    if (ntnNumber !== undefined) settings.ntnNumber = ntnNumber.trim();

    await settings.save();

    return res.status(200).json({
      success: true,
      message: 'NTN number updated successfully',
      ntnNumber: settings.ntnNumber
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
