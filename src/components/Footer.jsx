import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer-section">
      <div className="container">
        <div className="row align-items-start">
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
                <li><a href="#contact">Contact</a></li>
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
                    <a href="#privacy">Privacy Policy</a>
                    <a href="#support">Help & Support</a>
                  </div>
                  <div className="social-media">
                    <a href="#" className="social-link instagram">
                      <i className="fab fa-instagram"></i>
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
    </footer>
  );
};

export default Footer;