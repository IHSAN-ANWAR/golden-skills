import { useState, useEffect } from 'react';
import './SubmittedTasks.css';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { FaUser, FaEnvelope, FaTasks, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaEye, FaClipboardList, FaInfoCircle } from 'react-icons/fa';

const SubmittedTasks = () => {
  const [submittedTasks, setSubmittedTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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
      
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await fetch(`${API_ENDPOINTS.USER_TASKS.GET_ALL}?status=completed`, { headers });
      const data = await response.json();

      if (data.success) {
        // Only get tasks with status 'completed' (submitted by users from mobile)
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

  const viewSubmission = (task) => {
    const modal = document.createElement('div');
    modal.className = 'submission-modal-overlay';
    modal.innerHTML = `
      <div class="submission-modal-content">
        <div class="submission-modal-header">
          <h2><i class="fas fa-clipboard-list"></i> Task Submission Review</h2>
          <button class="submission-modal-close">✕</button>
        </div>
        <div class="submission-modal-body">
          <div class="submission-section">
            <h3><i class="fas fa-user"></i> User Information</h3>
            <p><strong>Name:</strong> ${task.userName}</p>
            <p><strong>Email:</strong> ${task.userEmail}</p>
          </div>
          
          <div class="submission-section">
            <h3><i class="fas fa-tasks"></i> Task Details</h3>
            <p><strong>Title:</strong> ${task.taskTitle}</p>
            <p><strong>Description:</strong></p>
            <div class="submission-text">${task.taskDescription}</div>
            ${task.customTaskMessage ? `<p><strong>Custom Instructions:</strong></p><div class="submission-text">${task.customTaskMessage}</div>` : ''}
          </div>
          
          <div class="submission-section highlight">
            <h3><i class="fas fa-file-upload"></i> User Submission</h3>
            <div class="submission-text">${task.submissionData || 'No submission data provided'}</div>
          </div>
          
          <div class="submission-section">
            <h3><i class="fas fa-comment-dots"></i> User Notes</h3>
            <div class="submission-text">${task.userNotes || 'No notes provided'}</div>
          </div>
          
          <div class="submission-section">
            <h3><i class="fas fa-clock"></i> Timeline</h3>
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
    
    const closeModal = () => {
      document.body.removeChild(modal);
    };
    
    modal.querySelector('.submission-modal-close').onclick = closeModal;
    modal.querySelector('.btn-modal-close').onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  };

  const handleApprove = async (taskId) => {
    const notes = window.prompt('Add approval notes (optional):', '');
    if (notes === null) return;

    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        alert('Admin token not found. Please login again.');
        window.location.href = '/admin/login';
        return;
      }
      
      const url = `${API_ENDPOINTS.USER_TASKS.UPDATE_STATUS(taskId)}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'approved', 
          adminNotes: notes || 'Task approved by admin' 
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        alert('Task approved successfully!');
        fetchSubmittedTasks();
      } else {
        throw new Error(data.message || 'Failed to approve task');
      }
    } catch (error) {
      console.error('Full error:', error);
      alert(`Failed to approve task:\n${error.message}\n\nCheck console for details.`);
    }
  };

  const handleReject = async (taskId) => {
    const reason = window.prompt('Explain why the task is rejected (this will be sent to the user):', '');
    if (reason === null || !reason.trim()) {
      if (reason !== null) {
        alert('Please provide a reason for rejection');
      }
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        alert('Admin token not found. Please login again.');
        window.location.href = '/admin/login';
        return;
      }

      const url = `${API_ENDPOINTS.USER_TASKS.UPDATE_STATUS(taskId)}`;
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: 'rejected', 
          adminNotes: reason 
        })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        alert('Task rejected and sent back to pending');
        fetchSubmittedTasks();
      } else {
        throw new Error(data.message || 'Failed to reject task');
      }
    } catch (error) {
      console.error('Full error:', error);
      alert(`Failed to reject task:\n${error.message}\n\nCheck console for details.`);
    }
  };

  if (loading) {
    return <div className="loading">Loading submitted tasks...</div>;
  }

  return (
    <div className="submitted-tasks-container">
      <div className="submitted-header">
        <h1><FaClipboardList /> Submitted Tasks Review</h1>
        <p>Review tasks submitted by users from mobile app - approve or reject them</p>
      </div>

      {submittedTasks.length === 0 ? (
        <div className="no-submitted-tasks">
          <FaTasks size={80} />
          <h2>No Submitted Tasks</h2>
          <p>No tasks have been submitted by users yet.</p>
          <p className="info-text">
            <FaInfoCircle /> Tasks will appear here when users complete and submit them from the mobile app.
          </p>
        </div>
      ) : (
        <div className="submitted-tasks-table-container">
          <table className="submitted-tasks-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Task Title</th>
                <th>Submitted Date</th>
                <th>Deadline</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submittedTasks.map((task) => (
                <tr key={task._id} className="submitted-task-row">
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar">
                        <FaUser />
                      </div>
                      <span>{task.userName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      <FaEnvelope />
                      <span>{task.userEmail}</span>
                    </div>
                  </td>
                  <td>
                    <div className="task-title-cell">
                      <FaTasks />
                      <span>{task.taskTitle}</span>
                      {task.isCustomTask && <span className="custom-badge">Custom</span>}
                    </div>
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
                        onClick={() => viewSubmission(task)}
                        title="View submission details"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn-approve"
                        onClick={() => handleApprove(task._id)}
                        title="Approve task"
                      >
                        <FaCheckCircle />
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleReject(task._id)}
                        title="Reject and send back"
                      >
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
    </div>
  );
};

export default SubmittedTasks;
