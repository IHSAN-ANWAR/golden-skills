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
    
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(API_ENDPOINTS.TEAM.VERIFY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: phoneNumber.trim() })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data);
      } else {
        setResult({ 
          success: false, 
          verified: false,
          status: 'error',
          message: data.message || 'Verification failed'
        });
      }
    } catch (err) {
      console.error('Verification error:', err);
      setError('Failed to verify. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setPhoneNumber('');
    setResult(null);
    setError('');
  };

  return (
    <>
      <Navbar />
      <div className="tv-page">

        {/* Hero */}
        <section className="tv-hero">
          <div className="tv-hero-overlay" />
          <div className="tv-hero-inner">
            <div className="tv-hero-content">
              <div className="tv-hero-icon">
                <FaShieldAlt />
              </div>
              <h1 className="tv-hero-title">
                Team <span className="tv-gradient-text">Verification</span>
              </h1>
              <p className="tv-hero-desc">
                Verify if someone claiming to represent Golden Skills is an official team member. Enter their phone number below.
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="tv-content">
          <div className="tv-content-inner">

            {/* Search Card */}
            <div className="tv-search-card">
              <div className="tv-search-header">
                <FaPhone className="tv-search-icon" />
                <h3 className="tv-search-title">Enter Phone Number</h3>
              </div>

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
                    Enter the phone number to verify team membership
                  </small>
                </div>

                {error && (
                  <div className="tv-error">
                    <FaTimesCircle />
                    <span>{error}</span>
                  </div>
                )}

                <button type="submit" className="tv-btn-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="tv-spinner" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <FaSearch />
                      Verify Now
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Result */}
            {result && (
              <div className="tv-result-wrapper">

                {/* Verified */}
                {result.status === 'verified' && (
                  <div className="tv-result tv-result-success">
                    <div className="tv-result-header">
                      <div className="tv-result-icon tv-icon-success">
                        <FaCheckCircle />
                      </div>
                      <h2 className="tv-result-title tv-title-success">
                        <FaCheckCircle />
                        Verified Official Team Member
                      </h2>
                      <p className="tv-result-subtitle">
                        This person is a verified member of Golden Skills team
                      </p>
                    </div>

                    <div className="tv-member-details">
                      <div className="tv-detail-row">
                        <div className="tv-detail-icon tv-icon-success"><FaUser /></div>
                        <div className="tv-detail-info">
                          <span className="tv-detail-label">Full Name</span>
                          <span className="tv-detail-value">{result.teamMember.name}</span>
                        </div>
                      </div>

                      <div className="tv-detail-row">
                        <div className="tv-detail-icon tv-icon-success"><FaPhone /></div>
                        <div className="tv-detail-info">
                          <span className="tv-detail-label">Phone Number</span>
                          <span className="tv-detail-value">{result.teamMember.phoneNumber}</span>
                        </div>
                      </div>

                      <div className="tv-detail-row">
                        <div className="tv-detail-icon tv-icon-success"><FaIdBadge /></div>
                        <div className="tv-detail-info">
                          <span className="tv-detail-label">Role</span>
                          <span className="tv-detail-value">{result.teamMember.role}</span>
                        </div>
                      </div>

                      <div className="tv-detail-row">
                        <div className="tv-detail-icon tv-icon-success"><FaMapMarkerAlt /></div>
                        <div className="tv-detail-info">
                          <span className="tv-detail-label">City</span>
                          <span className="tv-detail-value">{result.teamMember.city}</span>
                        </div>
                      </div>

                      {result.teamMember.referralCode && (
                        <div className="tv-detail-row">
                          <div className="tv-detail-icon tv-icon-success"><FaIdBadge /></div>
                          <div className="tv-detail-info">
                            <span className="tv-detail-label">Referral Code</span>
                            <span className="tv-referral-code tv-code-success">
                              {result.teamMember.referralCode}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <button onClick={handleReset} className="tv-btn-reset">
                      Verify Another Number
                    </button>
                  </div>
                )}

                {/* Blacklisted */}
                {result.status === 'blacklisted' && (
                  <div className="tv-result tv-result-danger">
                    <div className="tv-result-header">
                      <div className="tv-result-icon tv-icon-danger">
                        <FaExclamationTriangle />
                      </div>
                      <h2 className="tv-result-title tv-title-danger">
                        BLACKLISTED — SCAMMER ALERT
                      </h2>
                      <p className="tv-result-subtitle-danger">
                        This number has been reported for fraudulent activity
                      </p>
                    </div>

                    <div className="tv-blacklist-warning">
                      <div className="tv-warning-header">
                        <FaExclamationTriangle />
                        FRAUD WARNING
                      </div>

                      <div className="tv-member-details">
                        <div className="tv-detail-row">
                          <div className="tv-detail-icon tv-icon-danger"><FaUser /></div>
                          <div className="tv-detail-info">
                            <span className="tv-detail-label">Name</span>
                            <span className="tv-detail-value">{result.alert.name}</span>
                          </div>
                        </div>

                        <div className="tv-detail-row">
                          <div className="tv-detail-icon tv-icon-danger"><FaPhone /></div>
                          <div className="tv-detail-info">
                            <span className="tv-detail-label">Phone Number</span>
                            <span className="tv-detail-value">{result.alert.phoneNumber}</span>
                          </div>
                        </div>

                        <div className="tv-detail-row">
                          <div className="tv-detail-icon tv-icon-danger"><FaExclamationTriangle /></div>
                          <div className="tv-detail-info">
                            <span className="tv-detail-label">Reason</span>
                            <span className="tv-detail-value">{result.alert.reason}</span>
                          </div>
                        </div>
                      </div>

                      <div className="tv-action-warning">
                        <FaExclamationTriangle />
                        <strong>DO NOT proceed with any transactions. Report to authorities immediately.</strong>
                      </div>
                    </div>

                    <button onClick={handleReset} className="tv-btn-danger">
                      Check Another Number
                    </button>
                  </div>
                )}

                {/* Unknown/Unverified */}
                {(result.status === 'unknown' || result.status === 'unverified') && (
                  <div className="tv-result tv-result-neutral">
                    <div className="tv-result-header">
                      <div className="tv-result-icon tv-icon-neutral">
                        <FaTimesCircle />
                      </div>
                      <h2 className="tv-result-title tv-title-neutral">
                        <FaTimesCircle />
                        {result.status === 'unknown' ? 'Not Found' : 'Unverified'}
                      </h2>
                      <p className="tv-result-subtitle">{result.message}</p>
                    </div>
                    <button onClick={handleReset} className="tv-btn-reset">
                      Try Another Number
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Info */}
            <div className="tv-info-card">
              <h6 className="tv-info-title">
                <FaCheckCircle />
                Why Verify?
              </h6>
              <ul className="tv-info-list">
                <li>Protect yourself from fraud and impersonation</li>
                <li>Confirm you're dealing with an official team member</li>
                <li>Verify authenticity before making any payments</li>
                <li>Report suspicious activity if someone claims to be from our team</li>
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
