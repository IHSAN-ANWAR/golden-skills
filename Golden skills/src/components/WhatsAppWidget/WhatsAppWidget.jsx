import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { API_ENDPOINTS } from '../../config/apiConfig';
import './WhatsAppWidget.css';

const WhatsAppWidget = () => {
  const location = useLocation();
  const [number, setNumber] = useState('');
  const [message, setMessage] = useState('Hello! I am interested in Golden Skills.');
  const [enabled, setEnabled] = useState(false);
  const [tooltip, setTooltip] = useState(false);

  // Check if current route is admin panel
  const isAdminRoute = location.pathname.startsWith('/admin');

  useEffect(() => {
    fetch(API_ENDPOINTS.SETTINGS.GET_WHATSAPP)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.whatsappNumber && data.whatsappEnabled) {
          setNumber(data.whatsappNumber);
          setMessage(data.whatsappMessage || 'Hello! I am interested in Golden Skills.');
          setEnabled(true);
        }
      })
      .catch(() => {});
  }, []);

  // Hide on admin panel routes
  if (!enabled || !number || isAdminRoute) return null;

  const handleClick = () => {
    const cleaned = number.replace(/\D/g, '');
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleaned}?text=${encoded}`, '_blank');
  };

  return (
    <div className="wa-widget">
      {tooltip && (
        <div className="wa-tooltip">Chat with us on WhatsApp</div>
      )}
      <button
        className="wa-btn"
        onClick={handleClick}
        onMouseEnter={() => setTooltip(true)}
        onMouseLeave={() => setTooltip(false)}
        aria-label="Chat on WhatsApp"
      >
        {/* WhatsApp SVG icon */}
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="wa-icon">
          <path d="M16 0C7.163 0 0 7.163 0 16c0 2.82.736 5.469 2.027 7.77L0 32l8.43-2.007A15.93 15.93 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.77-1.852l-.486-.288-5.01 1.194 1.218-4.878-.317-.502A13.267 13.267 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333z" fill="#fff"/>
          <path d="M23.2 19.467c-.4-.2-2.353-1.16-2.72-1.294-.366-.133-.632-.2-.899.2-.266.4-1.032 1.294-1.265 1.56-.233.267-.466.3-.866.1-.4-.2-1.688-.623-3.214-1.983-1.188-1.06-1.99-2.369-2.224-2.769-.233-.4-.025-.616.175-.815.18-.178.4-.467.6-.7.2-.233.267-.4.4-.666.133-.267.066-.5-.033-.7-.1-.2-.9-2.167-1.233-2.967-.325-.78-.655-.674-.9-.686l-.766-.013c-.267 0-.7.1-1.067.5-.366.4-1.4 1.367-1.4 3.334s1.434 3.867 1.634 4.133c.2.267 2.82 4.3 6.833 6.034.955.412 1.7.658 2.28.842.957.305 1.83.262 2.52.159.768-.115 2.353-.963 2.686-1.893.333-.93.333-1.727.233-1.893-.1-.167-.366-.267-.766-.467z" fill="#fff"/>
        </svg>
        <span className="wa-pulse" />
      </button>
    </div>
  );
};

export default WhatsAppWidget;
