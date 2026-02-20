import React from 'react';
import './Courses.css';
import contentWritingImg from '../assets/content writing .gif';
import digitalMarketingImg from '../assets/digital.gif';
import graphicBasicsImg from '../assets/graphic basic.gif';
import certificateImg from '../assets/certificate.jpeg';

const Courses = () => {
  return (
    <section className="courses-section">
      {/* Courses Header and Grid - Regular Container */}
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="courses-content">
              {/* Courses Header */}
              <div className="courses-header mb-5">
                <h2 className="courses-title mb-4">Our Courses</h2>
                <p className="courses-description mb-0">
                  Golden Skills offers a variety of skill-focused courses designed to<br className="d-none d-md-block" />
                  prepare users for real-world challenges.
                </p>
              </div>

              {/* Courses Grid */}
              <div className="row g-4 mb-5">
                {/* Content Writing Course */}
                <div className="col-lg-4 col-md-6 col-12">
                  <div className="course-card h-100">
                    <div className="course-image-container">
                      <img 
                        src={contentWritingImg} 
                        alt="Content Writing Course" 
                        className="course-image"
                      />
                    </div>
                    <div className="course-content">
                      <p className="course-description mb-3">
                        Master the art of creating compelling content.<br />
                        Learn SEO writing, blog posts, and social media content<br />
                        that engages and converts.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Digital Marketing Course */}
                <div className="col-lg-4 col-md-6 col-12">
                  <div className="course-card h-100">
                    <div className="course-image-container">
                      <img 
                        src={digitalMarketingImg} 
                        alt="Digital Marketing Course" 
                        className="course-image"
                      />
                    </div>
                    <div className="course-content">
                      <p className="course-description mb-3">
                        Discover modern marketing strategies.<br />
                        Learn social media marketing, PPC campaigns,<br />
                        and analytics to grow businesses online.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Graphic Lite Course */}
                <div className="col-lg-4 col-md-6 col-12">
                  <div className="course-card h-100">
                    <div className="course-image-container">
                      <img 
                        src={graphicBasicsImg} 
                        alt="Graphic Lite Course" 
                        className="course-image"
                      />
                    </div>
                    <div className="course-content">
                      <p className="course-description mb-3">
                        Create stunning visual designs.<br />
                        Learn design principles, color theory,<br />
                        and tools to bring your ideas to life.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section - Regular Container */}
      <div className="container">
        <div className="how-it-works-section">
          <div className="row">
            <div className="col-12">
              <div className="how-it-works-header text-center mb-5">
                <h2 className="how-it-works-title">How It Works</h2>
                <p className="how-it-works-subtitle">Simple 4-step process:</p>
              </div>
              
              <div className="workflow-steps-container">
                <div className="workflow-step">
                  <div className="step-icon">
                    <i className="fas fa-search"></i>
                  </div>
                  <h3 className="step-title">Choose Course</h3>
                </div>
                
                <div className="workflow-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
                
                <div className="workflow-step">
                  <div className="step-icon">
                    <i className="fas fa-graduation-cap"></i>
                  </div>
                  <h3 className="step-title">Learn & Practice</h3>
                </div>
                
                <div className="workflow-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
                
                <div className="workflow-step">
                  <div className="step-icon">
                    <i className="fas fa-award"></i>
                  </div>
                  <h3 className="step-title">Get Certified</h3>
                </div>
                
                <div className="workflow-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
                
                <div className="workflow-step">
                  <div className="step-icon">
                    <i className="fas fa-rocket"></i>
                  </div>
                  <h3 className="step-title">Advance Career</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Separator Line */}
      <div className="section-separator"></div>

      {/* Certificate Banner Section */}
      <div className="container">
        <div className="certificate-banner">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-12 mb-4 mb-lg-0">
              <div className="certificate-content">
                <h2 className="certificate-title">Official Certification</h2>
                <p className="certificate-description">
                  Upon successful completion of our courses, you will receive an 
                  <strong> official certificate from Golden Skills Company</strong>. 
                  Our certificates are recognized and validate your newly acquired skills.
                </p>
                <div className="certificate-features">
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Officially issued by Golden Skills</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Completion-based certification</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Industry-recognized credentials</span>
                  </div>
                  <div className="feature-item">
                    <i className="fas fa-check-circle"></i>
                    <span>Digital certificate with verification</span>
                  </div>
                </div>
                <button className="btn btn-certificate-cta">
                  <i className="fas fa-graduation-cap"></i>
                  Start Learning Today
                </button>
              </div>
            </div>
            <div className="col-lg-6 col-md-12">
              <div className="certificate-image">
                <img 
                  src={certificateImg} 
                  alt="Official Golden Skills Certificate" 
                  className="certificate-img"
                />
                <div className="certificate-badge">
                  <i className="fas fa-award"></i>
                  <span>Official</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="container">
        <div className="testimonials-section">
          <div className="row">
            <div className="col-12">
              <div className="testimonials-header text-center mb-5">
                <div className="section-title-with-line">
                  <div className="title-line"></div>
                  <h2 className="testimonials-title">What Our Students Say</h2>
                  <div className="title-line"></div>
                </div>
                <p className="testimonials-subtitle">Real reviews from our course graduates</p>
              </div>
              
              <div className="testimonials-grid">
                <div className="testimonial-card">
                  <div className="testimonial-content">
                    <div className="stars">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                    </div>
                    <p className="testimonial-text">
                      "The Content Writing course transformed my writing skills completely. 
                      The practical approach and real projects helped me land my dream job!"
                    </p>
                    <div className="testimonial-author">
                      <div className="author-info">
                        <h4 className="author-name">Sarah Ahmed</h4>
                        <p className="author-role">Content Writer at TechCorp</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="testimonial-card">
                  <div className="testimonial-content">
                    <div className="stars">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                    </div>
                    <p className="testimonial-text">
                      "Digital Marketing course was amazing! The mentors were incredibly helpful 
                      and the certificate helped me get promoted in my current company."
                    </p>
                    <div className="testimonial-author">
                      <div className="author-info">
                        <h4 className="author-name">Muhammad Ali</h4>
                        <p className="author-role">Marketing Manager</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="testimonial-card">
                  <div className="testimonial-content">
                    <div className="stars">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                    </div>
                    <p className="testimonial-text">
                      "Graphic Lite course gave me the foundation I needed. The step-by-step 
                      guidance and affordable pricing made it perfect for beginners like me."
                    </p>
                    <div className="testimonial-author">
                      <div className="author-info">
                        <h4 className="author-name">Fatima Khan</h4>
                        <p className="author-role">Freelance Designer</p>
                      </div>
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

export default Courses;