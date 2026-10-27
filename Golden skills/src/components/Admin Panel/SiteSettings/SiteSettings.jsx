import React, { useState, useEffect } from 'react';
import { FaWhatsapp, FaSave, FaToggleOn, FaToggleOff, FaFacebook, FaInstagram, FaYoutube, FaTiktok, FaTwitter, FaLinkedin, FaShareAlt, FaFileInvoice } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import axios from 'axios';
import './SiteSettings.css';

const SiteSettings = () => {
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [whatsappMessage, setWhatsappMessage] = useState('Hello! I am interested in Golden Skills.');
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: '',
    youtube: '',
    tiktok: '',
    twitter: '',
    linkedin: ''
  });
  const [ntnNumber, setNtnNumber] = useState('');
  const [ntnLoading, setNtnLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => { fetchSettings(); fetchSocialLinks(); fetchNtn(); }, []);

  const getAuthConfig = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const fetchSettings = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.SETTINGS.GET_WHATSAPP);
      if (res.data.success) {
        setWhatsappNumber(res.data.whatsappNumber || '');
        setWhatsappMessage(res.data.whatsappMessage || 'Hello! I am interested in Golden Skills.');
        setWhatsappEnabled(res.data.whatsappEnabled ?? true);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const fetchSocialLinks = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.SETTINGS.GET_SOCIAL_LINKS);
      if (res.data.success) {
        setSocialLinks(res.data.socialLinks || {
          facebook: '',
          instagram: '',
          youtube: '',
          tiktok: '',
          twitter: '',
          linkedin: ''
        });
      }
    } catch (err) {
      console.error('Error fetching social links:', err);
    }
  };

  const fetchNtn = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.SETTINGS.GET_NTN);
      if (res.data.success) {
        setNtnNumber(res.data.ntnNumber || '');
      }
    } catch (err) {
      console.error('Error fetching NTN number:', err);
    }
  };

  const handleSave = async () => {
    if (!whatsappNumber.trim()) {
      showMessage('error', 'Please enter a WhatsApp number');
      return;
    }
    setLoading(true);
    try {
      await axios.put(API_ENDPOINTS.SETTINGS.UPDATE_WHATSAPP, {
        whatsappNumber: whatsappNumber.trim(),
        whatsappMessage: whatsappMessage.trim(),
        whatsappEnabled
      }, getAuthConfig());
      showMessage('success', 'WhatsApp settings saved successfully');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialSave = async () => {
    setSocialLoading(true);
    try {
      await axios.put(API_ENDPOINTS.SETTINGS.UPDATE_SOCIAL_LINKS, socialLinks, getAuthConfig());
      showMessage('success', 'Social media links saved successfully');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to save social links');
    } finally {
      setSocialLoading(false);
    }
  };

  const handleNtnSave = async () => {
    setNtnLoading(true);
    try {
      await axios.put(API_ENDPOINTS.SETTINGS.UPDATE_NTN, { ntnNumber }, getAuthConfig());
      showMessage('success', 'NTN number saved successfully');
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to save NTN number');
    } finally {
      setNtnLoading(false);
    }
  };

  const handleSocialChange = (platform, value) => {
    setSocialLinks(prev => ({ ...prev, [platform]: value }));
  };

  return (
    <>
      {message.text && (
        <div className={`ss-alert ss-alert-${message.type}`}>{message.text}</div>
      )}

      {/* WhatsApp Card */}
      <div className="ss-card">
        <div className="ss-card-header">
          <FaWhatsapp className="ss-header-icon" />
          <div>
            <h2>WhatsApp Widget</h2>
            <p>Configure the floating WhatsApp button shown on the website</p>
          </div>
          <button
            className={`ss-toggle ${whatsappEnabled ? 'on' : 'off'}`}
            onClick={() => setWhatsappEnabled(!whatsappEnabled)}
          >
            {whatsappEnabled
              ? <><FaToggleOn className="ss-toggle-icon" /> Enabled</>
              : <><FaToggleOff className="ss-toggle-icon" /> Disabled</>}
          </button>
        </div>

        <div className="ss-card-body">
          {/* Preview */}
          <div className="ss-preview">
            <div className="ss-preview-label">Live Preview</div>
            <div className="ss-preview-box">
              <div className="ss-preview-btn">
                <FaWhatsapp />
              </div>
              <div className="ss-preview-info">
                <span className="ss-preview-num">
                  {whatsappNumber || 'No number set'}
                </span>
                <span className="ss-preview-status">
                  {whatsappEnabled ? '🟢 Visible on website' : '🔴 Hidden from website'}
                </span>
              </div>
            </div>
          </div>

          <div className="ss-form">
            <div className="ss-field">
              <label>WhatsApp Number</label>
              <div className="ss-input-wrapper">
                <span className="ss-input-prefix">+</span>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  placeholder="923001234567 (with country code, no +)"
                  disabled={loading}
                />
              </div>
              <small>Enter number with country code. E.g. 923001234567 for Pakistan</small>
            </div>

            <div className="ss-field">
              <label>Default Message</label>
              <textarea
                value={whatsappMessage}
                onChange={e => setWhatsappMessage(e.target.value)}
                placeholder="Hello! I am interested in Golden Skills."
                rows={3}
                disabled={loading}
              />
              <small>This message will be pre-filled when user opens WhatsApp chat</small>
            </div>

            <button className="ss-save-btn" onClick={handleSave} disabled={loading}>
              {loading
                ? <><span className="ss-spinner" /> Saving...</>
                : <><FaSave className="me-2" /> Save Settings</>}
            </button>
          </div>
        </div>
      </div>

      {/* How it looks info */}
      <div className="ss-info-box">
        <h6 className="ss-info-title">How it works</h6>
        <ul className="ss-info-list">
          <li>A floating green WhatsApp button appears on all public pages</li>
          <li>Clicking it opens WhatsApp with your number and default message</li>
          <li>Toggle Enabled/Disabled to show or hide the button</li>
          <li>Changes take effect immediately on the website</li>
        </ul>
      </div>

      {/* Social Media Links Card */}
      <div className="ss-card" style={{ marginTop: '2rem' }}>
        <div className="ss-card-header">
          <FaShareAlt className="ss-header-icon" />
          <div>
            <h2>Social Media Links</h2>
            <p>Manage social media links displayed in the website footer</p>
          </div>
        </div>

        <div className="ss-card-body">
          <div className="ss-form">
            {/* Facebook */}
            <div className="ss-field">
              <label>
                <FaFacebook style={{ color: '#1877f2', marginRight: '8px' }} />
                Facebook
              </label>
              <input
                type="url"
                value={socialLinks.facebook}
                onChange={e => handleSocialChange('facebook', e.target.value)}
                placeholder="https://facebook.com/yourpage"
                disabled={socialLoading}
              />
            </div>

            {/* Instagram */}
            <div className="ss-field">
              <label>
                <FaInstagram style={{ color: '#e4405f', marginRight: '8px' }} />
                Instagram
              </label>
              <input
                type="url"
                value={socialLinks.instagram}
                onChange={e => handleSocialChange('instagram', e.target.value)}
                placeholder="https://instagram.com/yourprofile"
                disabled={socialLoading}
              />
            </div>

            {/* YouTube */}
            <div className="ss-field">
              <label>
                <FaYoutube style={{ color: '#ff0000', marginRight: '8px' }} />
                YouTube
              </label>
              <input
                type="url"
                value={socialLinks.youtube}
                onChange={e => handleSocialChange('youtube', e.target.value)}
                placeholder="https://youtube.com/@yourchannel"
                disabled={socialLoading}
              />
            </div>

            {/* TikTok */}
            <div className="ss-field">
              <label>
                <FaTiktok style={{ color: '#000000', marginRight: '8px' }} />
                TikTok
              </label>
              <input
                type="url"
                value={socialLinks.tiktok}
                onChange={e => handleSocialChange('tiktok', e.target.value)}
                placeholder="https://tiktok.com/@yourusername"
                disabled={socialLoading}
              />
            </div>

            {/* Twitter */}
            <div className="ss-field">
              <label>
                <FaTwitter style={{ color: '#1da1f2', marginRight: '8px' }} />
                Twitter / X
              </label>
              <input
                type="url"
                value={socialLinks.twitter}
                onChange={e => handleSocialChange('twitter', e.target.value)}
                placeholder="https://twitter.com/yourhandle"
                disabled={socialLoading}
              />
            </div>

            {/* LinkedIn */}
            <div className="ss-field">
              <label>
                <FaLinkedin style={{ color: '#0077b5', marginRight: '8px' }} />
                LinkedIn
              </label>
              <input
                type="url"
                value={socialLinks.linkedin}
                onChange={e => handleSocialChange('linkedin', e.target.value)}
                placeholder="https://linkedin.com/company/yourcompany"
                disabled={socialLoading}
              />
            </div>

            <button className="ss-save-btn" onClick={handleSocialSave} disabled={socialLoading}>
              {socialLoading
                ? <><span className="ss-spinner" /> Saving...</>
                : <><FaSave className="me-2" /> Save Social Links</>}
            </button>
          </div>
        </div>
      </div>

      {/* Social info */}
      <div className="ss-info-box">
        <h6 className="ss-info-title">About Social Links</h6>
        <ul className="ss-info-list">
          <li>Only links with valid URLs will be displayed in the footer</li>
          <li>Leave empty to hide that social media icon</li>
          <li>Icons will only show for platforms with filled URLs</li>
          <li>Changes reflect immediately on the website footer</li>
        </ul>
      </div>

      {/* FBR NTN Number Card */}
      <div className="ss-card" style={{ marginTop: '2rem' }}>
        <div className="ss-card-header">
          <FaFileInvoice className="ss-header-icon" />
          <div>
            <h2>FBR NTN Number</h2>
            <p>Manage the NTN number displayed in the website footer's FBR registration badge</p>
          </div>
        </div>

        <div className="ss-card-body">
          <div className="ss-form">
            <div className="ss-field">
              <label>NTN Number</label>
              <input
                type="text"
                value={ntnNumber}
                onChange={e => setNtnNumber(e.target.value)}
                placeholder="e.g. 1234567-8"
                disabled={ntnLoading}
              />
              <small>This will be displayed in the FBR Registered Company badge in the footer</small>
            </div>

            {/* Preview */}
            <div className="ss-preview" style={{ marginBottom: '1rem' }}>
              <div className="ss-preview-label">Footer Preview</div>
              <div className="ss-preview-box">
                <div className="ss-preview-info">
                  <span className="ss-preview-num">
                    NTN: {ntnNumber || '[NTN-Number]'}
                  </span>
                  <span className="ss-preview-status">
                    {ntnNumber ? '🟢 Will show in footer' : '🔴 Placeholder shown in footer'}
                  </span>
                </div>
              </div>
            </div>

            <button className="ss-save-btn" onClick={handleNtnSave} disabled={ntnLoading}>
              {ntnLoading
                ? <><span className="ss-spinner" /> Saving...</>
                : <><FaSave className="me-2" /> Save NTN Number</>}
            </button>
          </div>
        </div>
      </div>

      {/* NTN info */}
      <div className="ss-info-box">
        <h6 className="ss-info-title">About NTN Number</h6>
        <ul className="ss-info-list">
          <li>NTN (National Tax Number) is assigned by FBR Pakistan</li>
          <li>It appears in the FBR Registered Company badge at the bottom of the footer</li>
          <li>Leave empty and the placeholder text will show instead</li>
          <li>Changes reflect immediately on the website</li>
        </ul>
      </div>
    </>
  );
};

export default SiteSettings;
