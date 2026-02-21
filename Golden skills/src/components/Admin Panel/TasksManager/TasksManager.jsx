import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './TasksManager.css';
import { FaTasks, FaPaperPlane, FaHistory, FaClipboardList, FaCheckCircle, FaClock } from 'react-icons/fa';
import AssignTask from '../AssignTask/AssignTask';
import UserTaskHistory from '../UserTaskHistory/UserTaskHistory';
import TaskHistory from '../TaskHistory/TaskHistory';
import SubmittedTasks from '../SubmittedTasks/SubmittedTasks';
import PlansModal from '../Tasks/PlansModal';

const TasksManager = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('verifications');

  const [showPlansModal, setShowPlansModal] = useState(false);

  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('verifications')) {
      setActiveTab('verifications');
    } else if (path.includes('send-message') || path.includes('send-task')) {
      setActiveTab('send-task');
    } else if (path.includes('pending-tasks')) {
      setActiveTab('pending-tasks');
    } else if (path.includes('submitted-tasks') || path.includes('review-tasks')) {
      setActiveTab('review-tasks');
    } else if (path.includes('task-history') || path.includes('all-tasks')) {
      setActiveTab('history');
    } else {
      setActiveTab('verifications');
    }
  }, [location.pathname]);

  const tabs = [
    {
      id: 'verifications',
      title: 'Verifications',
      icon: <FaCheckCircle />,
      component: <TaskHistory />
    },
    {
      id: 'send-task',
      title: 'Send Task',
      icon: <FaPaperPlane />,
      component: <AssignTask />
    },
    {
      id: 'pending-tasks',
      title: 'Pending Tasks',
      icon: <FaClock />,
      component: <UserTaskHistory initialFilter="assigned" mode="pending" />
    },
    {
      id: 'review-tasks',
      title: 'Submitted Tasks',
      icon: <FaCheckCircle />,
      component: <SubmittedTasks />
    },
    {
      id: 'history',
      title: 'Task History',
      icon: <FaHistory />,
      component: <UserTaskHistory initialFilter="approved" mode="history" />
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="tasks-manager-container" style={{minHeight: '100vh', background: '#f8fafc'}}>
      {/* Floating Plans Button - Right Corner */}
      <button 
        className="floating-plans-button"
        onClick={() => setShowPlansModal(true)}
        title="Manage Plans"
      >
        <FaClipboardList className="floating-icon" />
      </button>

      {/* Plans Modal */}
      {showPlansModal && (
        <PlansModal 
          onClose={() => setShowPlansModal(false)} 
        />
      )}

      {/* Tab Navigation */}
      <div className="tabs-navigation">
        <div className="tabs-header">
          <h1><FaTasks /> Tasks Management</h1>
          <p>Manage all task-related operations from one place</p>
        </div>
        
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

export default TasksManager;
