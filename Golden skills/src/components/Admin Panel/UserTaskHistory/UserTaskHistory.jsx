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
        const tasks = data.userTasks || [];
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
      assigned: { icon: <FaClock />, text: 'Assigned', className: 'status-assigned' },
      'in-progress': { icon: <FaHourglassHalf />, text: 'In Progress', className: 'status-in-progress' },
      completed: { icon: <FaCheckCircle />, text: 'Completed', className: 'status-completed' },
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

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task => 
        task.userName?.toLowerCase().includes(query) ||
        task.userEmail?.toLowerCase().includes(query) ||
        task.taskTitle?.toLowerCase().includes(query) ||
        task.userPlanSubmissionId?.userId?.toString().includes(query)
      );
    }

    setTaskHistory(filtered);
  }, [filter, searchQuery, allTaskHistory]);

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
            <p>Review completed tasks and approve or send back to the user</p>
          </>
        ) : (
          <>
            <h1><FaHistory /> User Task History</h1>
            <p>View and manage all assigned tasks and their completion status</p>
          </>
        )}
      </div>

      {/* Statistics */}
      <div className="statistics-section">
        <h2>Task Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon assigned">
              <FaClock />
            </div>
            <div className="stat-details">
              <h3>{allTaskHistory.filter(t => t.status === 'assigned').length}</h3>
              <p>Assigned</p>
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
              <p>Completed</p>
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

      {/* Search Section */}
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

      {/* Status Filter */}
      <div className="filter-section">
        <h3>Filter by Status</h3>
        <div className="filter-buttons">
          {mode === 'pending' ? (
            <>
              <button 
                className={filter === 'assigned' ? 'active' : ''}
                onClick={() => setFilter('assigned')}
              >
                Assigned (Pending)
              </button>
              <button 
                className={filter === 'overdue' ? 'active' : ''}
                onClick={() => setFilter('overdue')}
              >
                Overdue (Pending)
              </button>
            </>
          ) : mode === 'review' ? (
            <>
              <button 
                className={filter === 'completed' ? 'active' : ''}
                onClick={() => setFilter('completed')}
              >
                Completed
              </button>
              <button 
                className={filter === 'in-progress' ? 'active' : ''}
                onClick={() => setFilter('in-progress')}
              >
                In Progress
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
                Assigned
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
                Completed
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

      {/* Task History Table */}
      {taskHistory.length === 0 ? (
        <div className="no-tasks">
          <FaTasks size={60} />
          <h3>No Tasks Found</h3>
          <p>
            {mode === 'pending' 
              ? 'No pending tasks assigned by admin at the moment' 
              : 'No task assignments found for the selected filter'}
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
                <th>Points</th>
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
                    <span className="points-badge">{task.taskPoints} pts</span>
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
                            className="btn-approve-task"
                            title="Approve task"
                            onClick={() => {
                              const notes = window.prompt('Add approval notes (optional):', '');
                              updateTaskStatus(task._id, 'completed', notes || '');
                            }}
                          >
                            <FaCheckCircle /> Approve
                          </button>
                          <button
                            className="btn-reject-task"
                            title="Send back to user (task not correct)"
                            onClick={() => {
                              const reason = window.prompt('Explain why the task is not correct (this will be sent to the user):', '');
                              if (reason !== null) {
                                // Move task back to assigned so it appears in pending list again
                                updateTaskStatus(task._id, 'assigned', reason || '');
                              }
                            }}
                          >
                            <FaTimesCircle /> Send Back
                          </button>
                        </>
                      )}
                      <button 
                        className="btn-delete"
                        onClick={() => handleDeleteTask(task._id)}
                        title="Delete Task"
                      >
                        <FaTrash />
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

export default UserTaskHistory;
