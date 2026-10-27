import { useState, useEffect } from 'react';
import './AssignTask.css';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { FaUser, FaPaperPlane, FaEnvelope, FaPhone, FaCalendarAlt, FaTimes, FaClipboardList, FaBullseye, FaClock, FaCheckCircle, FaUsers } from 'react-icons/fa';

const AssignTask = () => {
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ── Single user modal ────────────────────────────────────────────────────
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sending, setSending] = useState(false);

  // ── Send to ALL modal ────────────────────────────────────────────────────
  const [showSendAllModal, setShowSendAllModal] = useState(false);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendAllResult, setSendAllResult] = useState(null); // summary after bulk send

  // ── Shared form state (used by both single + all modals) ─────────────────
  const [taskTitle, setTaskTitle] = useState('');
  const [taskMessage, setTaskMessage] = useState('');
  const [taskPoints, setTaskPoints] = useState(0);
  const [taskDeadline, setTaskDeadline] = useState(7);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [referralTarget, setReferralTarget] = useState(0);
  const [isCustomTarget, setIsCustomTarget] = useState(false);
  const [tutorialVideoUrl, setTutorialVideoUrl] = useState('');

  const messageTemplates = [
    { id: 'task-1',  title: 'Task 1 – Refer 1 & Purchase 1',    referralTarget: 1  },
    { id: 'task-2',  title: 'Task 2 – Refer 2 & Purchase 2',    referralTarget: 2  },
    { id: 'task-3',  title: 'Task 3 – Refer 3 & Purchase 3',    referralTarget: 3  },
    { id: 'task-4',  title: 'Task 4 – Refer 4 & Purchase 4',    referralTarget: 4  },
    { id: 'task-5',  title: 'Task 5 – Refer 5 & Purchase 5',    referralTarget: 5  },
    { id: 'task-6',  title: 'Task 6 – Refer 6 & Purchase 6',    referralTarget: 6  },
    { id: 'task-7',  title: 'Task 7 – Refer 7 & Purchase 7',    referralTarget: 7  },
    { id: 'task-8',  title: 'Task 8 – Refer 8 & Purchase 8',    referralTarget: 8  },
    { id: 'task-9',  title: 'Task 9 – Refer 9 & Purchase 9',    referralTarget: 9  },
    { id: 'task-10', title: 'Task 10 – Refer 10 & Purchase 10', referralTarget: 10 },
    { id: 'custom',  title: 'Custom – Enter your own target',    referralTarget: 0  },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) { window.location.href = '/admin/login'; return; }

      const usersResponse = await fetch(
        `${API_ENDPOINTS.SUBMISSIONS.GET_ALL}?status=approved`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      const usersData = await usersResponse.json();

      if (usersData.success) {
        const subs = usersData.submissions || [];
        subs.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        setApprovedUsers(subs);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Shared form helpers ──────────────────────────────────────────────────
  const resetForm = () => {
    setSelectedTemplate('');
    setTaskTitle('');
    setTaskMessage('');
    setTaskDeadline(7);
    setReferralTarget(0);
    setIsCustomTarget(false);
    setTutorialVideoUrl('');
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);

    if (!templateId) { resetForm(); return; }

    const template = messageTemplates.find(t => t.id === templateId);
    if (!template) return;

    if (templateId === 'custom') {
      setIsCustomTarget(true);
      setReferralTarget(0);
      setTaskTitle('');
      setTaskMessage('');
    } else {
      setIsCustomTarget(false);
      const n = template.referralTarget;
      setReferralTarget(n);
      setTaskTitle(template.title);
      setTaskMessage(
        `Your task is to refer ${n} ${n === 1 ? 'person' : 'people'} to join our platform using your unique referral link, ` +
        `and make sure ${n === 1 ? 'that person purchases' : 'each of them purchases'} a course (total ${n} course purchase${n > 1 ? 's' : ''}). ` +
        `The system will automatically verify this through your referral records. ` +
        `Once all ${n} ${n === 1 ? 'person has' : 'people have'} joined and purchased, your task will be marked complete.`
      );
    }
  };

  const handleCustomTargetChange = (e) => {
    const val = parseInt(e.target.value) || 0;
    setReferralTarget(val);
    if (val > 0) {
      setTaskTitle(`Custom Task – Refer ${val} & Purchase ${val}`);
      setTaskMessage(
        `Your task is to refer ${val} people to join our platform using your unique referral link, ` +
        `and make sure each of them purchases a course (total ${val} course purchases). ` +
        `The system will automatically verify this through your referral records. ` +
        `Once all ${val} people have joined and purchased, your task will be marked complete.`
      );
    } else {
      setTaskTitle('');
      setTaskMessage('');
    }
  };

  // ── Single user modal ────────────────────────────────────────────────────
  const openModal = (user) => {
    setSelectedUser(user);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) { alert('Please select a task'); return; }
    if (referralTarget < 1) { alert('Please enter a valid referral target (minimum 1)'); return; }
    if (!taskTitle.trim()) { alert('Task title is missing'); return; }

    setSending(true);
    try {
      const token = localStorage.getItem('adminToken');
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + parseInt(taskDeadline));

      const res = await fetch(API_ENDPOINTS.USER_TASKS.ASSIGN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          userPlanSubmissionId: selectedUser._id,
          isReferralTask: true,
          isCustomTask: false,
          customTaskTitle: taskTitle,
          customTaskDescription: taskMessage,
          customTaskMessage: taskMessage,
          referralTarget,
          referralReward: '0',
          referralPackagePrice: '',
          taskPoints: parseInt(taskPoints),
          taskDeadline: deadline,
          tutorialVideoUrl: tutorialVideoUrl.trim() || ''
        })
      });

      const data = await res.json();
      if (data.success) {
        alert(`Task "${taskTitle}" sent to ${selectedUser.userName} successfully!`);
        closeModal();
      } else {
        alert(data.message || 'Failed to send task');
      }
    } catch (error) {
      alert('Failed to send task');
    } finally {
      setSending(false);
    }
  };

  // ── Send to ALL modal ────────────────────────────────────────────────────
  const openSendAllModal = () => {
    resetForm();
    setSendAllResult(null);
    setShowSendAllModal(true);
  };

  const closeSendAllModal = () => {
    setShowSendAllModal(false);
    setSendAllResult(null);
    resetForm();
  };

  const handleSendToAll = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) { alert('Please select a task'); return; }
    if (referralTarget < 1) { alert('Please enter a valid referral target (minimum 1)'); return; }
    if (!taskTitle.trim()) { alert('Task title is missing'); return; }

    const confirmMsg = `Send "${taskTitle}" to ALL ${approvedUsers.length} approved users?\n\nUsers who already have this task will be skipped automatically.`;
    if (!window.confirm(confirmMsg)) return;

    setSendingAll(true);
    setSendAllResult(null);
    try {
      const token = localStorage.getItem('adminToken');
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + parseInt(taskDeadline));

      const res = await fetch(API_ENDPOINTS.USER_TASKS.ASSIGN_ALL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          isReferralTask: true,
          customTaskTitle: taskTitle,
          customTaskDescription: taskMessage,
          customTaskMessage: taskMessage,
          referralTarget,
          referralReward: '0',
          referralPackagePrice: '',
          taskPoints: parseInt(taskPoints),
          taskDeadline: deadline,
          tutorialVideoUrl: tutorialVideoUrl.trim() || ''
        })
      });

      const data = await res.json();
      if (data.success) {
        setSendAllResult(data.summary);
      } else {
        alert(data.message || 'Failed to send task to all users');
      }
    } catch (error) {
      alert('Failed to send task to all users');
    } finally {
      setSendingAll(false);
    }
  };

  if (loading) return <div className="loading">Loading approved users...</div>;

  // ── Shared form JSX ──────────────────────────────────────────────────────
  const TaskFormFields = () => (
    <>
      <div className="form-group">
        <label>Select Task</label>
        <select value={selectedTemplate} onChange={handleTemplateChange} className="template-select">
          <option value="">-- Select a Task (1 to 10) --</option>
          {messageTemplates.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {selectedTemplate && (
        <>
          {isCustomTarget && (
            <div className="form-group">
              <label>Number of Referrals Required *</label>
              <input
                type="number" min="1" max="100"
                value={referralTarget || ''}
                onChange={handleCustomTargetChange}
                placeholder="e.g. 12, 15, 20..."
                style={{ fontWeight: 'bold', fontSize: '1.1rem' }}
                required
              />
              <small style={{ color: '#64748b' }}>
                Enter how many people the user must refer and get to purchase a plan
              </small>
            </div>
          )}

          {referralTarget > 0 && (
            <div className="referral-task-info">
              <div className="info-row">
                <span className="info-label"><FaClipboardList className="info-icon" /> Task:</span>
                <span className="info-value">{taskTitle}</span>
              </div>
              <div className="info-row">
                <span className="info-label"><FaBullseye className="info-icon" /> Referral Target:</span>
                <span className="info-value" style={{ fontWeight: 'bold', color: '#f59e0b' }}>
                  {referralTarget} {referralTarget === 1 ? 'person' : 'people'} must join & purchase
                </span>
              </div>
              <div className="info-row">
                <span className="info-label"><FaClock className="info-icon" /> Deadline:</span>
                <span className="info-value">{taskDeadline} days</span>
              </div>
              <div className="info-row">
                <span className="info-label"><FaCheckCircle className="info-icon" /> Verification:</span>
                <span className="info-value" style={{ color: '#10b981' }}>Automatic (via referral records)</span>
              </div>
            </div>
          )}

          {referralTarget > 0 && (
            <div className="form-group">
              <label>Task Instructions (shown to user)</label>
              <textarea value={taskMessage} onChange={(e) => setTaskMessage(e.target.value)} rows="4" />
            </div>
          )}

          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaPaperPlane style={{ color: '#e53e3e', fontSize: '13px' }} />
              Tutorial Video URL&nbsp;
              <span style={{ color: '#94a3b8', fontWeight: 'normal', fontSize: '12px' }}>(Optional)</span>
            </label>
            <input
              type="url"
              value={tutorialVideoUrl}
              onChange={(e) => setTutorialVideoUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=... — user will see this as a guide"
            />
            <small style={{ color: '#64748b' }}>Add a YouTube link so new users understand what to do in this task</small>
          </div>

          {isCustomTarget && (
            <div className="form-group">
              <label>Deadline (Days)</label>
              <input
                type="number" value={taskDeadline}
                onChange={(e) => setTaskDeadline(e.target.value)}
                min="1" max="60"
              />
            </div>
          )}
        </>
      )}
    </>
  );

  return (
    <div className="assign-task-container">
      {/* Header */}
      <div className="assign-task-header">
        <div>
          <h1>Send Task to Approved Users</h1>
          <p>Send task to one user or to all {approvedUsers.length} approved users at once</p>
        </div>

        {/* ── SEND TO ALL BUTTON ── */}
        {approvedUsers.length > 0 && (
          <button className="btn-send-all" onClick={openSendAllModal}>
            <FaUsers /> Send Task to All
          </button>
        )}
      </div>

      {approvedUsers.length === 0 ? (
        <div className="no-users">
          <FaUser size={60} />
          <h3>No Approved Users</h3>
          <p>Approve users in the Verifications section first</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Payment Proof</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Plan</th>
                <th>Price</th>
                <th>Approved Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {approvedUsers.map((user) => (
                <tr key={user._id} className="user-row">
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar-small"><FaUser /></div>
                      <span className="user-fullname">{user.userName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="payment-image-cell">
                      {user.userImage ? (
                        <img src={user.userImage} alt="Payment Proof" className="payment-thumbnail"
                          onClick={() => window.open(user.userImage, '_blank')} />
                      ) : (
                        <span className="no-image-text">No Image</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      <FaEnvelope className="email-icon" />
                      <span>{user.userEmail || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="phone-cell">
                      <FaPhone className="phone-icon" />
                      <span>{user.userPhone || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`plan-title ${user.planTitle?.toLowerCase().includes('lite') ? 'plan-lite' : ''}`}>
                      {user.planTitle}
                      {user.planTitle?.toLowerCase().includes('lite') && <span className="lite-badge">Lite</span>}
                    </span>
                  </td>
                  <td>
                    <div className="price-cell">
                      <span className="price-currency">Rs</span>
                      <span>{user.planPrice}</span>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <FaCalendarAlt className="date-icon" />
                      <span>{new Date(user.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    <button className="btn-send-message" onClick={() => openModal(user)}>
                      <FaPaperPlane /> Send Task
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── SINGLE USER MODAL ─────────────────────────────────────────────── */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Task to {selectedUser.userName}</h2>
              <button className="modal-close" onClick={closeModal}><FaTimes /></button>
            </div>
            <div className="modal-body">
              <div className="user-info-card">
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{selectedUser.userEmail || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Plan:</span>
                  <span className="info-value">
                    {selectedUser.planTitle} - {selectedUser.planPrice}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="message-form">
                <TaskFormFields />
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal} disabled={sending}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit"
                    disabled={sending || !selectedTemplate || referralTarget < 1}>
                    {sending ? 'Sending...' : <><FaPaperPlane /> Send Task</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ── SEND TO ALL MODAL ─────────────────────────────────────────────── */}
      {showSendAllModal && (
        <div className="modal-overlay" onClick={closeSendAllModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '600px' }}>
            <div className="modal-header" style={{ background: 'linear-gradient(135deg, #390910, #6b1a1a)' }}>
              <div>
                <h2 style={{ color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaUsers /> Send Task to All Users
                </h2>
                <p style={{ color: '#ddd6fe', fontSize: '13px', margin: '4px 0 0' }}>
                  All approved users will receive this task
                </p>
              </div>
              <button className="modal-close" onClick={closeSendAllModal}><FaTimes /></button>
            </div>

            <div className="modal-body">
              {/* Success result view */}
              {sendAllResult ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎉</div>
                  <h3 style={{ color: '#10b981', marginBottom: '16px' }}>Task Sent Successfully!</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#16a34a' }}>{sendAllResult.sent}</div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>Tasks Sent</div>
                    </div>
                    <div style={{ background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#d97706' }}>{sendAllResult.skipped}</div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>Already Had Task</div>
                    </div>
                    <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#475569' }}>{sendAllResult.total}</div>
                      <div style={{ fontSize: '13px', color: '#64748b' }}>Total Users</div>
                    </div>
                  </div>
                  <button className="btn-submit" onClick={closeSendAllModal}
                    style={{ padding: '10px 32px' }}>
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendToAll} className="message-form">
                  {/* Warning banner */}
                  <div style={{
                    background: '#fef3c7', border: '1px solid #fbbf24',
                    borderRadius: '10px', padding: '12px 16px',
                    marginBottom: '16px', display: 'flex', gap: '10px', alignItems: 'flex-start'
                  }}>
                    <FaBullseye style={{ color: '#d97706', fontSize: '18px', marginTop: '2px', flexShrink: 0 }} />
                    <div>
                      <strong style={{ color: '#92400e' }}>Bulk Action</strong>
                      <p style={{ color: '#78350f', fontSize: '13px', margin: '2px 0 0' }}>
                        This task will be sent to <strong>all approved users</strong>.
                        Users who already have the same task assigned will be skipped automatically.
                      </p>
                    </div>
                  </div>

                  <TaskFormFields />

                  <div className="modal-actions">
                    <button type="button" className="btn-cancel" onClick={closeSendAllModal} disabled={sendingAll}>
                      Cancel
                    </button>
                    <button type="submit"
                      disabled={sendingAll || !selectedTemplate || referralTarget < 1}
                      style={{
                        background: 'linear-gradient(135deg, #390910, #6b1a1a)',
                        color: '#fff', border: 'none', borderRadius: '8px',
                        padding: '10px 20px', fontWeight: '600', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: '8px'
                      }}>
                      {sendingAll
                        ? 'Sending to all...'
                        : <><FaUsers /> Send to All Users</>}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignTask;
