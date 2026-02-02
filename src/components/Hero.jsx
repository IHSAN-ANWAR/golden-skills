import React from 'react';
import './Hero.css';
import bgImage from '../assets/bg.jpeg';

const Hero = () => {
  return (
    <section 
      className="hero-section" 
      style={{
        backgroundImage: `url(${bgImage})`
      }}
    >
      <div className="hero-overlay"></div>
      <div className="container-fluid">
        <div className="row align-items-center min-vh-100">
          <div className="col-lg-6 col-md-8 col-12">
            <div className="hero-content">
              <h1 className="hero-title mb-4">
                Learn. <span className="gradient-text">Earn.</span> <span className="gradient-text">Excel.</span>
              </h1>
              <p className="hero-description mb-4">
                Develop your skills and earn rewards by completing real-world tasks inside our mobile learning application. Join thousands of learners who are already building their careers through practical experience and skill development.
              </p>
              <button className="btn btn-hero-cta">
                Get Started
              </button>
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