import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './PromotionsManager.css';
import { FaBullhorn, FaPaperPlane, FaHistory, FaClipboardList, FaCheckCircle, FaClock } from 'react-icons/fa';
import PromotionHistory from '../PromotionHistory/PromotionHistory';
import AssignPromotion from '../AssignPromotion/AssignPromotion';
import UserPromotionHistory from '../UserPromotionHistory/UserPromotionHistory';
import SubmittedPromotions from '../SubmittedPromotions/SubmittedPromotions';
import PromotionsModal from './PromotionsModal';

const PromotionsManager = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('verifications');
  const [showPromotionsModal, setShowPromotionsModal] = useState(false);

  // Set active tab based on URL
  useEffect(() => {
    const path = location.pathname;
    if (path.includes('promo-verifications')) {
      setActiveTab('verifications');
    } else if (path.includes('assign-promotion')) {
      setActiveTab('assign');
    } else if (path.includes('pending-promotions')) {
      setActiveTab('pending-tasks');
    } else if (path.includes('submitted-promotions')) {
      setActiveTab('review-tasks');
    } else if (path.includes('promotion-history')) {
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
      component: <PromotionHistory />
    },
    {
      id: 'assign',
      title: 'Assign Tasks',
      icon: <FaPaperPlane />,
      component: <AssignPromotion />
    },
    {
      id: 'pending-tasks',
      title: 'Pending Tasks',
      icon: <FaClock />,
      component: <UserPromotionHistory filter="active" mode="pending" />
    },
    {
      id: 'review-tasks',
      title: 'Submitted Tasks',
      icon: <FaCheckCircle />,
      component: <SubmittedPromotions />
    },
    {
      id: 'history',
      title: 'Promotion History',
      icon: <FaHistory />,
      component: <UserPromotionHistory filter="completed" mode="history" />
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="tasks-manager-container" style={{minHeight: '100vh', background: '#f8fafc'}}>
      {/* Floating Promotions Button - Right Corner */}
      <button
        className="floating-plans-button"
        onClick={() => setShowPromotionsModal(true)}
        title="Manage Promotions"
      >
        <FaBullhorn className="floating-icon" />
      </button>

      {/* Promotions Modal */}
      {showPromotionsModal && (
        <PromotionsModal onClose={() => setShowPromotionsModal(false)} />
      )}

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

export default PromotionsManager;
