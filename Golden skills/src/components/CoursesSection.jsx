import './CoursesSection.css';
import certificateImg from '../assets/certificate.jpeg';

const Courses = () => {
  return (
    <section className="public-courses-section">
      {/* Courses Header and Grid */}
      <div className="public-courses-header">
        <h2 className="public-section-title">Our Courses</h2>
        <p className="public-section-subtitle">
          Golden Skills offers a variety of skill-focused courses designed to prepare users for real-world challenges.
        </p>
      </div>

      
      {/* How It Works Section */}
      <div className="public-how-it-works">
        <h2 className="public-section-title">How It Works</h2>
        <p className="public-section-subtitle">Simple 4-step process:</p>
        
        <div className="public-workflow-container">
          <div className="public-workflow-step">
            <div className="public-step-icon">
              <i className="fas fa-search"></i>
            </div>
            <h3 className="public-step-title">Choose Course</h3>
          </div>
          
          <div className="public-workflow-arrow">
            <i className="fas fa-chevron-right"></i>
          </div>
          
          <div className="public-workflow-step">
            <div className="public-step-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h3 className="public-step-title">Learn & Practice</h3>
          </div>
          
          <div className="public-workflow-arrow">
            <i className="fas fa-chevron-right"></i>
          </div>
          
          <div className="public-workflow-step">
            <div className="public-step-icon">
              <i className="fas fa-award"></i>
            </div>
            <h3 className="public-step-title">Get Certified</h3>
          </div>
          
          <div className="public-workflow-arrow">
            <i className="fas fa-chevron-right"></i>
          </div>
          
          <div className="public-workflow-step">
            <div className="public-step-icon">
              <i className="fas fa-rocket"></i>
            </div>
            <h3 className="public-step-title">Advance Career</h3>
          </div>
        </div>
      </div>

      {/* Certificate Banner Section */}
      <div className="public-certificate-section">
        <div className="public-certificate-content">
          <div>
            <h2 className="public-certificate-title">Official Certification</h2>
            <p className="public-certificate-description">
              Upon successful completion of our courses, you will receive an 
              <strong> official certificate from Golden Skills Company</strong>. 
              Our certificates are recognized and validate your newly acquired skills.
            </p>
            <div className="public-certificate-features">
              <div className="public-feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Officially issued by Golden Skills</span>
              </div>
              <div className="public-feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Completion-based certification</span>
              </div>
              <div className="public-feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Industry-recognized credentials</span>
              </div>
              <div className="public-feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Digital certificate with verification</span>
              </div>
            </div>
            <button className="public-certificate-btn">
              <i className="fas fa-graduation-cap"></i>
              Start Learning Today
            </button>
          </div>
          <div className="public-certificate-image-wrapper">
            <img 
              src={certificateImg} 
              alt="Official Golden Skills Certificate" 
              className="public-certificate-image"
            />
            <div className="public-certificate-badge">
              <i className="fas fa-award"></i>
              <span>Official</span>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="public-testimonials-section">
        <h2 className="public-section-title">What Our Students Say</h2>
        <p className="public-section-subtitle">Real reviews from our course graduates</p>
        
        <div className="public-testimonials-grid">
          <div className="public-testimonial-card">
            <div className="public-testimonial-stars">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
            <p className="public-testimonial-text">
              "The Content Writing course transformed my writing skills completely. 
              The practical approach and real projects helped me land my dream job!"
            </p>
            <div className="public-testimonial-author">
              <h4 className="public-author-name">Sarah Ahmed</h4>
              <p className="public-author-role">Content Writer at TechCorp</p>
            </div>
          </div>
          
          <div className="public-testimonial-card">
            <div className="public-testimonial-stars">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
            <p className="public-testimonial-text">
              "Digital Marketing course was amazing! The mentors were incredibly helpful 
              and the certificate helped me get promoted in my current company."
            </p>
            <div className="public-testimonial-author">
              <h4 className="public-author-name">Muhammad Ali</h4>
              <p className="public-author-role">Marketing Manager</p>
            </div>
          </div>
          
          <div className="public-testimonial-card">
            <div className="public-testimonial-stars">
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
              <i className="fas fa-star"></i>
            </div>
            <p className="public-testimonial-text">
              "Graphic Lite course gave me the foundation I needed. The step-by-step 
              guidance and affordable pricing made it perfect for beginners like me."
            </p>
            <div className="public-testimonial-author">
              <h4 className="public-author-name">Fatima Khan</h4>
              <p className="public-author-role">Freelance Designer</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Courses;