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
          </p>
          <p className="tasks-description">
            Complete practical assignments, grow your skills, and earn real rewards.
          </p>
        </div>

        {/* Grid */}
        <div className="tasks-grid">
          <div className="task-card">
            <img src={learnImg}  alt="Learn a skill"                    className="task-full-img" />
          </div>
          <div className="task-card">
            <img src={applyImg}  alt="Apply your knowledge in tasks"     className="task-full-img" />
          </div>
          <div className="task-card">
            <img src={rewardImg} alt="Get performance-based rewards"     className="task-full-img" />
          </div>
        </div>

        {/* Note */}
        <div className="tasks-note">
          <p className="note-text">
            <strong>Note:</strong> Tasks are managed and completed inside the Golden Skills mobile app.
            No task submissions are done on this website.
          </p>
        </div>

      </div>
    </section>
  );
};

export default Tasks;