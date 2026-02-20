import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaBook, FaClock, FaDollarSign, FaStar, FaUsers, FaSearch, FaLink, FaPaperPlane, FaTimes, FaHistory } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import CourseHistory from '../CourseHistory/CourseHistory';
import './Courses.css';

const COURSE_CATEGORIES = [
  { id: 'premium', label: 'Premium' },
  { id: 'pro', label: 'Pro' },
  { id: 'lite', label: 'Lite' }
];

const Courses = () => {
  const [activeTab, setActiveTab] = useState('list');
  const [courses, setCourses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Send Course Link tab state
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [linkLoading, setLinkLoading] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [courseCategory, setCourseCategory] = useState('premium');
  const [courseLink, setCourseLink] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (activeTab === 'send-link') {
      fetchApprovedUsers();
    } else if (activeTab === 'history' && courseHistoryRef.current) {
      // Refresh course history when switching to history tab
      courseHistoryRef.current.refresh();
    }
  }, [activeTab]);

  // Ref to pass refresh function to CourseHistory
  const courseHistoryRef = useRef(null);

  const fetchApprovedUsers = async () => {
    try {
      setLinkLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }
      const res = await fetch(`${API_ENDPOINTS.SUBMISSIONS.GET_ALL}?status=approved`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setApprovedUsers(data.submissions || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load users');
    } finally {
      setLinkLoading(false);
    }
  };

  const openLinkModal = (user) => {
    setSelectedUser(user);
    setCourseCategory('premium');
    setCourseLink('');
    setShowLinkModal(true);
  };

  const handleSendCourseLink = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    const trimmedCourseLink = courseLink.trim();
    if (!trimmedCourseLink) {
      alert('Please enter the course link');
      return;
    }

    // Validate link format early so we don't show confusing category errors
    let parsedUrl;
    try {
      parsedUrl = new URL(trimmedCourseLink);
    } catch {
      alert('Invalid course link. Please paste a full URL starting with https://');
      return;
    }
    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== 'http:') {
      alert('Invalid course link. Only http:// or https:// links are allowed.');
      return;
    }
    
    // Get the current category value directly from the select element
    // This ensures we get the actual selected value, not stale state
    const form = e.target;
    const categorySelect = form.querySelector('select[name="courseCategory"]') || form.querySelector('.template-select');
    let currentCategory = courseCategory;
    
    // Always get the value directly from the select element to avoid state timing issues
    if (categorySelect && categorySelect.value) {
      currentCategory = categorySelect.value;
      // Update state to keep it in sync
      if (currentCategory !== courseCategory) {
        setCourseCategory(currentCategory);
      }
    }
    
    console.log('Category check before sending:', {
      courseCategoryState: courseCategory,
      categoryFromSelect: categorySelect?.value,
      currentCategory: currentCategory,
      categoryType: typeof currentCategory,
      selectElementExists: !!categorySelect
    });
    
    setSending(true);
    
    // Validate and normalize category before sending
    // Ensure category is a string and normalize it
    let normalizedCategory = '';
    if (currentCategory) {
      normalizedCategory = String(currentCategory).toLowerCase().trim();
      // Remove any whitespace
      normalizedCategory = normalizedCategory.replace(/\s+/g, '');
    } else {
      normalizedCategory = String(courseCategory || '').toLowerCase().trim().replace(/\s+/g, '');
    }
    
    const validCategories = ['premium', 'pro', 'lite'];
    
    console.log('Category normalization:', {
      original: currentCategory || courseCategory,
      normalized: normalizedCategory,
      isValid: validCategories.includes(normalizedCategory),
      validCategories: validCategories,
      normalizedLength: normalizedCategory.length
    });
    
    if (!normalizedCategory || !validCategories.includes(normalizedCategory)) {
      alert(`Invalid category: "${currentCategory || courseCategory}". Please select Premium, Pro, or Lite.\n\nDebug info:\n- Selected value: "${currentCategory || courseCategory}"\n- Normalized: "${normalizedCategory}"\n- Valid options: ${validCategories.join(', ')}`);
      console.error('Category validation failed:', { 
        courseCategory, 
        currentCategory,
        normalizedCategory, 
        validCategories,
        courseCategoryType: typeof courseCategory,
        currentCategoryType: typeof currentCategory,
        courseCategoryLength: courseCategory?.length,
        normalizedLength: normalizedCategory.length,
        categorySelectValue: categorySelect?.value
      });
      setSending(false);
      return;
    }
    
    try {
      const token = localStorage.getItem('adminToken');
      
      const requestBody = {
        userPlanSubmissionId: selectedUser._id,
        category: normalizedCategory, // Use normalized category
        courseLink: trimmedCourseLink
      };
      
      console.log('Sending course link:', {
        originalCategory: courseCategory,
        normalizedCategory: normalizedCategory,
        fullRequest: requestBody
      });
      
      const res = await fetch(API_ENDPOINTS.COURSE_LINKS.SEND, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert(`Course link sent to ${selectedUser.userName} successfully!`);
        setShowLinkModal(false);
        // Reset form
        setCourseLink('');
        setCourseCategory('premium');
        // Switch to history tab to show the new record
        setActiveTab('history');
        // Refresh course history after a short delay to ensure data is saved
        setTimeout(() => {
          if (courseHistoryRef.current) {
            courseHistoryRef.current.refresh();
          }
        }, 500);
      } else {
        // Show detailed error message
        const errorMsg = data.message || 'Failed to send course link';
        console.error('Course link error:', {
          errorMessage: errorMsg,
          originalCategory: courseCategory,
          normalizedCategory: normalizedCategory,
          requestBody: requestBody,
          responseData: data,
          responseStatus: res.status
        });
        alert(`Error: ${errorMsg}\n\nCategory selected: "${courseCategory}"\nNormalized: "${normalizedCategory}"\nSent in request: "${requestBody.category}"\nValid categories: premium, pro, lite`);
      }
    } catch (err) {
      console.error('Network or other error:', err);
      alert(`Failed to send course link: ${err.message || 'Network error. Please check your connection and try again.'}`);
    } finally {
      setSending(false);
    }
  };

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
      {/* Tabs */}
      <div className="courses-tabs-nav">
        <button
          type="button"
          className={`courses-tab-btn ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          <FaBook /> Course List
        </button>
        <button
          type="button"
          className={`courses-tab-btn ${activeTab === 'send-link' ? 'active' : ''}`}
          onClick={() => setActiveTab('send-link')}
        >
          <FaLink /> Send Course Link
        </button>
        <button
          type="button"
          className={`courses-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FaHistory /> Course History
        </button>
      </div>

      {activeTab === 'list' && (
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
      )}

      {/* Send Course Link Tab */}
      {activeTab === 'send-link' && (
        <div className="send-course-link-section">
          <div className="send-link-header">
            <h1><FaLink /> Send Course Link to Users</h1>
            <p>Select a user, choose course category (Premium / Pro / Lite), and paste your course link to send via link</p>
         </div>
          {linkLoading ? (
            <div className="loading">Loading approved users...</div>
          ) : approvedUsers.length === 0 ? (
            <div className="no-users-box">
              <FaUsers size={60} />
              <h3>No Approved Users</h3>
              <p>Approve users in the Tasks → Verifications section first</p>
            </div>
          ) : (
            <div className="users-table-container send-link-table">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Plan</th>
                    <th>Price</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedUsers.map((user) => (
                    <tr key={user._id}>
                      <td><span className="user-id-badge">#{user.userId}</span></td>
                      <td>
                        <div className="user-name-cell">
                          <div className="user-avatar-small"><FaUsers /></div>
                          <span className="user-fullname">{user.userName}</span>
                        </div>
                      </td>
                      <td>{user.userEmail || 'N/A'}</td>
                      <td>{user.userPhone || 'N/A'}</td>
                      <td><span className="plan-title">{user.planTitle}</span></td>
                      <td><span>{user.planPrice}</span></td>
                      <td>
                        <button type="button" className="btn-send-link" onClick={() => openLinkModal(user)}>
                          <FaPaperPlane /> Send Link
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Send Course Link Modal */}
      {showLinkModal && selectedUser && (
        <div className="modal-overlay send-link-modal-overlay" onClick={() => setShowLinkModal(false)}>
          <div className="modal-content send-link-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Course Link to {selectedUser.userName}</h2>
              <button type="button" className="modal-close" onClick={() => setShowLinkModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="user-info-card">
                <div className="info-row">
                  <span className="info-label">User ID:</span>
                  <span className="info-value">#{selectedUser.userId}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Email:</span>
                  <span className="info-value">{selectedUser.userEmail || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Plan:</span>
                  <span className="info-value">{selectedUser.planTitle} – {selectedUser.planPrice}</span>
                </div>
              </div>
              <form onSubmit={handleSendCourseLink} className="message-form">
                <div className="form-group">
                  <label>Course Category *</label>
                  <select
                    name="courseCategory"
                    value={courseCategory || 'premium'}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log('Category selected from dropdown:', {
                        value: value,
                        type: typeof value,
                        length: value?.length,
                        charCodes: value ? Array.from(value).map(c => c.charCodeAt(0)) : []
                      });
                      // Ensure we're setting the exact value from the option
                      setCourseCategory(value);
                    }}
                    className="template-select"
                    required
                  >
                    {COURSE_CATEGORIES.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                  {/* Debug info - remove in production */}
                  {process.env.NODE_ENV === 'development' && (
                    <small style={{ display: 'block', marginTop: '5px', color: '#666', fontSize: '12px' }}>
                      Current category: "{courseCategory}" (type: {typeof courseCategory})
                    </small>
                  )}
                </div>
                <div className="form-group">
                  <label>Course Link *</label>
                  <input
                    type="text"
                    value={courseLink}
                    onChange={(e) => setCourseLink(e.target.value)}
                    placeholder="Paste your course link (e.g. from Google Drive, personal file)"
                    required
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowLinkModal(false)} disabled={sending}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-submit" disabled={sending}>
                    {sending ? 'Sending...' : <><FaPaperPlane /> Send Link</>}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Course History Tab */}
      {activeTab === 'history' && (
        <CourseHistory ref={courseHistoryRef} />
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
