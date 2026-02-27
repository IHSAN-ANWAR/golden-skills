import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './CourseManager.css';
import { FaGraduationCap, FaBook, FaClipboardList, FaCheckCircle, FaHistory } from 'react-icons/fa';
import Courses from '../Courses/Courses';
import CoursePlans from '../CoursePlans/CoursePlans';
import CourseVerifications from '../CourseVerifications/CourseVerifications';
import CourseHistory from '../CourseHistory/CourseHistory';

const CourseManager = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('courses');

  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('course-plans')) {
      setActiveTab('course-plans');
    } else if (path.includes('course-verifications')) {
      setActiveTab('verifications');
    } else if (path.includes('course-history')) {
      setActiveTab('history');
    } else if (path.includes('courses')) {
      setActiveTab('courses');
    } else {
      setActiveTab('courses');
    }
  }, [location.pathname]);

  const tabs = [
    {
      id: 'courses',
      title: 'All Courses',
      icon: <FaBook />,
      component: <Courses />
    },
    {
      id: 'course-plans',
      title: 'Course Plans',
      icon: <FaClipboardList />,
      component: <CoursePlans />
    },
    {
      id: 'verifications',
      title: 'Verifications',
      icon: <FaCheckCircle />,
      component: <CourseVerifications />
    },
    {
      id: 'history',
      title: 'Course History',
      icon: <FaHistory />,
      component: <CourseHistory />
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="course-manager-container" style={{minHeight: '100vh', background: '#f8fafc'}}>
      {/* Tab Navigation */}
      <div className="tabs-navigation">
        <div className="tabs-buttons">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              <span>{tab.title}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTabData && activeTabData.component}
      </div>
    </div>
  );
};

export default CourseManager;
