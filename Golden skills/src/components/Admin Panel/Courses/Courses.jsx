import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaBook, FaClock, FaDollarSign, FaStar, FaUsers, FaSearch } from 'react-icons/fa';
import './Courses.css';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const sampleCourses = [
      {
        id: 1,
        title: 'Professional Content Writing Masterclass',
        category: 'Content Writing',
        description: 'Learn professional content writing techniques',
        duration: 40,
        price: 99.99,
        level: 'Beginner',
        students: 1250,
        rating: 4.8,
        published: true,
        tags: ['Writing', 'Content', 'Copywriting'],
        image: null
      },
      {
        id: 2,
        title: 'Digital Marketing Complete Course',
        category: 'Digital Marketing',
        description: 'Master digital marketing strategies and tools',
        duration: 25,
        price: 79.99,
        level: 'Intermediate',
        students: 850,
        rating: 4.9,
        published: true,
        tags: ['Marketing', 'Digital', 'Social Media'],
        image: null
      },
      {
        id: 3,
        title: 'Graphic Design Fundamentals',
        category: 'Graphic Design',
        description: 'Learn the principles of graphic design',
        duration: 30,
        price: 89.99,
        level: 'Beginner',
        students: 620,
        rating: 4.7,
        published: true,
        tags: ['Design', 'Graphics', 'Creative'],
        image: null
      }
    ];
    setCourses(sampleCourses);
    setLoading(false);
  };

  const handleAddCourse = () => {
    setModalMode('add');
    setSelectedCourse(null);
    setShowModal(true);
  };

  const handleEditCourse = (course) => {
    setModalMode('edit');
    setSelectedCourse(course);
    setShowModal(true);
  };

  const handleDeleteCourse = (courseId) => {
    if (window.confirm('Are you sure you want to delete this course?')) {
      setCourses(courses.filter(c => c.id !== courseId));
    }
  };

  const handleSaveCourse = (courseData) => {
    if (modalMode === 'add') {
      const newCourse = {
        ...courseData,
        id: Date.now()
      };
      setCourses([...courses, newCourse]);
    } else {
      setCourses(courses.map(c => 
        c.id === selectedCourse.id ? { ...courseData, id: selectedCourse.id } : c
      ));
    }
    setShowModal(false);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="loading">Loading courses...</div>;
  }

  return (
    <>
      {/* Header Section */}
      <div className="courses-header-section">
        <div className="search-add-container">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          <button className="btn-add-course" onClick={handleAddCourse}>
            <FaPlus /> Add Course
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="courses-stats">
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #390910 0%, #772218 100%)' }}>
            <FaBook className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-number">{courses.length}</h3>
            <p className="stat-label">Total Courses</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #E6C547 100%)' }}>
            <FaUsers className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-number">{courses.reduce((sum, c) => sum + c.students, 0).toLocaleString()}</h3>
            <p className="stat-label">Total Students</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #B8860B 0%, #DAA520 100%)' }}>
            <FaStar className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-number">
              {courses.length > 0 ? (courses.reduce((sum, c) => sum + c.rating, 0) / courses.length).toFixed(1) : '0.0'}
            </h3>
            <p className="stat-label">Avg Rating</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-wrapper" style={{ background: 'linear-gradient(135deg, #772218 0%, #8b2a1f 100%)' }}>
            <FaDollarSign className="stat-icon" />
          </div>
          <div className="stat-details">
            <h3 className="stat-number">${courses.reduce((sum, c) => sum + c.price, 0).toFixed(0)}</h3>
            <p className="stat-label">Total Revenue</p>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      <div className="courses-table-container">
        <table className="courses-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Category</th>
              <th>Level</th>
              <th>Duration</th>
              <th>Price</th>
              <th>Students</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredCourses.length === 0 ? (
              <tr>
                <td colSpan="9" className="no-courses-row">
                  <div className="no-courses-content">
                    <FaBook className="no-courses-icon" />
                    <h3>No courses found</h3>
                    <p>Start by adding your first course</p>
                    <button className="btn-add-first" onClick={handleAddCourse}>
                      <FaPlus /> Add Course
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredCourses.map(course => (
                <tr key={course.id} className="course-row">
                  <td>
                    <div className="course-info">
                      <div className="course-icon-box">
                        <FaBook />
                      </div>
                      <div className="course-text">
                        <div className="course-title">{course.title}</div>
                        <div className="course-description">{course.description}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="category-badge">{course.category}</span>
                  </td>
                  <td>
                    <span className={`level-badge level-${course.level.toLowerCase()}`}>
                      {course.level}
                    </span>
                  </td>
                  <td>
                    <div className="duration-cell">
                      <FaClock className="cell-icon" />
                      <span>{course.duration}h</span>
                    </div>
                  </td>
                  <td>
                    <div className="price-cell">
                      <FaDollarSign className="cell-icon" />
                      <span>${course.price}</span>
                    </div>
                  </td>
                  <td>
                    <div className="students-cell">
                      <FaUsers className="cell-icon" />
                      <span>{course.students.toLocaleString()}</span>
                    </div>
                  </td>
                  <td>
                    <div className="rating-cell">
                      <FaStar className="cell-icon star-icon" />
                      <span>{course.rating}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${course.published ? 'published' : 'draft'}`}>
                      {course.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="action-btn view-btn"
                        onClick={() => alert('View course details')}
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEditCourse(course)}
                        title="Edit Course"
                      >
                        <FaEdit />
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteCourse(course.id)}
                        title="Delete Course"
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
        <CourseModal
          mode={modalMode}
          course={selectedCourse}
          onSave={handleSaveCourse}
          onCancel={() => setShowModal(false)}
        />
      )}
    </>
  );
};

// Course Modal Component
const CourseModal = ({ mode, course, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: course?.title || '',
    category: course?.category || 'Content Writing'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const courseData = {
      title: formData.title,
      category: formData.category,
      description: formData.title,
      duration: 10,
      price: 49.99,
      level: 'Beginner',
      tags: [],
      published: true,
      students: course?.students || 0,
      rating: course?.rating || 0,
      image: null
    };
    
    onSave(courseData);
    setIsSubmitting(false);
  };

  return (
    <div className="add-course-overlay" onClick={onCancel}>
      <div className="add-course-modal" onClick={(e) => e.stopPropagation()}>
        <div className="add-course-header">
          <h2 className="add-course-title">
            <FaBook className="me-2" />
            {mode === 'add' ? 'Add New Course' : 'Edit Course'}
          </h2>
          <button className="btn-close-custom" onClick={onCancel}>
            <span>×</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="add-course-form">
          <div className="form-group-simple">
            <label className="form-label">Course Title *</label>
            <input
              type="text"
              className="form-control form-control-lg"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Advanced Content Writing Techniques"
              required
              autoFocus
            />
          </div>

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
              <option value="Social Media Marketing">Social Media Marketing</option>
              <option value="SEO & Analytics">SEO & Analytics</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile App Development">Mobile App Development</option>
              <option value="UI/UX Design">UI/UX Design</option>
              <option value="Photography">Photography</option>
              <option value="Business & Entrepreneurship">Business & Entrepreneurship</option>
              <option value="Data Analysis">Data Analysis</option>
            </select>
          </div>

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
                  {mode === 'add' ? 'Create Course' : 'Save Changes'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Courses;
