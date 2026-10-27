import { useState, useEffect } from 'react';
import './SubmittedPromotions.css';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { FaUser, FaEnvelope, FaTasks, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaEye, FaClipboardList, FaInfoCircle, FaMoneyBillWave, FaMedal } from 'react-icons/fa';

const SubmittedPromotions = () => {
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Rank modal state ─────────────────────────────────────────────────────
  const [showRankModal, setShowRankModal] = useState(false);
  const [rankTask, setRankTask] = useState(null);
  const [rankInput, setRankInput] = useState('');
  const [rankStartDate, setRankStartDate] = useState('');
  const [rankEndDate, setRankEndDate] = useState('');
  const [rankNoExpiry, setRankNoExpiry] = useState(false);
  const [assigningRank, setAssigningRank] = useState(false);

  useEffect(() => {
    fetchSubmittedTasks();
  }, []);

  const fetchSubmittedTasks = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('Please login first');
        window.location.href = '/admin/login';
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(API_ENDPOINTS.USER_PROMOTIONS.GET_ALL, { headers });
      const data = await res.json();

      if (data.success) {
        const rows = [];
        for (const promo of data.userPromotions || []) {
          for (const task of promo.tasks || []) {
            if (task.status === 'completed') {
              rows.push({ ...task, _promoId: promo._id, _userName: promo.userName, _userEmail: promo.userEmail, _promotionTitle: promo.promotionTitle, _rewardAmount: promo.rewardAmount, _promoStatus: promo.status, _rewardStatus: promo.rewardStatus });
            }
          }
        }
        setSubmittedTasks(rows);
      }
    } catch (err) {
      console.error('Error fetching submitted promotion tasks:', err);
      alert('Failed to load submitted tasks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const viewSubmission = (task) => {
    // Sanitize helper — strips HTML tags to prevent XSS
    const s = (str) => String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

    const modal = document.createElement('div');
    modal.className = 'submission-modal-overlay';
    modal.innerHTML = `
      <div class="submission-modal-content">
        <div class="submission-modal-header">
          <h2>Promotion Task Submission Review</h2>
          <button class="submission-modal-close">✕</button>
        </div>
        <div class="submission-modal-body">
          <div class="submission-section">
            <h3>User Information</h3>
            <p><strong>Name:</strong> ${s(task._userName)}</p>
            <p><strong>Email:</strong> ${s(task._userEmail)}</p>
          </div>
          <div class="submission-section">
            <h3>Promotion</h3>
            <p><strong>Promotion:</strong> ${s(task._promotionTitle)}</p>
            <p><strong>Reward:</strong> Rs. ${s(task._rewardAmount)}</p>
          </div>
          <div class="submission-section">
            <h3>Task Details</h3>
            <p><strong>Title:</strong> ${s(task.taskTitle)}</p>
            <p><strong>Description:</strong></p>
            <div class="submission-text">${s(task.taskDescription)}</div>
          </div>
          <div class="submission-section highlight">
            <h3>User Submission</h3>
            <div class="submission-text">${s(task.submissionData) || 'No submission data provided'}</div>
          </div>
          <div class="submission-section">
            <h3>User Notes</h3>
            <div class="submission-text">${s(task.userNotes) || 'No notes provided'}</div>
          </div>
          <div class="submission-section">
            <h3>Timeline</h3>
            <p><strong>Deadline:</strong> ${s(new Date(task.taskDeadline).toLocaleString())}</p>
            <p><strong>Submitted:</strong> ${task.completedAt ? s(new Date(task.completedAt).toLocaleString()) : 'Not completed'}</p>
          </div>
        </div>
        <div class="submission-modal-footer">
          <button class="btn-modal-close">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    const closeModal = () => document.body.removeChild(modal);
    modal.querySelector('.submission-modal-close').onclick = closeModal;
    modal.querySelector('.btn-modal-close').onclick = closeModal;
    modal.onclick = (e) => { if (e.target === modal) closeModal(); };
  };

  const handleApprove = async (task) => {
    const notes = window.prompt('Add approval notes (optional):', '') ;
    if (notes === null) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.USER_PROMOTIONS.UPDATE_TASK(task._promoId, task._id), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', adminNotes: notes || 'Task approved by admin' })
      });
      const data = await res.json();
      if (data.success) {
        alert('Task approved successfully!');
        fetchSubmittedTasks();
      } else {
        alert(data.message || 'Failed to approve task');
      }
    } catch (err) {
      alert('Failed to approve task: ' + err.message);
    }
  };

  const handleReject = async (task) => {
    const reason = window.prompt('Explain why the task is rejected:', '');
    if (reason === null || !reason.trim()) {
      if (reason !== null) alert('Please provide a reason for rejection');
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.USER_PROMOTIONS.UPDATE_TASK(task._promoId, task._id), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', adminNotes: reason })
      });
      const data = await res.json();
      if (data.success) {
        alert('Task rejected');
        fetchSubmittedTasks();
      } else {
        alert(data.message || 'Failed to reject task');
      }
    } catch (err) {
      alert('Failed to reject task: ' + err.message);
    }
  };

  const handleApproveReward = async (task) => {
    const notes = window.prompt('Add reward payment notes (optional):', '');
    if (notes === null) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.USER_PROMOTIONS.APPROVE_REWARD(task._promoId), {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardStatus: 'approved', rewardNotes: notes })
      });
      const data = await res.json();
      if (data.success) {
        alert('Reward approved successfully!');
        // Wait for list to refresh, then open rank modal with stable promoId
        await fetchSubmittedTasks();
        openRankModal(task);
      } else {
        alert(data.message || 'Failed to approve reward');
      }
    } catch (err) {
      alert('Failed to approve reward: ' + err.message);
    }
  };

  // ── Rank modal handlers ──────────────────────────────────────────────────
  const openRankModal = (task) => {
    setRankTask(task);
    setRankInput('');
    setRankStartDate(new Date().toISOString().split('T')[0]); // today
    setRankEndDate('');
    setRankNoExpiry(false);
    setShowRankModal(true);
  };

  const closeRankModal = () => {
    setShowRankModal(false);
    setRankTask(null);
  };

  const handleAssignRank = async (e) => {
    e.preventDefault();
    if (!rankInput.trim()) { alert('Please enter a rank name'); return; }
    if (!rankNoExpiry && !rankEndDate) { alert('Please set an expiry date or check "No Expiry"'); return; }

    setAssigningRank(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.USER_PROMOTIONS.ASSIGN_RANK(rankTask._promoId), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rank: rankInput.trim(),
          rankStartDate: rankStartDate,
          rankExpiresAt: rankNoExpiry ? null : rankEndDate
        })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Rank "${rankInput}" assigned to ${rankTask._userName} successfully!`);
        closeRankModal();
        fetchSubmittedTasks();
      } else {
        alert(data.message || 'Failed to assign rank');
      }
    } catch (err) {
      alert('Failed to assign rank: ' + err.message);
    } finally {
      setAssigningRank(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading submitted tasks...</div>;
  }

  return (
    <div className="submitted-tasks-container">
      <div className="submitted-header">
        <h1><FaClipboardList /> Submitted Promotion Tasks</h1>
        <p>Review promotion tasks submitted by users — approve or reject them</p>
      </div>

      {submittedTasks.length === 0 ? (
        <div className="no-submitted-tasks">
          <FaTasks size={80} />
          <h2>No Submitted Promotion Tasks</h2>
          <p>No promotion tasks have been submitted by users yet.</p>
          <p className="info-text">
            <FaInfoCircle /> Tasks will appear here when users complete and submit them.
          </p>
        </div>
      ) : (
        <div className="submitted-tasks-table-container">
          <table className="submitted-tasks-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Promotion</th>
                <th>Task Title</th>
                <th>Submitted Date</th>
                <th>Deadline</th>
                <th>Reward</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submittedTasks.map((task) => (
                <tr key={`${task._promoId}-${task._id}`}>
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar"><FaUser /></div>
                      <span>{task._userName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      <FaEnvelope />
                      <span>{task._userEmail}</span>
                    </div>
                  </td>
                  <td>{task._promotionTitle || '—'}</td>
                  <td>
                    <div className="task-title-cell">
                      <FaTasks />
                      <span>{task.taskTitle}</span>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <FaCalendarAlt />
                      <span>{task.completedAt ? new Date(task.completedAt).toLocaleDateString() : '—'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <FaCalendarAlt />
                      <span>{new Date(task.taskDeadline).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    {task._rewardAmount ? (
                      <span style={{ color: '#28a745', fontWeight: 600 }}>Rs. {task._rewardAmount}</span>
                    ) : '—'}
                    {task._rewardStatus === 'approved' && (
                      <span className="custom-badge" style={{ background: '#d4edda', color: '#155724', marginLeft: '6px' }}>Paid</span>
                    )}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button className="btn-view" onClick={() => viewSubmission(task)} title="View submission details">
                        <FaEye />
                      </button>
                      <button className="btn-approve" onClick={() => handleApprove(task)} title="Approve task">
                        <FaCheckCircle />
                      </button>
                      <button className="btn-reject" onClick={() => handleReject(task)} title="Reject task">
                        <FaTimesCircle />
                      </button>
                      {task._promoStatus === 'completed' && task._rewardStatus === 'pending' && (
                        <button
                          onClick={() => handleApproveReward(task)}
                          title="Approve Reward Payment"
                          style={{ padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', background: 'linear-gradient(135deg, #28a745, #1e7e34)', color: 'white', width: '40px', height: '40px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaMoneyBillWave />
                        </button>
                      )}
                      {/* Assign Rank button — shown after reward is already approved */}
                      {task._rewardStatus === 'approved' && (
                        <button
                          onClick={() => openRankModal(task)}
                          title="Assign Rank / Badge"
                          style={{ padding: '12px', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem', background: 'linear-gradient(135deg, #390910, #6b1a1a)', color: 'white', width: '40px', height: '40px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaMedal />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── RANK ASSIGNMENT MODAL ─────────────────────────────────────────── */}
      {showRankModal && rankTask && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={closeRankModal}
        >
          <div
            style={{ background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '480px', margin: '16px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ background: 'linear-gradient(135deg, #390910, #6b1a1a)', padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaMedal style={{ color: '#f59e0b', fontSize: '22px' }} />
                <div>
                  <h2 style={{ color: '#fff', margin: 0, fontSize: '18px' }}>Assign Rank / Badge</h2>
                  <p style={{ color: '#fca5a5', margin: 0, fontSize: '13px' }}>{rankTask._userName} — {rankTask._userEmail}</p>
                </div>
              </div>
              <button onClick={closeRankModal} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '20px', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAssignRank} style={{ padding: '24px' }}>

              {/* Rank Name Input */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  🏅 Rank Name <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="text"
                  value={rankInput}
                  onChange={(e) => setRankInput(e.target.value)}
                  placeholder="e.g. Gold, Silver, Platinum, Diamond..."
                  required
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                />
                <small style={{ color: '#6b7280', marginTop: '4px', display: 'block' }}>
                  Koi bhi custom rank type karen — Gold, Silver, Diamond, Platinum, etc.
                </small>
              </div>

              {/* Start Date */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  📅 Rank Start Date <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <input
                  type="date"
                  value={rankStartDate}
                  onChange={(e) => setRankStartDate(e.target.value)}
                  required
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>

              {/* Expiry Date */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
                  📅 Rank Expiry Date
                </label>
                <input
                  type="date"
                  value={rankEndDate}
                  onChange={(e) => setRankEndDate(e.target.value)}
                  disabled={rankNoExpiry}
                  style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', outline: 'none', boxSizing: 'border-box', opacity: rankNoExpiry ? 0.4 : 1 }}
                />
                {/* No Expiry checkbox */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', cursor: 'pointer', color: '#6b7280', fontSize: '14px' }}>
                  <input
                    type="checkbox"
                    checked={rankNoExpiry}
                    onChange={(e) => { setRankNoExpiry(e.target.checked); if (e.target.checked) setRankEndDate(''); }}
                    style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                  />
                  No expiry — Permanent rank
                </label>
              </div>

              {/* Preview badge */}
              {rankInput && (
                <div style={{ background: '#fef3c7', border: '1px solid #fbbf24', borderRadius: '10px', padding: '12px 16px', marginBottom: '18px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaMedal style={{ color: '#f59e0b', fontSize: '20px' }} />
                  <div>
                    <span style={{ fontWeight: '700', color: '#92400e', fontSize: '15px' }}>{rankInput}</span>
                    <span style={{ color: '#78350f', fontSize: '13px', marginLeft: '8px' }}>
                      {rankNoExpiry ? '(Permanent)' : rankEndDate ? `(Until ${new Date(rankEndDate).toLocaleDateString()})` : ''}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={closeRankModal}
                  disabled={assigningRank}
                  style={{ padding: '10px 20px', border: '1px solid #d1d5db', borderRadius: '8px', background: '#fff', color: '#374151', fontWeight: '600', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={assigningRank}
                  style={{ padding: '10px 24px', border: 'none', borderRadius: '8px', background: 'linear-gradient(135deg, #390910, #6b1a1a)', color: '#fff', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <FaMedal />
                  {assigningRank ? 'Assigning...' : 'Assign Rank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SubmittedPromotions;
