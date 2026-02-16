import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';
import logo from '../assets/golden logo.jpeg';

const Navbar = () => {
  const location = useLocation();
  
  // Function to close mobile navbar when link is clicked
  const closeNavbar = () => {
    const navbarCollapse = document.getElementById('navbarNav');
    if (navbarCollapse && navbarCollapse.classList.contains('show')) {
      const bsCollapse = new window.bootstrap.Collapse(navbarCollapse);
      bsCollapse.hide();
    }
  };

  // Function to check if link is active
  const isActive = (path) => {
    return location.pathname === path;
  };

  // Function to handle download app click
  const handleDownloadApp = () => {
    alert("This app is under maintenance. Please check back later!");
    closeNavbar();
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-custom shadow-lg">
      <div className="container px-4">
        {/* Brand/Logo */}
        <Link className="navbar-brand d-flex align-items-center" to="/">
          <img 
            src={logo} 
            alt="Golden Skills Logo" 
            className="navbar-logo me-3"
          />
          <span className="brand-text">Golden Skills</span>
        </Link>

        {/* Mobile Toggle Button */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navigation Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto me-3">
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/') ? 'active' : ''}`} 
                to="/" 
                onClick={closeNavbar}
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/about') ? 'active' : ''}`} 
                to="/about" 
                onClick={closeNavbar}
              >
                About
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/courses') ? 'active' : ''}`} 
                to="/courses" 
                onClick={closeNavbar}
              >
                Courses
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/tasks') ? 'active' : ''}`} 
                to="/tasks" 
                onClick={closeNavbar}
              >
                Tasks
              </Link>
            </li>
            <li className="nav-item">
              <Link 
                className={`nav-link ${isActive('/contact') ? 'active' : ''}`} 
                to="/contact" 
                onClick={closeNavbar}
              >
                Contact
              </Link>
            </li>
          </ul>

          {/* Download App Button */}
          <div className="d-flex">
            <button className="btn-download-app" onClick={handleDownloadApp}>
              Download App
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;