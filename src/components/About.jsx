import React from 'react';
import './About.css';
import missionImage from '../assets/our mission.png';
import missionMobileImage from '../assets/ourmission mobile.png';

const About = () => {
  return (
    <section className="about-section">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            {/* About Content */}
            <div className="about-content">
              <h2 className="about-title mb-4">About Us</h2>
              
              <div className="about-text mb-5">
                <p className="about-paragraph mb-3"> 
                  Golden Skills Company is a leading skill-development platform dedicated 
                  to empowering individuals through innovative learning solutions.
                </p>
                <p className="about-paragraph mb-0">
                  <strong>Mission:</strong> We focus on skill-based, practical learning and career growth, 
                  helping learners bridge the gap between education and real-world application.
                </p>
              </div>

              {/* Mission Box */}
              <div className="mission-box mb-5">
                <div className="mission-content">
                  <div className="mission-image">
                    <img 
                      src={missionImage} 
                      alt="Our Mission - Golden Skills" 
                      className="mission-img mission-img-desktop"
                    />
                    <img 
                      src={missionMobileImage} 
                      alt="Our Mission - Golden Skills Mobile" 
                      className="mission-img mission-img-mobile"
                    />
                  </div>
                </div>
              </div>

              {/* Horizontal Separator Line */}
              <div className="section-separator mb-5"></div>

              {/* Why Choose Golden Skills Section */}
              <div className="why-choose-section">
                <div className="section-title-with-line">
                  <div className="title-line"></div>
                  <h2 className="why-choose-title">Why Choose Golden Skills</h2>
                  <div className="title-line"></div>
                </div>
                
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon">
                      <i className="fas fa-hands-helping"></i>
                    </div>
                    <h3 className="feature-title">Practical Learning</h3>
                    <p className="feature-description">
                      Learn through hands-on projects and real-world applications
                    </p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">
                      <i className="fas fa-user-tie"></i>
                    </div>
                    <h3 className="feature-title">Expert Mentors</h3>
                    <p className="feature-description">
                      Get guidance from industry professionals and experienced mentors
                    </p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">
                      <i className="fas fa-industry"></i>
                    </div>
                    <h3 className="feature-title">Industry-Relevant Courses</h3>
                    <p className="feature-description">
                      Stay updated with current market demands and trending skills
                    </p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">
                      <i className="fas fa-certificate"></i>
                    </div>
                    <h3 className="feature-title">Certificate After Completion</h3>
                    <p className="feature-description">
                      Earn official certificates to validate your newly acquired skills
                    </p>
                  </div>
                  
                  <div className="feature-card">
                    <div className="feature-icon">
                      <i className="fas fa-dollar-sign"></i>
                    </div>
                    <h3 className="feature-title">Affordable Fee Structure</h3>
                    <p className="feature-description">
                      Quality education at competitive prices for everyone
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;