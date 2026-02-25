import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { FaCheckCircle, FaBan, FaEye, FaTrash, FaUser, FaEnvelope, FaPhone, FaMoneyBillWave, FaCalendarAlt, FaImage } from 'react-icons/fa';
import './CourseVerifications.css';

const CourseVerifications = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    fetchSubmissions();
  }, [filter]);

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
          Pending
        </button>
        <button 
          className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
          onClick={() => setFilter('approved')}
        >
          Approved
        </button>
        <button 
          className={`filter-btn ${filter === 'rejected' ? 'active' : ''}`}
          onClick={() => setFilter('rejected')}
        >
          Rejected
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
                    {submission.userImage ? (
                      <button 
                        className="view-image-btn"
                        onClick={() => viewImage(submission.userImage)}
                      >
                        <FaImage /> View
                      </button>
                    ) : (
                      <span className="no-image">No image</span>
                    )}
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
            <img src={selectedImage} alt="Payment Proof" />
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseVerifications;
