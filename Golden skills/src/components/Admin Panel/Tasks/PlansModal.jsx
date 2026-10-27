import { useState, useEffect } from 'react';
import './Tasks.css';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { FaTasks, FaPlus, FaTrash, FaCheckCircle, FaBox } from 'react-icons/fa';

const PlansModal = ({ onClose }) => {
  const [customPlan, setCustomPlan] = useState({ title: '', price: '', taxAmount: '', tutorialVideoUrl: '' });
  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch plans from API on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async (fresh = false) => {
    try {
      const url = fresh
        ? `${API_ENDPOINTS.PLANS.GET_ALL}?fresh=1`
        : API_ENDPOINTS.PLANS.GET_ALL;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setAllPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      alert('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPlanSubmit = async (e) => {
    e.preventDefault();
    if (customPlan.title && customPlan.price) {
      try {
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch(API_ENDPOINTS.PLANS.CREATE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: customPlan.title,
            price: `${customPlan.price} RS`,
            taxAmount: customPlan.taxAmount ? Number(customPlan.taxAmount) : 0,
            tutorialVideoUrl: customPlan.tutorialVideoUrl || ''
          })
        });

        const data = await response.json();
        
        if (data.success) {
          // Refresh plans list bypassing cache
          await fetchPlans(true);
          alert(`Plan created successfully: ${data.plan.title}`);
          setCustomPlan({ title: '', price: '', taxAmount: '', tutorialVideoUrl: '' });
        } else {
          alert(data.message || 'Failed to create plan');
        }
      } catch (error) {
        console.error('Error creating plan:', error);
        alert('Failed to create plan');
      }
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch(API_ENDPOINTS.PLANS.DELETE(planId), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (data.success) {
          // Refresh plans list bypassing cache
          await fetchPlans(true);
          alert('Plan deleted successfully');
        } else {
          alert(data.message || 'Failed to delete plan');
        }
      } catch (error) {
        console.error('Error deleting plan:', error);
        alert('Failed to delete plan');
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="plans-management-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <span className="modal-icon">
              <FaTasks />
            </span>
            <div>
              <h2>Plans Manager</h2>
              <p className="modal-subtitle">View and manage all plans</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-full">
          {loading ? (
            <div className="loading">Loading plans...</div>
          ) : (
            <>
              {/* Create New Plan Section */}
              <div className="create-plan-section">
                <h3><FaPlus /> Create New Plan</h3>
                <form onSubmit={handleCustomPlanSubmit} className="inline-form">
                  <div className="form-row-inline">
                    <div className="form-group-inline">
                      <label>Plan Title *</label>
                      <input 
                        type="text" 
                        className="form-control-inline" 
                        placeholder="e.g., Premium Plan"
                        value={customPlan.title}
                        onChange={(e) => setCustomPlan({...customPlan, title: e.target.value})}
                        required 
                      />
                    </div>
                    
                    <div className="form-group-inline">
                      <label>Price (RS) *</label>
                      <input 
                        type="number" 
                        className="form-control-inline" 
                        placeholder="e.g., 1570"
                        value={customPlan.price}
                        onChange={(e) => setCustomPlan({...customPlan, price: e.target.value})}
                        min="1"
                        required
                      />
                    </div>

                    <div className="form-group-inline">
                      <label>Tax Amount (RS)</label>
                      <input 
                        type="number" 
                        className="form-control-inline" 
                        placeholder="e.g., 97"
                        value={customPlan.taxAmount}
                        onChange={(e) => setCustomPlan({...customPlan, taxAmount: e.target.value})}
                        min="0"
                      />
                      {customPlan.price && customPlan.taxAmount && (
                        <small style={{ color: '#16a34a', marginTop: '4px', display: 'block', fontWeight: '600' }}>
                          Net: Rs. {Number(customPlan.price) - Number(customPlan.taxAmount)}
                        </small>
                      )}
                    </div>
                  </div>

                  {/* Tutorial Video URL - Optional */}
                  <div className="form-group-inline full-width" style={{ marginTop: '12px' }}>
                    <label>📹 Tutorial Video URL <span style={{ color: '#94a3b8', fontSize: '12px' }}>(Optional)</span></label>
                    <input 
                      type="url" 
                      className="form-control-inline" 
                      placeholder="e.g., https://youtube.com/watch?v=abc123 — Helps users understand this plan"
                      value={customPlan.tutorialVideoUrl}
                      onChange={(e) => setCustomPlan({...customPlan, tutorialVideoUrl: e.target.value})}
                    />
                    <small style={{ color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Add a YouTube link so users know how to complete tasks for this plan
                    </small>
                  </div>

                  <div style={{ marginTop: '12px' }}>
                    <button type="submit" className="btn-create-inline">
                      <FaCheckCircle /> Create
                    </button>
                  </div>
                </form>
              </div>

              {/* Divider */}
              <div className="section-divider">
                <span>Existing Plans</span>
              </div>

              {/* Plans List */}
              <div className="plans-list-section">
                {allPlans.length === 0 ? (
                  <div className="no-plans-message">
                    <div className="empty-icon">
                      <FaBox />
                    </div>
                    <h4>No Plans Yet</h4>
                    <p>Create your first plan using the form above</p>
                  </div>
                ) : (
                  <div className="plans-grid-modal">
                    {allPlans.map((plan) => (
                      <div key={plan._id} className="plan-card-modal">
                        <div className="plan-card-header">
                          <h4>{plan.title}</h4>
                          <button 
                            className="btn-delete-small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePlan(plan._id);
                            }}
                            title="Delete Plan"
                          >
                            <FaTrash />
                          </button>
                        </div>
                        <div className="plan-card-price">
                          <span className="price-tag">{plan.price}</span>
                          {plan.taxAmount > 0 && (
                            <div style={{ marginTop: '4px', fontSize: '12px' }}>
                              <span style={{ color: '#dc2626' }}>Tax: Rs. {plan.taxAmount}</span>
                              <span style={{ color: '#16a34a', marginLeft: '8px', fontWeight: '700' }}>
                                Net: Rs. {parseInt(plan.price) - plan.taxAmount}
                              </span>
                            </div>
                          )}
                        </div>
                        {/* Tutorial Video Link */}
                        {plan.tutorialVideoUrl && (
                          <div className="plan-card-video" style={{ padding: '6px 0' }}>
                            <a
                              href={plan.tutorialVideoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ fontSize: '12px', color: '#e53e3e', display: 'flex', alignItems: 'center', gap: '4px' }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              📹 Tutorial Video
                            </a>
                          </div>
                        )}
                        <div className="plan-card-footer">
                          <span className="status-tag active">
                            <FaCheckCircle /> Active
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button 
            className="btn-close-modal"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlansModal;
