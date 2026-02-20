import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const openPrivacyModal = () => {
    setShowPrivacyModal(true);
  };

  const closePrivacyModal = () => {
    setShowPrivacyModal(false);
  };

  const openTermsModal = () => {
    setShowTermsModal(true);
  };

  const closeTermsModal = () => {
    setShowTermsModal(false);
  };

  return (
    <footer className="footer-section">
      <div className="container">
        <div className="row align-items-start mx-3">
          {/* About Golden Skills */}
          <div className="col-lg-4 col-md-6 mb-4">
            <div className="footer-content">
              <h3 className="footer-title">About Golden Skills</h3>
              <p className="footer-description">
                A premium platform for skill development and rewards, helping 
                users grow through practical, skill-based tasks.
              </p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-lg-3 col-md-6 mb-4">
            <div className="footer-content">
              <h3 className="footer-title">Quick Links</h3>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/courses">Courses</Link></li>
                <li><Link to="/tasks">Tasks</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>
          </div>

          {/* App Store & Social */}
          <div className="col-lg-5 col-md-12 mb-4">
            <div className="footer-content">
              <div className="app-social-section">
                {/* App Store Buttons */}
                <div className="app-buttons-horizontal">
                  <a href="#" className="app-store-btn">
                    <div className="store-button app-store">
                      <i className="fab fa-apple"></i>
                      <div className="store-text">
                        <span className="store-small">Download on</span>
                        <span className="store-large">App Store</span>
                      </div>
                    </div>
                  </a>
                  <a href="#" className="app-store-btn">
                    <div className="store-button google-play">
                      <i className="fab fa-google-play"></i>
                      <div className="store-text">
                        <span className="store-small">Get it on</span>
                        <span className="store-large">Google Play</span>
                      </div>
                    </div>
                  </a>
                </div>
                
                {/* Social Media & Legal Links */}
                <div className="social-legal-section">
                  <div className="legal-links">
                    <button 
                      onClick={openPrivacyModal}
                      className="legal-link-button"
                    >
                      Privacy Policy
                    </button>
                    <button 
                      onClick={openTermsModal}
                      className="legal-link-button"
                    >
                      Terms & Conditions
                    </button>
                  </div>
                  <div className="social-media">
                    <a href="#" className="social-link facebook">
                      <i className="fab fa-facebook-f"></i>
                    </a>
                    <a href="https://www.instagram.com/golden.skillscompany?igsh=NTVsNXA3aTdoZHlz" className="social-link instagram" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-instagram"></i>
                    </a>
                    <a href="https://youtube.com/@goldenskillscompanyoffical?si=fJ-6A7GWVqQd6UYh" className="social-link youtube" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-youtube"></i>
                    </a>
                    <a href="https://www.tiktok.com/@earnwithriya?_r=1&_t=ZS-93v7aSaTZ4u" className="social-link tiktok" target="_blank" rel="noopener noreferrer">
                      <i className="fab fa-tiktok"></i>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="row">
            <div className="col-12">
              <div className="footer-bottom-content">
                <p className="copyright">
                  © 2026 Golden Skills. All rights reserved.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="modal-overlay" onClick={closePrivacyModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <i className="fas fa-shield-alt"></i> Privacy Policy
              </h2>
              <button className="modal-close" onClick={closePrivacyModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <p className="modal-company">Golden Skills Company</p>
                <p className="modal-date">Last Updated: February 4, 2026</p>
                <p className="modal-intro">
                  Golden Skills Company respects your privacy and is committed to protecting your personal information. 
                  This Privacy Policy explains how we collect, use, and protect your data when you use our website and mobile application.
                </p>
              </div>

              <div className="modal-section">
                <h3>1. Information We Collect</h3>
                <p>We may collect the following information:</p>
                <ul>
                  <li>Name</li>
                  <li>Email address</li>
                  <li>Contact details</li>
                  <li>Course enrollment information</li>
                  <li>Usage data (for app improvement)</li>
                </ul>
                <p>We do not collect sensitive financial or personal data on the website.</p>
              </div>

              <div className="modal-section">
                <h3>2. How We Use Your Information</h3>
                <p>Your information is used to:</p>
                <ul>
                  <li>Provide access to courses and services</li>
                  <li>Improve our learning platform</li>
                  <li>Communicate important updates</li>
                  <li>Provide customer support</li>
                </ul>
              </div>

              <div className="modal-section">
                <h3>3. Data Protection</h3>
                <p>
                  Golden Skills Company takes appropriate security measures to protect your data from 
                  unauthorized access, alteration, or disclosure.
                </p>
              </div>

              <div className="modal-section">
                <h3>4. Third-Party Services</h3>
                <p>
                  We may use trusted third-party services (such as hosting or analytics tools) to improve our services. 
                  These parties are required to keep your information confidential.
                </p>
              </div>

              <div className="modal-section">
                <h3>5. Cookies</h3>
                <p>
                  Our website may use cookies to enhance user experience. You can disable cookies in your 
                  browser settings if you prefer.
                </p>
              </div>

              <div className="modal-section">
                <h3>6. Your Consent</h3>
                <p>
                  By using our website or mobile application, you consent to our Privacy Policy.
                </p>
              </div>

              <div className="modal-section">
                <h3>7. Contact Information</h3>
                <p>
                  If you have any questions about this Privacy Policy, you can contact us at:<br />
                  <strong><i className="fas fa-envelope"></i> goldenskillscompany@gmail.com</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      {showTermsModal && (
        <div className="modal-overlay" onClick={closeTermsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <i className="fas fa-scroll"></i> Terms & Conditions
              </h2>
              <button className="modal-close" onClick={closeTermsModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <p className="modal-company">Golden Skills Company</p>
                <p className="modal-date">Last Updated: February 4, 2026</p>
                <p className="modal-intro">
                  By accessing or using the Golden Skills Company website or mobile application, 
                  you agree to the following terms and conditions.
                </p>
              </div>

              <div className="modal-section">
                <h3>1. Use of Platform</h3>
                <p>
                  Golden Skills Company provides skill-based learning content for educational purposes only. 
                  Users must use the platform responsibly and ethically.
                </p>
              </div>

              <div className="modal-section">
                <h3>2. Courses & Certification</h3>
                <ul>
                  <li>Courses are designed for learning and skill development.</li>
                  <li>Certificates are issued upon successful course completion.</li>
                  <li>Certificates do not guarantee employment or income.</li>
                </ul>
              </div>

              <div className="modal-section">
                <h3>3. User Responsibilities</h3>
                <p>Users agree to:</p>
                <ul>
                  <li>Provide accurate information</li>
                  <li>Not misuse or copy platform content</li>
                  <li>Not engage in illegal or harmful activities</li>
                </ul>
              </div>

              <div className="modal-section">
                <h3>4. Intellectual Property</h3>
                <p>
                  All content, including logos, text, graphics, and certificates, is the property of 
                  Golden Skills Company and may not be used without permission.
                </p>
              </div>

              <div className="modal-section">
                <h3>5. Website vs Mobile App</h3>
                <ul>
                  <li>The website is for information and publicity purposes only.</li>
                  <li>Learning activities, tasks, and certifications are handled through the mobile application.</li>
                </ul>
              </div>

              <div className="modal-section">
                <h3>6. Limitation of Liability</h3>
                <p>
                  Golden Skills Company is not responsible for any loss or damage resulting from misuse of 
                  the platform or reliance on the provided information.
                </p>
              </div>

              <div className="modal-section">
                <h3>7. Changes to Terms</h3>
                <p>
                  We reserve the right to update these terms at any time. Continued use of the platform 
                  means acceptance of updated terms.
                </p>
              </div>

              <div className="modal-section">
                <h3>8. Contact Information</h3>
                <p>
                  For questions regarding these Terms & Conditions, contact:<br />
                  <strong><i className="fas fa-envelope"></i> goldenskillscompany@gmail.com</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export default Footer;