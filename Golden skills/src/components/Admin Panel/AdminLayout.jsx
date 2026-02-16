import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import AdminSidebar from './AdminSidebar';
import './AdminLayout.css';

const AdminLayout = ({ children, title, subtitle }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-layout">
      {/* Admin Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      
      {/* Main Content */}
      <div className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Top Bar */}
        <div className="admin-top-bar">
          <div className="top-bar-left">
            <button className="sidebar-toggle" onClick={toggleSidebar}>
              <FaBars />
            </button>
            <div className="page-title-container">
              <h1 className="page-title">{title || 'Admin Panel'}</h1>
              {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
          </div>
          <div className="top-bar-right">
            <div className="admin-info">
              <span className="admin-name">Admin User</span>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;