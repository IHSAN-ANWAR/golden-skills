import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import {
  FaCheckCircle, FaBan, FaUser, FaCalendarAlt,
  FaGraduationCap, FaCertificate, FaExternalLinkAlt, FaSpinner
} from 'react-icons/fa';
import './CourseCompletions.css';

const CourseCompletions = () => {
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('submitted');
  const [approvingId, setApprovingId] = useState(null);
  const [counts, setCounts] = useState({ submitted: 0, approved: 0, rejected: 0 });

  useEffect(() => { fetchCompletions(); }, [filter]);
  useEffect(() => { fetchCounts(); }, []);

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const headers = { Authorization: `Bearer ${token}` };

      const [sRes, aRes, rRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.USER_COURSE_COMPLETIONS.GET_ALL}?status=submitted`, { headers }),
        fetch(`${API_ENDPOINTS.USER_COURSE_COMPLETIONS.GET_ALL}?status=approved`, { headers }),
        fetch(`${API_ENDPOINTS.USER_COURSE_COMPLETIONS.GET_ALL}?status=rejected`, { headers })
      ]);
      const [s, a, r] = await Promise.all([sRes.json(), aRes.json(), rRes.json()]);
      setCounts({
        submitted: (s.completions || []).length,
        approved: (a.completions || []).length,
        rejected: (r.completions || []).length
      });
    } catch (err) {
      console.error('Count fetch error:', err);
    }
  };

  const fetchCompletions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) { window.location.href = '/admin/login'; return; }

      const url = `${API_ENDPOINTS.USER_COURSE_COMPLETIONS.GET_ALL}?status=${filter}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setCompletions(data.completions || []);
    } catch (err) {
      console.error('Fetch completions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (completionId, userName, courseTitle) => {
    if (!window.confirm(
      `Approve course completion for "${userName}"?\n\nCourse: ${courseTitle}\n\nA certificate PDF will be automatically generated.`
    )) return;

    setApprovingId(completionId);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.USER_COURSE_COMPLETIONS.UPDATE_STATUS(completionId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'approved' })
      });
      const data = await res.json();
      if (data.success) {
        alert(`✅ Approved! Certificate generated successfully.`);
        fetchCompletions();
        fetchCounts();
      } else {
        alert(data.message || 'Failed to approve');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to approve completion');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (completionId) => {
    if (!window.confirm('Are you sure you want to reject this course completion?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.USER_COURSE_COMPLETIONS.UPDATE_STATUS(completionId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });
      const data = await res.json();
      if (data.success) {
        alert('Course completion rejected');
        fetchCompletions();
        fetchCounts();
      } else {
        alert(data.message || 'Failed to reject');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to reject completion');
    }
  };

  const getStatusClass = (status) => ({
    submitted: 'status-pending',
    approved: 'status-approved',
    rejected: 'status-rejected'
  }[status] || 'status-pending');

  const getCategoryClass = (cat) => ({
    premium: 'cat-premium',
    pro: 'cat-pro',
    lite: 'cat-lite'
  }[cat] || 'cat-lite');

  return (
    <div className="course-completions-container">
      {/* Header */}
      <div className="completions-header">
        <div className="header-icon-wrap">
          <FaGraduationCap className="header-icon" />
        </div>
        <div>
          <h2>Course Completions</h2>
          <p>Review user completions and approve to auto-generate certificates</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="stats-bar">
        <div className="stat-card stat-submitted">
          <span className="stat-number">{counts.submitted}</span>
          <span className="stat-label">Pending Review</span>
        </div>
        <div className="stat-card stat-approved">
          <span className="stat-number">{counts.approved}</span>
          <span className="stat-label">Approved</span>
        </div>
        <div className="stat-card stat-rejected">
          <span className="stat-number">{counts.rejected}</span>
          <span className="stat-label">Rejected</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {[
          { key: 'submitted', label: 'Pending Review', count: counts.submitted },
          { key: 'approved',  label: 'Approved',       count: counts.approved },
          { key: 'rejected',  label: 'Rejected',        count: counts.rejected }
        ].map(tab => (
          <button
            key={tab.key}
            className={`filter-tab ${filter === tab.key ? 'active' : ''} tab-${tab.key}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="loading-state">
          <FaSpinner className="spin-icon" />
          <p>Loading completions...</p>
        </div>
      ) : completions.length === 0 ? (
        <div className="empty-state">
          <FaGraduationCap size={60} />
          <h3>No {filter} completions</h3>
          <p>
            {filter === 'submitted'
              ? 'No users have submitted course completions yet'
              : `No ${filter} course completions to show`}
          </p>
        </div>
      ) : (
        <div className="completions-grid">
          {completions.map((item) => (
            <div key={item._id} className={`completion-card ${item.status}`}>
              {/* Card Header */}
              <div className="card-header">
                <div className="user-avatar">
                  {item.userName?.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <h3 className="user-name">
                    <FaUser className="info-icon" />
                    {item.userName}
                  </h3>
                  <p className="user-email">{item.userEmail}</p>
                </div>
                <span className={`status-badge ${getStatusClass(item.status)}`}>
                  {item.status === 'submitted' ? '⏳ Pending' :
                   item.status === 'approved'  ? '✅ Approved' : '❌ Rejected'}
                </span>
              </div>

              {/* Course Info */}
              <div className="card-body">
                <div className="course-info-row">
                  <FaGraduationCap className="row-icon" />
                  <span className="course-title">{item.courseTitle || 'Course Plan'}</span>
                  <span className={`category-badge ${getCategoryClass(item.category)}`}>
                    {item.category}
                  </span>
                </div>

                <div className="date-row">
                  <FaCalendarAlt className="row-icon" />
                  <span>
                    Submitted: {new Date(item.completedAt).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </span>
                </div>

                {item.approvedAt && (
                  <div className="date-row">
                    <FaCheckCircle className="row-icon approved-icon" />
                    <span>
                      Approved: {new Date(item.approvedAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </span>
                  </div>
                )}

                {/* Certificate section — only when approved */}
                {item.status === 'approved' && item.certificateUrl && (
                  <div className="certificate-row">
                    <FaCertificate className="cert-icon" />
                    <span className="cert-label">Certificate Generated</span>
                    <a
                      href={item.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="view-cert-btn"
                    >
                      <FaExternalLinkAlt /> View PDF
                    </a>
                  </div>
                )}
              </div>

              {/* Actions */}
              {item.status === 'submitted' && (
                <div className="card-actions">
                  <button
                    className="btn-approve"
                    onClick={() => handleApprove(item._id, item.userName, item.courseTitle)}
                    disabled={approvingId === item._id}
                  >
                    {approvingId === item._id ? (
                      <><FaSpinner className="spin-icon" /> Generating...</>
                    ) : (
                      <><FaCheckCircle /> Approve & Generate Certificate</>
                    )}
                  </button>
                  <button
                    className="btn-reject"
                    onClick={() => handleReject(item._id)}
                    disabled={approvingId === item._id}
                  >
                    <FaBan /> Reject
                  </button>
                </div>
              )}

              {item.status === 'approved' && !item.certificateUrl && (
                <div className="card-actions">
                  <p className="cert-generating">⏳ Certificate is being generated...</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseCompletions;
