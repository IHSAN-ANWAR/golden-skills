import React, { useState, useEffect } from 'react';
import { FaSearch, FaTrash, FaEye, FaTimes, FaPhone, FaExclamationTriangle } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import axios from 'axios';
import './SearchTracking.css';

const SearchTracking = () => {
  const [records, setRecords] = useState([]);
  const [counts, setCounts] = useState({ all: 0, suspicious: 0 });
  const [activeTab, setActiveTab] = useState('suspicious');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => { fetchRecords(); }, [activeTab]);

  const getAuthConfig = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);   
  };

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const url = `${API_ENDPOINTS.TEAM.GET_SEARCH_TRACKING}?filter=${activeTab}`;
      const res = await axios.get(url, getAuthConfig());
      setRecords(res.data.records || []);
      setCounts(res.data.counts || { all: 0, suspicious: 0 });
    } catch (err) {
      console.error('Error fetching tracking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this tracking record?')) return;
    try {
      await axios.delete(API_ENDPOINTS.TEAM.DELETE_SEARCH_TRACKING(id), getAuthConfig());
      showMessage('success', 'Record deleted');
      setSelectedRecord(null);
      fetchRecords();
    } catch {
      showMessage('error', 'Failed to delete record');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });

  return (
    <>
      {message.text && (
        <div className={`st-alert st-alert-${message.type}`}>{message.text}</div>
      )}

      {/* Stats */}
      <div className="users-stats">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #390910, #772218)' }}>
            <FaSearch className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-number">{counts.all}</h3>
            <p className="stat-label">Total Tracked Numbers</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
            <FaExclamationTriangle className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-number">{counts.suspicious}</h3>
            <p className="stat-label">Suspicious (3+ Searches)</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="st-tabs">
        <button
          className={`st-tab ${activeTab === 'suspicious' ? 'active' : ''}`}
          onClick={() => setActiveTab('suspicious')}
        >
          Suspicious ({counts.suspicious})
        </button>
        <button
          className={`st-tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All Searches ({counts.all})
        </button>
      </div>

      {/* Table */}
      <div className="users-table-container">
        {loading ? (
          <div className="st-empty"><p>Loading...</p></div>
        ) : records.length === 0 ? (
          <div className="st-empty">
            <FaSearch className="st-empty-icon" />
            <h3>No {activeTab === 'suspicious' ? 'suspicious' : ''} search records</h3>
            <p>Search tracking data will appear here</p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>Phone Number</th>
                <th>Search Count</th>
                <th>Status</th>
                <th>Last Searched</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r._id} className={`user-row ${r.isSuspicious ? 'st-row-suspicious' : ''}`}>
                  <td>
                    <div className="user-name-cell">
                      <div className="user-avatar-small" style={{
                        background: r.isSuspicious
                          ? 'linear-gradient(135deg, #dc3545, #c82333)'
                          : 'linear-gradient(135deg, #390910, #772218)'
                      }}>
                        <FaPhone />
                      </div>
                      <span className="user-fullname">{r.phoneNumber}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`st-count-badge ${r.searchCount >= 3 ? 'high' : 'low'}`}>
                      {r.searchCount} times
                    </span>
                  </td>
                  <td>
                    {r.isSuspicious
                      ? <span className="st-badge-suspicious"><FaExclamationTriangle className="me-1" />Suspicious</span>
                      : <span className="st-badge-normal">Normal</span>
                    }
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#6c757d' }}>
                    {formatDate(r.lastSearchedAt)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn st-view-btn"
                        title="View Details"
                        onClick={() => setSelectedRecord(r)}
                      >
                        <FaEye />
                      </button>
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
      {selectedRecord && (
        <div className="st-modal-overlay" onClick={() => setSelectedRecord(null)}>
          <div className="st-modal" onClick={e => e.stopPropagation()}>
            <div className="st-modal-header">
              <h3><FaSearch className="me-2" />Search History — {selectedRecord.phoneNumber}</h3>
              <button className="st-modal-close" onClick={() => setSelectedRecord(null)}>
                <FaTimes />
              </button>
            </div>
            <div className="st-modal-body">
              <div className="st-modal-stats">
                <div className="st-modal-stat">
                  <span>Total Searches</span>
                  <strong>{selectedRecord.searchCount}</strong>
                </div>
                <div className="st-modal-stat">
                  <span>Status</span>
                  <strong style={{ color: selectedRecord.isSuspicious ? '#dc3545' : '#28a745' }}>
                    {selectedRecord.isSuspicious ? 'Suspicious' : 'Normal'}
                  </strong>
                </div>
                <div className="st-modal-stat">
                  <span>Last Search</span>
                  <strong>{formatDate(selectedRecord.lastSearchedAt)}</strong>
                </div>
              </div>

              <div className="st-history-label">Search History</div>
              <div className="st-history-list">
                {selectedRecord.searches.map((s, i) => (
                  <div key={i} className="st-history-item">
                    <div className="st-history-num">#{i + 1}</div>
                    <div className="st-history-info">
                      <span className="st-history-date">{formatDate(s.searchedAt)}</span>
                      <span className="st-history-ip">IP: {s.ip}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="st-modal-actions">
                <button className="st-btn-delete" onClick={() => handleDelete(selectedRecord._id)}>
                  <FaTrash className="me-1" /> Delete Record
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchTracking;
