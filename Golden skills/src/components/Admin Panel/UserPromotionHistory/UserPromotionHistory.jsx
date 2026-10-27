import { useState, useEffect } from 'react';
import './UserPromotionHistory.css';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { FaHistory, FaUser, FaEnvelope, FaTasks, FaCalendarAlt, FaClock, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaTrash, FaSearch, FaBullhorn, FaMoneyBillWave } from 'react-icons/fa';

const UserPromotionHistory = ({ filter: initialFilter = 'active', mode = 'pending' }) => {
  const [taskHistory, setTaskHistory] = useState([]);
  const [allTaskHistory, setAllTaskHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTaskHistory();
  }, []);

  const fetchTaskHistory = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        alert('Please login first');
        window.location.href = '/admin/login';
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      // Build query
      const params = new URLSearchParams();
      if (mode === 'pending') params.append('status', 'active');
      if (mode === 'history') params.append('status', 'completed');

      const res = await fetch(`${API_ENDPOINTS.USER_PROMOTIONS.GET_ALL}?${params}`, { headers });
      const data = await res.json();

      if (data.success) {
        // Flatten: one row per task
        const rows = [];
        for (const promo of data.userPromotions || []) {
          for (const task of promo.tasks || []) {
            rows.push({
              ...task,
              _promoId: promo._id,
              _userName: promo.userName,
              _userEmail: promo.userEmail,
              _promotionTitle: promo.promotionTitle,
              _rewardAmount: promo.rewardAmount,
              _promoStatus: promo.status,
              _rewardStatus: promo.rewardStatus,
              _planTitle: promo.planTitle,
              _planPrice: promo.planPrice,
              _createdAt: promo.createdAt
            });
          }
        }
        setAllTaskHistory(rows);
      }
    } catch (err) {
      console.error('Error fetching promotion history:', err);
      alert('Failed to load promotion history: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePromotion = async (promoId) => {
    if (!window.confirm('Are you sure you want to delete this promotion record?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.USER_PROMOTIONS.DELETE(promoId), {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        alert('Deleted successfully');
        fetchTaskHistory();
      } else {
        alert(data.message || 'Failed to delete');
      }
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      assigned: { icon: <FaClock />, text: 'Pending', className: 'status-assigned' },
      'in-progress': { icon: <FaHourglassHalf />, text: 'In Progress', className: 'status-in-progress' },
      completed: { icon: <FaCheckCircle />, text: 'Submitted', className: 'status-completed' },
      approved: { icon: <FaCheckCircle />, text: 'Approved', className: 'status-approved' },
      rejected: { icon: <FaTimesCircle />, text: 'Rejected', className: 'status-rejected' }
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
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  // Apply search filter
  useEffect(() => {
    let filtered = allTaskHistory;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t =>
        t._userName?.toLowerCase().includes(query) ||
        t._userEmail?.toLowerCase().includes(query) ||
        t.taskTitle?.toLowerCase().includes(query) ||
        t._promotionTitle?.toLowerCase().includes(query)
      );
    }
    setTaskHistory(filtered);
  }, [searchQuery, allTaskHistory]);

  if (loading) {
    return <div className="loading">Loading promotion history...</div>;
  }

  return (
    <div className="user-task-history-container">
      <div className="history-header">
        {mode === 'pending' ? (
          <>
            <h1><FaBullhorn /> Pending Promotion Tasks</h1>
            <p>Promotion tasks assigned to users that are pending completion</p>
          </>
        ) : (
          <>
            <h1><FaHistory /> Promotion History</h1>
            <p>View all completed and approved promotion tasks</p>
          </>
        )}
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search by user name, email, task or promotion..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search-btn" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>
        {searchQuery && (
          <div className="search-results-info">
            Found {taskHistory.length} result(s) matching "{searchQuery}"
          </div>
        )}
      </div>

      {taskHistory.length === 0 ? (
        <div className="no-tasks">
          <FaBullhorn size={60} />
          <h3>No Tasks Found</h3>
          <p>
            {mode === 'pending'
              ? 'No pending promotion tasks at the moment'
              : 'No completed promotion tasks in history yet'}
          </p>
        </div>
      ) : (
        <div className="tasks-table-container">
          <table className="tasks-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Promotion</th>
                <th>Task Title</th>
                <th>Plan</th>
                <th>Deadline</th>
                {mode === 'history' && <th>Completed Date</th>}
                <th>Reward</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {taskHistory.map((task) => (
                <tr
                  key={`${task._promoId}-${task._id}`}
                  className={`task-row ${mode === 'pending' && task.status === 'assigned' ? 'pending-highlight' : ''}`}
                >
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar-small"><FaUser /></div>
                      <span className="user-fullname">{task._userName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      <FaEnvelope className="email-icon" />
                      <span>{task._userEmail}</span>
                    </div>
                  </td>
                  <td>{task._promotionTitle || '—'}</td>
                  <td>
                    <div className="task-title-cell">
                      <FaTasks className="task-icon" />
                      <span className="task-title">{task.taskTitle}</span>
                    </div>
                  </td>
                  <td>
                    <span className="plan-title">{task._planTitle}</span>
                    <br />
                    <small style={{ color: '#28a745', fontWeight: 600 }}>Rs. {task._planPrice}</small>
                  </td>
                  <td>
                    <div className="date-cell">
                      <FaCalendarAlt className="date-icon" />
                      <span>{formatDate(task.taskDeadline)}</span>
                    </div>
                  </td>
                  {mode === 'history' && (
                    <td>
                      <div className="date-cell">
                        <FaCheckCircle className="date-icon completed-icon" />
                        <span className={task.completedAt ? 'completed-date' : 'no-date'}>
                          {task.completedAt ? formatDate(task.completedAt) : 'Not completed'}
                        </span>
                      </div>
                    </td>
                  )}
                  <td>
                    {task._rewardAmount ? (
                      <div className="date-cell">
                        <FaMoneyBillWave className="date-icon" style={{ color: '#28a745' }} />
                        <span style={{ color: '#28a745', fontWeight: 600 }}>Rs. {task._rewardAmount}</span>
                      </div>
                    ) : '—'}
                    {task._rewardStatus === 'approved' && (
                      <span className="custom-badge" style={{ background: '#d4edda', color: '#155724', display: 'block', marginTop: '4px' }}>Reward Paid</span>
                    )}
                  </td>
                  <td>{getStatusBadge(task.status)}</td>
                  <td>
                    <div className="task-actions-cell">
                      <button
                        className="btn-delete"
                        onClick={() => handleDeletePromotion(task._promoId)}
                        title="Delete Promotion Record"
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

export default UserPromotionHistory;
