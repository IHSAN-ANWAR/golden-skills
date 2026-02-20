import { useState, useEffect } from 'react';
import './Tasks.css';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { FaTasks, FaPlus, FaTrash, FaCheckCircle, FaBox } from 'react-icons/fa';

const PlansModal = ({ onClose }) => {
  const [customPlan, setCustomPlan] = useState({ title: '', price: '' });
  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch plans from API on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PLANS.GET_ALL);
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
            price: `${customPlan.price} RS`
          })
        });

        const data = await response.json();
        
        if (data.success) {
          // Refresh plans list
          await fetchPlans();
          alert(`Plan created successfully: ${data.plan.title}`);
          setCustomPlan({ title: '', price: '' });
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
          // Refresh plans list
          await fetchPlans();
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
                        placeholder="e.g., 500"
                        value={customPlan.price}
                        onChange={(e) => setCustomPlan({...customPlan, price: e.target.value})}
                        min="1"
                        required
                      />
                    </div>
                    
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
                        </div>
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
