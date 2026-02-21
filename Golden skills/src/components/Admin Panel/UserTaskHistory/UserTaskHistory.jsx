import { useState, useEffect } from 'react';
import './UserTaskHistory.css';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { FaHistory, FaUser, FaEnvelope, FaTasks, FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaTrash, FaSearch, FaUserShield } from 'react-icons/fa';

const UserTaskHistory = ({ initialFilter = 'all', mode = 'history' }) => {
  const [taskHistory, setTaskHistory] = useState([]);
  const [allTaskHistory, setAllTaskHistory] = useState([]); // Store all tasks for filtering
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(initialFilter || 'all'); // all, assigned, in-progress, completed, overdue
  const [searchQuery, setSearchQuery] = useState(''); // Search query state

  useEffect(() => {
    fetchTaskHistory();
  }, []); // Fetch once on mount

  const fetchTaskHistory = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        alert('Please login first');
        window.location.href = '/admin/login';
        return;
      }
      
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await fetch(`${API_ENDPOINTS.USER_TASKS.GET_ALL}`, { headers });
      const data = await response.json();

      if (data.success) {
        let tasks = data.userTasks || [];
        
        // For pending mode, ONLY show assigned and overdue tasks
        if (mode === 'pending') {
          tasks = tasks.filter(task => task.status === 'assigned' || task.status === 'overdue');
        }
        
        // For review mode, ONLY show completed tasks (submitted by users)
        if (mode === 'review') {
          tasks = tasks.filter(task => task.status === 'completed');
        }
        
        // For history mode, ONLY show approved tasks
        if (mode === 'history') {
          tasks = tasks.filter(task => task.status === 'approved');
        }
        
        setAllTaskHistory(tasks);
      }
      
    } catch (error) {
      console.error('Error fetching task history:', error);
      alert('Failed to load task history: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task assignment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.USER_TASKS.UPDATE_STATUS(taskId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Task deleted successfully');
        fetchTaskHistory();
      } else {
        alert(data.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task');
    }
  };

  const updateTaskStatus = async (taskId, newStatus, adminNotes = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.USER_TASKS.UPDATE_STATUS(taskId)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus, adminNotes })
      });

      const data = await response.json();

      if (data.success) {
        // Refresh list after status change
        await fetchTaskHistory();
        alert(data.message || 'Task status updated successfully');
      } else {
        alert(data.message || 'Failed to update task status');
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      assigned: { icon: <FaClock />, text: 'Pending', className: 'status-assigned' },
      'in-progress': { icon: <FaHourglassHalf />, text: 'In Progress', className: 'status-in-progress' },
      completed: { icon: <FaCheckCircle />, text: 'Submitted', className: 'status-completed' },
      approved: { icon: <FaCheckCircle />, text: 'Approved', className: 'status-approved' },
      rejected: { icon: <FaTimesCircle />, text: 'Rejected', className: 'status-rejected' },
      overdue: { icon: <FaTimesCircle />, text: 'Overdue', className: 'status-overdue' }
    };
    
    const config = statusConfig[status] || statusConfig.assigned;
    return (
      <span className={`status-badge ${config.className}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter tasks based on search query and status filter
  useEffect(() => {
    let filtered = allTaskHistory;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(task => task.status === filter);
    }

    // Apply search filter (only in history mode, not in pending or review mode)
    if (mode === 'history' && searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.userName?.toLowerCase().includes(query) ||
        task.userEmail?.toLowerCase().includes(query) ||
        task.taskTitle?.toLowerCase().includes(query) ||
        task.userPlanSubmissionId?.userId?.toString().includes(query)
      );
    }

    console.log('Filter applied:', { mode, filter, totalTasks: allTaskHistory.length, filteredTasks: filtered.length });
    setTaskHistory(filtered);
  }, [filter, searchQuery, allTaskHistory, mode]);

  if (loading) {
    return <div className="loading">Loading task history...</div>;
  }

  return (
    <div className="user-task-history-container">
      <div className="history-header">
        {mode === 'pending' ? (
          <>
            <h1><FaHistory /> Pending Tasks</h1>
            <p>Tasks assigned by admin that are pending completion by users</p>
          </>
        ) : mode === 'review' ? (
          <>
            <h1><FaHistory /> Submitted Tasks Review</h1>
            <p>Review tasks submitted by users - approve or reject them</p>
          </>
        ) : (
          <>
            <h1><FaHistory /> Task History</h1>
            <p>View all approved tasks that have been completed successfully</p>
          </>
        )}
      </div>

      {/* Statistics - Hidden for pending, review, and history modes */}
      {mode !== 'pending' && mode !== 'review' && mode !== 'history' && (
        <div className="statistics-section">
        <h2>Task Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon assigned">
              <FaClock />
            </div>
            <div className="stat-details">
              <h3>{allTaskHistory.filter(t => t.status === 'assigned').length}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon in-progress">
              <FaHourglassHalf />
            </div>
            <div className="stat-details">
              <h3>{allTaskHistory.filter(t => t.status === 'in-progress').length}</h3>
              <p>In Progress</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon completed">
              <FaCheckCircle />
            </div>
            <div className="stat-details">
              <h3>{allTaskHistory.filter(t => t.status === 'completed').length}</h3>
              <p>Submitted</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon approved">
              <FaCheckCircle />
            </div>
            <div className="stat-details">
              <h3>{allTaskHistory.filter(t => t.status === 'approved').length}</h3>
              <p>Approved</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon overdue">
              <FaTimesCircle />
            </div>
            <div className="stat-details">
              <h3>{allTaskHistory.filter(t => t.status === 'overdue').length}</h3>
              <p>Overdue</p>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Search Section - Only show for history mode */}
      {mode === 'history' && (
        <div className="search-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by user name, email, task title, or user ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              ×
            </button>
          )}
        </div>
        {searchQuery && (
          <div className="search-results-info">
            Found {taskHistory.length} task{taskHistory.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </div>
        )}
      </div>
      )}

      {/* Status Filter - Hidden for pending, review, and history modes */}
      {mode !== 'pending' && mode !== 'review' && mode !== 'history' && (
        <div className="filter-section">
        <h3>Filter by Status</h3>
        <div className="filter-buttons">
          {mode === 'pending' ? (
            <>
              <button 
                className={filter === 'assigned' ? 'active' : ''}
                onClick={() => setFilter('assigned')}
              >
                Pending
              </button>
              <button 
                className={filter === 'overdue' ? 'active' : ''}
                onClick={() => setFilter('overdue')}
              >
                Overdue
              </button>
            </>
          ) : mode === 'review' ? (
            <>
              <button 
                className={filter === 'completed' ? 'active' : ''}
                onClick={() => setFilter('completed')}
              >
                Submitted
              </button>
            </>
          ) : (
            <>
              <button 
                className={filter === 'all' ? 'active' : ''}
                onClick={() => setFilter('all')}
              >
                All ({allTaskHistory.length})
              </button>
              <button 
                className={filter === 'assigned' ? 'active' : ''}
                onClick={() => setFilter('assigned')}
              >
                Pending
              </button>
              <button 
                className={filter === 'in-progress' ? 'active' : ''}
                onClick={() => setFilter('in-progress')}
              >
                In Progress
              </button>
              <button 
                className={filter === 'completed' ? 'active' : ''}
                onClick={() => setFilter('completed')}
              >
                Submitted
              </button>
              <button 
                className={filter === 'approved' ? 'active' : ''}
                onClick={() => setFilter('approved')}
              >
                Approved
              </button>
              <button 
                className={filter === 'overdue' ? 'active' : ''}
                onClick={() => setFilter('overdue')}
              >
                Overdue
              </button>
            </>
          )}
        </div>
      </div>
      )}

      {/* Task History Table */}
      {taskHistory.length === 0 ? (
        <div className="no-tasks">
          <FaTasks size={60} />
          <h3>No Tasks Found</h3>
          <p>
            {mode === 'pending' 
              ? 'No pending tasks assigned by admin at the moment' 
              : mode === 'review'
              ? 'No submitted tasks waiting for review'
              : 'No approved tasks in history yet'}
          </p>
        </div>
      ) : (
        <div className="tasks-table-container">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>User Name</th>
                <th>Email</th>
                <th>Task Title</th>
                <th>Assigned By Admin</th>
                <th>Deadline</th>
                {mode !== 'pending' && <th>Completed Date</th>}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {taskHistory.map((task) => (
                <tr 
                  key={task._id} 
                  className={`task-row ${mode === 'pending' && (task.status === 'assigned' || task.status === 'overdue') ? 'pending-highlight' : ''}`}
                >
                  <td>
                    <span className="user-id-badge">
                      #{task.userPlanSubmissionId?.userId || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar-small">
                        <FaUser />
                      </div>
                      <span className="user-fullname">{task.userName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      <FaEnvelope className="email-icon" />
                      <span>{task.userEmail}</span>
                    </div>
                  </td>
                  <td>
                    <div className="task-title-cell">
                      <FaTasks className="task-icon" />
                      <div>
                        <span className="task-title">{task.taskTitle}</span>
                        {task.isCustomTask && (
                          <span className="custom-badge">Custom</span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <span className="admin-assigned-badge">
                        <FaUserShield /> Admin Assigned
                      </span>
                      <div style={{ marginTop: '5px', fontSize: '0.85rem', color: '#6c757d' }}>
                        <FaCalendarAlt className="date-icon" style={{ marginRight: '5px' }} />
                        {formatDate(task.assignedAt)}
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <FaCalendarAlt className="date-icon" />
                      <span>{formatDate(task.taskDeadline)}</span>
                    </div>
                  </td>
                  {mode !== 'pending' && (
                    <td>
                      <div className="date-cell">
                        <FaCheckCircle className="date-icon completed-icon" />
                        <span className={task.completedAt ? 'completed-date' : 'no-date'}>
                          {task.completedAt ? formatDateTime(task.completedAt) : 'Not completed'}
                        </span>
                      </div>
                    </td>
                  )}
                  <td>
                    {getStatusBadge(task.status)}
                  </td>
                  <td>
                    <div className="task-actions-cell">
                      {mode === 'review' && task.status === 'completed' && (
                        <>
                          <button
                            className="btn-view-submission"
                            title="View user submission details"
                            onClick={() => {
                              const submissionDetails = `
═══════════════════════════════════════
📋 TASK SUBMISSION DETAILS
═══════════════════════════════════════

👤 User: ${task.userName}
📧 Email: ${task.userEmail}
🎯 Task: ${task.taskTitle}

📝 Task Description:
${task.taskDescription}

${task.customTaskMessage ? `📌 Custom Instructions:\n${task.customTaskMessage}\n\n` : ''}
📤 User Submission:
${task.submissionData || 'No submission data provided'}

💬 User Notes:
${task.userNotes || 'No notes provided'}

📅 Assigned: ${new Date(task.assignedAt).toLocaleString()}
⏰ Deadline: ${new Date(task.taskDeadline).toLocaleString()}
✅ Submitted: ${task.completedAt ? new Date(task.completedAt).toLocaleString() : 'Not completed'}

═══════════════════════════════════════
                              `.trim();
                              
                              // Create a better modal for viewing submission
                              const modal = document.createElement('div');
                              modal.className = 'submission-modal-overlay';
                              modal.innerHTML = `
                                <div class="submission-modal-content">
                                  <div class="submission-modal-header">
                                    <h2>📋 Task Submission Review</h2>
                                    <button class="submission-modal-close">✕</button>
                                  </div>
                                  <div class="submission-modal-body">
                                    <div class="submission-section">
                                      <h3>👤 User Information</h3>
                                      <p><strong>Name:</strong> ${task.userName}</p>
                                      <p><strong>Email:</strong> ${task.userEmail}</p>
                                      <p><strong>User ID:</strong> #${task.userPlanSubmissionId?.userId || 'N/A'}</p>
                                    </div>
                                    
                                    <div class="submission-section">
                                      <h3>🎯 Task Details</h3>
                                      <p><strong>Title:</strong> ${task.taskTitle}</p>
                                      <p><strong>Description:</strong></p>
                                      <div class="submission-text">${task.taskDescription}</div>
                                      ${task.customTaskMessage ? `<p><strong>Custom Instructions:</strong></p><div class="submission-text">${task.customTaskMessage}</div>` : ''}
                                    </div>
                                    
                                    <div class="submission-section highlight">
                                      <h3>📤 User Submission</h3>
                                      <div class="submission-text">${task.submissionData || 'No submission data provided'}</div>
                                    </div>
                                    
                                    <div class="submission-section">
                                      <h3>💬 User Notes</h3>
                                      <div class="submission-text">${task.userNotes || 'No notes provided'}</div>
                                    </div>
                                    
                                    <div class="submission-section">
                                      <h3>📅 Timeline</h3>
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
                            }}
                          >
                            <FaTasks /> View Submission
                          </button>
                          <button
                            className="btn-approve-task"
                            title="Approve task"
                            onClick={() => {
                              const notes = window.prompt('Add approval notes (optional):', '');
                              if (notes !== null) {
                                updateTaskStatus(task._id, 'approved', notes || 'Task approved by admin');
                              }
                            }}
                          >
                            <FaCheckCircle /> Approve
                          </button>
                          <button
                            className="btn-reject-task"
                            title="Reject and send back to pending"
                            onClick={() => {
                              const reason = window.prompt('Explain why the task is rejected (this will be sent to the user):', '');
                              if (reason !== null && reason.trim()) {
                                updateTaskStatus(task._id, 'rejected', reason);
                              } else if (reason !== null) {
                                alert('Please provide a reason for rejection');
                              }
                            }}
                          >
                            <FaTimesCircle /> Reject
                          </button>
                        </>
                      )}
                      {mode !== 'review' && (
                        <button 
                          className="btn-delete"
                          onClick={() => handleDeleteTask(task._id)}
                          title="Delete Task"
                        >
                          <FaTrash />
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
    </div>
  );
};

export default UserTaskHistory;
