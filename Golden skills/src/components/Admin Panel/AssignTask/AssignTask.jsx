import { useState, useEffect } from 'react';
import './AssignTask.css';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { FaUser, FaPaperPlane, FaEnvelope, FaPhone, FaCalendarAlt, FaTimes } from 'react-icons/fa';

const AssignTask = () => {
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [sending, setSending] = useState(false);
  
  // Form data
  const [taskTitle, setTaskTitle] = useState('');
  const [taskMessage, setTaskMessage] = useState('');
  const [taskPoints, setTaskPoints] = useState(10);
  const [taskDeadline, setTaskDeadline] = useState(7);
  const [selectedTemplate, setSelectedTemplate] = useState('');

  // Predefined message templates
  const messageTemplates = [
    {
      id: 'social-media',
      title: 'Social Media Post',
      message: 'Please create and post content on your social media accounts about our services. Include relevant hashtags and tag our official page. Share the screenshot of your post as proof of completion.',
      deadline: 3
    },
    {
      id: 'profile-complete',
      title: 'Complete Your Profile',
      message: 'Please complete your profile by adding all required information including your bio, profile picture, and contact details. This will help us serve you better.',
      deadline: 2
    },
    {
      id: 'referral',
      title: 'Refer Friends',
      message: 'Refer 5 friends to join our platform using your unique referral code. Each successful referral will earn you bonus points. Share your referral link on social media or directly with friends.',
      deadline: 7
    },
    {
      id: 'review',
      title: 'Write a Review',
      message: 'Please write a detailed review about your experience with our platform. Share what you liked and any suggestions for improvement. Post it on Google Reviews or Trustpilot.',
      deadline: 5
    },
    {
      id: 'survey',
      title: 'Complete Survey',
      message: 'Fill out our feedback survey to help us improve our services. Your honest feedback is valuable to us. The survey will take approximately 5-10 minutes to complete.',
      deadline: 3
    },
    {
      id: 'video-testimonial',
      title: 'Video Testimonial',
      message: 'Record a short video testimonial (30-60 seconds) sharing your experience with our platform. Upload it to YouTube or Instagram and share the link with us.',
      deadline: 7
    },
    {
      id: 'custom',
      title: 'Custom Message',
      message: '',
      deadline: 7
    }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        alert('Please login first');
        window.location.href = '/admin/login';
        return;
      }
      
      const headers = { 'Authorization': `Bearer ${token}` };
      
      // Fetch approved users
      const usersResponse = await fetch(`${API_ENDPOINTS.SUBMISSIONS.GET_ALL}?status=approved`, { headers });
      const usersData = await usersResponse.json();

      if (usersData.success) {
        setApprovedUsers(usersData.submissions || []);
      }
      
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (user) => {
    setSelectedUser(user);
    setShowModal(true);
    // Reset form
    setSelectedTemplate('');
    setTaskTitle('');
    setTaskMessage('');
    setTaskDeadline(7);
  };

  const handleTemplateChange = (e) => {
    const templateId = e.target.value;
    setSelectedTemplate(templateId);
    
    if (templateId) {
      const template = messageTemplates.find(t => t.id === templateId);
      if (template) {
        setTaskTitle(template.title);
        setTaskMessage(template.message);
        setTaskDeadline(template.deadline);
      }
    } else {
      setTaskTitle('');
      setTaskMessage('');
      setTaskDeadline(7);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!taskTitle.trim() || !taskMessage.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    
    setSending(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      
      const deadline = new Date();
      deadline.setDate(deadline.getDate() + parseInt(taskDeadline));
      
      const response = await fetch(`${API_ENDPOINTS.USER_TASKS.ASSIGN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userPlanSubmissionId: selectedUser._id,
          isCustomTask: true,
          customTaskTitle: taskTitle,
          customTaskDescription: taskMessage,
          customTaskMessage: taskMessage,
          taskPoints: parseInt(taskPoints),
          taskDeadline: deadline
        })
      });

      const data = await response.json();

      if (data.success) {
        alert(`Task sent to ${selectedUser.userName} successfully!`);
        closeModal();
      } else {
        alert(data.message || 'Failed to send task');
      }
    } catch (error) {
      console.error('Error sending task:', error);
      alert('Failed to send task');
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
        <h1>Send Task to Approved Users</h1>
        <p>Click "Send Task" to send task instructions directly to any approved user</p>
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
                      <div className="user-avatar-small">
                        <FaUser />
                      </div>
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
                    <span className={`plan-title ${user.planTitle?.toLowerCase().includes('lite') ? 'plan-lite' : ''}`}>
                      {user.planTitle}
                      {user.planTitle?.toLowerCase().includes('lite') && (
                        <span className="lite-badge">Lite</span>
                      )}
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
                    <button 
                      className="btn-send-message"
                      onClick={() => openModal(user)}
                    >
                      <FaPaperPlane /> Send Task
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Message Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Task to {selectedUser.userName}</h2>
              <button className="modal-close" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>

            <div className="modal-body">
              <div className="user-info-card">
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{selectedUser.userEmail || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Plan:</span>
                  <span className={`info-value ${selectedUser.planTitle?.toLowerCase().includes('lite') ? 'plan-lite-info' : ''}`}>
                    {selectedUser.planTitle}
                    {selectedUser.planTitle?.toLowerCase().includes('lite') && (
                      <span className="lite-badge-small">Lite</span>
                    )}
                    {' - '}{selectedUser.planPrice}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="message-form">
                <div className="form-group">
                  <label>Select Task Template</label>
                  <select
                    value={selectedTemplate}
                    onChange={handleTemplateChange}
                    className="template-select"
                  >
                    <option value="">-- Choose a template or create custom --</option>
                    {messageTemplates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Task Title *</label>
                  <input
                    type="text"
                    value={taskTitle}
                    onChange={(e) => setTaskTitle(e.target.value)}
                    placeholder="Enter task title..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Task Instructions *</label>
                  <textarea
                    value={taskMessage}
                    onChange={(e) => setTaskMessage(e.target.value)}
                    placeholder="Enter your task instructions for the user..."
                    rows="6"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Deadline (Days)</label>
                  <input
                    type="number"
                    value={taskDeadline}
                    onChange={(e) => setTaskDeadline(e.target.value)}
                    min="1"
                    max="30"
                  />
                </div>

                <div className="modal-actions">
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={closeModal}
                    disabled={sending}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn-submit"
                    disabled={sending}
                  >
                    {sending ? 'Sending...' : <><FaPaperPlane /> Send Task</>}
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

export default AssignTask;
