import { useNavigate } from 'react-router-dom';
import { FaUsers, FaBook, FaTasks, FaBullhorn, FaUniversity, FaShieldAlt, FaProjectDiagram, FaFlag, FaWhatsapp, FaSearchPlus } from 'react-icons/fa';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();

  const categories = [
    {
      id: 1,
      title: 'User Management',
      description: 'Manage all registered users',
      icon: FaUsers,
      color: '#390910',
      path: '/admin/users'
    },
    {
      id: 2,
      title: 'Course Management',
      description: 'Add, edit, and manage courses',
      icon: FaBook,
      color: '#D4AF37',
      path: '/admin/courses'
    },
    {
      id: 3,
      title: 'Tasks Management',
      description: 'Manage verifications, plans & tasks',
      icon: FaTasks,
      color: '#772218',
      path: '/admin/tasks'
    },
    {
      id: 4,
      title: 'Promotions',
      description: 'Manage promotions & rewards',
      icon: FaBullhorn,
      color: '#5A0F15',
      path: '/admin/promotions'
    },
    {
      id: 5,
      title: 'Account Details',
      description: 'Manage bank & payment accounts',
      icon: FaUniversity,
      color: '#B8860B',
      path: '/admin/account-details'
    },
    {
      id: 6,
      title: 'Referral System',
      description: 'View referral trees & track referrals',
      icon: FaProjectDiagram,
      color: '#1a6b3a',
      path: '/admin/referrals'
    },
    {
      id: 7,
      title: 'Team Management',
      description: 'Manage team members & blacklist scammers',
      icon: FaShieldAlt,
      color: '#390910',
      path: '/admin/team-management'
    },
    {
      id: 8,
      title: 'Fraud Reports',
      description: 'Review fraud reports submitted by users',
      icon: FaFlag,
      color: '#dc3545',
      path: '/admin/fraud-reports'
    },
    {
      id: 9,
      title: 'Site Settings',
      description: 'Manage WhatsApp widget & site config',
      icon: FaWhatsapp,
      color: '#25D366',
      path: '/admin/site-settings'
    },
    {
      id: 10,
      title: 'Search Tracking',
      description: 'Track repeated suspicious number searches',
      icon: FaSearchPlus,
      color: '#6f42c1',
      path: '/admin/search-tracking'
    }
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-grid">
        {categories.map((category) => {
          const IconComponent = category.icon;
          return (
            <div
              key={category.id}
              className="category-card"
              onClick={() => handleCardClick(category.path)}
            >
              <div className="card-icon" style={{ background: category.color }}>
                <IconComponent />
              </div>
              <h3>{category.title}</h3>
              <p>{category.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;