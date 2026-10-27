import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiConfig';
import './Footer.css';

const Footer = () => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [ntnNumber, setNtnNumber] = useState('');
  const [socialLinks, setSocialLinks] = useState({
    facebook: '',
    instagram: 'https://www.instagram.com/golden.skillscompany?igsh=NTVsNXA3aTdoZHlz',
    youtube: 'https://youtube.com/@goldenskillscompanyoffical?si=fJ-6A7GWVqQd6UYh',
    tiktok: 'https://www.tiktok.com/@earnwithriya?_r=1&_t=ZS-93v7aSaTZ4u',
  });

  useEffect(() => {
    fetchSocialLinks();
    fetchNtnNumber();
  }, []);

  const fetchNtnNumber = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.SETTINGS.GET_NTN);
      if (res.data.success) {
        setNtnNumber(res.data.ntnNumber || '');
      }
    } catch (err) {
      console.error('Error fetching NTN number:', err);
    }
  };

  const fetchSocialLinks = async () => {
    try {
      const res = await axios.get(API_ENDPOINTS.SETTINGS.GET_SOCIAL_LINKS);
      if (res.data.success && res.data.socialLinks) {
        setSocialLinks(res.data.socialLinks);
      }
    } catch (err) {
      console.error('Error fetching social links:', err);
    }
  };

  return (
    <footer className="footer-section">
      <div className="footer-inner">

        {/* Top grid */}
        <div className="footer-grid">

          {/* Col 1: About */}
          <div className="footer-col footer-col-about">
            <h3 className="footer-heading">Golden Skills</h3>
            <p className="footer-desc">
              Pakistan's leading skill-development platform — empowering individuals
              through practical learning, real-world tasks, and performance-based rewards.
            </p>
            
            {/* App buttons */}
            <div className="footer-app-buttons">
              <a href="/goldenskills.apk" download className="footer-app-btn">
                <i className="fab fa-android" />
                <div className="footer-app-btn-text">
                  <span className="footer-app-btn-sm">Download on</span>
                  <span className="footer-app-btn-lg">Google Play</span>
                </div>
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="footer-col">
            <h4 className="footer-col-title">Quick Links</h4>
            <ul className="footer-links">
              <li><Link to="/">Home</Link></li>
              <li><Link to="/about">About</Link></li>
              <li><Link to="/courses">Courses</Link></li>
              <li><Link to="/tasks">Tasks</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          {/* Col 3: Important */}
          <div className="footer-col">
            <h4 className="footer-col-title">Important</h4>
            <ul className="footer-links">
              <li><Link to="/verify-team">Verify Team</Link></li>
              <li><Link to="/report-fraud" className="link-danger">Report Fraud</Link></li>
              <li><button onClick={() => setShowPrivacyModal(true)} className="footer-link-btn">Privacy Policy</button></li>
              <li><button onClick={() => setShowTermsModal(true)} className="footer-link-btn">Terms & Conditions</button></li>
            </ul>
          </div>

          {/* Col 4: Social + Contact */}
          <div className="footer-col">
            <h4 className="footer-col-title">Connect With Us</h4>
            <div className="footer-social">
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="footer-social-btn facebook" aria-label="Facebook">
                  <i className="fab fa-facebook-f" />
                </a>
              )}
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="footer-social-btn instagram" aria-label="Instagram">
                  <i className="fab fa-instagram" />
                </a>
              )}
              {socialLinks.youtube && (
                <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="footer-social-btn youtube" aria-label="YouTube">
                  <i className="fab fa-youtube" />
                </a>
              )}
              {socialLinks.tiktok && (
                <a href={socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="footer-social-btn tiktok" aria-label="TikTok">
                  <i className="fab fa-tiktok" />
                </a>
              )}
            </div>

            <div className="footer-contact-block">
              <p className="footer-contact-item">
                <i className="fas fa-envelope" />
                <a href="mailto:goldenskillscompany@gmail.com">goldenskillscompany@gmail.com</a>
              </p>
            </div>
          </div>

        </div>

        {/* FBR Badge */}
        <div className="footer-fbr-section">
          <div className="footer-fbr-badge">
            <div className="footer-fbr-icon">
              <i className="fas fa-certificate"></i>
            </div>
            <div className="footer-fbr-content">
              <h5 className="footer-fbr-title">FBR Registered Company</h5>
              {ntnNumber && (
                <p className="footer-fbr-ntn">
                  <i className="fas fa-shield-check"></i>
                  NTN: {ntnNumber}
                </p>
              )}
              <p className="footer-fbr-text">
                Officially registered with Federal Board of Revenue, Pakistan
              </p>
            </div>
          </div>

          <div className="footer-account-badge">
            <i className="fas fa-university"></i>
            <div className="footer-account-info">
              <span className="footer-account-label">Official Payment Account</span>
              <span className="footer-account-name">Title: Shaila Rani</span>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            © 2026 Golden Skills Company. All rights reserved.
          </p>
        </div>

      </div>

      {/* Privacy Modal */}
      {showPrivacyModal && (
        <div className="modal-overlay" onClick={() => setShowPrivacyModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <i className="fas fa-shield-alt" />
                Privacy Policy
              </h2>
              <button className="modal-close" onClick={() => setShowPrivacyModal(false)}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-company">Golden Skills Company</p>
              <p className="modal-date">Last Updated: February 4, 2026</p>
              <p className="modal-intro">
                Golden Skills Company respects your privacy and is committed to protecting your personal information.
              </p>

              <h3>1. Information We Collect</h3>
              <p>We may collect: Name, Email, Contact details, Course enrollment info, Usage data.</p>

              <h3>2. How We Use Your Information</h3>
              <p>To provide courses, improve platform, communicate updates, and offer support.</p>

              <h3>3. Data Protection</h3>
              <p>We take appropriate measures to protect your data from unauthorized access.</p>

              <h3>4. Third-Party Services</h3>
              <p>We may use trusted services (hosting, analytics) to improve our platform.</p>

              <h3>5. Cookies</h3>
              <p>Our website may use cookies. You can disable them in browser settings.</p>

              <h3>6. Your Consent</h3>
              <p>By using our platform, you consent to this Privacy Policy.</p>

              <h3>7. Contact</h3>
              <p>
                <strong><i className="fas fa-envelope" /> goldenskillscompany@gmail.com</strong>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {showTermsModal && (
        <div className="modal-overlay" onClick={() => setShowTermsModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <i className="fas fa-scroll" />
                Terms & Conditions
              </h2>
              <button className="modal-close" onClick={() => setShowTermsModal(false)}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="modal-body">
              <p className="modal-company">Golden Skills Company</p>
              <p className="modal-date">Last Updated: February 4, 2026</p>
              <p className="modal-intro">
                By using Golden Skills, you agree to the following terms.
              </p>

              <h3>1. Use of Platform</h3>
              <p>Use responsibly and ethically for learning purposes.</p>

              <h3>2. Courses & Certification</h3>
              <p>Certificates are issued upon completion but do not guarantee employment.</p>

              <h3>3. User Responsibilities</h3>
              <p>Provide accurate info, don't misuse content, don't engage in illegal activities.</p>

              <h3>4. Intellectual Property</h3>
              <p>All content is property of Golden Skills — no unauthorized use.</p>

              <h3>5. Website vs Mobile App</h3>
              <p>Website is for info. Tasks and learning are in the mobile app.</p>

              <h3>6. Limitation of Liability</h3>
              <p>We're not responsible for misuse or reliance on provided info.</p>

              <h3>7. Changes to Terms</h3>
              <p>We may update these terms. Continued use means acceptance.</p>

              <h3>8. Contact</h3>
              <p>
                <strong><i className="fas fa-envelope" /> goldenskillscompany@gmail.com</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;
