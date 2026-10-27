import { useState, useEffect, useCallback } from 'react';
import {
  FaUserFriends, FaSearch, FaCheckCircle, FaTimesCircle,
  FaChevronDown, FaChevronUp, FaUsers, FaUserCheck,
  FaUserPlus, FaUser, FaEnvelope, FaTag, FaLink
} from 'react-icons/fa';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import './ReferralSystem.css';

const PAGE_SIZE = 20;

const ReferralSystem = () => {
  const [users, setUsers]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchInput, setSearchInput]   = useState('');
  const [expandedUser, setExpandedUser] = useState(null);

  const [currentPage, setCurrentPage]   = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [totalUsers, setTotalUsers]     = useState(0);
  const [hasNextPage, setHasNextPage]   = useState(false);
  const [hasPrevPage, setHasPrevPage]   = useState(false);
  const [withReferral, setWithReferral] = useState(0);
  const [withoutReferral, setWithoutReferral] = useState(0);

  // Fetch page from backend
  const fetchUsers = useCallback(async (page = 1, search = '') => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
      const url = `${API_ENDPOINTS.ADMIN.REFERRAL_TREE}?page=${page}&limit=${PAGE_SIZE}${searchParam}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();

      if (data.success) {
        setUsers(data.users || []);
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
        setTotalUsers(data.total);
        setHasNextPage(data.hasNextPage);
        setHasPrevPage(data.hasPrevPage);
        setWithReferral(data.withReferral);
        setWithoutReferral(data.withoutReferral);
      }
    } catch (err) {
      console.error('Referral tree fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers(1, '');
  }, [fetchUsers]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, searchInput);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, fetchUsers]);

  const handlePageChange = (pageNum) => {
    if (pageNum < 1 || pageNum > totalPages) return;
    setExpandedUser(null);
    fetchUsers(pageNum, searchInput);
  };

  const toggleExpand = (userId) =>
    setExpandedUser(prev => (prev === userId ? null : userId));

  // For expand sub-rows — only works within current page (same as Users section behavior)
  const getReferredUsers = (referrerEmail) =>
    users.filter(u => u.referredBy?.email === referrerEmail);

  return (
    <div className="ref-container">

      {/* ── Header ── */}
      <div className="ref-header">
        <div className="ref-header-icon"><FaUserFriends /></div>
        <h2>Referral System</h2>
        <p>View who registered through which referral code</p>
      </div>

      {/* ── Stats ── */}
      <div className="ref-stats">
        <div className="ref-stat-card total">
          <div className="ref-stat-icon"><FaUsers /></div>
          <span className="ref-stat-num">{totalUsers}</span>
          <span className="ref-stat-label">Total Users</span>
        </div>
        <div className="ref-stat-card referred">
          <div className="ref-stat-icon"><FaUserCheck /></div>
          <span className="ref-stat-num">{withReferral}</span>
          <span className="ref-stat-label">Joined via Referral</span>
        </div>
        <div className="ref-stat-card organic">
          <div className="ref-stat-icon"><FaUserPlus /></div>
          <span className="ref-stat-num">{withoutReferral}</span>
          <span className="ref-stat-label">Direct Register</span>
        </div>
      </div>

      {/* ── Search ── */}
      <div className="ref-search-bar">
        <FaSearch className="ref-search-icon" />
        <input
          type="text"
          placeholder="Search by name, email or referral code..."
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
        {searchInput && (
          <button className="ref-search-clear" onClick={() => setSearchInput('')}>×</button>
        )}
      </div>

      {/* ── Table ── */}
      {loading ? (
        <div className="ref-loading">
          <FaUserFriends className="ref-loading-icon" />
          <p>Loading referral data...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="ref-empty">
          <FaUserFriends size={52} />
          <h3>No Records Found</h3>
        </div>
      ) : (
        <>
          <div className="ref-table-wrapper">
            <table className="ref-table">
              <thead>
                <tr>
                  <th><FaUser className="th-icon" /> User</th>
                  <th><FaEnvelope className="th-icon" /> Email</th>
                  <th><FaTag className="th-icon" /> My Referral Code</th>
                  <th><FaUserFriends className="th-icon" /> Referred Count</th>
                  <th><FaLink className="th-icon" /> Referred By</th>
                  <th><FaCheckCircle className="th-icon" /> Plan Active</th>
                  <th>Join Date</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const referredList = getReferredUsers(u.email);
                  const isExpanded   = expandedUser === u.userId;

                  return (
                    <>
                      <tr key={u.userId} className={isExpanded ? 'ref-row-expanded' : ''}>
                        <td className="ref-name">
                          <div className="ref-avatar">
                            {(u.fullName?.[0] || '?').toUpperCase()}
                          </div>
                          {u.fullName}
                        </td>
                        <td className="ref-email">
                          <FaEnvelope className="cell-icon" /> {u.email}
                        </td>
                        <td>
                          <span className="ref-code">
                            <FaTag className="code-icon" /> {u.myReferralCode || '—'}
                          </span>
                        </td>
                        <td>
                          <span className={`ref-count ${u.referredUsersCount > 0 ? 'has-refs' : ''}`}>
                            <FaUserFriends className="cell-icon" /> {u.referredUsersCount}
                          </span>
                        </td>
                        <td>
                          {u.referredBy ? (
                            <div className="ref-by-cell">
                              <span className="ref-by-name">
                                <FaUser className="cell-icon" /> {u.referredBy.fullName}
                              </span>
                              <span className="ref-by-code">
                                <FaTag className="code-icon" /> {u.referredBy.myReferralCode}
                              </span>
                            </div>
                          ) : (
                            <span className="ref-no-ref">— Direct —</span>
                          )}
                        </td>
                        <td className="ref-plan-cell">
                          {u.hasActivatedPlan
                            ? <FaCheckCircle className="ref-active-yes" title="Plan Active" />
                            : <FaTimesCircle className="ref-active-no" title="No Plan" />
                          }
                        </td>
                        <td className="ref-date">
                          {new Date(u.joinedAt).toLocaleDateString('en-PK', {
                            day: '2-digit', month: 'short', year: 'numeric'
                          })}
                        </td>
                        <td>
                          {u.referredUsersCount > 0 && (
                            <button
                              className="ref-expand-btn"
                              onClick={() => toggleExpand(u.userId)}
                              title="View referred users"
                            >
                              {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                              <span>{u.referredUsersCount}</span>
                            </button>
                          )}
                        </td>
                      </tr>

                      {/* Expand sub-row */}
                      {isExpanded && referredList.length > 0 && (
                        <tr key={`${u.userId}-expand`} className="ref-expand-row">
                          <td colSpan="8">
                            <div className="ref-expand-content">
                              <h4>
                                <FaUserFriends className="expand-title-icon" />
                                Users referred by {u.fullName} ({referredList.length})
                              </h4>
                              <div className="ref-expand-grid">
                                {referredList.map(r => (
                                  <div key={r.userId} className="ref-expand-card">
                                    <div className="ref-expand-avatar">
                                      {(r.fullName?.[0] || '?').toUpperCase()}
                                    </div>
                                    <div className="ref-expand-info">
                                      <div className="ref-expand-card-name">
                                        <FaUser className="cell-icon" /> {r.fullName}
                                      </div>
                                      <div className="ref-expand-card-email">
                                        <FaEnvelope className="cell-icon" /> {r.email}
                                      </div>
                                      <div className="ref-expand-card-meta">
                                        <span className={`ref-expand-plan ${r.hasActivatedPlan ? 'active' : 'inactive'}`}>
                                          {r.hasActivatedPlan
                                            ? <><FaCheckCircle /> Plan Active</>
                                            : <><FaTimesCircle /> No Plan Yet</>
                                          }
                                        </span>
                                        <span className="ref-expand-date">
                                          {new Date(r.joinedAt).toLocaleDateString('en-PK', {
                                            day: '2-digit', month: 'short', year: 'numeric'
                                          })}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination (same style as Users section) ── */}
          {totalPages > 1 && (
            <div className="ref-pagination">
              <div className="ref-page-info">
                Showing {(currentPage - 1) * PAGE_SIZE + 1} to {Math.min(currentPage * PAGE_SIZE, totalUsers)} of {totalUsers} users
              </div>
              <div className="ref-page-controls">
                <button
                  className="ref-page-btn nav"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hasPrevPage}
                >
                  Previous
                </button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      className={`ref-page-btn ${currentPage === pageNum ? 'active' : ''}`}
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  className="ref-page-btn nav"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasNextPage}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReferralSystem;
