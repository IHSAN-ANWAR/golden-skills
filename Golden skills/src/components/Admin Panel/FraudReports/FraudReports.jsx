import React, { useState, useEffect } from 'react';
import { FaExclamationTriangle, FaPhone, FaUser, FaTrash, FaEye, FaCheck, FaTimes, FaImage, FaShieldAlt, FaClock, FaCheckCircle } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import axios from 'axios';
import './FraudReports.css';

const FraudReports = () => {
  const [reports, setReports] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, reviewed: 0, actioned: 0 });
  const [activeTab, setActiveTab] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => { fetchReports(); }, [activeTab]);

  const getAuthConfig = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_ENDPOINTS.FRAUD.GET_ALL}?status=${activeTab}`, getAuthConfig());
      setReports(res.data.reports || []);
      setCounts(res.data.counts || {});
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await axios.put(API_ENDPOINTS.FRAUD.UPDATE(id), { status }, getAuthConfig());
      showMessage('success', `Report marked as ${status}`);
      setSelectedReport(null);
      fetchReports();
    } catch {
      showMessage('error', 'Failed to update report');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this fraud report?')) return;
    try {
      await axios.delete(API_ENDPOINTS.FRAUD.DELETE(id), getAuthConfig());
      showMessage('success', 'Report deleted');
      setSelectedReport(null);
      fetchReports();
    } catch {
      showMessage('error', 'Failed to delete report');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  const statusBadge = (status) => {
    const map = {
      pending: 'fr-badge-pending',
      reviewed: 'fr-badge-reviewed',
      actioned: 'fr-badge-actioned'
    };
    return <span className={`fr-badge ${map[status]}`}>{status}</span>;
  };

  return (
    <>
      {/* Alert */}
      {message.text && (
        <div className={`fr-alert fr-alert-${message.type}`}>{message.text}</div>
      )}

      {/* Stats */}
      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #390910, #772218)' }}>
            <FaShieldAlt className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-number">{counts.all || 0}</h3>
            <p className="stat-label">Total Reports</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #fd7e14, #ffc107)' }}>
            <FaClock className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-number">{counts.pending || 0}</h3>
            <p className="stat-label">Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #0d6efd, #0a58ca)' }}>
            <FaEye className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-number">{counts.reviewed || 0}</h3>
            <p className="stat-label">Reviewed</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #28a745, #20c997)' }}>
            <FaCheckCircle className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-number">{counts.actioned || 0}</h3>
            <p className="stat-label">Actioned</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="fr-tabs">
        {['pending', 'reviewed', 'actioned'].map(tab => (
          <button
            key={tab}
            className={`fr-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)} ({counts[tab] || 0})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="users-table-container">
        {loading ? (
          <div className="fr-empty">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="fr-empty">
            <FaExclamationTriangle className="fr-empty-icon" />
            <h3>No {activeTab} reports</h3>
            <p>Fraud reports will appear here</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Reporter</th>
                <th>Reporter Phone</th>
                <th>Scammer Phone</th>
                <th>Message</th>
                <th>Screenshot</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(r => (
                <tr key={r._id} className="user-row">
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar-small"><FaUser /></div>
                      <span className="user-fullname">{r.reporterName}</span>
                    </div>
                  </td>
                  <td>{r.reporterPhone}</td>
                  <td><strong style={{ color: '#dc3545' }}>{r.scammerPhone}</strong></td>
                  <td>
                    <span className="fr-message-preview" title={r.message}>
                      {r.message.length > 50 ? r.message.slice(0, 50) + '...' : r.message}
                    </span>
                  </td>
                  <td>
                    {r.screenshot
                      ? <button className="fr-img-btn" onClick={() => setSelectedReport(r)}>
                          <FaImage /> View
                        </button>
                      : <span className="fr-no-img">None</span>}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: '#6c757d' }}>{formatDate(r.createdAt)}</td>
                  <td>{statusBadge(r.status)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn fr-view-btn"
                        title="View Details"
                        onClick={() => setSelectedReport(r)}
                      >
                        <FaEye />
                      </button>
                      {r.status === 'pending' && (
                        <button
                          className="action-btn fr-ok-btn"
                          title="Mark Reviewed"
                          onClick={() => handleUpdateStatus(r._id, 'reviewed')}
                        >
                          <FaCheck />
                        </button>
                      )}
                      {r.status === 'reviewed' && (
                        <button
                          className="action-btn fr-ok-btn"
                          title="Mark Actioned"
                          onClick={() => handleUpdateStatus(r._id, 'actioned')}
                        >
                          <FaCheck />
                        </button>
                      )}
                      <button
                        className="action-btn delete-btn"
                        title="Delete"
                        onClick={() => handleDelete(r._id)}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail Modal */}
      {selectedReport && (
        <div className="fr-modal-overlay" onClick={() => setSelectedReport(null)}>
          <div className="fr-modal" onClick={e => e.stopPropagation()}>
            <div className="fr-modal-header">
              <h3><FaExclamationTriangle className="me-2" />Fraud Report Detail</h3>
              <button className="fr-modal-close" onClick={() => setSelectedReport(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="fr-modal-body">
              <div className="fr-detail-row">
                <span className="fr-detail-label">Reporter Name</span>
                <span className="fr-detail-val">{selectedReport.reporterName}</span>
              </div>
              <div className="fr-detail-row">
                <span className="fr-detail-label">Reporter Phone</span>
                <span className="fr-detail-val">{selectedReport.reporterPhone}</span>
              </div>
              <div className="fr-detail-row fr-detail-danger">
                <span className="fr-detail-label">Scammer Phone</span>
                <span className="fr-detail-val"><strong>{selectedReport.scammerPhone}</strong></span>
              </div>
              <div className="fr-detail-row">
                <span className="fr-detail-label">Status</span>
                <span className="fr-detail-val">{statusBadge(selectedReport.status)}</span>
              </div>
              <div className="fr-detail-row">
                <span className="fr-detail-label">Submitted</span>
                <span className="fr-detail-val">{formatDate(selectedReport.createdAt)}</span>
              </div>
              <div className="fr-detail-message">
                <span className="fr-detail-label">Message</span>
                <p>{selectedReport.message}</p>
              </div>
              {selectedReport.screenshot && (
                <div className="fr-detail-screenshot">
                  <span className="fr-detail-label">Screenshot</span>
                  <img src={selectedReport.screenshot} alt="Screenshot" />
                </div>
              )}
              <div className="fr-modal-actions">
                {selectedReport.status === 'pending' && (
                  <button className="fr-btn-action" onClick={() => handleUpdateStatus(selectedReport._id, 'reviewed')}>
                    <FaEye className="me-1" /> Mark Reviewed
                  </button>
                )}
                {selectedReport.status === 'reviewed' && (
                  <button className="fr-btn-action" onClick={() => handleUpdateStatus(selectedReport._id, 'actioned')}>
                    <FaCheck className="me-1" /> Mark Actioned
                  </button>
                )}
                <button className="fr-btn-delete" onClick={() => handleDelete(selectedReport._id)}>
                  <FaTrash className="me-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FraudReports;
