import React, { useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FaExclamationTriangle, FaUser, FaPhone, FaCamera, FaCommentAlt, FaCheckCircle, FaTimesCircle, FaUpload, FaShieldAlt, FaLock, FaEye, FaHandshake } from 'react-icons/fa';
import { API_ENDPOINTS } from '../config/apiConfig';
import './ReportFraud.css';

const ReportFraud = () => {
  const [form, setForm] = useState({ reporterName: '', reporterPhone: '', scammerPhone: '', message: '' });
  const [screenshot, setScreenshot] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotName, setScreenshotName] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); setError(''); };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Only image files are allowed'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Screenshot must be less than 5MB'); return; }
    setScreenshotName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => { setScreenshot(reader.result); setScreenshotPreview(reader.result); };
    reader.readAsDataURL(file);
  };
  const removeScreenshot = () => {
    setScreenshot(null); setScreenshotPreview(null); setScreenshotName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!form.reporterName.trim()) { setError('Please enter your name'); return; }
    if (!form.reporterPhone.trim()) { setError('Please enter your phone number'); return; }
    if (!form.scammerPhone.trim()) { setError('Please enter the scammer phone number'); return; }
    if (!form.message.trim()) { setError('Please describe the incident'); return; }
    setLoading(true);
    try {
      const res = await fetch(API_ENDPOINTS.FRAUD.SUBMIT, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, screenshot: screenshot || null, screenshotName: screenshotName || null })
      });
      const data = await res.json();
      if (data.success) { setSubmitted(true); }
      else { setError(data.message || 'Failed to submit. Please try again.'); }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  };
  const handleReset = () => {
    setForm({ reporterName: '', reporterPhone: '', scammerPhone: '', message: '' });
    setScreenshot(null); setScreenshotPreview(null); setScreenshotName('');
    setSubmitted(false); setError('');
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
              <div className="rf-hero-icon"><FaExclamationTriangle /></div>
              <h1 className="rf-hero-title">Report a <span className="rf-gradient-text">Fraud</span></h1>
              <p className="rf-hero-desc">
                Is someone using the Golden Skills name to scam people? Help us protect thousands
                of community members. Your report is 100% confidential and reviewed by our security team.
              </p>
              <div className="rf-hero-badges">
                <div className="rf-hero-badge"><FaLock /> Confidential Report</div>
                <div className="rf-hero-badge"><FaShieldAlt /> Reviewed in 24hrs</div>
                <div className="rf-hero-badge"><FaEye /> Scammers Blacklisted</div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Strip */}
        <div className="rf-trust-strip">
          <div className="rf-trust-inner">
            <div className="rf-trust-item"><FaLock className="rf-trust-icon" /><span>Your identity is fully protected and never shared</span></div>
            <div className="rf-trust-divider" />
            <div className="rf-trust-item"><FaShieldAlt className="rf-trust-icon" /><span>Every report is reviewed by our dedicated security team</span></div>
            <div className="rf-trust-divider" />
            <div className="rf-trust-item"><FaHandshake className="rf-trust-icon" /><span>Together we keep the Golden Skills community safe</span></div>
          </div>
        </div>

        {/* Main Content */}
        <div className="rf-content">

          {/* Why Section - full width */}
          <div className="rf-full-section">
            <div className="rf-why-section">
              <h3 className="rf-why-title"><FaShieldAlt /> Why Reporting Matters</h3>
              <p className="rf-why-desc">
                Scammers are using the Golden Skills brand name to deceive innocent people —
                asking for course fees, registration charges, or personal data under false pretenses.
                Your single report can save dozens of people from being scammed.
              </p>
              <div className="rf-why-grid">
                <div className="rf-why-card">
                  <div className="rf-why-icon"><FaExclamationTriangle /></div>
                  <h4>Stop the Scammer</h4>
                  <p>Your report helps us identify and blacklist fraudulent numbers immediately.</p>
                </div>
                <div className="rf-why-card">
                  <div className="rf-why-icon"><FaUser /></div>
                  <h4>Protect Others</h4>
                  <p>Once reported, anyone who searches that number will see a SCAMMER ALERT.</p>
                </div>
                <div className="rf-why-card">
                  <div className="rf-why-icon"><FaHandshake /></div>
                  <h4>Build Trust</h4>
                  <p>Reporting keeps our community safe and strengthens trust in Golden Skills.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form - narrow column */}
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 col-xl-7">

                {submitted ? (
                  <div className="rf-success-card">
                    <div className="rf-success-icon"><FaCheckCircle /></div>
                    <h2>Report Submitted Successfully!</h2>
                    <p>Thank you for helping us keep the Golden Skills community safe. Our security team will review your report within 24–48 hours.</p>
                    <div className="rf-success-info"><FaShieldAlt className="me-2" />Your report is under review.</div>
                    <button className="rf-btn-primary" onClick={handleReset}>Submit Another Report</button>
                  </div>
                ) : (
                  <div className="rf-form-card">
                    <div className="rf-form-header">
                      <FaExclamationTriangle className="rf-form-header-icon" />
                      <div>
                        <h2>Fraud Report Form</h2>
                        <p>All information is kept strictly confidential — your identity will never be disclosed</p>
                      </div>
                    </div>
                    {error && <div className="rf-error"><FaTimesCircle className="me-2" />{error}</div>}
                    <form onSubmit={handleSubmit} className="rf-form">
                      <div className="rf-section-label">Your Information (Kept Private)</div>
                      <div className="rf-row">
                        <div className="rf-field">
                          <label><FaUser className="rf-field-icon" />Your Name</label>
                          <input type="text" name="reporterName" value={form.reporterName} onChange={handleChange} placeholder="Enter your full name" disabled={loading} />
                        </div>
                        <div className="rf-field">
                          <label><FaPhone className="rf-field-icon" />Your Phone Number</label>
                          <input type="text" name="reporterPhone" value={form.reporterPhone} onChange={handleChange} placeholder="e.g. 03001234567" disabled={loading} />
                        </div>
                      </div>
                      <div className="rf-section-label rf-section-danger">Scammer Information</div>
                      <div className="rf-field">
                        <label><FaPhone className="rf-field-icon" />Scammer's Phone Number</label>
                        <input type="text" name="scammerPhone" value={form.scammerPhone} onChange={handleChange} placeholder="Enter the scammer's phone number" disabled={loading} className="rf-input-danger" />
                      </div>
                      <div className="rf-field">
                        <label><FaCommentAlt className="rf-field-icon" />Describe the Incident in Detail</label>
                        <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us everything — how did they contact you? What did they say? What did they ask for? The more detail, the faster we can act." rows={6} disabled={loading} />
                      </div>
                      <div className="rf-field">
                        <label><FaCamera className="rf-field-icon" />Screenshot (Highly Recommended)</label>
                        <p className="rf-field-hint">Screenshots of chats, payment requests, or calls are very helpful for our investigation.</p>
                        {screenshotPreview ? (
                          <div className="rf-preview-wrapper">
                            <img src={screenshotPreview} alt="Screenshot preview" className="rf-preview-img" />
                            <div className="rf-preview-info">
                              <span>{screenshotName}</span>
                              <button type="button" className="rf-remove-btn" onClick={removeScreenshot}><FaTimesCircle /> Remove</button>
                            </div>
                          </div>
                        ) : (
                          <div className="rf-upload-area" onClick={() => fileInputRef.current?.click()}>
                            <FaUpload className="rf-upload-icon" />
                            <p>Click to upload screenshot</p>
                            <span>PNG, JPG, JPEG up to 5MB</span>
                          </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
                      </div>
                      <button type="submit" className="rf-btn-submit" disabled={loading}>
                        {loading ? (<><span className="rf-spinner" /> Submitting...</>) : (<><FaExclamationTriangle className="me-2" /> Submit Fraud Report</>)}
                      </button>
                    </form>
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Process Section - full width */}
          <div className="rf-full-section">
            <div className="rf-process-section">
              <h3 className="rf-process-title">What Happens After You Report?</h3>
              <div className="rf-process-steps">
                <div className="rf-process-step">
                  <div className="rf-process-num">1</div>
                  <div className="rf-process-icon"><FaCheckCircle /></div>
                  <h4>Report Received</h4>
                  <p>Your report is instantly logged in our secure system and flagged for immediate review.</p>
                </div>
                <div className="rf-process-step">
                  <div className="rf-process-num">2</div>
                  <div className="rf-process-icon"><FaEye /></div>
                  <h4>Investigation</h4>
                  <p>Our security team reviews your report within 24–48 hours and investigates the number.</p>
                </div>
                <div className="rf-process-step">
                  <div className="rf-process-num">3</div>
                  <div className="rf-process-icon"><FaExclamationTriangle /></div>
                  <h4>Blacklisted</h4>
                  <p>If confirmed, the scammer is immediately added to our public blacklist database.</p>
                </div>
                <div className="rf-process-step">
                  <div className="rf-process-num">4</div>
                  <div className="rf-process-icon"><FaShieldAlt /></div>
                  <h4>Community Protected</h4>
                  <p>Anyone who searches that number will now see a SCAMMER ALERT — protecting thousands.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Info Box - full width */}
          <div className="rf-full-section rf-full-section-last">
            <div className="rf-info-box">
              <h6 className="rf-info-title"><FaShieldAlt className="me-2" />Your Privacy is Our Priority</h6>
              <ul className="rf-info-list">
                <li>Your name and phone number are <strong>never shared</strong> with anyone including the reported person</li>
                <li>All reports are stored on encrypted, secure servers accessible only to our security team</li>
                <li>You will never be contacted by the scammer — your identity is 100% protected</li>
                <li>Verified scammers are added to our public blacklist visible to all users</li>
                <li>Multiple reports against the same number result in immediate permanent blacklisting</li>
              </ul>
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
};

export default ReportFraud;