import { useState, useEffect } from 'react';
import { FaUsers, FaEnvelope, FaMapMarkerAlt, FaIdCard, FaTrash } from 'react-icons/fa';
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
        headers: { 'Authorization': `Bearer ${token}` }
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

  const handlePageChange = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    fetchUsers(pageNumber, searchTerm);
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(API_ENDPOINTS.AUTH.DELETE_USER(userId), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        alert('User deleted successfully!');
        fetchUsers(currentPage, searchTerm);
      } else {
        alert(data.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + error.message);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(1, searchTerm);
  };

  if (loading) {
    return <div className="loading">Loading users...</div>;
  }

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
              onClick={() => { setSearchTerm(''); fetchUsers(1, ''); }}
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {error && <div className="error-message">{error}</div>}

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
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan="8" className="no-users-row">
                  <div className="no-users-content">
                    <FaUsers className="no-users-icon" />
                    <h3>No users found</h3>
                    <p>Users registered through the mobile app will appear here</p>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="user-row">
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar-small"><FaUsers /></div>
                      <span className="user-fullname">{user.fullName}</span>
                    </div>
                  </td>
                  <td><span className="username">@{user.username}</span></td>
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
                    <div className="action-buttons">
                      <button
                        className="action-btn delete-btn"
                        onClick={() => deleteUser(user._id)}
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
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
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
