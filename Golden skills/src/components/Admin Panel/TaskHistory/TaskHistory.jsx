import { useState, useEffect } from 'react';
import './TaskHistory.css';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { FaHistory, FaUser, FaEnvelope, FaPhone, FaClock, FaCheckCircle, FaTimesCircle, FaEye, FaTrash } from 'react-icons/fa';

const TaskHistory = () => {
  const [submissions, setSubmissions] = useState([]);
  const [allSubmissions, setAllSubmissions] = useState([]); // Store all submissions for filtering
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending'); // pending, approved, rejected

  useEffect(() => {
    fetchSubmissions();
  }, []); // Fetch once on mount

  const fetchSubmissions = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const response = await fetch(`${API_ENDPOINTS.SUBMISSIONS.GET_ALL}`, { headers });
      const data = await response.json();
      
      if (data.success) {
        const subs = data.submissions || [];
        setAllSubmissions(subs);
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      alert('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const updateSubmissionStatus = async (id, status, notes = '') => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const response = await fetch(`${API_ENDPOINTS.SUBMISSIONS.UPDATE_STATUS(id)}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status, notes })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setAllSubmissions(prev => prev.map(sub => 
          sub._id === id ? { ...sub, status, notes } : sub
        ));
        alert(`Submission ${status} successfully!`);
      } else {
        alert(data.message || 'Failed to update submission');
      }
    } catch (error) {
      console.error('Error updating submission:', error);
      alert('Failed to update submission');
    }
  };

  const deleteSubmission = async (id) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const response = await fetch(`${API_ENDPOINTS.SUBMISSIONS.DELETE(id)}`, {
        method: 'DELETE',
        headers
      });
      
      const data = await response.json();
      
      if (data.success) {
        setAllSubmissions(prev => prev.filter(sub => sub._id !== id));
        alert('Submission deleted successfully!');
      } else {
        alert(data.message || 'Failed to delete submission');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      alert('Failed to delete submission');
    }
  };

  // Filter submissions based on status
  useEffect(() => {
    let filtered = [...allSubmissions];

    // Apply status filter (pending, approved, rejected)
    if (filter) {
      filtered = filtered.filter(submission => submission.status === filter);
    }

    setSubmissions(filtered);
  }, [filter, allSubmissions]);

  const filteredSubmissions = submissions;

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { icon: <FaClock />, text: 'Pending', className: 'status-pending' },
      approved: { icon: <FaCheckCircle />, text: 'Approved', className: 'status-approved' },
      rejected: { icon: <FaTimesCircle />, text: 'Rejected', className: 'status-rejected' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`status-badge ${config.className}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const viewSubmissionDetails = (submission) => {
    // Create a modal or alert with full details
    const details = `
User Details:
- Name: ${submission.userName}
- Email: ${submission.userEmail || 'Not provided'}
- Phone: ${submission.userPhone || 'Not provided'}
- User ID: #${submission.userId}

Plan Details:
- Plan: ${submission.planTitle}
- Price: ${submission.planPrice}

Status: ${submission.status}
${submission.notes ? `Notes: ${submission.notes}` : ''}
Submitted: ${formatDate(submission.createdAt)}
    `;
    alert(details);
  };

  if (loading) {
    return <div className="loading">Loading submissions...</div>;
  }

  return (
    <div className="task-history-container">
      <div className="history-header">
        <h1>Verifications</h1>
        <p>Review and manage user plan submissions</p>
      </div>

      {/* Status Filter */}
      <div className="time-filter">
        <h3>Filter by Status</h3>
        <div className="filter-buttons">
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending ({allSubmissions.filter(s => s.status === 'pending').length})
          </button>
          <button 
            className={filter === 'approved' ? 'active' : ''}
            onClick={() => setFilter('approved')}
          >
            Approved ({allSubmissions.filter(s => s.status === 'approved').length})
          </button>
          <button 
            className={filter === 'rejected' ? 'active' : ''}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({allSubmissions.filter(s => s.status === 'rejected').length})
          </button>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="submissions-table-container">
        <table className="submissions-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Name</th>
              <th>Payment Proof</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Plan</th>
              <th>Price</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-submissions-row">
                  <div className="no-submissions-content">
                    <FaHistory className="no-submissions-icon" />
                    <h3>No {filter} submissions found</h3>
                    <p>User plan submissions will appear here</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((submission) => (
                <tr key={submission._id} className="submission-row">
                  <td>
                    <span className="user-id-badge">#{submission.userId}</span>
                  </td>
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar-small">
                        <FaUser />
                      </div>
                      <span className="user-fullname">{submission.userName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="payment-image-cell">
                      {submission.userImage ? (
                        <img 
                          src={submission.userImage} 
                          alt="Payment Proof"
                          className="payment-thumbnail"
                          onClick={() => window.open(submission.userImage, '_blank')}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                      ) : (
                        <span className="no-image-text">No Image</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      <FaEnvelope className="email-icon" />
                      <span>{submission.userEmail || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <div className="phone-cell">
                      <FaPhone className="phone-icon" />
                      <span>{submission.userPhone || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="plan-title">{submission.planTitle}</span>
                  </td>
                  <td>
                    <div className="price-cell">
                      <span className="price-currency">Rs</span>
                      <span>{submission.planPrice}</span>
                    </div>
                  </td>
                  <td>{formatDate(submission.createdAt)}</td>
                  <td>
                    {getStatusBadge(submission.status)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => viewSubmissionDetails(submission)}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      {submission.status === 'pending' && (
                        <>
                          <button 
                            className="action-btn approve-btn"
                            onClick={() => {
                              const notes = prompt('Add approval notes (optional):');
                              updateSubmissionStatus(submission._id, 'approved', notes || '');
                            }}
                            title="Approve"
                          >
                            <FaCheckCircle />
                          </button>
                          <button 
                            className="action-btn reject-btn"
                            onClick={() => {
                              const notes = prompt('Reason for rejection:');
                              if (notes) {
                                updateSubmissionStatus(submission._id, 'rejected', notes);
                              }
                            }}
                            title="Reject"
                          >
                            <FaTimesCircle />
                          </button>
                        </>
                      )}
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => deleteSubmission(submission._id)}
                        title="Delete"
                      >
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
    </div>
  );
};

export default TaskHistory;
