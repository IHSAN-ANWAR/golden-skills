import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/apiConfig';
import './UserTaskData.css';
import { FaCheckCircle, FaClock, FaTimesCircle, FaHourglassHalf, FaRupeeSign } from 'react-icons/fa';

const UserTaskData = () => {
  const [userEmail, setUserEmail] = useState('');
  const [userSubmissions, setUserSubmissions] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!userEmail.trim()) {
      alert('Please enter your email address');
      return;
    }

    setLoading(true);
    setSearched(true);
    setEarnings(null);

    try {
      // Fetch submissions and earnings in parallel
      const [subRes, earningsRes] = await Promise.all([
        fetch(`${API_ENDPOINTS.SUBMISSIONS.GET_ALL.replace('/submissions', '/submissions/my-submissions')}?userEmail=${userEmail}`),
        fetch(API_ENDPOINTS.USER_TASKS.GET_EARNINGS(userEmail.trim().toLowerCase()))
      ]);

      const [subData, earningsData] = await Promise.all([
        subRes.json(),
        earningsRes.json()
      ]);
      
      if (subData.success) {
        const filtered = subData.submissions.filter(
          sub => sub.userEmail.toLowerCase() === userEmail.toLowerCase()
        );
        setUserSubmissions(filtered);
      }

      if (earningsData.success) {
        setEarnings(earningsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('Failed to load your data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <FaCheckCircle className="status-icon approved" />;
      case 'rejected':
        return <FaTimesCircle className="status-icon rejected" />;
      case 'completed':
        return <FaCheckCircle className="status-icon completed" />;
      case 'pending':
      default:
        return <FaHourglassHalf className="status-icon pending" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'completed':
        return 'Completed';
      case 'pending':
      default:
        return 'Pending Review';
    }
  };

  return (
    <div className="user-task-data-container">
      <div className="task-data-header">
        <h1>My Task Submissions</h1>
        <p>View the status of your submitted task plans</p>
      </div>

      {/* Search Form */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'View My Submissions'}
            </button>
          </div>
        </form>
      </div>

      {/* Total Earnings Card */}
      {!loading && searched && earnings && (
        <div className="earnings-summary-card">
          <div className="earnings-icon"><FaRupeeSign /></div>
          <div className="earnings-info">

            {/* Plan info + tax row */}
            {earnings.planInfo && (
              <div className="earnings-plan-row">
                <span className="earnings-plan-name">{earnings.planInfo.planTitle}</span>
                <div className="earnings-tax-row">
                  <span className="earnings-plan-price">Plan: Rs. {earnings.planInfo.planPrice.toLocaleString()}</span>
                  {earnings.planInfo.taxAmount > 0 && (
                    <>
                      <span className="earnings-tax-badge">− Tax Rs. {earnings.planInfo.taxAmount.toLocaleString()}</span>
                      <span className="earnings-net-badge">Net Rs. {earnings.planInfo.netAmount.toLocaleString()}</span>
                    </>
                  )}
                </div>
              </div>
            )}

            <span className="earnings-label">Total Task Earnings</span>
            <span className="earnings-amount">Rs. {earnings.totalEarnings.toLocaleString()}</span>
            <span className="earnings-sub">
              {earnings.approvedTaskCount > 0
                ? `${earnings.approvedTaskCount} task${earnings.approvedTaskCount !== 1 ? 's' : ''} approved`
                : 'No approved tasks yet'}
            </span>

          </div>
        </div>
      )}

      {/* Results */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your submissions...</p>
        </div>
      )}

      {!loading && searched && userSubmissions.length === 0 && (
        <div className="no-submissions-found">
          <FaClock size={60} />
          <h3>No Submissions Found</h3>
          <p>We couldn't find any submissions with the email: <strong>{userEmail}</strong></p>
          <p>Please check your email address and try again.</p>
        </div>
      )}

      {!loading && userSubmissions.length > 0 && (
        <div className="submissions-list">
          <h2>Your Submissions ({userSubmissions.length})</h2>
          
          <div className="submissions-grid">
            {userSubmissions.map((submission) => (
              <div key={submission._id} className="submission-card">
                <div className="submission-header">
                  <div className="user-avatar-section">
                    {submission.userImage ? (
                      <img src={submission.userImage} alt={submission.userName} />
                    ) : (
                      <div className="avatar-placeholder">
                        {submission.userName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="user-info">
                      <h3>{submission.userName}</h3>
                      <p>{submission.userEmail}</p>
                    </div>
                  </div>
                  
                  <div className="status-badge-large">
                    {getStatusIcon(submission.status)}
                    <span>{getStatusText(submission.status)}</span>
                  </div>
                </div>

                <div className="submission-details">
                  <div className="detail-item">
                    <label>Plan Selected:</label>
                    <span className="plan-name">{submission.planTitle}</span>
                  </div>

                  <div className="detail-item">
                    <label>Plan Price:</label>
                    <span className="plan-price">{submission.planPrice}</span>
                  </div>

                  {submission.userPhone && (
                    <div className="detail-item">
                      <label>Phone:</label>
                      <span>{submission.userPhone}</span>
                    </div>
                  )}

                  <div className="detail-item">
                    <label>Submitted On:</label>
                    <span>{new Date(submission.submittedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</span>
                  </div>

                  {submission.notes && (
                    <div className="detail-item notes">
                      <label>Admin Notes:</label>
                      <p>{submission.notes}</p>
                    </div>
                  )}
                </div>

                <div className="submission-footer">
                  {submission.status === 'pending' && (
                    <div className="info-message pending">
                      <FaClock />
                      <span>Your submission is being reviewed by our team</span>
                    </div>
                  )}
                  {submission.status === 'approved' && (
                    <div className="info-message approved">
                      <FaCheckCircle />
                      <span>Congratulations! Your submission has been approved</span>
                    </div>
                  )}
                  {submission.status === 'rejected' && (
                    <div className="info-message rejected">
                      <FaTimesCircle />
                      <span>Your submission was not approved. Please contact support for details.</span>
                    </div>
                  )}
                  {submission.status === 'completed' && (
                    <div className="info-message completed">
                      <FaCheckCircle />
                      <span>Task completed successfully!</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserTaskData;
