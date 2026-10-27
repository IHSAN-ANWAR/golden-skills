import { useState, useEffect } from 'react';
import './SubmittedTasks.css';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { FaUser, FaEnvelope, FaTasks, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaEye, FaClipboardList, FaInfoCircle, FaUsers, FaShoppingCart, FaBullseye } from 'react-icons/fa';

const SubmittedTasks = () => {
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyModal, setVerifyModal] = useState(null);     // referral verification data
  const [verifyLoading, setVerifyLoading] = useState(false);

  useEffect(() => {
    fetchSubmittedTasks();
  }, []);

  const fetchSubmittedTasks = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) { window.location.href = '/admin/login'; return; }
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await fetch(`${API_ENDPOINTS.USER_TASKS.GET_ALL}?status=completed`, { headers });
      const data = await response.json();
      if (data.success) {
        const completedTasks = (data.userTasks || []).filter(task => task.status === 'completed');
        setSubmittedTasks(completedTasks);
      }
    } catch (error) {
      console.error('Error fetching submitted tasks:', error);
      alert('Failed to load submitted tasks: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Referral task verification modal ──────────────────────────────────────
  const openReferralVerification = async (task) => {
    setVerifyLoading(true);
    setVerifyModal({ loading: true, task });
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.USER_TASKS.REFERRAL_VERIFICATION(task._id), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setVerifyModal({ loading: false, data });
      } else {
        setVerifyModal(null);
        alert(data.message || 'Failed to load referral data');
      }
    } catch (e) {
      setVerifyModal(null);
      alert('Failed to load referral verification data');
    } finally {
      setVerifyLoading(false);
    }
  };

  // ── Normal task view modal (existing logic, kept as is) ──────────────────
  const viewSubmission = (task) => {
    const modal = document.createElement('div');
    modal.className = 'submission-modal-overlay';
    modal.innerHTML = `
      <div class="submission-modal-content">
        <div class="submission-modal-header">
          <h2>Task Submission Review</h2>
          <button class="submission-modal-close">✕</button>
        </div>
        <div class="submission-modal-body">
          <div class="submission-section">
            <h3>User Information</h3>
            <p><strong>Name:</strong> ${task.userName}</p>
            <p><strong>Email:</strong> ${task.userEmail}</p>
          </div>
          <div class="submission-section">
            <h3>Task Details</h3>
            <p><strong>Title:</strong> ${task.taskTitle}</p>
            <p><strong>Description:</strong></p>
            <div class="submission-text">${task.taskDescription}</div>
            ${task.customTaskMessage ? `<p><strong>Custom Instructions:</strong></p><div class="submission-text">${task.customTaskMessage}</div>` : ''}
          </div>
          <div class="submission-section highlight">
            <h3>User Submission</h3>
            <div class="submission-text">${task.submissionData || 'No submission data provided'}</div>
          </div>
          <div class="submission-section">
            <h3>User Notes</h3>
            <div class="submission-text">${task.userNotes || 'No notes provided'}</div>
          </div>
          <div class="submission-section">
            <h3>Timeline</h3>
            <p><strong>Assigned:</strong> ${new Date(task.assignedAt).toLocaleString()}</p>
            <p><strong>Deadline:</strong> ${new Date(task.taskDeadline).toLocaleString()}</p>
            <p><strong>Submitted:</strong> ${task.completedAt ? new Date(task.completedAt).toLocaleString() : 'Not completed'}</p>
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

  const handleApprove = async (taskId) => {
    const rewardAmount = window.prompt('Reward Amount (Rs.) — leave blank if no reward:', '');
    if (rewardAmount === null) return; // user pressed Cancel

    const notes = window.prompt('Approval notes (optional):', '');
    if (notes === null) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.USER_TASKS.UPDATE_STATUS(taskId)}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'approved',
          adminNotes: notes || 'Task approved by admin',
          rewardAmount: rewardAmount ? rewardAmount.trim() : ''
        })
      });
      const data = await response.json();
      if (data.success) {
        alert('Task approved successfully!');
        setVerifyModal(null);
        fetchSubmittedTasks();
      } else {
        throw new Error(data.message || 'Failed to approve task');
      }
    } catch (error) {
      alert(`Failed to approve task:\n${error.message}`);
    }
  };

  const handleReject = async (taskId) => {
    const reason = window.prompt('Reason for rejection:', '');
    if (reason === null || !reason.trim()) {
      if (reason !== null) alert('Please provide a reason');
      return;
    }
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.USER_TASKS.UPDATE_STATUS(taskId)}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected', adminNotes: reason })
      });
      const data = await response.json();
      if (data.success) {
        alert('Task rejected and sent back to pending');
        setVerifyModal(null);
        fetchSubmittedTasks();
      } else {
        throw new Error(data.message || 'Failed to reject task');
      }
    } catch (error) {
      alert(`Failed to reject task:\n${error.message}`);
    }
  };

  if (loading) return <div className="loading">Loading submitted tasks...</div>;

  return (
    <div className="submitted-tasks-container">
      <div className="submitted-header">
        <h1><FaClipboardList /> Submitted Tasks Review</h1>
        <p>Review tasks submitted by users — approve or reject them</p>
      </div>

      {submittedTasks.length === 0 ? (
        <div className="no-submitted-tasks">
          <FaTasks size={80} />
          <h2>No Submitted Tasks</h2>
          <p>No tasks have been submitted by users yet.</p>
          <p className="info-text"><FaInfoCircle /> Tasks will appear here when users submit them from the mobile app.</p>
        </div>
      ) : (
        <div className="submitted-tasks-table-container">
          <table className="submitted-tasks-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Task</th>
                <th>Type</th>
                <th>Progress</th>
                <th>Submitted</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submittedTasks.map((task) => (
                <tr key={task._id} className="submitted-task-row">
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar"><FaUser /></div>
                      <span>{task.userName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      <FaEnvelope /><span>{task.userEmail}</span>
                    </div>
                  </td>
                  <td>
                    <div className="task-title-cell">
                      <FaTasks /><span>{task.taskTitle}</span>
                    </div>
                  </td>
                  <td>
                    {task.isReferralTask
                      ? <span className="badge badge-referral"><FaUsers /> Referral</span>
                      : <span className="badge badge-custom">Custom</span>
                    }
                  </td>
                  <td>
                    {task.isReferralTask ? (
                      <div className="progress-cell">
                        <span className={`progress-count ${task.referralProgress >= task.referralTarget ? 'done' : ''}`}>
                          {task.referralProgress}/{task.referralTarget}
                        </span>
                        <div className="mini-progress-bar">
                          <div
                            className="mini-progress-fill"
                            style={{ width: `${Math.min((task.referralProgress / task.referralTarget) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <div className="date-cell">
                      <FaCalendarAlt />
                      <span>{new Date(task.completedAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <FaCalendarAlt />
                      <span>{new Date(task.taskDeadline).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => task.isReferralTask ? openReferralVerification(task) : viewSubmission(task)}
                        title="View details"
                      >
                        <FaEye />
                      </button>
                      <button className="btn-approve" onClick={() => handleApprove(task._id)} title="Approve">
                        <FaCheckCircle />
                      </button>
                      <button className="btn-reject" onClick={() => handleReject(task._id)} title="Reject">
                        <FaTimesCircle />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Referral Verification Modal ── */}
      {verifyModal && (
        <div className="verify-modal-overlay" onClick={() => setVerifyModal(null)}>
          <div className="verify-modal-content" onClick={(e) => e.stopPropagation()}>

            {verifyModal.loading ? (
              <div className="verify-loading">Loading referral data...</div>
            ) : (
              <>
                <div className="verify-modal-header">
                  <h2><FaBullseye /> Referral Task Verification</h2>
                  <button className="verify-modal-close" onClick={() => setVerifyModal(null)}>✕</button>
                </div>

                <div className="verify-modal-body">
                  {/* Owner info */}
                  <div className="verify-section">
                    <h3><FaUser /> Task Assigned To</h3>
                    <p><strong>Name:</strong> {verifyModal.data.owner.name}</p>
                    <p><strong>Email:</strong> {verifyModal.data.owner.email}</p>
                    <p><strong>Referral Code:</strong> <span className="ref-code">{verifyModal.data.owner.referralCode}</span></p>
                  </div>

                  {/* Summary */}
                  <div className="verify-section">
                    <h3><FaBullseye /> Task Summary</h3>
                    <div className="verify-summary-grid">
                      <div className={`summary-box ${verifyModal.data.summary.targetMet ? 'box-green' : 'box-orange'}`}>
                        <span className="summary-num">{verifyModal.data.summary.target}</span>
                        <span className="summary-label">Target</span>
                      </div>
                      <div className="summary-box box-blue">
                        <span className="summary-num">{verifyModal.data.summary.totalJoined}</span>
                        <span className="summary-label">Joined</span>
                      </div>
                      <div className={`summary-box ${verifyModal.data.summary.targetMet ? 'box-green' : 'box-orange'}`}>
                        <span className="summary-num">{verifyModal.data.summary.totalPurchased}</span>
                        <span className="summary-label">Purchased</span>
                      </div>
                    </div>

                    {verifyModal.data.summary.targetMet ? (
                      <div className="verify-status verify-status-ok">
                        <FaCheckCircle /> Target met — {verifyModal.data.summary.totalPurchased}/{verifyModal.data.summary.target} referrals completed
                      </div>
                    ) : (
                      <div className="verify-status verify-status-warn">
                        <FaInfoCircle /> Only {verifyModal.data.summary.totalPurchased}/{verifyModal.data.summary.target} referrals completed
                      </div>
                    )}
                  </div>

                  {/* Referred users table */}
                  <div className="verify-section">
                    <h3><FaUsers /> Referred Users Detail</h3>
                    {verifyModal.data.referredUsers.length === 0 ? (
                      <p className="text-muted">No users joined via this referral code yet.</p>
                    ) : (
                      <table className="verify-table">
                        <thead>
                          <tr>
                            <th>#</th>
                            <th>Name</th>
                            <th>City</th>
                            <th>Joined</th>
                            <th><FaShoppingCart /> Purchased</th>
                          </tr>
                        </thead>
                        <tbody>
                          {verifyModal.data.referredUsers.map((u) => (
                            <tr key={u.serial} className={u.hasPurchasedPlan ? 'row-purchased' : 'row-pending'}>
                              <td>{u.serial}</td>
                              <td>{u.name}</td>
                              <td>{u.city}</td>
                              <td>{new Date(u.joinedAt).toLocaleDateString()}</td>
                              <td>
                                {u.hasPurchasedPlan
                                  ? <span className="purchased-yes"><FaCheckCircle /> Yes</span>
                                  : <span className="purchased-no"><FaTimesCircle /> No</span>
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                <div className="verify-modal-footer">
                  <button className="btn-reject-modal" onClick={() => handleReject(verifyModal.data.task._id)}>
                    <FaTimesCircle /> Reject
                  </button>
                  <button
                    className={`btn-approve-modal ${!verifyModal.data.summary.targetMet ? 'btn-approve-warn' : ''}`}
                    onClick={() => handleApprove(verifyModal.data.task._id)}
                  >
                    <FaCheckCircle />
                    {verifyModal.data.summary.targetMet ? ' Approve' : ' Approve Anyway'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmittedTasks;