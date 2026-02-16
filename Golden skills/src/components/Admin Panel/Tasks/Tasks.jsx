import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaTasks, FaUsers, FaCheckCircle, FaClock } from 'react-icons/fa';
import './Tasks.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/admin/all?page=1&limit=100`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTasks(data.tasks);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_BASE_URL}/api/auth/users?page=1&limit=1000`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleAddTask = () => {
    setModalMode('add');
    setSelectedTask(null);
    setShowModal(true);
  };

  const handleEditTask = (task) => {
    setModalMode('edit');
    setSelectedTask(task);
    setShowModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await fetch(`${API_BASE_URL}/api/admin/delete/${taskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        const data = await response.json();
        
        if (data.success) {
          setTasks(tasks.filter(t => t._id !== taskId));
          alert('Task deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
      }
    }
  };

  const handleSaveTask = async (taskData) => {
    try {
      const token = localStorage.getItem('adminToken');
      const url = modalMode === 'add' 
        ? `${API_BASE_URL}/api/admin/create`
        : `${API_BASE_URL}/api/admin/update/${selectedTask._id}`;
      
      const response = await fetch(url, {
        method: modalMode === 'add' ? 'POST' : 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        fetchTasks(); // Refresh the list
        setShowModal(false);
        alert(modalMode === 'add' ? 'Task created successfully!' : 'Task updated successfully!');
      } else {
        alert(data.message || 'Failed to save task');
      }
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div className="loading">Loading tasks...</div>;
  }

  const activeTasks = tasks.filter(t => t.status === 'active').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  return (
    <>
      {/* Header Section */}
      <div className="tasks-header-section">
        <button className="btn-add-task" onClick={handleAddTask}>
          <FaPlus /> Add Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="tasks-stats">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #390910 0%, #772218 100%)' }}>
            <FaTasks className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-number">{tasks.length}</h3>
            <p className="stat-label">Total Tasks</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #E6C547 100%)' }}>
            <FaClock className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-number">{activeTasks}</h3>
            <p className="stat-label">Active Tasks</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <FaCheckCircle className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-number">{completedTasks}</h3>
            <p className="stat-label">Completed</p>
          </div>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="tasks-table-container">
        <table className="tasks-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Category</th>
              <th>Points</th>
              <th>Deadline</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-tasks-row">
                  <div className="no-tasks-content">
                    <FaTasks className="no-tasks-icon" />
                    <h3>No tasks yet</h3>
                    <p>Start by creating your first task</p>
                    <button className="btn-add-first" onClick={handleAddTask}>
                      <FaPlus /> Add Task
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              tasks.map(task => (
                <tr key={task._id} className="task-row">
                  <td>
                    <div className="task-info">
                      <div className="task-icon-box">
                        <FaTasks />
                      </div>
                      <div className="task-text">
                        <div className="task-title">{task.title}</div>
                        <div className="task-description">{task.description}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">{task.category}</span>
                  </td>
                  <td>
                    <div className="points-cell">
                      <span className="points-badge">{task.points} pts</span>
                    </div>
                  </td>
                  <td>
                    <div className="deadline-cell">
                      <FaClock className="cell-icon" />
                      <span>{formatDate(task.deadline)}</span>
                    </div>
                  </td>
                  <td>
                    {task.assignedTo === 'all' ? (
                      <span className="assigned-badge all">All Users</span>
                    ) : (
                      <span className="assigned-badge specific">
                        <FaUsers /> {task.specificUsers?.length || 0} Users
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`status-badge ${task.status}`}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => alert('View task details')}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEditTask(task)}
                        title="Edit Task"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteTask(task._id)}
                        title="Delete Task"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <TaskModal
          mode={modalMode}
          task={selectedTask}
          users={users}
          onSave={handleSaveTask}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  );
};

// Task Modal Component
const TaskModal = ({ mode, task, users, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    category: task?.category || 'Content Writing',
    points: task?.points || 10,
    deadline: task?.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
    assignedTo: task?.assignedTo || 'all',
    specificUsers: task?.specificUsers?.map(u => u._id) || []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUserSelection = (userId) => {
    setFormData(prev => ({
      ...prev,
      specificUsers: prev.specificUsers.includes(userId)
        ? prev.specificUsers.filter(id => id !== userId)
        : [...prev.specificUsers, userId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await onSave(formData);
    
    setIsSubmitting(false);
  };

  return (
    <div className="add-task-overlay" onClick={onCancel}>
      <div className="add-task-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-task-header">
          <h2 className="add-task-title">
            <FaTasks className="me-2" />
            {mode === 'add' ? 'Add New Task' : 'Edit Task'}
          </h2>
          <button className="btn-close-custom" onClick={onCancel}>
            <span>×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-task-form">
          <div className="form-group-simple">
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              className="form-control form-control-lg"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Write a blog post about digital marketing"
              required
              autoFocus
            />
          </div>

          <div className="form-group-simple">
            <label className="form-label">Description *</label>
            <textarea
              className="form-control"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the task requirements..."
              required
            ></textarea>
          </div>

          <div className="form-row-two">
            <div className="form-group-simple">
              <label className="form-label">Category *</label>
              <select 
                className="form-select form-select-lg"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="Content Writing">Content Writing</option>
                <option value="Digital Marketing">Digital Marketing</option>
                <option value="Graphic Design">Graphic Design</option>
                <option value="Video Editing">Video Editing</option>
                <option value="Social Media">Social Media</option>
                <option value="SEO">SEO</option>
                <option value="Photography">Photography</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group-simple">
              <label className="form-label">Points *</label>
              <input
                type="number"
                className="form-control form-control-lg"
                name="points"
                value={formData.points}
                onChange={handleChange}
                placeholder="10"
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-group-simple">
            <label className="form-label">Deadline *</label>
            <input
              type="date"
              className="form-control form-control-lg"
              name="deadline"
              value={formData.deadline}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group-simple">
            <label className="form-label">Assign To *</label>
            <select 
              className="form-select form-select-lg"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              required
            >
              <option value="all">All Users</option>
              <option value="specific">Specific Users</option>
            </select>
          </div>

          {formData.assignedTo === 'specific' && (
            <div className="form-group-simple">
              <label className="form-label">Select Users *</label>
              <div className="users-selection-box">
                {users.length === 0 ? (
                  <p className="no-users-text">No users available</p>
                ) : (
                  users.map(user => (
                    <label key={user._id} className="user-checkbox-label">
                      <input
                        type="checkbox"
                        checked={formData.specificUsers.includes(user._id)}
                        onChange={() => handleUserSelection(user._id)}
                      />
                      <span>{user.fullName} (@{user.username})</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-lg"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Saving...
                </>
              ) : (
                <>
                  {mode === 'add' ? 'Create Task' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Tasks;
