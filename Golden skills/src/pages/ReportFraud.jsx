import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaExclamationTriangle, FaUser, FaPhone, FaCamera, FaCommentAlt, FaCheckCircle, FaTimesCircle, FaUpload, FaShieldAlt } from 'react-icons/fa';
import { API_ENDPOINTS } from '../config/apiConfig';
import './ReportFraud.css';

const ReportFraud = () => {
  const [form, setForm] = useState({
    reporterName: '',
    reporterPhone: '',
    scammerPhone: '',
    message: ''
  });
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Only image files are allowed for screenshot');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Screenshot must be less than 5MB');
      return;
    }

    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshot(reader.result);
      setScreenshotPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotPreview(null);
    setScreenshotName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.reporterName.trim()) { setError('Please enter your name'); return; }
    if (!form.reporterPhone.trim()) { setError('Please enter your phone number'); return; }
    if (!form.scammerPhone.trim()) { setError('Please enter the scammer\'s phone number'); return; }
    if (!form.message.trim()) { setError('Please describe the incident'); return; }

    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.FRAUD.SUBMIT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          screenshot: screenshot || null,
          screenshotName: screenshotName || null
        })
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.message || 'Failed to submit report. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm({ reporterName: '', reporterPhone: '', scammerPhone: '', message: '' });
    setScreenshot(null);
    setScreenshotPreview(null);
    setScreenshotName('');
    setSubmitted(false);
    setError('');
  };

  return (
    <>
      <Navbar />
      <div className="rf-page">

        {/* Hero */}
        <section className="rf-hero">
          <div className="rf-hero-overlay" />
          <div className="container">
            <div className="rf-hero-content text-center">
              <div className="rf-hero-icon">
                <FaExclamationTriangle />
              </div>
              <h1 className="rf-hero-title">
                Report a <span className="rf-gradient-text">Fraud</span>
              </h1>
              <p className="rf-hero-desc">
                Help us protect our community. If someone is impersonating our team or scamming people using our name, report them here.
              </p>
            </div>
          </div>
        </section>

        <div className="rf-content">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 col-xl-7">

                {submitted ? (
                  /* Success State */
                  <div className="rf-success-card">
                    <div className="rf-success-icon">
                      <FaCheckCircle />
                    </div>
                    <h2>Report Submitted!</h2>
                    <p>Thank you for helping us keep the community safe. Our team will review your report and take appropriate action within 24-48 hours.</p>
                    <div className="rf-success-info">
                      <FaShieldAlt className="me-2" />
                      Your report has been received and is under review.
                    </div>
                    <button className="rf-btn-primary" onClick={handleReset}>
                      Submit Another Report
                    </button>
                  </div>
                ) : (
                  /* Form */
                  <div className="rf-form-card">
                    <div className="rf-form-header">
                      <FaExclamationTriangle className="rf-form-header-icon" />
                      <div>
                        <h2>Fraud Report Form</h2>
                        <p>All information is kept confidential</p>
                      </div>
                    </div>

                    {error && (
                      <div className="rf-error">
                        <FaTimesCircle className="me-2" />
                        {error}
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="rf-form">

                      {/* Your Info */}
                      <div className="rf-section-label">Your Information</div>

                      <div className="rf-row">
                        <div className="rf-field">
                          <label>
                            <FaUser className="rf-field-icon" />
                            Your Name
                          </label>
                          <input
                            type="text"
                            name="reporterName"
                            value={form.reporterName}
                            onChange={handleChange}
                            placeholder="Enter your full name"
                            disabled={loading}
                          />
                        </div>

                        <div className="rf-field">
                          <label>
                            <FaPhone className="rf-field-icon" />
                            Your Phone Number
                          </label>
                          <input
                            type="text"
                            name="reporterPhone"
                            value={form.reporterPhone}
                            onChange={handleChange}
                            placeholder="e.g. 03001234567"
                            disabled={loading}
                          />
                        </div>
                      </div>

                      {/* Scammer Info */}
                      <div className="rf-section-label rf-section-danger">Scammer Information</div>

                      <div className="rf-field">
                        <label>
                          <FaPhone className="rf-field-icon" />
                          Scammer's Phone Number
                        </label>
                        <input
                          type="text"
                          name="scammerPhone"
                          value={form.scammerPhone}
                          onChange={handleChange}
                          placeholder="Enter the scammer's phone number"
                          disabled={loading}
                          className="rf-input-danger"
                        />
                      </div>

                      {/* Message */}
                      <div className="rf-field">
                        <label>
                          <FaCommentAlt className="rf-field-icon" />
                          Describe the Incident
                        </label>
                        <textarea
                          name="message"
                          value={form.message}
                          onChange={handleChange}
                          placeholder="Describe what happened in detail — how they contacted you, what they claimed, what they asked for..."
                          rows={5}
                          disabled={loading}
                        />
                      </div>

                      {/* Screenshot */}
                      <div className="rf-field">
                        <label>
                          <FaCamera className="rf-field-icon" />
                          Screenshot (Optional)
                        </label>

                        {screenshotPreview ? (
                          <div className="rf-preview-wrapper">
                            <img src={screenshotPreview} alt="Screenshot preview" className="rf-preview-img" />
                            <div className="rf-preview-info">
                              <span>{screenshotName}</span>
                              <button type="button" className="rf-remove-btn" onClick={removeScreenshot}>
                                <FaTimesCircle /> Remove
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="rf-upload-area"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <FaUpload className="rf-upload-icon" />
                            <p>Click to upload screenshot</p>
                            <span>PNG, JPG, JPEG up to 5MB</span>
                          </div>
                        )}

                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                        />
                      </div>

                      <button type="submit" className="rf-btn-submit" disabled={loading}>
                        {loading ? (
                          <><span className="rf-spinner" /> Submitting...</>
                        ) : (
                          <><FaExclamationTriangle className="me-2" /> Submit Fraud Report</>
                        )}
                      </button>
                    </form>
                  </div>
                )}

                {/* Info Box */}
                <div className="rf-info-box">
                  <h6 className="rf-info-title">
                    <FaShieldAlt className="me-2" />
                    What happens after you report?
                  </h6>
                  <ul className="rf-info-list">
                    <li>Our team reviews every report within 24–48 hours</li>
                    <li>Verified scammers are added to our public blacklist</li>
                    <li>Anyone searching that number will see a SCAMMER ALERT</li>
                    <li>Your personal information is kept completely confidential</li>
                  </ul>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default ReportFraud;
