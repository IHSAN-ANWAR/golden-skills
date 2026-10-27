import { useState } from 'react';
import { API_ENDPOINTS } from '../config/apiConfig';
import './UserPromotion.css';
import {
  FaLock,
  FaUnlock,
  FaCheckCircle,
  FaTimesCircle,
  FaTrophy,
  FaSpinner,
  FaSearch,
  FaTasks,
  FaUpload
} from 'react-icons/fa';

const REQUIRED_TASKS = 3;

const UserPromotion = () => {
  const [email, setEmail] = useState('');
  const [eligibility, setEligibility] = useState(null);
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checked, setChecked] = useState(false);

  // Form state
  const [selectedPromotion, setSelectedPromotion] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [plans, setPlans] = useState([]);
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [paymentImage, setPaymentImage] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [checkError, setCheckError] = useState('');

  const handleCheckEligibility = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setChecked(false);
    setEligibility(null);
    setSubmitSuccess(false);
    setSubmitError('');
    setCheckError('');

    try {
      // Check eligibility and fetch promotions + plans in parallel
      const [eligRes, promoRes, planRes] = await Promise.all([
        fetch(API_ENDPOINTS.USER_TASKS.CHECK_ELIGIBILITY(email.trim().toLowerCase())),
        fetch(API_ENDPOINTS.PROMOTIONS.GET_ALL),
        fetch(API_ENDPOINTS.PLANS.GET_ALL)
      ]);

      // Check HTTP-level errors before parsing JSON
      if (!eligRes.ok) throw new Error(`Eligibility check failed (${eligRes.status})`);
      if (!promoRes.ok) throw new Error(`Failed to load promotions (${promoRes.status})`);
      if (!planRes.ok) throw new Error(`Failed to load plans (${planRes.status})`);

      const [eligData, promoData, planData] = await Promise.all([
        eligRes.json(),
        promoRes.json(),
        planRes.json()
      ]);

      if (eligData.success) setEligibility(eligData);
      else setCheckError(eligData.message || 'Could not verify eligibility. Please try again.');

      if (promoData.success) setPromotions(promoData.promotions || []);
      if (planData.success) setPlans(planData.plans || []);
    } catch (err) {
      console.error('Error checking eligibility:', err);
      setCheckError(
        err.message.includes('fetch')
          ? 'Network error. Please check your connection and try again.'
          : err.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setLoading(false);
      setChecked(true);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentImage(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPromotion = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!selectedPlan) return setSubmitError('Please select a plan.');
    if (!userName.trim()) return setSubmitError('Please enter your name.');
    if (!paymentImage) return setSubmitError('Please upload your payment screenshot.');

    setSubmitting(true);
    try {
      const res = await fetch(API_ENDPOINTS.USER_PROMOTIONS.SUBMIT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: selectedPlan,
          promotionId: selectedPromotion || undefined,
          userName: userName.trim(),
          userEmail: email.trim().toLowerCase(),
          userPhone: userPhone.trim(),
          userImage: paymentImage
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
      } else {
        setSubmitError(data.message || 'Submission failed. Please try again.');
      }
    } catch (err) {
      setSubmitError('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Progress bar percentage
  const progressPercent = eligibility
    ? Math.min((eligibility.completedTasks / REQUIRED_TASKS) * 100, 100)
    : 0;

  return (
    <div className="user-promotion-container">
      {/* Header */}
      <div className="promotion-page-header">
        <FaTrophy className="header-icon" />
        <h1>Promotion Program</h1>
        <p>Complete <strong>{REQUIRED_TASKS} tasks</strong> to unlock the promotion and earn rewards</p>
      </div>

      {/* Email Check Form */}
      <div className="email-check-section">
        <form onSubmit={handleCheckEligibility} className="email-check-form">
          <div className="email-input-group">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? <FaSpinner className="spin" /> : <FaSearch />}
              {loading ? 'Checking...' : 'Check Eligibility'}
            </button>
          </div>
        </form>
      </div>

      {/* Error Message */}
      {checked && checkError && (
        <div className="submit-error" style={{ maxWidth: '600px', margin: '0 auto 1.5rem' }}>
          <FaTimesCircle /> {checkError}
        </div>
      )}

      {/* Results */}
      {checked && eligibility && (
        <div className="eligibility-result">

          {/* Progress Card */}
          <div className={`progress-card ${eligibility.isEligible ? 'eligible' : 'locked'}`}>
            <div className="progress-card-header">
              {eligibility.isEligible ? (
                <>
                  <FaUnlock className="lock-icon unlocked" />
                  <h2>Promotion Unlocked!</h2>
                  <p>You have completed {eligibility.completedTasks} tasks. You are eligible to join the promotion.</p>
                </>
              ) : (
                <>
                  <FaLock className="lock-icon locked" />
                  <h2>Promotion Locked</h2>
                  <p>
                    Complete <strong>{eligibility.remaining} more task{eligibility.remaining !== 1 ? 's' : ''}</strong> to unlock the promotion.
                  </p>
                </>
              )}
            </div>

            {/* Progress Bar */}
            <div className="task-progress-section">
              <div className="progress-label">
                <FaTasks />
                <span>Tasks Completed: {eligibility.completedTasks} / {REQUIRED_TASKS}</span>
              </div>
              <div className="progress-bar-track">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="progress-steps">
                {Array.from({ length: REQUIRED_TASKS }).map((_, i) => (
                  <div
                    key={i}
                    className={`progress-step ${i < eligibility.completedTasks ? 'done' : 'pending'}`}
                  >
                    {i < eligibility.completedTasks ? <FaCheckCircle /> : <FaTimesCircle />}
                    <span>Task {i + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Promotion Apply Form — only if eligible */}
          {eligibility.isEligible && !submitSuccess && (
            <div className="promotion-apply-section">
              <h2>Apply for Promotion</h2>
              <p className="apply-subtitle">Fill in the details below to submit your promotion application.</p>

              <form onSubmit={handleSubmitPromotion} className="promotion-apply-form">
                {/* Name */}
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                {/* Phone */}
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={userPhone}
                    onChange={(e) => setUserPhone(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Select Promotion */}
                {promotions.length > 0 && (
                  <div className="form-group">
                    <label>Select Promotion</label>
                    <select
                      value={selectedPromotion}
                      onChange={(e) => setSelectedPromotion(e.target.value)}
                    >
                      <option value="">-- Select a promotion (optional) --</option>
                      {promotions.map((promo) => (
                        <option key={promo._id} value={promo._id}>
                          {promo.title} — Reward: {promo.rewardAmount}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Select Plan */}
                <div className="form-group">
                  <label>Select Plan *</label>
                  <select
                    value={selectedPlan}
                    onChange={(e) => setSelectedPlan(e.target.value)}
                    required
                  >
                    <option value="">-- Select a plan --</option>
                    {plans.map((plan) => (
                      <option key={plan._id} value={plan._id}>
                        {plan.title} — {plan.price}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Screenshot */}
                <div className="form-group">
                  <label>Payment Screenshot *</label>
                  <div className="upload-area">
                    <label htmlFor="payment-img" className="upload-label">
                      <FaUpload />
                      <span>{imagePreview ? 'Change Image' : 'Upload Payment Screenshot'}</span>
                    </label>
                    <input
                      id="payment-img"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Payment screenshot preview" />
                    </div>
                  )}
                </div>

                {submitError && (
                  <div className="submit-error">
                    <FaTimesCircle /> {submitError}
                  </div>
                )}

                <button type="submit" className="submit-btn" disabled={submitting}>
                  {submitting ? (
                    <><FaSpinner className="spin" /> Submitting...</>
                  ) : (
                    <><FaTrophy /> Submit Application</>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Success Message */}
          {submitSuccess && (
            <div className="submit-success-card">
              <FaCheckCircle className="success-icon" />
              <h2>Application Submitted!</h2>
              <p>Your promotion application has been submitted successfully. Our team will review it and get back to you.</p>
            </div>
          )}

          {/* Locked Promotion Preview — show when not eligible */}
          {!eligibility.isEligible && promotions.length > 0 && (
            <div className="locked-promotions-preview">
              <h3>Available Promotions</h3>
              <p className="locked-note">Complete {eligibility.remaining} more task{eligibility.remaining !== 1 ? 's' : ''} to apply</p>
              <div className="promotions-grid">
                {promotions.map((promo) => (
                  <div key={promo._id} className="promo-card locked-card">
                    <div className="promo-lock-overlay">
                      <FaLock />
                    </div>
                    <h4>{promo.title}</h4>
                    {promo.description && <p>{promo.description}</p>}
                    <div className="promo-reward">
                      <FaTrophy />
                      <span>Reward: {promo.rewardAmount}</span>
                    </div>
                    <div className="promo-plan-req">
                      Required Plan: {promo.requiredPlanPrice}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserPromotion;
