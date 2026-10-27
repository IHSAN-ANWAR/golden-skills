import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { FaCheckCircle, FaBan, FaTrash, FaUser, FaPhone, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';
import './CourseVerifications.css';

const CourseVerifications = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

  useEffect(() => {
    fetchCounts();
  }, []);

  const fetchCounts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) return;
      const headers = { 'Authorization': `Bearer ${token}` };
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.COURSE_PLAN_SUBMISSIONS.GET_ALL}?status=pending`, { headers }),
        fetch(`${API_ENDPOINTS.COURSE_PLAN_SUBMISSIONS.GET_ALL}?status=approved`, { headers }),
        fetch(`${API_ENDPOINTS.COURSE_PLAN_SUBMISSIONS.GET_ALL}?status=rejected`, { headers }),
      ]);
      const [p, a, r] = await Promise.all([pendingRes.json(), approvedRes.json(), rejectedRes.json()]);
      setCounts({
        pending: (p.submissions || []).length,
        approved: (a.submissions || []).length,
        rejected: (r.submissions || []).length,
      });
    } catch (err) {
      console.error('Error fetching counts:', err);
    }
  };

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }

      const url = `${API_ENDPOINTS.COURSE_PLAN_SUBMISSIONS.GET_ALL}?status=${filter}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.success) {
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error('Error fetching course plan submissions:', err);
      alert('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId) => {
    if (!window.confirm('Are you sure you want to approve this course plan application?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.COURSE_PLAN_SUBMISSIONS.UPDATE_STATUS(submissionId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'approved' })
      });

      const data = await res.json();
      if (data.success) {
        alert('Course plan application approved successfully!');
        fetchSubmissions();
        fetchCounts();
      } else {
        alert(data.message || 'Failed to approve application');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to approve application');
    }
  };

  const handleReject = async (submissionId) => {
    if (!window.confirm('Are you sure you want to reject this course plan application?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.COURSE_PLAN_SUBMISSIONS.UPDATE_STATUS(submissionId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      const data = await res.json();
      if (data.success) {
        alert('Course plan application rejected');
        fetchSubmissions();
        fetchCounts();
      } else {
        alert(data.message || 'Failed to reject application');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to reject application');
    }
  };

  const handleDelete = async (submissionId) => {
    if (!window.confirm('Are you sure you want to delete this submission?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.COURSE_PLAN_SUBMISSIONS.DELETE(submissionId), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (data.success) {
        alert('Submission deleted successfully');
        fetchSubmissions();
        fetchCounts();
      } else {
        alert(data.message || 'Failed to delete submission');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete submission');
    }
  };

  const viewImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  // Base64 ya URL ko proper src mein convert karo
  const getImageSrc = (img) => {
    if (!img) return '';
    if (img.startsWith('data:')) return img; // already full data URL
    if (img.startsWith('http://') || img.startsWith('https://')) return img; // normal URL
    // Raw base64 — detect image type from magic bytes
    if (img.startsWith('/9j/')) return `data:image/jpeg;base64,${img}`; // JPEG
    if (img.startsWith('iVBOR')) return `data:image/png;base64,${img}`;  // PNG
    if (img.startsWith('R0lGO')) return `data:image/gif;base64,${img}`;  // GIF
    if (img.startsWith('UklGR')) return `data:image/webp;base64,${img}`; // WebP
    return `data:image/jpeg;base64,${img}`; // default fallback
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'approved': return 'status-approved';
      case 'rejected': return 'status-rejected';
      case 'pending': return 'status-pending';
      default: return 'status-pending';
    }
  };

  if (loading) {
    return <div className="loading">Loading course plan submissions...</div>;
  }

  return (
    <div className="course-verifications-container">
      <div className="verifications-header">
        <h2>Course Plan Verifications</h2>
        <p>Review and approve course plan applications from users</p>
      </div>

      {/* Filter Buttons */}
      <div className="filter-buttons">
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          Pending ({counts.pending})
        </button>
        <button 
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved ({counts.approved})
        </button>
        <button 
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected ({counts.rejected})
        </button>
      </div>

      {/* Submissions Table */}
      {submissions.length === 0 ? (
        <div className="no-submissions">
          <FaUser size={60} />
          <h3>No Submissions Found</h3>
          <p>No course plan applications to display</p>
        </div>
      ) : (
        <div className="submissions-table-wrapper">
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Payment Proof</th>
                <th>Contact</th>
                <th>Plan</th>
                <th>Price</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission) => (
                <tr key={submission._id}>
                  <td>
                    <div className="user-info">
                      <FaUser className="icon" />
                      <span>{submission.userName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="payment-image-cell">
                      {submission.userImage ? (
                        <img
                          src={getImageSrc(submission.userImage)}
                          alt="Payment Proof"
                          className="payment-thumbnail"
                          onClick={() => viewImage(submission.userImage)}
                          onError={(e) => {
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTAiIGZpbGw9IiM2NjYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                      ) : (
                        <span className="no-image">No image</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className="contact-info">
                      {submission.userPhone && (
                        <div className="contact-item">
                          <FaPhone className="icon" />
                          <span>{submission.userPhone}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="plan-title">{submission.planTitle}</span>
                  </td>
                  <td>
                    <div className="price-cell">
                      <FaMoneyBillWave className="icon" />
                      <span>{submission.planPrice}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusBadgeClass(submission.status)}`}>
                      {submission.status}
                    </span>
                  </td>
                  <td>
                    <div className="date-cell">
                      <FaCalendarAlt className="icon" />
                      <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {submission.status === 'pending' && (
                        <>
                          <button 
                            className="btn-approve"
                            onClick={() => handleApprove(submission._id)}
                            title="Approve"
                          >
                            <FaCheckCircle />
                          </button>
                          <button 
                            className="btn-reject"
                            onClick={() => handleReject(submission._id)}
                            title="Reject"
                          >
                            <FaBan />
                          </button>
                        </>
                      )}
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(submission._id)}
                        title="Delete"
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

      {/* Image Modal */}
      {showImageModal && (
        <div className="image-modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={() => setShowImageModal(false)}>×</button>
            {selectedImage ? (
              <img
                src={getImageSrc(selectedImage)}
                alt="Payment Proof"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
                style={{ maxWidth: '100%', maxHeight: '80vh', display: 'block', borderRadius: '8px' }}
              />
            ) : null}
            <p style={{ display: 'none', color: 'red', padding: '1rem' }}>
              Can't Load Image!    </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseVerifications;
