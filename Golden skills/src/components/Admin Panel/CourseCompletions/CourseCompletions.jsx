import { useState, useEffect, useRef } from 'react';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { adminFetch } from '../../../config/adminApi';
import {
  FaCheckCircle, FaBan, FaUser, FaCalendarAlt,
  FaGraduationCap, FaCertificate, FaExternalLinkAlt, FaSpinner,
  FaUpload, FaFilePdf
} from 'react-icons/fa';
import './CourseCompletions.css';

const CourseCompletions = () => {
  const [completions, setCompletions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('submitted');
  const [approvingId, setApprovingId] = useState(null);
  const [counts, setCounts] = useState({ submitted: 0, approved: 0, rejected: 0 });

  // PDF upload state — har card ke liye alag file track karo
  const [selectedFiles, setSelectedFiles] = useState({}); // { [completionId]: File }
  const fileInputRefs = useRef({});                        // hidden input refs

  useEffect(() => { fetchCompletions(); }, [filter]);
  useEffect(() => { fetchCounts(); }, []);

  const fetchCounts = async () => {
    try {
      const [sRes, aRes, rRes] = await Promise.all([
        adminFetch(`${API_ENDPOINTS.USER_COURSE_COMPLETIONS.GET_ALL}?status=submitted`),
        adminFetch(`${API_ENDPOINTS.USER_COURSE_COMPLETIONS.GET_ALL}?status=approved`),
        adminFetch(`${API_ENDPOINTS.USER_COURSE_COMPLETIONS.GET_ALL}?status=rejected`)
      ]);
      if (!sRes || !aRes || !rRes) return;
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
      const url = `${API_ENDPOINTS.USER_COURSE_COMPLETIONS.GET_ALL}?status=${filter}`;
      const res = await adminFetch(url);
      if (!res) return;
      const data = await res.json();
      if (data.success) setCompletions(data.completions || []);
    } catch (err) {
      console.error('Fetch completions error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (completionId, userName, courseTitle) => {
    const file = selectedFiles[completionId];

    // File select nahi ki to block karo
    if (!file) {
      alert('Pehle certificate PDF file select karo, phir approve karo.');
      return;
    }

    if (!window.confirm(
      `Approve course completion for "${userName}"?\n\nCourse: ${courseTitle}\n\nCertificate PDF upload hoga.`
    )) return;

    setApprovingId(completionId);
    try {
      // multipart/form-data — file + status dono bhejo
      const formData = new FormData();
      formData.append('status', 'approved');
      formData.append('certificate', file);

      // adminFetch FormData detect karke Content-Type khud set karta hai
      const res = await adminFetch(
        API_ENDPOINTS.USER_COURSE_COMPLETIONS.UPDATE_STATUS(completionId),
        {
          method: 'PUT',
          body: formData
        }
      );
      if (!res) return;
      const data = await res.json();
      if (data.success) {
        alert(`✅ Approved! Certificate uploaded successfully.`);
        // Is card ki selected file clear karo
        setSelectedFiles(prev => {
          const updated = { ...prev };
          delete updated[completionId];
          return updated;
        });
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
      const res = await adminFetch(API_ENDPOINTS.USER_COURSE_COMPLETIONS.UPDATE_STATUS(completionId), {
        method: 'PUT',
        body: JSON.stringify({ status: 'rejected' })
      });
      if (!res) return;
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
                  {/* PDF upload area */}
                  <div className="upload-section">
                    <input
                      type="file"
                      accept="application/pdf"
                      ref={el => fileInputRefs.current[item._id] = el}
                      style={{ display: 'none' }}
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          if (file.size > 5 * 1024 * 1024) {
                            alert('File size 5MB se zyada nahi honi chahiye.');
                            e.target.value = '';
                            return;
                          }
                          setSelectedFiles(prev => ({ ...prev, [item._id]: file }));
                        }
                      }}
                    />
                    <button
                      className="btn-upload-pdf"
                      onClick={() => fileInputRefs.current[item._id]?.click()}
                      disabled={approvingId === item._id}
                    >
                      <FaFilePdf />
                      {selectedFiles[item._id]
                        ? <span className="file-name-text">📄 {selectedFiles[item._id].name}</span>
                        : <span>Select Certificate PDF</span>
                      }
                    </button>

                    <div className="action-btns-row">
                      <button
                        className="btn-approve"
                        onClick={() => handleApprove(item._id, item.userName, item.courseTitle)}
                        disabled={approvingId === item._id || !selectedFiles[item._id]}
                      >
                        {approvingId === item._id ? (
                          <><FaSpinner className="spin-icon" /> Uploading...</>
                        ) : (
                          <><FaUpload /> Approve & Upload Certificate</>
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
                  </div>
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
