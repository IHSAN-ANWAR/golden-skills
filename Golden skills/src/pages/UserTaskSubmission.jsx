import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/apiConfig';
import './UserTaskSubmission.css';
import { FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';

const UserTaskSubmission = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    userPhone: '',
    paymentScreenshot: ''
  });

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
      alert('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setShowForm(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentScreenshotUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          paymentScreenshot: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.userName.trim()) {
      alert('Please enter your name');
      return;
    }

    if (!formData.paymentScreenshot) {
      alert('Please upload your payment screenshot');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(API_ENDPOINTS.SUBMISSIONS.SUBMIT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          planId: selectedPlan._id,
          userName: formData.userName,
          userEmail: formData.userEmail,
          userPhone: formData.userPhone,
          userImage: formData.paymentScreenshot // Changed to use payment screenshot
        })
      });

      const data = await response.json();
      
      if (data.success) {
        alert('Payment verification submitted successfully! Admin will review your payment.');
        setShowForm(false);
        setSelectedPlan(null);
        setFormData({
          userName: '',
          userEmail: '',
          userPhone: '',
          paymentScreenshot: ''
        });
      } else {
        alert(data.message || 'Failed to submit payment verification');
      }
    } catch (error) {
      console.error('Error submitting payment verification:', error);
      alert('Failed to submit payment verification. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="user-task-container">
        <div className="loading">Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="user-task-container">
      <div className="user-task-header">
        <h1>Select Your Plan</h1>
        <p>Choose a plan to get started with your tasks</p>
      </div>

      {/* Plans Selection Screen */}
      {!showForm && (
        <div className="plans-selection-screen">
          {plans.length === 0 ? (
            <div className="no-plans-alert">
              <div className="alert-icon">⚠️</div>
              <h3>No Plans Available</h3>
              <p>Please check back later for available plans</p>
            </div>
          ) : (
            <div className="plans-cards-container">
              {plans.map((plan) => (
                <div 
                  key={plan._id} 
                  className="plan-selection-card"
                  onClick={() => handlePlanSelect(plan)}
                >
                  <div className="plan-card-header">
                    <h3>{plan.title}</h3>
                  </div>
                  <div className="plan-card-body">
                    <div className="plan-price-tag">
                      <span className="price-label">Price</span>
                      <span className="price-value">{plan.price}</span>
                    </div>
                    {plan.description && (
                      <p className="plan-description">{plan.description}</p>
                    )}
                  </div>
                  <div className="plan-card-footer">
                    <button className="btn-select-plan">
                      Select Plan
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Submission Form */}
      {showForm && selectedPlan && (
        <div className="submission-form-container">
          <div className="form-card">
            <div className="form-header">
              <h2>Submit Your Information</h2>
              <p>Plan: <strong>{selectedPlan.title}</strong> - {selectedPlan.price}</p>
            </div>

            <form onSubmit={handleSubmit} className="submission-form">
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="userEmail"
                  value={formData.userEmail}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="userPhone"
                  value={formData.userPhone}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                />
              </div>

              <div className="form-group">
                <label>Upload Payment Screenshot *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePaymentScreenshotUpload}
                  className="file-input"
                  required
                />
                {formData.paymentScreenshot && (
                  <div className="image-preview">
                    <img src={formData.paymentScreenshot} alt="Payment Screenshot Preview" />
                  </div>
                )}
                <small className="form-hint">Upload your payment confirmation screenshot</small>
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => {
                    setShowForm(false);
                    setSelectedPlan(null);
                  }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTaskSubmission;
