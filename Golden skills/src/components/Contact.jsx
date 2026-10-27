import { useState } from 'react';
import { FaEnvelope, FaUser, FaPaperPlane, FaCheckCircle, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validationPatterns = {
    name: /^[a-zA-Z\s]{2,50}$/,
    email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    phone: /^[0-9]{10,15}$/,
    message: /^.{10,500}$/
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateField = (fieldName, value) => {
    const pattern = validationPatterns[fieldName];
    if (!value.trim()) return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
    if (!pattern.test(value.trim())) {
      switch (fieldName) {
        case 'name': return 'Name must be 2-50 characters and contain only letters';
        case 'email': return 'Please enter a valid email address';
        case 'phone': return 'Phone must be 10-15 digits';
        case 'message': return 'Message must be 10-500 characters';
        default: return 'Invalid input';
      }
    }
    return '';
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });
    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSubmitted(true);
    } catch (error) {
      setErrors({ submit: 'Failed to send message. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({ name: '', email: '', phone: '', message: '' });
    setErrors({});
    setSubmitted(false);
  };

  return (
    <div className="contact-page">

      {/* Hero */}
      <section className="contact-hero">
        <div className="contact-hero-overlay" />
        <div className="contact-hero-inner">
          <div className="contact-hero-content">
            <div className="contact-hero-icon">
              <FaEnvelope />
            </div>
            <h1 className="contact-hero-title">
              Get in <span className="contact-gradient-text">Touch</span>
            </h1>
            <p className="contact-hero-desc">
              Have questions or need support? We're here to help. Send us a message and we'll respond as soon as possible.
            </p>
          </div>
        </div>
      </section>

      {/* Form Section */}
      <section className="contact-form-section">
        <div className="contact-form-inner">

          {submitted ? (
            <div className="contact-success-card">
              <div className="contact-success-icon">
                <FaCheckCircle />
              </div>
              <h2 className="contact-success-title">Message Sent Successfully!</h2>
              <p className="contact-success-text">
                Thank you for contacting us. Our team will get back to you within 24-48 hours.
              </p>
              <button onClick={handleReset} className="contact-btn-reset">
                Send Another Message
              </button>
            </div>
          ) : (
            <div className="contact-grid">

              {/* Left: Form */}
              <div className="contact-form-card">
                <div className="contact-form-header">
                  <h2 className="contact-form-title">Send Us a Message</h2>
                  <p className="contact-form-subtitle">Fill out the form below and we'll respond shortly</p>
                </div>

                <form onSubmit={handleSubmit} className="contact-form">

                  {/* Name */}
                  <div className="contact-field">
                    <label className="contact-label">
                      <FaUser />
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`contact-input ${errors.name ? 'contact-input-error' : ''}`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <span className="contact-error">{errors.name}</span>}
                  </div>

                  {/* Email */}
                  <div className="contact-field">
                    <label className="contact-label">
                      <FaEnvelope />
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`contact-input ${errors.email ? 'contact-input-error' : ''}`}
                      placeholder="your.email@example.com"
                    />
                    {errors.email && <span className="contact-error">{errors.email}</span>}
                  </div>

                  {/* Phone */}
                  <div className="contact-field">
                    <label className="contact-label">
                      <FaPhone />
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`contact-input ${errors.phone ? 'contact-input-error' : ''}`}
                      placeholder="03001234567"
                    />
                    {errors.phone && <span className="contact-error">{errors.phone}</span>}
                  </div>

                  {/* Message */}
                  <div className="contact-field">
                    <label className="contact-label">
                      <FaPaperPlane />
                      Your Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={5}
                      className={`contact-textarea ${errors.message ? 'contact-input-error' : ''}`}
                      placeholder="Tell us how we can help you..."
                    />
                    {errors.message && <span className="contact-error">{errors.message}</span>}
                  </div>

                  {errors.submit && <div className="contact-submit-error">{errors.submit}</div>}

                  <button type="submit" disabled={isSubmitting} className="contact-btn-submit">
                    {isSubmitting ? (
                      <>
                        <span className="contact-spinner" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Right: Info Cards */}
              <div className="contact-info-cards">

                <div className="contact-info-card">
                  <div className="contact-info-icon email">
                    <FaEnvelope />
                  </div>
                  <h3 className="contact-info-title">Email Us</h3>
                  <p className="contact-info-text">goldenskillscompany@gmail.com</p>
                  <a href="mailto:goldenskillscompany@gmail.com" className="contact-info-link">Send Email →</a>
                </div>

                <div className="contact-info-card">
                  <div className="contact-info-icon phone">
                    <FaPhone />
                  </div>
                  <h3 className="contact-info-title">Call Us</h3>
                  <p className="contact-info-text">Available 9 AM - 6 PM (PKT)</p>
                  <a href="tel:+923001234567" className="contact-info-link">Call Now →</a>
                </div>

                <div className="contact-info-card">
                  <div className="contact-info-icon location">
                    <FaMapMarkerAlt />
                  </div>
                  <h3 className="contact-info-title">Visit Us</h3>
                  <p className="contact-info-text">Golden Skills Company<br />Pakistan</p>
                </div>

              </div>

            </div>
          )}

        </div>
      </section>

    </div>
  );
};

export default Contact;
