import { useState } from 'react';
import { API_ENDPOINTS } from '../config/apiConfig';
import './UserCourseData.css';
import {
  FaGraduationCap, FaCheckCircle, FaLink, FaCalendarAlt,
  FaCertificate, FaDownload, FaExternalLinkAlt, FaSpinner, FaClock
} from 'react-icons/fa';

const UserCourseData = () => {
  const [userId, setUserId] = useState('');
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [markingId, setMarkingId] = useState(null);

  const handleSearch = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!userId.trim()) { alert('Please enter your User ID'); return; }

    setLoading(true);
    setSearched(true);

    try {
      const [assignedRes, completedRes] = await Promise.all([
        fetch(API_ENDPOINTS.USER_COURSE_COMPLETIONS.GET_USER_ASSIGNED(userId)),
        fetch(API_ENDPOINTS.USER_COURSE_COMPLETIONS.GET_USER_COMPLETIONS(userId))
      ]);
      const [assignedData, completedData] = await Promise.all([
        assignedRes.json(), completedRes.json()
      ]);

      if (assignedData.success) setAssignedCourses(assignedData.courses || []);
      if (completedData.success) setCompletedCourses(completedData.completions || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
      alert('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  // User "Mark as Complete" — no quiz, just submit
  const handleMarkComplete = async (course) => {
    if (!window.confirm('Mark this course as complete?\n\nAdmin will review and generate your certificate.')) return;

    setMarkingId(course._id);
    try {
      const res = await fetch(API_ENDPOINTS.USER_COURSE_COMPLETIONS.SUBMIT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseLinkAssignmentId: course._id })
      });
      const data = await res.json();

      if (data.success) {
        alert('✅ Course marked as complete!\n\nAdmin will review and generate your certificate soon.');
        handleSearch();
      } else {
        alert(data.message || 'Failed to submit');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to mark course as complete');
    } finally {
      setMarkingId(null);
    }
  };

  const formatDate = (d) => d
    ? new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
    : 'N/A';

  const CategoryBadge = ({ category }) => {
    const map = { premium: 'category-premium', pro: 'category-pro', lite: 'category-lite' };
    return <span className={`category-badge ${map[category] || 'category-premium'}`}>{category}</span>;
  };

  const StatusBadge = ({ status }) => {
    if (status === 'approved') return <span className="status-badge status-approved"><FaCheckCircle /> Approved</span>;
    if (status === 'rejected') return <span className="status-badge status-rejected">❌ Rejected</span>;
    return <span className="status-badge status-pending"><FaClock /> Under Review</span>;
  };

  return (
    <div className="user-course-data-container">
      {/* Header */}
      <div className="course-data-header">
        <h1><FaGraduationCap /> My Courses</h1>
        <p>View your assigned courses and download certificates</p>
      </div>

      {/* Search */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your User ID"
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'View My Courses'}
            </button>
          </div>
        </form>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your courses...</p>
        </div>
      )}

      {searched && !loading && (
        <>
          {/* ── In Progress Courses ─────────────────────────────── */}
          <div className="courses-section">
            <h2><FaLink /> Active Courses ({assignedCourses.length})</h2>
            {assignedCourses.length === 0 ? (
              <div className="no-courses">
                <FaGraduationCap size={50} />
                <p>No active courses</p>
              </div>
            ) : (
              <div className="courses-grid">
                {assignedCourses.map((course) => (
                  <div key={course._id} className="course-card in-progress">
                    <div className="course-card-header">
                      <CategoryBadge category={course.category} />
                      <span className="course-date">
                        <FaCalendarAlt /> {formatDate(course.sentAt)}
                      </span>
                    </div>

                    <div className="course-card-body">
                      <p className="course-plan-title">{course.planDetails?.title || 'Course Plan'}</p>
                      {course.courseLink && (
                        <a
                          href={course.courseLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="course-link-btn"
                        >
                          <FaExternalLinkAlt /> Open Course
                        </a>
                      )}
                    </div>

                    <div className="course-card-footer">
                      <button
                        className="complete-btn"
                        onClick={() => handleMarkComplete(course)}
                        disabled={markingId === course._id}
                      >
                        {markingId === course._id
                          ? <><FaSpinner className="spin" /> Submitting...</>
                          : <><FaCheckCircle /> Mark as Complete</>}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Completed Courses + Certificates ───────────────── */}
          <div className="courses-section">
            <h2><FaCertificate /> Completed Courses ({completedCourses.length})</h2>
            {completedCourses.length === 0 ? (
              <div className="no-courses">
                <FaCheckCircle size={50} />
                <p>No completed courses yet</p>
              </div>
            ) : (
              <div className="courses-grid">
                {completedCourses.map((c) => (
                  <div key={c._id} className={`course-card completed ${c.status}`}>
                    {/* Card Top */}
                    <div className="course-card-header">
                      <CategoryBadge category={c.category} />
                      <StatusBadge status={c.status} />
                    </div>

                    <div className="course-card-body">
                      <p className="course-plan-title">{c.courseTitle || 'Course Plan'}</p>
                      <p className="completion-date">
                        <FaCalendarAlt /> Submitted: {formatDate(c.completedAt)}
                      </p>
                      {c.approvedAt && (
                        <p className="completion-date approved-date">
                          <FaCheckCircle /> Approved: {formatDate(c.approvedAt)}
                        </p>
                      )}
                    </div>

                    {/* Certificate section */}
                    {c.status === 'approved' && (
                      <div className="certificate-section">
                        <div className="cert-banner">
                          <FaCertificate className="cert-icon" />
                          <span>🎉 Certificate Ready!</span>
                        </div>
                        <div className="cert-actions">
                          <a
                            href={c.certificateUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="cert-btn cert-view"
                          >
                            <FaExternalLinkAlt /> View Certificate
                          </a>
                          <a
                            href={c.certificateUrl}
                            download
                            className="cert-btn cert-download"
                          >
                            <FaDownload /> Download PDF
                          </a>
                        </div>
                      </div>
                    )}

                    {c.status === 'submitted' && (
                      <div className="pending-review-banner">
                        <FaClock /> Admin review mein hai — wait karo
                      </div>
                    )}

                    {c.status === 'rejected' && (
                      <div className="rejected-banner">
                        ❌ Rejected — Admin se contact karo
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default UserCourseData;
