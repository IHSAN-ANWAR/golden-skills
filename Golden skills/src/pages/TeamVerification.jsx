import React, { useState } from 'react';
import { API_ENDPOINTS } from '../config/apiConfig';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaSearch, FaCheckCircle, FaTimesCircle, FaPhone, FaUser, FaMapMarkerAlt, FaIdBadge, FaShieldAlt, FaExclamationTriangle } from 'react-icons/fa';
import './TeamVerification.css';

const TeamVerification = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) { setError('Please enter a phone number'); return; }
    setLoading(true); setError(''); setResult(null);
    try {
      const response = await fetch(API_ENDPOINTS.TEAM.VERIFY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim() })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setResult(data);
      } else {
        setResult({ success: false, verified: false, status: 'error', message: data.message || 'Verification failed' });
      }
    } catch (err) {
      setError('Failed to verify. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => { setPhoneNumber(''); setResult(null); setError(''); };

  return (
    <>
      <Navbar />
      <div className="tv-page">

        {/* Hero */}
        <section className="tv-hero">
          <div className="tv-hero-overlay" />
          <div className="tv-hero-inner">
            <div className="tv-hero-content">
              <div className="tv-hero-icon"><FaShieldAlt /></div>
              <h1 className="tv-hero-title">
                Team <span className="tv-gradient-text">Verification</span>
              </h1>
              <p className="tv-hero-desc">
                Before making any payment or sharing personal information — always verify first.
                Enter any phone number to instantly check if that person is an official
                Golden Skills team member or a scammer.
              </p>
              <div className="tv-hero-badges">
                <div className="tv-hero-badge"><FaCheckCircle /> Instant Verification</div>
                <div className="tv-hero-badge"><FaShieldAlt /> 100% Free</div>
                <div className="tv-hero-badge"><FaCheckCircle /> Official Database</div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Banner */}
        <div className="tv-trust-banner">
          <div className="tv-trust-inner">
            <div className="tv-trust-item">
              <FaShieldAlt className="tv-trust-icon" />
              <span>Official Golden Skills team member database</span>
            </div>
            <div className="tv-trust-divider" />
            <div className="tv-trust-item">
              <FaCheckCircle className="tv-trust-icon" />
              <span>Updated in real-time by our admin team</span>
            </div>
            <div className="tv-trust-divider" />
            <div className="tv-trust-item">
              <FaExclamationTriangle className="tv-trust-icon tv-trust-warn" />
              <span>Scammers are blacklisted and publicly flagged</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <section className="tv-content">
          <div className="tv-content-inner">

            {/* Alert Box */}
            <div className="tv-alert-box">
              <div className="tv-alert-icon"><FaExclamationTriangle /></div>
              <div className="tv-alert-text">
                <strong>Important Safety Notice:</strong> Golden Skills team members will NEVER ask you to
                send money directly to a personal account, WhatsApp, or JazzCash/EasyPaisa without
                an official receipt. Always verify before paying.
              </div>
            </div>

            {/* Search Card */}
            <div className="tv-search-card">
              <div className="tv-search-header">
                <FaPhone className="tv-search-icon" />
                <h3 className="tv-search-title">Enter Phone Number to Verify</h3>
              </div>
              <p className="tv-search-desc">
                Type the phone number of the person claiming to be from Golden Skills.
                Our system will instantly check against our official team database.
              </p>
              <form onSubmit={handleVerify} className="tv-search-form">
                <div className="tv-field">
                  <div className="tv-phone-wrapper">
                    <FaPhone className="tv-phone-icon" />
                    <input
                      type="text"
                      className="tv-phone-input"
                      placeholder="e.g., 03001234567"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      disabled={loading}
                    />
                  </div>
                  <small className="tv-helper">
                    Enter the complete phone number including country code if needed
                  </small>
                </div>
                {error && (
                  <div className="tv-error">
                    <FaTimesCircle /><span>{error}</span>
                  </div>
                )}
                <button type="submit" className="tv-btn-submit" disabled={loading}>
                  {loading ? (<><span className="tv-spinner" />Verifying...</>) : (<><FaSearch />Verify Now</>)}
                </button>
              </form>
            </div>

            {/* Result */}
            {result && (
              <div className="tv-result-wrapper">
                {result.status === 'verified' && (
                  <div className="tv-result tv-result-success">
                    <div className="tv-result-header">
                      <div className="tv-result-icon tv-icon-success"><FaCheckCircle /></div>
                      <h2 className="tv-result-title tv-title-success"><FaCheckCircle />Verified Official Team Member</h2>
                      <p className="tv-result-subtitle">This person is a verified member of the Golden Skills team. You can safely proceed.</p>
                    </div>
                    <div className="tv-member-details">
                      <div className="tv-detail-row"><div className="tv-detail-icon tv-icon-success"><FaUser /></div><div className="tv-detail-info"><span className="tv-detail-label">Full Name</span><span className="tv-detail-value">{result.teamMember.name}</span></div></div>
                      <div className="tv-detail-row"><div className="tv-detail-icon tv-icon-success"><FaPhone /></div><div className="tv-detail-info"><span className="tv-detail-label">Phone Number</span><span className="tv-detail-value">{result.teamMember.phoneNumber}</span></div></div>
                      <div className="tv-detail-row"><div className="tv-detail-icon tv-icon-success"><FaIdBadge /></div><div className="tv-detail-info"><span className="tv-detail-label">Role</span><span className="tv-detail-value">{result.teamMember.role}</span></div></div>
                      <div className="tv-detail-row"><div className="tv-detail-icon tv-icon-success"><FaMapMarkerAlt /></div><div className="tv-detail-info"><span className="tv-detail-label">City</span><span className="tv-detail-value">{result.teamMember.city}</span></div></div>
                      {result.teamMember.referralCode && (
                        <div className="tv-detail-row"><div className="tv-detail-icon tv-icon-success"><FaIdBadge /></div><div className="tv-detail-info"><span className="tv-detail-label">Referral Code</span><span className="tv-referral-code tv-code-success">{result.teamMember.referralCode}</span></div></div>
                      )}
                    </div>
                    <button onClick={handleReset} className="tv-btn-reset">Verify Another Number</button>
                  </div>
                )}
                {result.status === 'blacklisted' && (
                  <div className="tv-result tv-result-danger">
                    <div className="tv-result-header">
                      <div className="tv-result-icon tv-icon-danger"><FaExclamationTriangle /></div>
                      <h2 className="tv-result-title tv-title-danger">BLACKLISTED — SCAMMER ALERT</h2>
                      <p className="tv-result-subtitle-danger">This number has been reported for fraudulent activity. Do NOT proceed.</p>
                    </div>
                    <div className="tv-blacklist-warning">
                      <div className="tv-warning-header"><FaExclamationTriangle />FRAUD WARNING</div>
                      <div className="tv-member-details">
                        <div className="tv-detail-row"><div className="tv-detail-icon tv-icon-danger"><FaUser /></div><div className="tv-detail-info"><span className="tv-detail-label">Name</span><span className="tv-detail-value">{result.alert.name}</span></div></div>
                        <div className="tv-detail-row"><div className="tv-detail-icon tv-icon-danger"><FaPhone /></div><div className="tv-detail-info"><span className="tv-detail-label">Phone Number</span><span className="tv-detail-value">{result.alert.phoneNumber}</span></div></div>
                        <div className="tv-detail-row"><div className="tv-detail-icon tv-icon-danger"><FaExclamationTriangle /></div><div className="tv-detail-info"><span className="tv-detail-label">Reason</span><span className="tv-detail-value">{result.alert.reason}</span></div></div>
                      </div>
                      <div className="tv-action-warning"><FaExclamationTriangle /><strong>DO NOT proceed. Block this number and report to authorities immediately.</strong></div>
                    </div>
                    <button onClick={handleReset} className="tv-btn-danger">Check Another Number</button>
                  </div>
                )}
                {(result.status === 'unknown' || result.status === 'unverified') && (
                  <div className="tv-result tv-result-neutral">
                    <div className="tv-result-header">
                      <div className="tv-result-icon tv-icon-neutral"><FaTimesCircle /></div>
                      <h2 className="tv-result-title tv-title-neutral"><FaTimesCircle />{result.status === 'unknown' ? 'Not Found in Database' : 'Unverified'}</h2>
                      <p className="tv-result-subtitle">{result.message}</p>
                    </div>
                    <div className="tv-neutral-warning">
                      <FaExclamationTriangle />
                      <p>This number is <strong>NOT registered</strong> as an official Golden Skills team member.
                      If this person is claiming to represent us — treat it as suspicious and do not make any payments.</p>
                    </div>
                    <button onClick={handleReset} className="tv-btn-reset">Try Another Number</button>
                  </div>
                )}
              </div>
            )}

            {/* How It Works */}
            <div className="tv-how-section">
              <h3 className="tv-how-title">How Verification Works</h3>
              <div className="tv-how-steps">
                <div className="tv-how-step">
                  <div className="tv-how-num">1</div>
                  <div className="tv-how-icon"><FaPhone /></div>
                  <h4>Enter Phone Number</h4>
                  <p>Type the phone number of the person claiming to be from Golden Skills team.</p>
                </div>
                <div className="tv-how-arrow">›</div>
                <div className="tv-how-step">
                  <div className="tv-how-num">2</div>
                  <div className="tv-how-icon"><FaSearch /></div>
                  <h4>Instant Check</h4>
                  <p>We search our official team database in real-time and match against verified members.</p>
                </div>
                <div className="tv-how-arrow">›</div>
                <div className="tv-how-step">
                  <div className="tv-how-num">3</div>
                  <div className="tv-how-icon"><FaShieldAlt /></div>
                  <h4>Get Result</h4>
                  <p>You get an instant result — Verified, Blacklisted (Scammer), or Not Found.</p>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="tv-info-card">
              <h6 className="tv-info-title"><FaCheckCircle />Why You Should Always Verify</h6>
              <ul className="tv-info-list">
                <li>Protect yourself from fraud and impersonation by fake Golden Skills representatives</li>
                <li>Confirm you are dealing with an official, registered team member before making any payment</li>
                <li>Verify authenticity before sharing personal information or enrolling through someone</li>
                <li>Our blacklist is regularly updated with reported scammers — check before you trust</li>
                <li>If someone is not in our database, they are NOT authorized to represent Golden Skills</li>
                <li>Report suspicious activity immediately — help protect other community members</li>
              </ul>
            </div>

          </div>
        </section>

      </div>
      <Footer />
    </>
  );
};

export default TeamVerification;