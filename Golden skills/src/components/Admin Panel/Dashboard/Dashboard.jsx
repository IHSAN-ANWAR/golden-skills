import { useNavigate } from 'react-router-dom';
import { FaUsers, FaBook, FaTasks, FaMoneyBillWave, FaChartLine, FaHeadset } from 'react-icons/fa';
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
      title: 'Analytics',
      description: 'View platform statistics',
      icon: FaChartLine,
      color: '#5A0F15',
      path: '/admin/analytics'
    },
    {
      id: 5,
      title: 'Earnings & Rewards',
      description: 'Track user earnings',
      icon: FaMoneyBillWave,
      color: '#E6C547',
      path: '/admin/earnings'
    },
    {
      id: 6,
      title: 'Support & Help',
      description: 'Manage user queries',
      icon: FaHeadset,
      color: '#B8860B',
      path: '/admin/support'
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