import './Courses.css';
import contentWritingImg from '../assets/content writing .gif';
import digitalMarketingImg from '../assets/digital.gif';
import graphicBasicsImg from '../assets/graphic basic.gif';
import certificateImg from '../assets/certificate.jpeg';

const Courses = () => {
  return (
    <section className="courses-section">
      {/* Courses Header */}
      <div className="courses-header">
        <h2 className="section-title">Our Courses</h2>
        <p className="section-subtitle">
          Golden Skills offers a variety of skill-focused courses designed to prepare users for real-world challenges.
        </p>
      </div>

      {/* Courses Grid */}
      <div className="courses-grid">
          {/* Content Writing Course */}
          <div className="course-card">
            <div className="course-badge">
              <i className="fas fa-pen-fancy"></i>
              <span>Writing</span>
            </div>
            <div className="course-image-wrapper">
              <img src={contentWritingImg} alt="Content Writing Course" className="course-image" />
            </div>
            <div className="course-body">
           
              <p className="course-description">
                Master the art of creating compelling content. Learn SEO writing, blog posts, and social media content that engages and converts.
              </p>
            </div>
          </div>

          {/* Digital Marketing Course */}
          <div className="course-card">
            <div className="course-badge">
              <i className="fas fa-bullhorn"></i>
              <span>Marketing</span>
            </div>
            <div className="course-image-wrapper">
              <img src={digitalMarketingImg} alt="Digital Marketing Course" className="course-image" />
            </div>
            <div className="course-body">
            
              <p className="course-description">
                Discover modern marketing strategies. Learn social media marketing, PPC campaigns, and analytics to grow businesses online.
              </p>
            </div>
          </div>

          {/* Graphic Design Course */}
          <div className="course-card">
            <div className="course-badge">
              <i className="fas fa-palette"></i>
              <span>Design</span>
            </div>
            <div className="course-image-wrapper">
              <img src={graphicBasicsImg} alt="Graphic Design Course" className="course-image" />
            </div>
            <div className="course-body">
            
              <p className="course-description">
                Create stunning visual designs. Learn design principles, color theory, and tools to bring your ideas to life.
              </p>
            </div>
          </div>
      </div>

      {/* How It Works Section */}
      <div className="how-it-works">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Simple 4-step process to success</p>
          
          <div className="workflow-container">
            <div className="workflow-step">
              <div className="step-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3 className="step-title">Choose Course</h3>
              <p className="step-description">Browse and select the perfect course for your goals</p>
            </div>

            <div className="workflow-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>

            <div className="workflow-step">
              <div className="step-icon">
                <i className="fas fa-graduation-cap"></i>
              </div>
              <h3 className="step-title">Learn & Practice</h3>
              <p className="step-description">Engage with interactive lessons and hands-on projects</p>
            </div>

            <div className="workflow-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>

            <div className="workflow-step">
              <div className="step-icon">
                <i className="fas fa-award"></i>
              </div>
              <h3 className="step-title">Get Certified</h3>
              <p className="step-description">Earn your official Golden Skills certificate</p>
            </div>

            <div className="workflow-arrow">
              <i className="fas fa-arrow-right"></i>
            </div>

            <div className="workflow-step">
              <div className="step-icon">
                <i className="fas fa-rocket"></i>
              </div>
              <h3 className="step-title">Advance Career</h3>
              <p className="step-description">Apply your skills and grow professionally</p>
            </div>
          </div>
      </div>

      {/* Certificate Section */}
      <div className="certificate-section">
          <div className="certificate-content">
            <div className="certificate-text">
              <h2 className="certificate-title">Official Certification</h2>
              <p className="certificate-description">
                Upon successful completion of our courses, you will receive an <strong>official certificate from Golden Skills Company</strong>. Our certificates are recognized and validate your newly acquired skills.
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

              <button className="certificate-btn">
                <i className="fas fa-graduation-cap"></i>
                Start Learning Today
              </button>
            </div>

            <div className="certificate-image-wrapper">
              <div className="certificate-badge">
                <i className="fas fa-award"></i>
                <span>Official</span>
              </div>
              <img src={certificateImg} alt="Official Golden Skills Certificate" className="certificate-image" />
            </div>
          </div>
      </div>

      {/* Testimonials Section */}
      <div className="testimonials-section">
          <h2 className="section-title">What Our Students Say</h2>
          <p className="section-subtitle">Real reviews from our course graduates</p>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p className="testimonial-text">
                "The Content Writing course transformed my writing skills completely. The practical approach and real projects helped me land my dream job!"
              </p>
              <div className="testimonial-author">
                <h4 className="author-name">Sarah Ahmed</h4>
                <p className="author-role">Content Writer at TechCorp</p>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p className="testimonial-text">
                "Digital Marketing course was amazing! The mentors were incredibly helpful and the certificate helped me get promoted in my current company."
              </p>
              <div className="testimonial-author">
                <h4 className="author-name">Muhammad Ali</h4>
                <p className="author-role">Marketing Manager</p>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-stars">
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
                <i className="fas fa-star"></i>
              </div>
              <p className="testimonial-text">
                "Graphic Lite course gave me the foundation I needed. The step-by-step guidance and affordable pricing made it perfect for beginners like me."
              </p>
              <div className="testimonial-author">
                <h4 className="author-name">Fatima Khan</h4>
                <p className="author-role">Freelance Designer</p>
              </div>
            </div>
          </div>
        </div>
    
    </section>
  );
};

export default Courses;
