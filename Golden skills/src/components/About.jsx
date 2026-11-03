import './About.css';

const features = [
  { icon: 'fas fa-hands-helping',  title: 'Practical Learning',        desc: 'Learn through hands-on projects and real-world tasks that directly apply to your career. No theory-only courses — everything is practical.' },
  { icon: 'fas fa-user-tie',       title: 'Expert Mentors',            desc: 'Get guidance from industry professionals with years of real-world experience. Our mentors have worked in top companies across Pakistan.' },
  { icon: 'fas fa-industry',       title: 'Industry-Relevant Courses', desc: 'Our courses are updated regularly to match current market demands. Learn skills that employers are actively hiring for right now.' },
  { icon: 'fas fa-certificate',    title: 'Verified Certificates',     desc: 'Earn official certificates recognized by employers. Each certificate carries a unique verification ID proving its authenticity.' },
  { icon: 'fas fa-dollar-sign',    title: 'Affordable Fee Structure',  desc: 'Quality education at competitive prices with flexible payment options — making professional skill development accessible for everyone.' },
  { icon: 'fas fa-mobile-alt',     title: 'Learn on Mobile',           desc: 'Our dedicated Android app lets you learn anytime, anywhere. Complete tasks, track progress, and earn rewards all from your phone.' },
];

