import './CoursesSection.css';
import certificateImg from '../assets/certificate.jpeg';

const Courses = () => {
  return (
    <section className="public-courses-section">

      {/* Courses Header */}
      <div className="public-courses-header">
        <h2 className="public-section-title">Our Courses</h2>
        <p className="public-section-subtitle">
          Golden Skills offers a variety of skill-focused courses designed to prepare users for real-world challenges.
          Whether you are a complete beginner or looking to upgrade your existing skills, our courses are crafted by
          industry experts to give you practical, hands-on experience. Learn at your own pace, complete real-world
          tasks, and earn an official certificate that validates your expertise.
        </p>

        {/* Stats Row */}
        <div className="public-courses-stats">
          <div className="public-stat-item">
            <span className="public-stat-number">10+</span>
            <span className="public-stat-label">Courses Available</span>
          </div>
          <div className="public-stat-divider" />
          <div className="public-stat-item">
            <span className="public-stat-number">5000+</span>
            <span className="public-stat-label">Students Enrolled</span>
          </div>
          <div className="public-stat-divider" />
          <div className="public-stat-item">
            <span className="public-stat-number">95%</span>
            <span className="public-stat-label">Completion Rate</span>
          </div>
          <div className="public-stat-divider" />
          <div className="public-stat-item">
            <span className="public-stat-number">100%</span>
            <span className="public-stat-label">Official Certificate</span>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="public-how-it-works">
        <h2 className="public-section-title">How It Works</h2>
        <p className="public-section-subtitle">
          Getting started with Golden Skills is simple. Follow these 4 easy steps to go from a beginner
          to a certified professional and unlock real career opportunities.
        </p>

        <div className="public-workflow-container">
          <div className="public-workflow-step">
            <div className="public-step-icon">
              <i className="fas fa-search"></i>
            </div>
            <h3 className="public-step-title">Choose Course</h3>
            <p className="public-step-description">
              Browse our skill-based courses and pick the one that fits your interest and career goals.
            </p>
          </div>

          <div className="public-workflow-arrow">
            <i className="fas fa-chevron-right"></i>
          </div>

          <div className="public-workflow-step">
            <div className="public-step-icon">
              <i className="fas fa-graduation-cap"></i>
            </div>
            <h3 className="public-step-title">Learn & Practice</h3>
            <p className="public-step-description">
              Follow structured lessons and complete real-world tasks that sharpen your practical skills.
            </p>
          </div>

          <div className="public-workflow-arrow">
            <i className="fas fa-chevron-right"></i>
          </div>

          <div className="public-workflow-step">
            <div className="public-step-icon">
              <i className="fas fa-award"></i>
            </div>
            <h3 className="public-step-title">Get Certified</h3>
            <p className="public-step-description">
              Pass your final assessment and receive an official Golden Skills certificate for your achievement.
            </p>
          </div>

          <div className="public-workflow-arrow">
            <i className="fas fa-chevron-right"></i>
          </div>

          <div className="public-workflow-step">
            <div className="public-step-icon">
              <i className="fas fa-rocket"></i>
            </div>
            <h3 className="public-step-title">Advance Career</h3>
            <p className="public-step-description">
              Use your certificate and new skills to land better jobs, freelance projects, or grow your business.
            </p>
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
              Whether you want to showcase your abilities to employers or clients,
              our digital certificate comes with a unique verification code that
              proves your achievement is 100% authentic and trustworthy.
            </p>
            <div className="public-certificate-features">
              <div className="public-feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Officially issued by Golden Skills Company</span>
              </div>
              <div className="public-feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Completion-based certification with unique ID</span>
              </div>
              <div className="public-feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Industry-recognized credentials</span>
              </div>
              <div className="public-feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Digital certificate with online verification</span>
              </div>
              <div className="public-feature-item">
                <i className="fas fa-check-circle"></i>
                <span>Share directly on LinkedIn and resume</span>
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

      {/* Why Choose Us Section */}
      <div className="public-why-section">
        <h2 className="public-section-title">Why Choose Golden Skills?</h2>
        <p className="public-section-subtitle">
          We are not just an online course platform — we are a complete skill development ecosystem
          that rewards your hard work with real earnings and career growth.
        </p>
        <div className="public-why-grid">
          <div className="public-why-card">
            <div className="public-why-icon"><i className="fas fa-laptop-code"></i></div>
            <h4>Practical Learning</h4>
            <p>All courses focus on real tasks, not just theory. You learn by doing actual work that matters in the real world.</p>
          </div>
          <div className="public-why-card">
            <div className="public-why-icon"><i className="fas fa-coins"></i></div>
            <h4>Earn While Learning</h4>
            <p>Complete tasks assigned through our app and earn real rewards based on your performance and skill level.</p>
          </div>
          <div className="public-why-card">
            <div className="public-why-icon"><i className="fas fa-users"></i></div>
            <h4>Expert Mentors</h4>
            <p>Learn from experienced industry professionals who guide you through every step of your learning journey.</p>
          </div>
          <div className="public-why-card">
            <div className="public-why-icon"><i className="fas fa-mobile-alt"></i></div>
            <h4>Learn on Mobile</h4>
            <p>Download our app and learn from anywhere, anytime. All course content and tasks are available on your phone.</p>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="public-testimonials-section">
        <h2 className="public-section-title">What Our Students Say</h2>
        <p className="public-section-subtitle">
          Thousands of students have transformed their careers with Golden Skills.
          Here is what some of our graduates have to say about their experience.
        </p>

        <div className="public-testimonials-grid">
          <div className="public-testimonial-card">
            <div className="public-testimonial-stars">
              <i className="fas fa-star"></i><i className="fas fa-star"></i>
              <i className="fas fa-star"></i><i className="fas fa-star"></i>
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
              <i className="fas fa-star"></i><i className="fas fa-star"></i>
              <i className="fas fa-star"></i><i className="fas fa-star"></i>
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
              <i className="fas fa-star"></i><i className="fas fa-star"></i>
              <i className="fas fa-star"></i><i className="fas fa-star"></i>
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