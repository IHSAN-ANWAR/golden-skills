import { useState, useEffect } from 'react';
import './AlertBanner.css';

const AlertBanner = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Update CSS variable when banner visibility changes
    if (isVisible) {
      document.documentElement.style.setProperty('--alert-banner-height', '60px');
    } else {
      document.documentElement.style.setProperty('--alert-banner-height', '0px');
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="alert-banner">
      <div className="alert-content">
     
        <p className="alert-text">
  <strong>Important Notice:</strong> Golden Skills Company only accepts payments to our official FBR-registered account (Title: Shaila Rani). 

</p>
        <button 
          className="alert-close"
          onClick={() => setIsVisible(false)}
          aria-label="Close alert"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default AlertBanner;
