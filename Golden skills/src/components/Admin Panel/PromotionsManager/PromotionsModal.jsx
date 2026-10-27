import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { FaBullhorn, FaTimes, FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff } from 'react-icons/fa';

const PromotionsModal = ({ onClose }) => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    requiredPlanPrice: '',
    rewardAmount: ''
  });

  useEffect(() => {
    fetchPromotions();
  }, []);

  const fetchPromotions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.PROMOTIONS.GET_ALL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setPromotions(data.promotions || []);
    } catch (err) {
      console.error('Error fetching promotions:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingPromotion(null);
    setForm({ title: '', description: '', requiredPlanPrice: '', rewardAmount: '' });
    setShowForm(true);
  };

  const openEdit = (promo) => {
    setEditingPromotion(promo);
    setForm({
      title: promo.title,
      description: promo.description || '',
      requiredPlanPrice: promo.requiredPlanPrice,
      rewardAmount: promo.rewardAmount
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.requiredPlanPrice.trim() || !form.rewardAmount.trim()) {
      alert('Title, required plan price, and reward amount are required');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('adminToken');
      const url = editingPromotion
        ? API_ENDPOINTS.PROMOTIONS.UPDATE(editingPromotion._id)
        : API_ENDPOINTS.PROMOTIONS.CREATE;
      const method = editingPromotion ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        alert(editingPromotion ? 'Promotion updated!' : 'Promotion created!');
        setShowForm(false);
        fetchPromotions();
      } else {
        alert(data.message || 'Failed to save');
      }
    } catch (err) {
      alert('Error saving promotion');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (promo) => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.PROMOTIONS.UPDATE(promo._id), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !promo.isActive })
      });
      const data = await res.json();
      if (data.success) fetchPromotions();
    } catch (err) {
      alert('Error toggling promotion');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this promotion?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.PROMOTIONS.DELETE(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPromotions(prev => prev.filter(p => p._id !== id));
      }
    } catch (err) {
      alert('Error deleting promotion');
    }
  };

  return (
    <div className="promo-modal-overlay" onClick={onClose}>
      <div className="promo-modal-box" onClick={e => e.stopPropagation()}>
        <div className="promo-modal-header">
          <h2><FaBullhorn /> Manage Promotions</h2>
          <button className="promo-modal-close" onClick={onClose}><FaTimes /></button>
        </div>

        <div className="promo-modal-body">
          {!showForm ? (
            <>
              <button className="promo-add-btn" onClick={openCreate}>
                <FaPlus /> Add New Promotion
              </button>

              {loading ? (
                <p className="promo-loading">Loading...</p>
              ) : promotions.length === 0 ? (
                <p className="promo-empty">No promotions yet. Create one!</p>
              ) : (
                <div className="promo-list">
                  {promotions.map(promo => (
                    <div key={promo._id} className={`promo-item ${!promo.isActive ? 'inactive' : ''}`}>
                      <div className="promo-item-info">
                        <h3>{promo.title}</h3>
                        {promo.description && <p className="promo-desc">{promo.description}</p>}
                        <div className="promo-meta">
                          <span className="promo-badge plan">Plan: Rs. {promo.requiredPlanPrice}</span>
                          <span className="promo-badge reward">Reward: Rs. {promo.rewardAmount}</span>
                          <span className={`promo-badge status ${promo.isActive ? 'active' : 'inactive'}`}>
                            {promo.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="promo-item-actions">
                        <button className="promo-action-btn toggle" onClick={() => handleToggle(promo)} title="Toggle Active">
                          {promo.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                        <button className="promo-action-btn edit" onClick={() => openEdit(promo)} title="Edit">
                          <FaEdit />
                        </button>
                        <button className="promo-action-btn delete" onClick={() => handleDelete(promo._id)} title="Delete">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="promo-form">
              <h3>{editingPromotion ? 'Edit Promotion' : 'New Promotion'}</h3>
              <div className="promo-form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Promotion"
                />
              </div>
              <div className="promo-form-group">
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Describe this promotion..."
                  rows={3}
                />
              </div>
              <div className="promo-form-row">
                <div className="promo-form-group">
                  <label>Required Plan Price (Rs.) *</label>
                  <input
                    type="text"
                    value={form.requiredPlanPrice}
                    onChange={e => setForm({ ...form, requiredPlanPrice: e.target.value })}
                    placeholder="e.g. 5000"
                  />
                </div>
                <div className="promo-form-group">
                  <label>Reward Amount (Rs.) *</label>
                  <input
                    type="text"
                    value={form.rewardAmount}
                    onChange={e => setForm({ ...form, rewardAmount: e.target.value })}
                    placeholder="e.g. 15000"
                  />
                </div>
              </div>
              <div className="promo-form-actions">
                <button className="promo-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button className="promo-save-btn" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Promotion'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromotionsModal;
