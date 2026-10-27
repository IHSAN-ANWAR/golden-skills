import './About.css';

const features = [
  { icon: 'fas fa-hands-helping',  title: 'Practical Learning',          desc: 'Learn through hands-on projects and real-world applications that matter.' },
  { icon: 'fas fa-user-tie',       title: 'Expert Mentors',              desc: 'Get guidance from industry professionals and experienced mentors.' },
  { icon: 'fas fa-industry',       title: 'Industry-Relevant Courses',   desc: 'Stay updated with current market demands and trending skills.' },
  { icon: 'fas fa-certificate',    title: 'Verified Certificates',       desc: 'Earn official certificates to validate your newly acquired skills.' },
  { icon: 'fas fa-dollar-sign',    title: 'Affordable Fee Structure',    desc: 'Quality education at competitive prices — accessible for everyone.' },
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
              the gap between education and real-world application.
            </p>
            <p className="about-paragraph">
              <strong>Our Mission:</strong> We focus on skill-based, practical learning
              and career growth. Every course, task, and reward is designed to help you
              build confidence and income simultaneously.
            </p>
          </div>

          <div className="about-intro-highlights">
            <div className="highlight-box">
              <div className="highlight-icon">
                <i className="fas fa-bullseye" />
              </div>
              <h3 className="highlight-title">Our Mission</h3>
              <p className="highlight-text">
                Empowering individuals with practical skills, real earnings, and career opportunities across Pakistan.
              </p>
            </div>

            <div className="highlight-box">
              <div className="highlight-icon">
                <i className="fas fa-eye" />
              </div>
              <h3 className="highlight-title">Our Vision</h3>
              <p className="highlight-text">
                To become Pakistan's leading platform where skill meets opportunity and learning drives prosperity.
              </p>
            </div>

            <div className="highlight-box fbr-highlight">
              <div className="highlight-icon">
                <i className="fas fa-shield-alt" />
              </div>
              <h3 className="highlight-title">FBR Registered</h3>
              <p className="highlight-text">
                Officially registered company — transparent, trustworthy, and compliant.
              </p>
            </div>
          </div>
        </div>

        {/* ── Separator ── */}
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

        {/* ── Separator ── */}
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
              <p className="value-desc">
                We constantly evolve our teaching methods to provide cutting-edge learning experiences.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon"><i className="fas fa-handshake" /></div>
              <h3 className="value-title">Integrity</h3>
              <p className="value-desc">
                Transparency and honesty guide every decision we make for our community.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon"><i className="fas fa-chart-line" /></div>
              <h3 className="value-title">Excellence</h3>
              <p className="value-desc">
                We deliver high-quality education and maintain the highest standards in everything.
              </p>
            </div>
            <div className="value-card">
              <div className="value-icon"><i className="fas fa-users-cog" /></div>
              <h3 className="value-title">Community</h3>
              <p className="value-desc">
                Building a supportive network where learners grow together and succeed together.
              </p>
            </div>
          </div>
        </div>

        {/* ── Separator ── */}
        <div className="section-separator" />

        {/* ── Why Choose ── */}
        <div className="why-choose-section">
          <div className="why-choose-header">
            <div className="eyebrow" style={{ margin: '0 auto 1rem' }}>
              <i className="fas fa-check-circle" style={{ fontSize: '0.7rem', color: 'var(--gold-dark)' }} />
              Why Choose Us
            </div>
            <h2 className="why-choose-title">What Makes Us Different</h2>
            <div className="gold-divider center" />
          </div>

          <div className="features-grid">
            {features.slice(0, 3).map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon"><i className={f.icon} /></div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-description">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="features-grid-bottom">
            {features.slice(3).map((f, i) => (
              <div className="feature-card" key={i}>
                <div className="feature-icon"><i className={f.icon} /></div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-description">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;
