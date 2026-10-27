import React, { useState, useEffect } from 'react';
import { FaUserShield, FaExclamationTriangle, FaTrash, FaUserClock, FaUsers, FaBan, FaEnvelope, FaPhone } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import axios from 'axios';
import './TeamManagement.css';

const TeamManagement = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState('verified');
  const [teamMembers, setTeamMembers] = useState([]);
  const [blacklistedUsers, setBlacklistedUsers] = useState([]);
  const [unverifiedUsers, setUnverifiedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [activeTab, setActiveTab] = useState('verified');

  useEffect(() => { fetchData(); }, []);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const getAuthConfig = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchData = async () => {
    try {
      const config = getAuthConfig();
      const [membersRes, blacklistRes] = await Promise.all([
        axios.get(API_ENDPOINTS.TEAM.GET_ALL_MEMBERS, config),
        axios.get(API_ENDPOINTS.TEAM.GET_BLACKLIST, config)
      ]);
      setTeamMembers(membersRes.data.teamMembers || []);
      setBlacklistedUsers(blacklistRes.data.blacklistedUsers || []);
      setUnverifiedUsers(membersRes.data.unverifiedUsers || []);
    } catch (err) { console.error('Error fetching data:', err); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) { showMessage('error', 'Please enter a phone number'); return; }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const config = getAuthConfig();

      if (status === 'blacklisted') {
        // Direct blacklist - works for BOTH registered and unregistered users
        await axios.post(API_ENDPOINTS.TEAM.ADD_TO_BLACKLIST, {
          phoneNumber: phoneNumber.trim(),
          name: 'Unknown',
          reason: 'Reported for fraudulent activities using our company name'
        }, config);
        showMessage('success', 'Number blacklisted successfully');
        setActiveTab('blacklisted');  
        setPhoneNumber('');
        await fetchData();

      } else {
        // Verified / Unverified - needs registered user
        const verifyRes = await axios.post(API_ENDPOINTS.TEAM.VERIFY, { phoneNumber: phoneNumber.trim() });

        // userId can come from any status (verified, unverified, blacklisted, unknown won't have it)
        const userId =
          verifyRes.data.teamMember?._id ||
          verifyRes.data.alert?._id;

        if (!userId) {
          showMessage('error', 'User not found with this phone number. Only blacklisting works without a registered account.');
          setLoading(false);
          return;
        }

        await axios.put(API_ENDPOINTS.TEAM.UPDATE_MEMBER(userId), {
          isTeamMember: status === 'verified',
          isBlacklisted: false,
          teamRole: status === 'verified' ? 'Team Member' : '',
          blacklistReason: ''
        }, config);

        showMessage('success', status === 'verified' ? 'Team member added successfully' : 'User status reset to unverified');
        setActiveTab(status === 'verified' ? 'verified' : 'unverified');
        setPhoneNumber('');
        await fetchData();
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Failed to update status');
    } finally { setLoading(false); }
  };

  const handleDeleteTeamMember = async (userId) => {
    if (!window.confirm('Remove this team member?')) return;
    try {
      await axios.put(API_ENDPOINTS.TEAM.UPDATE_MEMBER(userId), { isTeamMember: false, teamRole: '' }, getAuthConfig());
      showMessage('success', 'Team member removed');
      await fetchData();
    } catch { showMessage('error', 'Failed to remove team member'); }
  };

  const handleDeleteBlacklisted = async (id) => {
    if (!window.confirm('Remove this number from blacklist?')) return;
    try {
      await axios.delete(API_ENDPOINTS.TEAM.REMOVE_FROM_BLACKLIST(id), getAuthConfig());
      showMessage('success', 'Removed from blacklist');
      await fetchData();
    } catch { showMessage('error', 'Failed to remove from blacklist'); }
  };

  return (
    <>
      {/* ── Add Form ── */}
      <form className="search-form" onSubmit={handleSubmit}>
        <div className="tm-form-row">
          <input
            type="text"
            className="search-input"
            placeholder="Search users by phone number..."
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            disabled={loading}
          />
          <select
            className="tm-status-select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            disabled={loading}
          >
            <option value="verified">Verified Team Member</option>
            <option value="blacklisted">Blacklisted Scammer</option>
          </select>
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? 'Processing...' : 'Submit'}
          </button>
        </div>
      </form>

      {/* ── Alert ── */}
      {message.text && (
        <div className={`tm-alert tm-alert-${message.type}`}>{message.text}</div>
      )}

      {/* ── Stats ── */}
      <div className="users-stats">
        <div className="stat-card" style={{ cursor: 'pointer', outline: activeTab === 'verified' ? '2px solid #390910' : 'none' }} onClick={() => setActiveTab('verified')}>
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #28a745, #20c997)' }}>
            <FaUserShield className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-number">{teamMembers.length}</h3>
            <p className="stat-label">Verified Team Members</p>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer', outline: activeTab === 'unverified' ? '2px solid #390910' : 'none' }} onClick={() => setActiveTab('unverified')}>
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #fd7e14, #ffc107)' }}>
            <FaUserClock className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-number">{unverifiedUsers.length}</h3>
            <p className="stat-label">Unverified Users</p>
          </div>
        </div>

        <div className="stat-card" style={{ cursor: 'pointer', outline: activeTab === 'blacklisted' ? '2px solid #dc3545' : 'none' }} onClick={() => setActiveTab('blacklisted')}>
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}>
            <FaBan className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-number">{blacklistedUsers.length}</h3>
            <p className="stat-label">Blacklisted Scammers</p>
          </div>
        </div>
      </div>

      {/* ── Tabs (outside table container) ── */}
      <div className="tm-tabs">
        <button className={`tm-tab ${activeTab === 'verified' ? 'active' : ''}`} onClick={() => setActiveTab('verified')}>
          Verified ({teamMembers.length})
        </button>
        <button className={`tm-tab ${activeTab === 'unverified' ? 'active' : ''}`} onClick={() => setActiveTab('unverified')}>
          Unverified ({unverifiedUsers.length})
        </button>
        <button className={`tm-tab tm-tab-red ${activeTab === 'blacklisted' ? 'active' : ''}`} onClick={() => setActiveTab('blacklisted')}>
          Blacklisted ({blacklistedUsers.length})
        </button>
      </div>

      {/* ── Table ── */}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              {activeTab === 'verified' && (<>
                <th>Name</th><th>Username</th><th>Email</th><th>Phone Number</th><th>Actions</th>
              </>)}
              {activeTab === 'unverified' && (<>
                <th>Name</th><th>Email</th><th>Phone Number</th><th>Actions</th>
              </>)}
              {activeTab === 'blacklisted' && (<>
                <th>Name</th><th>Phone Number</th><th>Reason</th><th>Date Added</th><th>Actions</th>
              </>)}
            </tr>
          </thead>
          <tbody>
            {/* VERIFIED */}
            {activeTab === 'verified' && (
              teamMembers.length === 0 ? (
                <tr><td colSpan="5" className="no-users-row">
                  <div className="no-users-content">
                    <FaUsers className="no-users-icon" />
                    <h3>No Verified Team Members</h3>
                    <p>Add team members using the form above</p>
                  </div>
                </td></tr>
              ) : teamMembers.map((m) => (
                <tr key={m._id} className="user-row">
                  <td><div className="user-name-cell">
                    <div className="user-avatar-small"><FaUsers /></div>
                    <span className="user-fullname">{m.username}</span>
                  </div></td>
                  <td><span className="username">@{m.username}</span></td>
                  <td><div className="email-cell"><FaEnvelope className="email-icon" /><span>{m.email}</span></div></td>
                  <td>{m.phoneNumber}</td>
                  <td><div className="action-buttons">
                    <button className="action-btn delete-btn" onClick={() => handleDeleteTeamMember(m._id)} title="Remove"><FaTrash /></button>
                  </div></td>
                </tr>
              ))
            )}

            {/* UNVERIFIED */}
            {activeTab === 'unverified' && (
              unverifiedUsers.length === 0 ? (
                <tr><td colSpan="4" className="no-users-row">
                  <div className="no-users-content">
                    <FaUsers className="no-users-icon" />
                    <h3>No Unverified Users</h3>
                    <p>No users with unverified status</p>
                  </div>
                </td></tr>
              ) : unverifiedUsers.map((u) => (
                <tr key={u._id} className="user-row">
                  <td><div className="user-name-cell">
                    <div className="user-avatar-small"><FaUsers /></div>
                    <span className="user-fullname">{u.username}</span>
                  </div></td>
                  <td><div className="email-cell"><FaEnvelope className="email-icon" /><span>{u.email}</span></div></td>
                  <td>{u.phoneNumber}</td>
                  <td><div className="action-buttons">
                    <button className="action-btn delete-btn" onClick={() => handleDeleteTeamMember(u._id)} title="Remove"><FaTrash /></button>
                  </div></td>
                </tr>
              ))
            )}

            {/* BLACKLISTED */}
            {activeTab === 'blacklisted' && (
              blacklistedUsers.length === 0 ? (
                <tr><td colSpan="5" className="no-users-row">
                  <div className="no-users-content">
                    <FaBan className="no-users-icon" />
                    <h3>No Blacklisted Numbers</h3>
                    <p>No numbers have been blacklisted yet</p>
                  </div>
                </td></tr>
              ) : blacklistedUsers.map((u) => (
                <tr key={u._id} className="user-row tm-blacklist-row">
                  <td><div className="user-name-cell">
                    <div className="user-avatar-small" style={{ background: 'linear-gradient(135deg, #dc3545, #c82333)' }}><FaBan /></div>
                    <span className="user-fullname">{u.username}</span>
                  </div></td>
                  <td><strong>{u.phoneNumber}</strong></td>
                  <td>{u.blacklistReason || 'N/A'}</td>
                  <td>{u.addedAt ? new Date(u.addedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</td>
                  <td><div className="action-buttons">
                    <button className="action-btn delete-btn" onClick={() => handleDeleteBlacklisted(u._id)} title="Remove"><FaTrash /></button>
                  </div></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default TeamManagement;
