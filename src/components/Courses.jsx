import React from 'react';
import './Courses.css';
import contentWritingImg from '../assets/content writing .gif';
import digitalMarketingImg from '../assets/digital.gif';
import graphicBasicsImg from '../assets/graphic basic.gif';

const Courses = () => {
  return (
    <section className="courses-section">
      <div className="container-fluid">
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

                {/* Graphic Basics Course */}
                <div className="col-lg-4 col-md-6 col-12">
                  <div className="course-card h-100">
                    <div className="course-image-container">
                      <img 
                        src={graphicBasicsImg} 
                        alt="Graphic Basics Course" 
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

              {/* How It Works Section */}
              <div className="how-it-works-section">
                <div className="row">
                  <div className="col-12">
                    <div className="how-it-works-header text-center mb-5">
                      <h2 className="how-it-works-title">How It Works</h2>
                    </div>
                    
                    <div className="row justify-content-center align-items-center g-3">
                      <div className="col-lg-2 col-md-4 col-6">
                        <div className="workflow-step text-center">
                          <div className="step-icon mx-auto mb-3">
                            <i className="fas fa-download"></i>
                          </div>
                          <h3 className="step-title">Download the app</h3>
                        </div>
                      </div>
                      
                      <div className="col-lg-1 col-md-1 col-12">
                        <div className="workflow-arrow text-center">
                          <i className="fas fa-chevron-right d-none d-md-inline"></i>
                          <i className="fas fa-chevron-down d-md-none"></i>
                        </div>
                      </div>
                      
                      <div className="col-lg-2 col-md-4 col-6">
                        <div className="workflow-step text-center">
                          <div className="step-icon mx-auto mb-3">
                            <i className="fas fa-graduation-cap"></i>
                          </div>
                          <h3 className="step-title">Learn skills</h3>
                        </div>
                      </div>
                      
                      <div className="col-lg-1 col-md-1 col-12">
                        <div className="workflow-arrow text-center">
                          <i className="fas fa-chevron-right d-none d-md-inline"></i>
                          <i className="fas fa-chevron-down d-md-none"></i>
                        </div>
                      </div>
                      
                      <div className="col-lg-2 col-md-4 col-6">
                        <div className="workflow-step text-center">
                          <div className="step-icon mx-auto mb-3">
                            <i className="fas fa-tasks"></i>
                          </div>
                          <h3 className="step-title">Complete tasks</h3>
                        </div>
                      </div>
                      
                      <div className="col-lg-1 col-md-1 col-12">
                        <div className="workflow-arrow text-center">
                          <i className="fas fa-chevron-right d-none d-md-inline"></i>
                          <i className="fas fa-chevron-down d-md-none"></i>
                        </div>
                      </div>
                      
                      <div className="col-lg-2 col-md-4 col-6">
                        <div className="workflow-step text-center">
                          <div className="step-icon mx-auto mb-3">
                            <i className="fas fa-gift"></i>
                          </div>
                          <h3 className="step-title">Earn rewards</h3>
                        </div>
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