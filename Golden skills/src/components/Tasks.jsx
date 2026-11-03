import { useState, useEffect } from 'react';
import './Tasks.css';
import learnImg from '../assets/learn.png';
import applyImg from '../assets/appply.png';
import rewardImg from '../assets/reward.png';
import { API_ENDPOINTS } from '../config/apiConfig';

const Tasks = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PLANS.GET_ALL);
      const data = await response.json();
      if (data.success) {
        setPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="tasks-section">
      <div className="tasks-inner">

        {/* Header */}
        <div className="tasks-header">
          <div className="eyebrow" style={{ margin: '0 auto 1rem', color: 'var(--gold)', borderColor: 'rgba(212,175,55,0.4)', background: 'rgba(212,175,55,0.12)' }}>
            <i className="fas fa-mobile-alt" style={{ fontSize: '0.7rem' }} />
            Mobile App Exclusive
          </div>
          <h2 className="tasks-title">Skill-Based Tasks</h2>
          <p className="tasks-description">
            Tasks are available inside the <span className="highlight">Golden Skills</span> mobile app only.
            Each task is carefully designed to test and strengthen the skills you learn through our courses.
          </p>
          <p className="tasks-description">
            Complete practical assignments, grow your abilities, and earn real performance-based rewards —
            all from the comfort of your mobile phone.
          </p>
        </div>

        {/* Stats Row */}
        <div className="tasks-stats-row">
          <div className="tasks-stat">
            <span className="tasks-stat-number">500+</span>
            <span className="tasks-stat-label">Tasks Available</span>
          </div>
          <div className="tasks-stat-divider" />
          <div className="tasks-stat">
            <span className="tasks-stat-number">Daily</span>
            <span className="tasks-stat-label">New Tasks Added</span>
          </div>
          <div className="tasks-stat-divider" />
          <div className="tasks-stat">
            <span className="tasks-stat-number">Real</span>
            <span className="tasks-stat-label">Cash Rewards</span>
          </div>
          <div className="tasks-stat-divider" />
          <div className="tasks-stat">
            <span className="tasks-stat-number">24/7</span>
            <span className="tasks-stat-label">Available Anytime</span>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="tasks-grid">
          <div className="task-card">
            <div className="task-card-label">
              <i className="fas fa-book-open"></i> Learn a Skill
            </div>
            <img src={learnImg} alt="Learn a skill" className="task-full-img" />
          </div>
          <div className="task-card">
            <div className="task-card-label">
              <i className="fas fa-tasks"></i> Apply in Tasks
            </div>
            <img src={applyImg} alt="Apply your knowledge in tasks" className="task-full-img" />
          </div>
          <div className="task-card">
            <div className="task-card-label">
              <i className="fas fa-coins"></i> Earn Rewards
            </div>
            <img src={rewardImg} alt="Get performance-based rewards" className="task-full-img" />
          </div>
        </div>

        {/* How Tasks Work */}
        <div className="tasks-how-section">
          <h3 className="tasks-how-title">How Tasks Work</h3>
          <p className="tasks-how-desc">
            Our task system is designed to make skill-building fun, rewarding, and career-focused.
            Here is exactly how you go from learning to earning:
          </p>
          <div className="tasks-steps-grid">
            <div className="tasks-step">
              <div className="tasks-step-num">01</div>
              <div className="tasks-step-icon"><i className="fas fa-download"></i></div>
              <h4>Download the App</h4>
              <p>Install the Golden Skills app on your Android phone. Register your account and complete your profile to get started.</p>
            </div>
            <div className="tasks-step">
              <div className="tasks-step-num">02</div>
              <div className="tasks-step-icon"><i className="fas fa-graduation-cap"></i></div>
              <h4>Enroll in a Course</h4>
              <p>Choose a course that matches your interest. Learn through structured lessons built by industry professionals.</p>
            </div>
            <div className="tasks-step">
              <div className="tasks-step-num">03</div>
              <div className="tasks-step-icon"><i className="fas fa-clipboard-check"></i></div>
              <h4>Get Assigned Tasks</h4>
              <p>Once enrolled, you will receive skill-based tasks directly in the app. Each task is matched to your course level.</p>
            </div>
            <div className="tasks-step">
              <div className="tasks-step-num">04</div>
              <div className="tasks-step-icon"><i className="fas fa-paper-plane"></i></div>
              <h4>Submit Your Work</h4>
              <p>Complete the task and submit your work through the app. Our team reviews every submission carefully.</p>
            </div>
            <div className="tasks-step">
              <div className="tasks-step-num">05</div>
              <div className="tasks-step-icon"><i className="fas fa-star"></i></div>
              <h4>Get Reviewed</h4>
              <p>Your submission is reviewed based on quality and accuracy. You receive detailed feedback to help you improve.</p>
            </div>
            <div className="tasks-step">
              <div className="tasks-step-num">06</div>
              <div className="tasks-step-icon"><i className="fas fa-wallet"></i></div>
              <h4>Earn Your Reward</h4>
              <p>Upon approval, your reward is credited to your Golden Skills wallet. Withdraw anytime to your bank account.</p>
            </div>
          </div>
        </div>

        {/* Features Strip */}
        <div className="tasks-features-strip">
          <div className="tasks-feature">
            <i className="fas fa-shield-alt"></i>
            <span>100% Secure Payments</span>
          </div>
          <div className="tasks-feature">
            <i className="fas fa-clock"></i>
            <span>Work at Your Own Pace</span>
          </div>
          <div className="tasks-feature">
            <i className="fas fa-chart-line"></i>
            <span>Track Your Progress</span>
          </div>
          <div className="tasks-feature">
            <i className="fas fa-headset"></i>
            <span>24/7 Support Team</span>
          </div>
          <div className="tasks-feature">
            <i className="fas fa-mobile-alt"></i>
            <span>Android App Only</span>
          </div>
        </div>

        {/* Note */}
        <div className="tasks-note">
          <i className="fas fa-info-circle" style={{ color: 'var(--gold)', fontSize: '1.1rem' }}></i>
          <p className="note-text">
            <strong>Important Note:</strong> All tasks are managed and completed exclusively inside the Golden Skills mobile app.
            No task submissions are accepted through this website. Download the app to get started.
          </p>
        </div>

      </div>
    </section>
  );
};

export default Tasks;