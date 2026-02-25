import { useState, useEffect } from 'react';
import './SubmittedCourses.css';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import { FaUser, FaEnvelope, FaGraduationCap, FaCalendarAlt, FaCheckCircle, FaBan, FaEye, FaLink, FaQuestionCircle, FaInfoCircle } from 'react-icons/fa';

const SubmittedCourses = () => {
  const [submittedCourses, setSubmittedCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmittedCourses();
  }, []);

  const fetchSubmittedCourses = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        alert('Please login first');
        window.location.href = '/admin/login';
        return;
      }
      
      const headers = { 'Authorization': `Bearer ${token}` };
      const response = await fetch(`${API_ENDPOINTS.USER_COURSE_COMPLETIONS.GET_ALL}?status=submitted`, { headers });
      const data = await response.json();

      if (data.success) {
        const submitted = (data.completions || []).filter(c => c.status === 'submitted');
        console.log('Submitted courses loaded:', submitted.length);
        setSubmittedCourses(submitted);
      }
      
    } catch (error) {
      console.error('Error fetching submitted courses:', error);
      alert('Failed to load submitted courses: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const viewSubmission = (course) => {
    const modal = document.createElement('div');
    modal.className = 'submission-modal-overlay';
    
    const quizAnswersHtml = course.quizAnswers.map((answer, index) => `
      <div class="quiz-answer-item">
        <p><strong>Question ${index + 1}:</strong> ${answer.question}</p>
        <p><strong>Answer:</strong> ${answer.userAnswer}</p>
        ${answer.isCorrect !== undefined ? `<p class="${answer.isCorrect ? 'correct' : 'incorrect'}">
          ${answer.isCorrect ? '✓ Correct' : '✗ Incorrect'}
        </p>` : ''}
      </div>
    `).join('');
    
    modal.innerHTML = `
      <div class="submission-modal-content">
        <div class="submission-modal-header">
          <h2><i class="fas fa-graduation-cap"></i> Course Completion Review</h2>
          <button class="submission-modal-close">✕</button>
        </div>
        <div class="submission-modal-body">
          <div class="submission-section">
            <h3><i class="fas fa-user"></i> User Information</h3>
            <p><strong>Name:</strong> ${course.userName}</p>
            <p><strong>Email:</strong> ${course.userEmail}</p>
            <p><strong>Category:</strong> <span class="category-badge-${course.category}">${course.category}</span></p>
          </div>
          
          <div class="submission-section">
            <h3><i class="fas fa-link"></i> Course Details</h3>
            <p><strong>Course Link:</strong></p>
            <a href="${course.courseLink}" target="_blank" rel="noopener noreferrer" class="course-link-modal">
              ${course.courseLink}
            </a>
          </div>
          
          <div class="submission-section highlight">
            <h3><i class="fas fa-question-circle"></i> Quiz Results</h3>
            <p><strong>Score:</strong> ${course.score} / ${course.totalQuestions}</p>
            <p><strong>Percentage:</strong> ${course.totalQuestions > 0 ? Math.round((course.score / course.totalQuestions) * 100) : 0}%</p>
            <div class="quiz-answers">
              ${quizAnswersHtml}
            </div>
          </div>
          
          <div class="submission-section">
            <h3><i class="fas fa-clock"></i> Timeline</h3>
            <p><strong>Completed:</strong> ${new Date(course.completedAt).toLocaleString()}</p>
          </div>
        </div>
        <div class="submission-modal-footer">
          <button class="btn-modal-close">Close</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    const closeModal = () => {
      document.body.removeChild(modal);
    };
    
    modal.querySelector('.submission-modal-close').onclick = closeModal;
    modal.querySelector('.btn-modal-close').onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  };

  const handleApprove = async (courseId) => {
    if (!window.confirm('Approve this course completion? It will appear in Course History.')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        alert('Admin token not found. Please login again.');
        window.location.href = '/admin/login';
        return;
      }
      
      const url = `${API_ENDPOINTS.USER_COURSE_COMPLETIONS.UPDATE_STATUS(courseId)}`;
      console.log('Approving course...');
      console.log('URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'approved' })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        alert('Course completion approved! It will now appear in Course History.');
        fetchSubmittedCourses();
      } else {
        throw new Error(data.message || 'Failed to approve course');
      }
    } catch (error) {
      console.error('Full error:', error);
      alert(`Failed to approve course:\n${error.message}\n\nCheck console for details.`);
    }
  };

  const handleReject = async (courseId) => {
    const reason = window.prompt('Explain why the course completion is rejected:', '');
    if (reason === null || !reason.trim()) {
      if (reason !== null) {
        alert('Please provide a reason for rejection');
      }
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        alert('Admin token not found. Please login again.');
        window.location.href = '/admin/login';
        return;
      }

      const url = `${API_ENDPOINTS.USER_COURSE_COMPLETIONS.UPDATE_STATUS(courseId)}`;
      console.log('Rejecting course...');
      console.log('URL:', url);
      
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      if (data.success) {
        alert('Course completion rejected');
        fetchSubmittedCourses();
      } else {
        throw new Error(data.message || 'Failed to reject course');
      }
    } catch (error) {
      console.error('Full error:', error);
      alert(`Failed to reject course:\n${error.message}\n\nCheck console for details.`);
    }
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
    return <div className="loading">Loading submitted courses...</div>;
  }

  return (
    <div className="submitted-courses-container">
      <div className="submitted-header">
        <h1><FaGraduationCap /> Submitted Courses Review</h1>
        <p>Review course completions submitted by users - approve to add to Course History</p>
      </div>

      {submittedCourses.length === 0 ? (
        <div className="no-submitted-courses">
          <FaGraduationCap size={80} />
          <h2>No Submitted Courses</h2>
          <p>No course completions have been submitted by users yet.</p>
          <p className="info-text">
            <FaInfoCircle /> Course completions will appear here when users complete their assigned courses.
          </p>
        </div>
      ) : (
        <div className="submitted-courses-table-container">
          <table className="submitted-courses-table">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email</th>
                <th>Category</th>
                <th>Course Link</th>
                <th>Score</th>
                <th>Submitted Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submittedCourses.map((course) => (
                <tr key={course._id} className="submitted-course-row">
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar">
                        <FaUser />
                      </div>
                      <span>{course.userName}</span>
                    </div>
                  </td>
                  <td>
                    <div className="email-cell">
                      <FaEnvelope />
                      <span>{course.userEmail}</span>
                    </div>
                  </td>
                  <td>
                    {getCategoryBadge(course.category)}
                  </td>
                  <td>
                    <div className="course-link-cell">
                      <FaLink />
                      <a href={course.courseLink} target="_blank" rel="noopener noreferrer">
                        {course.courseLink.length > 40 ? `${course.courseLink.substring(0, 40)}...` : course.courseLink}
                      </a>
                    </div>
                  </td>
                  <td>
                    <span className="score-badge">
                      {course.score}/{course.totalQuestions}
                    </span>
                  </td>
                  <td>
                    <div className="date-cell">
                      <FaCalendarAlt />
                      <span>{new Date(course.completedAt).toLocaleDateString()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-view"
                        onClick={() => viewSubmission(course)}
                        title="View submission details"
                      >
                        <FaEye />
                      </button>
                      <button
                        className="btn-approve"
                        onClick={() => handleApprove(course._id)}
                        title="Approve course"
                      >
                        <FaCheckCircle />
                      </button>
                      <button
                        className="btn-reject"
                        onClick={() => handleReject(course._id)}
                        title="Reject course"
                      >
                        <FaBan />
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

export default SubmittedCourses;
