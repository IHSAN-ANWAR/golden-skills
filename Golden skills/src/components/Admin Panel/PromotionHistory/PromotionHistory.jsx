import { useState, useEffect } from 'react';
import './PromotionHistory.css';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { FaUser, FaEnvelope, FaPhone, FaEye, FaCheckCircle, FaTimesCircle, FaTrash, FaBullhorn } from 'react-icons/fa';

const PromotionHistory = () => {
  const [submissions, setSubmissions] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    let filtered = allSubmissions;
    if (filter !== 'all') {
      filtered = filtered.filter(s => s.paymentStatus === filter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.userName?.toLowerCase().includes(term) ||
        s.userEmail?.toLowerCase().includes(term) ||
        s.promotionTitle?.toLowerCase().includes(term)
      );
    }
    setSubmissions(filtered);
  }, [filter, searchTerm, allSubmissions]);

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.USER_PROMOTIONS.GET_ALL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAllSubmissions(data.userPromotions || []);
    } catch (err) {
      console.error('Error fetching promotion submissions:', err);
      alert('Failed to load promotion submissions');
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (id, paymentStatus, notes = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.USER_PROMOTIONS.UPDATE_PAYMENT(id), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus, paymentNotes: notes })
      });
      const data = await res.json();
      if (data.success) {
        setAllSubmissions(prev =>
          prev.map(s => s._id === id ? { ...s, paymentStatus, paymentNotes: notes, status: paymentStatus === 'approved' ? 'active' : 'rejected' } : s)
        );
        alert(`Payment ${paymentStatus} successfully!`);
      } else {
        alert(data.message || 'Failed to update');
      }
    } catch (err) {
      alert('Failed to update payment status');
    }
  };

  const handleApprove = (id) => {
    const notes = prompt('Add notes (optional):') || '';
    updatePaymentStatus(id, 'approved', notes);
  };

  const handleReject = (id) => {
    const reason = prompt('Rejection reason:') || '';
    updatePaymentStatus(id, 'rejected', reason);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this submission?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.USER_PROMOTIONS.DELETE(id), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setAllSubmissions(prev => prev.filter(s => s._id !== id));
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const viewDetails = (sub) => {
    const modal = document.createElement('div');
    modal.className = 'submission-modal-overlay';
    modal.innerHTML = `
      <div class="submission-modal-content">
        <div class="submission-modal-header">
          <h2>Promotion Submission Details</h2>
          <button class="submission-modal-close">✕</button>
        </div>
        <div class="submission-modal-body">
          <div class="submission-section">
            <h3>User Information</h3>
            <p><strong>Name:</strong> ${sub.userName}</p>
            <p><strong>Email:</strong> ${sub.userEmail}</p>
            <p><strong>Phone:</strong> ${sub.userPhone || 'N/A'}</p>
          </div>
          <div class="submission-section">
            <h3>Plan Details</h3>
            <p><strong>Plan:</strong> ${sub.planTitle}</p>
            <p><strong>Price:</strong> Rs. ${sub.planPrice}</p>
          </div>
          <div class="submission-section">
            <h3>Promotion</h3>
            <p><strong>Promotion:</strong> ${sub.promotionTitle || 'N/A'}</p>
            <p><strong>Reward:</strong> Rs. ${sub.rewardAmount || 'N/A'}</p>
          </div>
          ${sub.userImage ? `
          <div class="submission-section highlight">
            <h3>Payment Screenshot</h3>
            <img src="${sub.userImage}" alt="Payment" style="max-width:100%;border-radius:8px;margin-top:8px;" />
          </div>` : ''}
          <div class="submission-section">
            <h3>Status</h3>
            <p><strong>Payment Status:</strong> ${sub.paymentStatus}</p>
            <p><strong>Notes:</strong> ${sub.paymentNotes || 'None'}</p>
            <p><strong>Submitted:</strong> ${new Date(sub.submittedAt || sub.createdAt).toLocaleString()}</p>
          </div>
        </div>
      </div>
    `;
    modal.querySelector('.submission-modal-close').onclick = () => document.body.removeChild(modal);
    modal.onclick = (e) => { if (e.target === modal) document.body.removeChild(modal); };
    document.body.appendChild(modal);
  };

  const counts = {
    pending: allSubmissions.filter(s => s.paymentStatus === 'pending').length,
    approved: allSubmissions.filter(s => s.paymentStatus === 'approved').length,
    rejected: allSubmissions.filter(s => s.paymentStatus === 'rejected').length
  };

  return (
    <div className="task-history-container">
      {/* Header */}
      <div className="history-header">
        <h1><FaBullhorn /> Promotion Payment Verifications</h1>
        <p>Review and approve user plan purchases for promotions</p>
      </div>

      {/* Search */}
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by name, email or promotion..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button className="clear-search-btn" onClick={() => setSearchTerm('')}>×</button>
          )}
        </div>
        {searchTerm && (
          <div className="search-results-info">
            Found {submissions.length} result(s) for "{searchTerm}"
          </div>
        )}
      </div>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        {['pending', 'approved', 'rejected'].map(f => (
          <button
            key={f}
            className={filter === f ? 'active' : ''}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading submissions...</div>
      ) : (
        <div className="submissions-table-container">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Plan</th>
                <th>Promotion</th>
                <th>Reward</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan="9">
                    <div className="no-submissions-content">
                      <FaBullhorn className="no-submissions-icon" />
                      <h3>No {filter} submissions found</h3>
                      <p>No promotion payment verifications match your filter</p>
                    </div>
                  </td>
                </tr>
              ) : (
                submissions.map((sub, index) => (
                  <tr key={sub._id}>
                    <td>
                      <div className="user-name-cell">
                        <div className="user-avatar-small"><FaUser /></div>
                        <span className="user-fullname">{sub.userName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="email-cell">
                        <FaEnvelope className="email-icon" />
                        {sub.userEmail}
                      </div>
                    </td>
                    <td>
                      <div className="phone-cell">
                        <FaPhone className="phone-icon" />
                        {sub.userPhone || 'N/A'}
                      </div>
                    </td>
                    <td>
                      <span className="plan-title">{sub.planTitle}</span>
                      <br />
                      <small style={{ color: '#28a745', fontWeight: 600 }}>Rs. {sub.planPrice}</small>
                    </td>
                    <td>{sub.promotionTitle || '—'}</td>
                    <td>
                      {sub.rewardAmount ? (
                        <span className="price-cell">
                          <span className="price-currency">Rs.</span> {sub.rewardAmount}
                        </span>
                      ) : '—'}
                    </td>
                    <td>
                      {sub.userImage ? (
                        <div className="payment-image-cell">
                          <img
                            src={sub.userImage}
                            alt="Payment"
                            className="payment-thumbnail"
                            onClick={() => window.open(sub.userImage, '_blank')}
                          />
                        </div>
                      ) : (
                        <span className="no-image-text">No image</span>
                      )}
                    </td>
                    <td>
                      <span className={`status-badge status-${sub.paymentStatus}`}>
                        {sub.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="action-btn view-btn" title="View Details" onClick={() => viewDetails(sub)}>
                          <FaEye />
                        </button>
                        {sub.paymentStatus === 'pending' && (
                          <>
                            <button className="action-btn approve-btn" title="Approve" onClick={() => handleApprove(sub._id)}>
                              <FaCheckCircle />
                            </button>
                            <button className="action-btn reject-btn" title="Reject" onClick={() => handleReject(sub._id)}>
                              <FaTimesCircle />
                            </button>
                          </>
                        )}
                        <button className="action-btn delete-btn" title="Delete" onClick={() => handleDelete(sub._id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PromotionHistory;
