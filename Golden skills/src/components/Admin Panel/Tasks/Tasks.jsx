import './Tasks.css';
import { FaTasks } from 'react-icons/fa';

const Tasks = () => {
  return (
    <div className="simple-tasks-container">
      <div className="no-tasks-content">
        <FaTasks className="no-tasks-icon" />
        <h3>Tasks Section</h3>
        <p>Task management features are available in other sections</p>
      </div>
    </div>
  );
};

export default Tasks;