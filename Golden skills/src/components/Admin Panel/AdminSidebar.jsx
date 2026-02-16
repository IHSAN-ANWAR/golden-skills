import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaBook, 
  FaTasks, 
  FaMoneyBillWave, 
  FaChartBar, 
  FaCog, 
  FaSignOutAlt
} from 'react-icons/fa';
import logo from '../../assets/golden logo.jpeg';
import './AdminSidebar.css';

const AdminSidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();

  const menuItems = [
    {
      id: 1,
      title: 'Dashboard',
      icon: FaTachometerAlt,
      path: '/admin/dashboard'
    },
    {
      id: 2,
      title: 'Users',
      icon: FaUsers,
      path: '/admin/users'
    },
    {
      id: 3,
      title: 'Courses',
      icon: FaBook,
      path: '/admin/courses'
    },
    {
      id: 4,
      title: 'Tasks',
      icon: FaTasks,
      path: '/admin/tasks'
    },
    {
      id: 5,
      title: 'Transactions',
      icon: FaMoneyBillWave,
      path: '/admin/transactions'
    },
    {
      id: 6,
      title: 'Reports',
      icon: FaChartBar,
      path: '/admin/reports'
    },
    {
      id: 7,
      title: 'Settings',
      icon: FaCog,
      path: '/admin/settings'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}
      
      {/* Sidebar */}
      <div className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-circle">
              <img src={logo} alt="Golden Skills Logo" className="logo-image" />
            </div>
            <h2 className="logo-text">Golden Skills</h2>
          </div>
          <button className="close-btn" onClick={toggleSidebar}>
            ×
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <ul className="admin-nav-menu">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <li key={item.id} className="admin-nav-item">
                  <Link
                    to={item.path}
                    className={`admin-nav-link ${isActive(item.path) ? 'active' : ''}`}
                    onClick={() => {
                      if (window.innerWidth < 992) {
                        toggleSidebar();
                      }
                    }}
                  >
                    <IconComponent className="admin-nav-icon" />
                    <span className="admin-nav-text">{item.title}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="sidebar-footer">
          <button className="logout-btn">
            <FaSignOutAlt className="logout-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;