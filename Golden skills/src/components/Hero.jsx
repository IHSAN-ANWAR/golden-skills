import './Hero.css';
import bgImage   from '../assets/bg.jpeg';
import tabletBg  from '../assets/tablet bg.png';
import mobileBg  from '../assets/mobile screen.png';

const Hero = () => {
  return (
    <section className="hero-section">
      {/* Responsive backgrounds */}
      <div className="hero-background-desktop" style={{ backgroundImage: `url(${bgImage})` }} />
      <div className="hero-background-tablet"  style={{ backgroundImage: `url(${tabletBg})` }} />
      <div className="hero-background-mobile"  style={{ backgroundImage: `url(${mobileBg})` }} />
      <div className="hero-overlay" />

      <div className="container">
        <div className="row align-items-center min-vh-100">
          <div className="col-lg-7 col-md-9 col-12">
            <div className="hero-content">

              {/* Eyebrow */}
              <div className="hero-eyebrow">
                <span className="hero-eyebrow-dot" />
                Pakistan's #1 Skill Platform
              </div>

              {/* Title */}
              <h1 className="hero-title">
                Learn Real Skills.<br />
                <span className="gradient-text">Earn Real Money.</span><br />
                Build Your Future.
              </h1>

              {/* Description */}
              <p className="hero-description">
                Pakistan's most trusted skill-development platform. Complete practical tasks,
                earn performance-based rewards, and launch your career — all through our
                mobile app.
              </p>

              {/* Buttons */}
              <div className="hero-buttons">
                <button
                  className="btn-hero-cta btn-primary"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = '/goldenskills.apk';
                    link.download = 'GoldenSkills.apk';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <i className="fas fa-download" />
                  Download App
                </button>
                <a href="/courses" className="btn-hero-cta btn-secondary">
                  Explore Courses
                </a>
              </div>

              {/* Stats */}
              <div className="hero-stats">
                <div className="hero-stat">
                  <span className="hero-stat-number">15K+</span>
                  <span className="hero-stat-label">Active Learners</span>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <span className="hero-stat-number">60+</span>
                  <span className="hero-stat-label">Skill Courses</span>
                </div>
                <div className="hero-stat-divider" />
                <div className="hero-stat">
                  <span className="hero-stat-number">98%</span>
                  <span className="hero-stat-label">Success Rate</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="hero-scroll">
        <div className="hero-scroll-line" />
        <span className="hero-scroll-text">Scroll</span>
      </div>
    </section>
  );
};

export default Hero;
