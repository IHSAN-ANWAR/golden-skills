import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import './CourseHistory.css';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { FaHistory, FaUser, FaEnvelope, FaLink, FaCalendarAlt, FaSearch, FaTrash, FaExternalLinkAlt } from 'react-icons/fa';

const CourseHistory = forwardRef((props, ref) => {
  const [assignments, setAssignments] = useState([]);
  const [allAssignments, setAllAssignments] = useState([]); // Store all assignments for filtering
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(''); // Search query state
  const [dateFilter, setDateFilter] = useState('all'); // all, today, yesterday, week, month
  const [categoryFilter, setCategoryFilter] = useState('all'); // all, premium, pro, lite

  const fetchCourseHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        alert('Please login first');
        window.location.href = '/admin/login';
        return;
      }
      
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await fetch(`${API_ENDPOINTS.COURSE_LINKS.GET_ALL}`, { headers });
      const data = await response.json();

      if (data.success) {
        const assignmentsData = data.assignments || [];
        setAllAssignments(assignmentsData);
      }
      
    } catch (error) {
      console.error('Error fetching course history:', error);
      alert('Failed to load course history: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Expose refresh method to parent component
  useImperativeHandle(ref, () => ({
    refresh: fetchCourseHistory
  }));

  useEffect(() => {
    fetchCourseHistory();
  }, []); // Fetch once on mount


  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this course assignment?')) {
      return;
    }

    try {
      // Note: You may need to add a DELETE endpoint in the backend
      // For now, we'll just remove it from the local state
      setAllAssignments(prev => prev.filter(assignment => assignment._id !== assignmentId));
      alert('Course assignment deleted successfully');
    } catch (error) {
      console.error('Error deleting assignment:', error);
      alert('Failed to delete assignment');
    }
  };

  // Filter assignments based on search query, date filter, and category filter
  useEffect(() => {
    let filtered = [...allAssignments];

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(assignment => assignment.category === categoryFilter);
    }

    // Apply date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      let dateRange = null;

      switch (dateFilter) {
        case 'today':
          dateRange = { start: today, end: now };
          break;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          const endYesterday = new Date(yesterday);
          endYesterday.setHours(23, 59, 59, 999);
          dateRange = { start: yesterday, end: endYesterday };
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          dateRange = { start: weekAgo, end: now };
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          dateRange = { start: monthAgo, end: now };
          break;
        default:
          dateRange = null;
      }

      if (dateRange) {
        filtered = filtered.filter(assignment => {
          const assignmentDate = new Date(assignment.sentAt);
          return assignmentDate >= dateRange.start && assignmentDate <= dateRange.end;
        });
      }
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(assignment => 
        assignment.userName?.toLowerCase().includes(query) ||
        assignment.userEmail?.toLowerCase().includes(query) ||
        assignment.userId?.toString().includes(query) ||
        assignment.courseLink?.toLowerCase().includes(query) ||
        assignment.category?.toLowerCase().includes(query)
      );
    }

    setAssignments(filtered);
  }, [categoryFilter, dateFilter, searchQuery, allAssignments]);

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

  const getCategoryBadge = (category) => {
    const categoryConfig = {
      premium: { className: 'category-premium', label: 'Premium' },
      pro: { className: 'category-pro', label: 'Pro' },
      lite: { className: 'category-lite', label: 'Lite' }
    };
    
    const config = categoryConfig[category] || categoryConfig.premium;
    return (
      <span className={`category-badge ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return <div className="loading">Loading course history...</div>;
  }

  return (
    <div className="course-history-container">
      <div className="history-header">
        <h1><FaHistory /> Course History</h1>
        <p>View and manage all course link assignments sent to users</p>
      </div>

      {/* Statistics */}
      <div className="statistics-section">
        <h2>Course Assignment Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon premium">
              <FaLink />
            </div>
            <div className="stat-details">
              <h3>{allAssignments.length}</h3>
              <p>Total Assignments</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon premium">
              <FaLink />
            </div>
            <div className="stat-details">
              <h3>{allAssignments.filter(a => a.category === 'premium').length}</h3>
              <p>Premium</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon pro">
              <FaLink />
            </div>
            <div className="stat-details">
              <h3>{allAssignments.filter(a => a.category === 'pro').length}</h3>
              <p>Pro</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon lite">
              <FaLink />
            </div>
            <div className="stat-details">
              <h3>{allAssignments.filter(a => a.category === 'lite').length}</h3>
              <p>Lite</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="search-section">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Search by user name, email, user ID, course link, or category..."
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
            Found {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} matching "{searchQuery}"
          </div>
        )}
      </div>

      {/* Date Filter Section */}
      <div className="date-filter-section">
        <h3><FaCalendarAlt /> Filter by Date</h3>
        <div className="date-filter-buttons">
          <button 
            className={dateFilter === 'all' ? 'active' : ''}
            onClick={() => setDateFilter('all')}
          >
            All Time
          </button>
          <button 
            className={dateFilter === 'today' ? 'active' : ''}
            onClick={() => setDateFilter('today')}
          >
            Today
          </button>
          <button 
            className={dateFilter === 'yesterday' ? 'active' : ''}
            onClick={() => setDateFilter('yesterday')}
          >
            Yesterday
          </button>
          <button 
            className={dateFilter === 'week' ? 'active' : ''}
            onClick={() => setDateFilter('week')}
          >
            Last 7 Days
          </button>
          <button 
            className={dateFilter === 'month' ? 'active' : ''}
            onClick={() => setDateFilter('month')}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* Category Filter Section */}
      <div className="category-filter-section">
        <h3>Filter by Category</h3>
        <div className="category-filter-buttons">
          <button 
            className={categoryFilter === 'all' ? 'active' : ''}
            onClick={() => setCategoryFilter('all')}
          >
            All ({allAssignments.length})
          </button>
          <button 
            className={categoryFilter === 'premium' ? 'active' : ''}
            onClick={() => setCategoryFilter('premium')}
          >
            Premium ({allAssignments.filter(a => a.category === 'premium').length})
          </button>
          <button 
            className={categoryFilter === 'pro' ? 'active' : ''}
            onClick={() => setCategoryFilter('pro')}
          >
            Pro ({allAssignments.filter(a => a.category === 'pro').length})
          </button>
          <button 
            className={categoryFilter === 'lite' ? 'active' : ''}
            onClick={() => setCategoryFilter('lite')}
          >
            Lite ({allAssignments.filter(a => a.category === 'lite').length})
          </button>
        </div>
      </div>

      {/* Assignments Table */}
      {assignments.length === 0 ? (
        <div className="no-assignments">
          <FaHistory size={60} />
          <h3>No Course Assignments Found</h3>
          <p>No course assignments found for the selected filters</p>
        </div>
      ) : (
        <div className="assignments-table-container">
          <table className="assignments-table">
            <thead>
              <tr>
                <th>User ID</th>
                <th>User Name</th>
                <th>Email</th>
                <th>Category</th>
                <th>Course Link</th>
                <th>Sent Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment._id} className="assignment-row">
                  <td>
                    <span className="user-id-badge">
                      #{assignment.userId || 'N/A'}
                    </span>
                  </td>
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar-small">
                        <FaUser />
                      </div>
                      <span className="user-fullname">{assignment.userName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      <FaEnvelope className="email-icon" />
                      <span>{assignment.userEmail || 'N/A'}</span>
                    </div>
                  </td>
                  <td>
                    {getCategoryBadge(assignment.category)}
                  </td>
                  <td>
                    <div className="course-link-cell">
                      <FaLink className="link-icon" />
                      <a 
                        href={assignment.courseLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="course-link"
                        title={assignment.courseLink}
                      >
                        {assignment.courseLink.length > 50 
                          ? `${assignment.courseLink.substring(0, 50)}...` 
                          : assignment.courseLink}
                        <FaExternalLinkAlt className="external-link-icon" />
                      </a>
                    </div>
                  </td>
                  <td>
                    <div className="date-cell">
                      <FaCalendarAlt className="date-icon" />
                      <span>{formatDateTime(assignment.sentAt)}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => window.open(assignment.courseLink, '_blank')}
                        title="Open Course Link"
                      >
                        <FaExternalLinkAlt />
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteAssignment(assignment._id)}
                        title="Delete Assignment"
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
});

CourseHistory.displayName = 'CourseHistory';

export default CourseHistory;
