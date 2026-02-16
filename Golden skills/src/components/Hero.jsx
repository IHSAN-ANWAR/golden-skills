import React from 'react';
import './Hero.css';
import bgImage from '../assets/bg.jpeg';
import tabletBg from '../assets/tablet bg.png';
import mobileBg from '../assets/mobile screen.png';

const Hero = () => {
  return (
    <section className="hero-section">
      <div className="hero-background-desktop" style={{ backgroundImage: `url(${bgImage})` }}></div>
      <div className="hero-background-tablet" style={{ backgroundImage: `url(${tabletBg})` }}></div>
      <div className="hero-background-mobile" style={{ backgroundImage: `url(${mobileBg})` }}></div>
      <div className="hero-overlay"></div>
      <div className="container-fluid">
        <div className="row align-items-center min-vh-100">
          <div className="col-lg-6 col-md-8 col-12">
            <div className="hero-content">
              <h1 className="hero-title mb-4">
            <span className="gradient-text">Golden Skills</span>
              </h1>
              <p className="hero-description mb-4">
                Develop your skills and earn rewards by completing real-world tasks inside our mobile learning application. Join thousands of learners who are already building their careers through practical experience and skill development.
              </p>
              <div className="hero-buttons">
                <button className="btn-hero-cta btn-primary">
                  Get Started
                </button>
                <button className="btn-hero-cta btn-secondary">
                  Explore Courses
                </button>
              </div>
           
            </div>
          </div>
          <div className="col-lg-6 d-none d-lg-block">
            {/* Right side for background image visibility */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;