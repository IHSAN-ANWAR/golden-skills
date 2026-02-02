import React from 'react';
import './About.css';
import visionImage from '../assets/VISION.png';
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
              <h2 className="about-title mb-4">About Golden Skills</h2>
              
              <div className="about-text mb-5">
                <p className="about-paragraph mb-3"> 
                  Golden Skills is a premium skill-development platform designed 
                  to help learners grow through practical experience.
                </p>
                <p className="about-paragraph mb-0">
                  Our goal is to bridge the gap between learning and real-world 
                  application by offering skill-based tasks inside our mobile application.
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

              {/* Vision Section */}
              <div className="vision-section">
                <div className="row align-items-center">
                  <div className="col-lg-6 col-md-12 mb-4 mb-lg-0">
                    <div className="vision-text">
                      <h3 className="vision-title mb-3">Our Vision</h3>
                      <p className="vision-description mb-0">
                        Empower individuals to learn, apply, and grow with confidence.
                      </p>
                    </div>
                  </div>
                  <div className="col-lg-6 col-md-12">
                    <div className="vision-image">
                      <img 
                        src={visionImage} 
                        alt="Our Vision - Empower individuals to learn and grow" 
                        className="vision-img img-fluid"
                      />
                    </div>
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