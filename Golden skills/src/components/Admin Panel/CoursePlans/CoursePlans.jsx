import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import './CoursePlans.css';

const CoursePlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'premium',
    price: '',
    description: '',
    features: [''],
    isActive: true
  });

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.COURSE_PLANS.GET_ALL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPlans(data.plans || []);
      }
    } catch (err) {
      console.error('Failed to fetch course plans:', err);
      alert('Failed to load course plans');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = () => {
    setModalMode('add');
    setSelectedPlan(null);
    setFormData({
      title: '',
      category: 'premium',
      price: '',
      description: '',
      features: [''],
      isActive: true
    });
    setShowModal(true);
  };

  const handleEditPlan = (plan) => {
    setModalMode('edit');
    setSelectedPlan(plan);
    setFormData({
      title: plan.title,
      category: plan.category,
      price: plan.price,
      description: plan.description || '',
      features: plan.features && plan.features.length > 0 ? plan.features : [''],
      isActive: plan.isActive
    });
    setShowModal(true);
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm('Are you sure you want to delete this course plan?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.COURSE_PLANS.DELETE(planId), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Course plan deleted successfully');
        fetchPlans();
      } else {
        alert(data.message || 'Failed to delete course plan');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete course plan');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const filteredFeatures = formData.features.filter(f => f.trim() !== '');

    try {
      const token = localStorage.getItem('adminToken');
      const url = modalMode === 'add' 
        ? API_ENDPOINTS.COURSE_PLANS.CREATE 
        : API_ENDPOINTS.COURSE_PLANS.UPDATE(selectedPlan._id);
      
      const res = await fetch(url, {
        method: modalMode === 'add' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          features: filteredFeatures
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`Course plan ${modalMode === 'add' ? 'created' : 'updated'} successfully`);
        setShowModal(false);
        fetchPlans();
      } else {
        alert(data.message || `Failed to ${modalMode} course plan`);
      }
    } catch (err) {
      console.error(err);
      alert(`Failed to ${modalMode} course plan`);
    }
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index) => {
    if (formData.features.length > 1) {
      const newFeatures = formData.features.filter((_, i) => i !== index);
      setFormData({ ...formData, features: newFeatures });
    }
  };

  if (loading) {
    return <div className="loading">Loading course plans...</div>;
  }

  return (
    <div className="course-plans-container">
      <div className="plans-header">
        <h1>Course Plans Management</h1>
        <button className="btn-add-plan" onClick={handleAddPlan}>
          <FaPlus /> Add Course Plan
        </button>
      </div>

      <div className="plans-grid">
        {plans.length === 0 ? (
          <div className="no-plans">
            <p>No course plans found. Create your first plan!</p>
            <button className="btn-add-first" onClick={handleAddPlan}>
              <FaPlus /> Create Course Plan
            </button>
          </div>
        ) : (
          plans.map(plan => (
            <div key={plan._id} className={`plan-card ${plan.category}`}>
              <div className="plan-header">
                <span className={`category-badge ${plan.category}`}>
                  {plan.category.toUpperCase()}
                </span>
                <span className={`status-badge ${plan.isActive ? 'active' : 'inactive'}`}>
                  {plan.isActive ? <><FaCheckCircle /> Active</> : <><FaTimesCircle /> Inactive</>}
                </span>
              </div>
              
              <h3>{plan.title}</h3>
              <div className="plan-price">
                {plan.price}
              </div>
              
              {plan.description && (
                <p className="plan-desc">{plan.description}</p>
              )}
              
              {plan.features && plan.features.length > 0 && (
                <ul className="features-list">
                  {plan.features.map((feature, idx) => (
                    <li key={idx}>{feature}</li>
                  ))}
                </ul>
              )}
              
              <div className="plan-actions">
                <button className="btn-edit" onClick={() => handleEditPlan(plan)}>
                  <FaEdit /> Edit
                </button>
                <button className="btn-delete" onClick={() => handleDeletePlan(plan._id)}>
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{modalMode === 'add' ? 'Add' : 'Edit'} Course Plan</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                  disabled={modalMode === 'edit'}
                >
                  <option value="premium">Premium</option>
                  <option value="pro">Pro</option>
                  <option value="lite">Lite</option>
                </select>
                {modalMode === 'edit' && (
                  <small>Category cannot be changed after creation</small>
                )}
              </div>

              <div className="form-group">
                <label>Price *</label>
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g., Rs 4999"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Features</label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="feature-input-group">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => handleFeatureChange(index, e.target.value)}
                      placeholder={`Feature ${index + 1}`}
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove-feature"
                        onClick={() => removeFeature(index)}
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn-add-feature" onClick={addFeature}>
                  <FaPlus /> Add Feature
                </button>
              </div>

              <div className="form-group checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {modalMode === 'add' ? 'Create' : 'Update'} Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursePlans;