const About = () => {
  return (
    <section className="about-section">
      <div className="about-content">

        {/* ── Intro ── */}
        <div className="about-intro">
          <div className="about-intro-text">
            <div className="eyebrow">
              <i className="fas fa-star" style={{ fontSize: '0.7rem', color: 'var(--gold-dark)' }} />
              About Golden Skills
            </div>
            <h2 className="about-title">
              Empowering Talent<br />
              <span>Across Pakistan</span>
            </h2>
            <div className="gold-divider" style={{ marginBottom: '1.8rem' }} />
            <p className="about-paragraph">
              Golden Skills Company is a leading skill-development platform dedicated
              to empowering individuals through innovative learning solutions — bridging
              the gap between education and real-world application. We believe every
              person in Pakistan deserves access to quality education and the opportunity
              to earn a dignified income through their skills.
            </p>
            <p className="about-paragraph">
              <strong>Our Mission:</strong> We focus on skill-based, practical learning
              and career growth. Every course, task, and reward is designed to help you
              build confidence and income simultaneously. We are not just a learning
              platform — we are a complete career ecosystem that takes you from
              zero to earning professional.
            </p>
            <p className="about-paragraph">
              As an <strong>FBR-registered company</strong>, we operate with full
              transparency and legal accountability. Our platform is trusted by thousands
              of students across Pakistan who have transformed their lives through
              our skill development programs.
            </p>
          </div>

          <div className="about-intro-highlights">
            <div className="highlight-box">
              <div className="highlight-icon"><i className="fas fa-bullseye" /></div>
              <div>
                <h3 className="highlight-title">Our Mission</h3>
                <p className="highlight-text">
                  Empowering individuals with practical skills, real earnings, and career opportunities across Pakistan. We connect learning with real income generation.
                </p>
              </div>
            </div>
            <div className="highlight-box">
              <div className="highlight-icon"><i className="fas fa-eye" /></div>
              <div>
                <h3 className="highlight-title">Our Vision</h3>
                <p className="highlight-text">
                  To become Pakistan's most trusted platform where skill meets opportunity — creating a generation of financially independent, digitally skilled professionals.
                </p>
              </div>
            </div>
            <div className="highlight-box fbr-highlight">
              <div className="highlight-icon"><i className="fas fa-shield-alt" /></div>
              <div>
                <h3 className="highlight-title">FBR Registered</h3>
                <p className="highlight-text">
                  Officially registered with the Federal Board of Revenue, Pakistan. Fully legal, transparent, and accountable.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-separator" />

        {/* ── Impact Stats ── */}
        <div className="impact-stats">
          <div className="impact-stat">
            <div className="impact-stat-icon"><i className="fas fa-users" /></div>
            <div className="impact-stat-number">15,000+</div>
            <div className="impact-stat-label">Active Learners</div>
          </div>
          <div className="impact-stat">
            <div className="impact-stat-icon"><i className="fas fa-graduation-cap" /></div>
            <div className="impact-stat-number">60+</div>
            <div className="impact-stat-label">Skill Courses</div>
          </div>
          <div className="impact-stat">
            <div className="impact-stat-icon"><i className="fas fa-certificate" /></div>
            <div className="impact-stat-number">12,000+</div>
            <div className="impact-stat-label">Certificates Issued</div>
          </div>
          <div className="impact-stat">
            <div className="impact-stat-icon"><i className="fas fa-star" /></div>
            <div className="impact-stat-number">98%</div>
            <div className="impact-stat-label">Success Rate</div>
          </div>
        </div>

        <div className="section-separator" />

        {/* ── Our Story ── */}
        <div className="about-story-section">
          <div className="about-story-header">
            <div className="eyebrow" style={{ margin: '0 auto 1rem' }}>
              <i className="fas fa-history" style={{ fontSize: '0.7rem', color: 'var(--gold-dark)' }} />
              Our Story
            </div>
            <h2 className="about-story-title">How Golden Skills Began</h2>
            <div className="gold-divider center" style={{ marginBottom: '1.5rem' }} />
            <p className="about-story-desc">
              Golden Skills was born from a simple but powerful idea — that every Pakistani
              deserves the chance to learn a skill and earn from it. Our founder saw thousands
              of talented individuals who lacked access to quality, affordable, and practical education.
              The result was a platform that combines structured learning, real-world tasks, and
              performance-based rewards all in one place.
            </p>
          </div>
          <div className="about-timeline">
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-year">2022</div>
              <div className="timeline-card">
                <h4>Company Founded</h4>
                <p>Golden Skills Company was officially established with a vision to bridge the skill gap in Pakistan's youth workforce.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-year">2023</div>
              <div className="timeline-card">
                <h4>First 1,000 Students</h4>
                <p>Reached our first milestone of 1,000 enrolled students and launched our first 10 professional skill courses.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-year">2024</div>
              <div className="timeline-card">
                <h4>FBR Registration & App Launch</h4>
                <p>Officially registered with FBR, launched our mobile app, and introduced the task-based earning system for students.</p>
              </div>
            </div>
            <div className="timeline-item">
              <div className="timeline-dot"></div>
              <div className="timeline-year">2025</div>
              <div className="timeline-card">
                <h4>15,000+ Active Learners</h4>
                <p>Grew to over 15,000 active learners across Pakistan with 60+ courses and PKR 50 million+ in student rewards distributed.</p>
              </div>
            </div>
            <div className="timeline-item timeline-item-last">
              <div className="timeline-dot timeline-dot-gold"></div>
              <div className="timeline-year timeline-year-gold">2026</div>
              <div className="timeline-card timeline-card-gold">
                <h4><i className="fas fa-rocket" style={{color:"#D4AF37",marginRight:"8px"}}></i>The Future</h4>
                <p>Expanding nationally with new courses, international certifications, and partnerships with leading employers across Pakistan.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="section-separator" />

        {/* ── Core Values ── */}
        <div className="values-section">
          <div className="values-header">
            <div className="eyebrow" style={{ margin: '0 auto 1rem' }}>
              <i className="fas fa-heart" style={{ fontSize: '0.7rem', color: 'var(--gold-dark)' }} />
              Our Core Values
            </div>
            <h2 className="values-title">What We Stand For</h2>
            <div className="gold-divider center" />
          </div>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon"><i className="fas fa-lightbulb" /></div>
              <h3 className="value-title">Innovation</h3>
              <p className="value-desc">We constantly evolve our teaching methods and platform to provide cutting-edge, relevant learning experiences.</p>
            </div>
            <div className="value-card">
              <div className="value-icon"><i className="fas fa-handshake" /></div>
              <h3 className="value-title">Integrity</h3>
              <p className="value-desc">Transparency and honesty guide every decision we make — from course content to payment processing.</p>
            </div>
            <div className="value-card">
              <div className="value-icon"><i className="fas fa-chart-line" /></div>
              <h3 className="value-title">Excellence</h3>
              <p className="value-desc">We deliver high-quality education and maintain the highest standards in course content and student support.</p>
            </div>
            <div className="value-card">
              <div className="value-icon"><i className="fas fa-users-cog" /></div>
              <h3 className="value-title">Community</h3>
              <p className="value-desc">Building a supportive nationwide network where learners grow together, help each other, and succeed together.</p>
            </div>
          </div>
        </div>

        <div className="section-separator" />

        {/* ── Why Choose ── */}
        <div className="why-choose-section">
          <div className="why-choose-header">
            <div className="eyebrow" style={{ margin: '0 auto 1rem' }}>
              <i className="fas fa-check-circle" style={{ fontSize: '0.7rem', color: 'var(--gold-dark)' }} />
              Why Choose Us
            </div>
            <h2 className="why-choose-title">What Makes Us Different</h2>
            <div className="gold-divider center" style={{ marginBottom: '0.8rem' }} />
            <p className="why-choose-subtitle">
              We combine quality education, expert mentorship, and real earning potential
              into one powerful platform designed for Pakistan's growing digital workforce.
            </p>
          </div>

          <div className="features-grid-new">
            {features.map((f, i) => (
              <div className="feature-card-new" key={i}>
                <div className="feature-card-top">
                  <div className="feature-icon-new">
                    <i className={f.icon} />
                  </div>
                  <div className="feature-card-num">0{i + 1}</div>
                </div>
                <h3 className="feature-title-new">{f.title}</h3>
                <p className="feature-desc-new">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;