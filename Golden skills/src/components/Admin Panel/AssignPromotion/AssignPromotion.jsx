import { useState, useEffect } from 'react';
import './AssignPromotion.css';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { FaUser, FaPaperPlane, FaEnvelope, FaPhone, FaCalendarAlt, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';

const AssignPromotion = () => {
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sending, setSending] = useState(false);

  // Multiple tasks
  const [tasks, setTasks] = useState([
    { taskTitle: '', taskDescription: '', taskDeadline: '' }
  ]);

  // Predefined task templates
  const taskTemplates = [
    {
      id: 'referral',
      title: 'Refer New Users',
      description: 'Refer 2 new users to join our platform using your unique referral code. Each referred user must register and purchase a plan. Share your referral link on social media or directly with friends.',
      deadline: 14
    },
    {
      id: 'course-join',
      title: 'Join a Course',
      description: 'Enroll a new user in one of our courses. Help them register and complete the course enrollment process. Share the course details and benefits with potential students.',
      deadline: 7
    },
    {
      id: 'sale-task',
      title: 'Complete a Sale',
      description: 'Successfully onboard a new paying customer to our platform. The customer must complete their registration and make their first purchase. Provide proof of the completed sale.',
      deadline: 10
    },
    {
      id: 'social-media',
      title: 'Social Media Promotion',
      description: 'Create and post promotional content about our platform on your social media accounts. Include relevant hashtags and tag our official page. Share the screenshot of your post as proof.',
      deadline: 3
    },
    {
      id: 'custom',
      title: 'Custom Task',
      description: '',
      deadline: 7
    }
  ];

  useEffect(() => {
    fetchApprovedUsers();
  }, []);

  const fetchApprovedUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('Please login first');
        window.location.href = '/admin/login';
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };
      const res = await fetch(`${API_ENDPOINTS.USER_PROMOTIONS.GET_ALL}?paymentStatus=approved`, { headers });
      const data = await res.json();
      if (data.success) setApprovedUsers(data.userPromotions || []);
    } catch (err) {
      console.error('Error fetching approved users:', err);
      alert('Failed to load approved users');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setTasks([{ taskTitle: '', taskDescription: '', taskDeadline: getDefaultDeadline(7) }]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setTasks([{ taskTitle: '', taskDescription: '', taskDeadline: '' }]);
  };

  const getDefaultDeadline = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const addTask = () => {
    setTasks(prev => [...prev, { taskTitle: '', taskDescription: '', taskDeadline: getDefaultDeadline(7) }]);
  };

  const removeTask = (index) => {
    if (tasks.length === 1) return;
    setTasks(prev => prev.filter((_, i) => i !== index));
  };

  const updateTask = (index, field, value) => {
    setTasks(prev => prev.map((t, i) => i === index ? { ...t, [field]: value } : t));
  };

  const applyTemplate = (index, templateId) => {
    if (!templateId) return;
    const template = taskTemplates.find(t => t.id === templateId);
    if (template) {
      setTasks(prev => prev.map((t, i) => i === index ? {
        ...t,
        taskTitle: template.title,
        taskDescription: template.description,
        taskDeadline: getDefaultDeadline(template.deadline)
      } : t));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    for (const task of tasks) {
      if (!task.taskTitle.trim() || !task.taskDescription.trim() || !task.taskDeadline) {
        alert('Please fill in all task fields (title, description, deadline)');
        return;
      }
    }

    setSending(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.USER_PROMOTIONS.ASSIGN_TASKS(selectedUser._id), {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks })
      });
      const data = await res.json();
      if (data.success) {
        alert(`${tasks.length} task(s) assigned to ${selectedUser.userName} successfully!`);
        closeModal();
        fetchApprovedUsers();
      } else {
        alert(data.message || 'Failed to assign tasks');
      }
    } catch (err) {
      alert('Error assigning tasks');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading approved users...</div>;
  }

  return (
    <div className="assign-task-container">
      <div className="assign-task-header">
        <h1>Assign Promotion Tasks to Approved Users</h1>
        <p>Click "Assign Tasks" to assign promotion tasks to any approved user</p>
      </div>

      {approvedUsers.length === 0 ? (
        <div className="no-users">
          <FaUser size={60} />
          <h3>No Approved Promotion Users</h3>
          <p>Approve payment verifications in the Verifications tab first</p>
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
                <th>Promotion</th>
                <th>Reward</th>
                <th>Tasks</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {approvedUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar-small"><FaUser /></div>
                      <span className="user-fullname">{user.userName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="payment-image-cell">
                      {user.userImage ? (
                        <img
                          src={user.userImage}
                          alt="Payment Proof"
                          className="payment-thumbnail"
                          onClick={() => window.open(user.userImage, '_blank')}
                        />
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
                    <span className="plan-title">{user.planTitle}</span>
                    <br />
                    <small style={{ color: '#28a745', fontWeight: 600 }}>Rs. {user.planPrice}</small>
                  </td>
                  <td>{user.promotionTitle || '—'}</td>
                  <td>
                    {user.rewardAmount ? (
                      <div className="price-cell">
                        <span className="price-currency">Rs.</span>
                        <span>{user.rewardAmount}</span>
                      </div>
                    ) : '—'}
                  </td>
                  <td>
                    <span className="user-id-badge">{user.tasks?.length || 0} tasks</span>
                  </td>
                  <td>
                    <button className="btn-send-message" onClick={() => openModal(user)}>
                      <FaPaperPlane /> Assign Tasks
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" style={{ maxWidth: '680px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Tasks to {selectedUser.userName}</h2>
              <button className="modal-close" onClick={closeModal}><FaTimes /></button>
            </div>

            <div className="modal-body">
              <div className="user-info-card">
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{selectedUser.userEmail}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Plan:</span>
                  <span className="info-value">{selectedUser.planTitle} — Rs. {selectedUser.planPrice}</span>
                </div>
                {selectedUser.promotionTitle && (
                  <div className="info-row">
                    <span className="info-label">Promotion:</span>
                    <span className="info-value">{selectedUser.promotionTitle} — Reward: Rs. {selectedUser.rewardAmount}</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="message-form">
                {tasks.map((task, index) => (
                  <div key={index} style={{ border: '1px solid #e9ecef', borderRadius: '10px', padding: '16px', marginBottom: '14px', background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <strong style={{ color: '#390910', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Task {index + 1}
                      </strong>
                      {tasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTask(index)}
                          style={{ background: '#ffebee', border: 'none', borderRadius: '6px', color: '#c62828', cursor: 'pointer', padding: '5px 10px', fontSize: '0.8rem' }}
                        >
                          <FaTrash /> Remove
                        </button>
                      )}
                    </div>

                    <div className="form-group">
                      <label>Select Template</label>
                      <select
                        className="template-select"
                        onChange={e => applyTemplate(index, e.target.value)}
                        defaultValue=""
                      >
                        <option value="">-- Choose a template or create custom --</option>
                        {taskTemplates.map(t => (
                          <option key={t.id} value={t.id}>{t.title}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Task Title *</label>
                      <input
                        type="text"
                        value={task.taskTitle}
                        onChange={e => updateTask(index, 'taskTitle', e.target.value)}
                        placeholder="e.g. Refer 2 new users"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Task Description *</label>
                      <textarea
                        value={task.taskDescription}
                        onChange={e => updateTask(index, 'taskDescription', e.target.value)}
                        placeholder="Describe what the user needs to do..."
                        rows={4}
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label><FaCalendarAlt /> Deadline *</label>
                      <input
                        type="date"
                        value={task.taskDeadline}
                        onChange={e => updateTask(index, 'taskDeadline', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addTask}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', border: '2px dashed #D4AF37', borderRadius: '8px', background: 'transparent', color: '#390910', cursor: 'pointer', fontWeight: 600, marginBottom: '20px', width: '100%', justifyContent: 'center' }}
                >
                  <FaPlus /> Add Another Task
                </button>

                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={closeModal} disabled={sending}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit" disabled={sending}>
                    {sending ? 'Assigning...' : <><FaPaperPlane /> Assign {tasks.length} Task(s)</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignPromotion;
