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
      <div className="container-fluid">
        <div className="tasks-content text-center">
          {/* Tasks Header */}
          <div className="tasks-header">
            <h2 className="tasks-title">Skill-Based Tasks</h2>
            <p className="tasks-description">
              Tasks are available inside the <span className="highlight">Golden Skills</span> mobile application only.
            </p>
            <p className="tasks-description">
              Users complete practical assignments related to their selected<br />
              skills to gain experience and rewards.
            </p>
          </div>

          {/* Tasks Grid */}
          <div className="tasks-grid">
            {/* Learn a skill */}
            <div className="task-card">
              <img 
                src={learnImg} 
                alt="Learn a skill" 
                className="task-full-img"
              />
            </div>

            {/* Apply your knowledge in tasks */}
            <div className="task-card">
              <img 
                src={applyImg} 
                alt="Apply your knowledge in tasks" 
                className="task-full-img"
              />
            </div>

            {/* Get performance-based rewards */}
            <div className="task-card">
              <img 
                src={rewardImg} 
                alt="Get performance-based rewards" 
                className="task-full-img"
              />
            </div>
          </div>

          {/* Note Section */}
          <div className="tasks-note">
            <p className="note-text">
              <strong>Note:</strong> Tasks are managed and completed inside the Golden Skills mobile app.<br />
              No task submissions are done on this website.
            </p>
          </div>

          {/* Plans Section */}
          {plans.length > 0 && (
            <div className="plans-section" style={{ marginTop: '4rem' }}>
              <h2 className="tasks-title" style={{ marginBottom: '2rem' }}>Available Plans</h2>
              <div className="tasks-grid">
                {plans.map((plan) => (
                  <div key={plan._id} className="task-card" style={{ padding: '2rem' }}>
                    <h3 style={{ 
                      color: '#390910', 
                      fontSize: '1.5rem', 
                      marginBottom: '1rem',
                      fontWeight: '700'
                    }}>
                      {plan.title}
                    </h3>
                    <div style={{
                      fontSize: '2rem',
                      fontWeight: '800',
                      color: '#D4AF37',
                      margin: '1.5rem 0'
                    }}>
                      {plan.price}
                    </div>
                    {plan.description && (
                      <p style={{
                        color: '#6c757d',
                        fontSize: '1rem',
                        lineHeight: '1.5'
                      }}>
                        {plan.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Tasks;