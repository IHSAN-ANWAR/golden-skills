import { useState, useEffect } from 'react';
import { FaUsers, FaEnvelope, FaMapMarkerAlt, FaIdCard, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import './Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [usersPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers(currentPage, searchTerm);
  }, []);

  const fetchUsers = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const token = localStorage.getItem('adminToken');
      
      const url = `${API_ENDPOINTS.AUTH.USERS}?page=${page}&limit=${usersPerPage}${searchParam}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
        setTotalUsers(data.total);
        setHasNextPage(data.hasNextPage);
        setHasPrevPage(data.hasPrevPage);
      } else {
        setError(data.message);
        // Redirect to login if unauthorized
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('adminToken');
          window.location.href = '/login';
        }
      }
    } catch (err) {
      setError('Failed to fetch users');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Current users are already paginated from backend
  const currentUsers = users;

  const handlePageChange = (pageNumber) => {
    // Validate page number
    if (pageNumber < 1 || pageNumber > totalPages) return;
    
    fetchUsers(pageNumber, searchTerm);
  };

  const handleAction = (action, userId) => {
    console.log(`${action} user: ${userId}`);
    // Implement actual actions here
  };

  if (loading) {
    return (
      <div className="loading">Loading users...</div>
    );
  }

  const handleSearch = (e) => {
    e.preventDefault();
    // Reset to first page when searching
    fetchUsers(1, searchTerm);
  };

  return (
    <>
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search users by name, username, email, or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <button type="submit" className="search-button">Search</button>
          {searchTerm && (
            <button 
              type="button" 
              className="clear-search-button"
              onClick={() => {
                setSearchTerm('');
                fetchUsers(1, '');
              }}
            >
              Clear
            </button>
          )}
        </div>
      </form>
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #390910 0%, #772218 100%)' }}>
            <FaUsers className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-number">{totalUsers}</h3>
            <p className="stat-label">Total Users</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #E6C547 100%)' }}>
            <FaUsers className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-number">{users.filter(u => u.isActive !== false).length}</h3>
            <p className="stat-label">Active Users</p>
          </div>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Email</th>
              <th>Age</th>
              <th>City</th>
              <th>Referral Code</th>
              <th>Registration Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-users-row">
                  <div className="no-users-content">
                    <FaUsers className="no-users-icon" />
                    <h3>No users found</h3>
                    <p>Users registered through the mobile app will appear here</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentUsers.map((user) => (
                <tr key={user._id} className="user-row">
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar-small">
                        <FaUsers />
                      </div>
                      <span className="user-fullname">{user.fullName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="username">@{user.username}</span>
                  </td>
                  <td>
                    <div className="email-cell">
                      <FaEnvelope className="email-icon" />
                      <span>{user.email}</span>
                    </div>
                  </td>
                  <td>{user.age} years</td>
                  <td>
                    <div className="location-cell">
                      <FaMapMarkerAlt className="location-icon" />
                      <span>{user.city}</span>
                    </div>
                  </td>
                  <td>
                    {user.referralCode ? (
                      <div className="referral-cell">
                        <FaIdCard className="referral-icon" />
                        <span>{user.referralCode}</span>
                      </div>
                    ) : (
                      <span className="no-referral">-</span>
                    )}
                  </td>
                  <td>{formatDate(user.createdAt)}</td>
                  <td>
                    <span className={`status-badge ${user.isActive === false ? 'inactive' : 'active'}`}>
                      {user.isActive === false ? 'Inactive' : 'Active'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => handleAction('view', user._id)}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleAction('edit', user._id)}
                        title="Edit User"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleAction('delete', user._id)}
                        title="Delete User"
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {(currentPage - 1) * usersPerPage + 1} to {Math.min(currentPage * usersPerPage, totalUsers)} of {totalUsers} users
          </div>
          <div className="pagination-controls">
            <button 
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={!hasPrevPage}
            >
              Previous
            </button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                // Show all pages if total pages is 5 or less
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                // Show first 5 pages if current page is 1, 2, or 3
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                // Show last 5 pages if current page is near the end
                pageNum = totalPages - 4 + i;
              } else {
                // Show current page in the middle
                pageNum = currentPage - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button 
              className="pagination-btn"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={!hasNextPage}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Users;