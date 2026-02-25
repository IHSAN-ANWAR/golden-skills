import { useState, useEffect } from 'react';
import './Courses.css';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { FaBook, FaPlus, FaTrash, FaCheckCircle, FaBox } from 'react-icons/fa';

const CoursePlansModal = ({ onClose }) => {
  const [customPlan, setCustomPlan] = useState({ title: '', category: 'premium', price: '' });
  const [allPlans, setAllPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch plans from API on component mount
  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.COURSE_PLANS.GET_ALL);
      const data = await response.json();
      
      if (data.success) {
        setAllPlans(data.plans);
      }
    } catch (error) {
      console.error('Error fetching course plans:', error);
      alert('Failed to load course plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPlanSubmit = async (e) => {
    e.preventDefault();
    if (customPlan.title && customPlan.category && customPlan.price) {
      try {
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch(API_ENDPOINTS.COURSE_PLANS.CREATE, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title: customPlan.title,
            category: customPlan.category,
            price: `Rs ${customPlan.price}`
          })
        });

        const data = await response.json();
        
        if (data.success) {
          // Refresh plans list
          await fetchPlans();
          alert(`Course plan created successfully: ${data.plan.title}`);
          setCustomPlan({ title: '', category: 'premium', price: '' });
        } else {
          alert(data.message || 'Failed to create course plan');
        }
      } catch (error) {
        console.error('Error creating course plan:', error);
        alert('Failed to create course plan');
      }
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this course plan?')) {
      try {
        const token = localStorage.getItem('adminToken');
        
        const response = await fetch(API_ENDPOINTS.COURSE_PLANS.DELETE(planId), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        
        if (data.success) {
          // Refresh plans list
          await fetchPlans();
          alert('Course plan deleted successfully');
        } else {
          alert(data.message || 'Failed to delete course plan');
        }
      } catch (error) {
        console.error('Error deleting course plan:', error);
        alert('Failed to delete course plan');
      }
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch(category) {
      case 'premium': return 'category-badge-premium';
      case 'pro': return 'category-badge-pro';
      case 'lite': return 'category-badge-lite';
      default: return 'category-badge-premium';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="plans-management-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div className="modal-title-section">
            <span className="modal-icon">
              <FaBook />
            </span>
            <div>
              <h2>Course Plans Manager</h2>
              <p className="modal-subtitle">View and manage all course plans</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-full">
          {loading ? (
            <div className="loading">Loading course plans...</div>
          ) : (
            <>
              {/* Create New Plan Section */}
              <div className="create-plan-section">
                <h3><FaPlus /> Create New Course Plan</h3>
                <form onSubmit={handleCustomPlanSubmit} className="inline-form">
                  <div className="form-row-inline">
                    <div className="form-group-inline">
                      <label>Plan Title *</label>
                      <input 
                        type="text" 
                        className="form-control-inline" 
                        placeholder="e.g., Premium Course Plan"
                        value={customPlan.title}
                        onChange={(e) => setCustomPlan({...customPlan, title: e.target.value})}
                        required 
                      />
                    </div>
                    
                    <div className="form-group-inline">
                      <label>Category *</label>
                      <select 
                        className="form-control-inline" 
                        value={customPlan.category}
                        onChange={(e) => setCustomPlan({...customPlan, category: e.target.value})}
                        required
                      >
                        <option value="premium">Premium</option>
                        <option value="pro">Pro</option>
                        <option value="lite">Lite</option>
                      </select>
                    </div>
                    
                    <div className="form-group-inline">
                      <label>Price (Rs) *</label>
                      <input 
                        type="number" 
                        className="form-control-inline" 
                        placeholder="e.g., 4999"
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
                <span>Existing Course Plans</span>
              </div>

              {/* Plans List */}
              <div className="plans-list-section">
                {allPlans.length === 0 ? (
                  <div className="no-plans-message">
                    <div className="empty-icon">
                      <FaBox />
                    </div>
                    <h4>No Course Plans Yet</h4>
                    <p>Create your first course plan using the form above</p>
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
                        <div className="plan-card-body">
                          <span className={`category-badge-modal ${getCategoryBadgeClass(plan.category)}`}>
                            {plan.category.toUpperCase()}
                          </span>
                        </div>
                        <div className="plan-card-price">
                          <span className="price-tag">{plan.price}</span>
                        </div>
                        <div className="plan-card-footer">
                          <span className={`status-tag ${plan.isActive ? 'active' : 'inactive'}`}>
                            <FaCheckCircle /> {plan.isActive ? 'Active' : 'Inactive'}
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

export default CoursePlansModal;
