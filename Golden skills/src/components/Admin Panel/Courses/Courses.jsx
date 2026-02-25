import { useState, useEffect, useRef } from 'react';
import { FaPlus, FaEdit, FaTrash, FaEye, FaBook, FaClock, FaDollarSign, FaStar, FaUsers, FaSearch, FaLink, FaPaperPlane, FaTimes, FaHistory, FaCheckCircle, FaQuestionCircle, FaCalendarAlt, FaEnvelope, FaExternalLinkAlt, FaClipboardList } from 'react-icons/fa';
import { API_ENDPOINTS } from '../../../config/apiConfig';
import CourseHistory from '../CourseHistory/CourseHistory';
import SubmittedCourses from '../SubmittedCourses/SubmittedCourses';
import CoursePlansModal from './CoursePlansModal';
import CourseVerifications from '../CourseVerifications/CourseVerifications';
import './Courses.css';

const COURSE_CATEGORIES = [
  { id: 'premium', label: 'Premium' },
  { id: 'pro', label: 'Pro' },
  { id: 'lite', label: 'Lite' }
];

const Courses = () => {
  const [activeTab, setActiveTab] = useState('verifications');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Course Plans Modal state
  const [showCoursePlansModal, setShowCoursePlansModal] = useState(false);

  // Send Course Link tab state
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [linkLoading, setLinkLoading] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [coursePlans, setCoursePlans] = useState([]);
  const [selectedCoursePlan, setSelectedCoursePlan] = useState(null);
  const [courseCategory, setCourseCategory] = useState('premium');
  const [courseLink, setCourseLink] = useState('');
  const [sending, setSending] = useState(false);

  // Pending and Completed courses state
  const [pendingCourses, setPendingCourses] = useState([]);
  const [submittedCourses, setSubmittedCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);

  // Quiz questions modal state
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedPendingCourse, setSelectedPendingCourse] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([
    { question: '', options: ['', ''], correctAnswer: '' }
  ]);

  useEffect(() => {
    if (activeTab === 'send-link') {
      fetchApprovedUsers();
      fetchCoursePlans(); // Fetch plans when opening send-link tab
    } else if (activeTab === 'pending') {
      fetchPendingCourses();
    } else if (activeTab === 'submitted') {
      fetchSubmittedCourses();
    } else if (activeTab === 'completed') {
      fetchCompletedCourses();
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
      const res = await fetch(`${API_ENDPOINTS.COURSE_PLAN_SUBMISSIONS.GET_ALL}?status=approved`, {
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

  const fetchCoursePlans = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.COURSE_PLANS.GET_ALL, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCoursePlans(data.plans || []);
      }
    } catch (err) {
      console.error('Failed to fetch course plans:', err);
    }
  };

  const fetchPendingCourses = async () => {
    try {
      setCoursesLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }
      const res = await fetch(`${API_ENDPOINTS.USER_COURSE_COMPLETIONS.GET_PENDING}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setPendingCourses(data.pendingCourses || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load pending courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchSubmittedCourses = async () => {
    try {
      setCoursesLoading(true);
      const token = localStorage.getItem('adminToken');
      console.log('Fetching submitted courses, token:', token ? 'exists' : 'missing');
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }
      const url = `${API_ENDPOINTS.USER_COURSE_COMPLETIONS.GET_SUBMITTED}`;
      console.log('Fetching from:', url);
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      console.log('Response status:', res.status);
      const data = await res.json();
      console.log('Response data:', data);
      if (data.success) {
        console.log('Submitted courses:', data.submissions);
        setSubmittedCourses(data.submissions || []);
      } else {
        console.error('API returned success=false:', data.message);
      }
    } catch (err) {
      console.error('Error fetching submitted courses:', err);
      alert('Failed to load submitted courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  const fetchCompletedCourses = async () => {
    try {
      setCoursesLoading(true);
      const token = localStorage.getItem('adminToken');
      if (!token) {
        window.location.href = '/admin/login';
        return;
      }
      const res = await fetch(`${API_ENDPOINTS.USER_COURSE_COMPLETIONS.GET_ALL}?status=approved`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setCompletedCourses(data.completions || []);
    } catch (err) {
      console.error(err);
      alert('Failed to load completed courses');
    } finally {
      setCoursesLoading(false);
    }
  };

  const handleSendQuizQuestions = (course) => {
    setSelectedPendingCourse(course);
    // Start with one empty question
    setQuizQuestions([
      { question: '', options: ['', ''], correctAnswer: '' }
    ]);
    setShowQuizModal(true);
  };

  const handleAddQuestion = () => {
    setQuizQuestions([...quizQuestions, { question: '', options: ['', ''], correctAnswer: '' }]);
  };

  const handleRemoveQuestion = (index) => {
    if (quizQuestions.length > 1) {
      setQuizQuestions(quizQuestions.filter((_, i) => i !== index));
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...quizQuestions];
    updated[index][field] = value;
    setQuizQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, value) => {
    const updated = [...quizQuestions];
    updated[qIndex].options[oIndex] = value;
    setQuizQuestions(updated);
  };

  const handleAddOption = (qIndex) => {
    const updated = [...quizQuestions];
    updated[qIndex].options.push('');
    setQuizQuestions(updated);
  };

  const handleRemoveOption = (qIndex, oIndex) => {
    const updated = [...quizQuestions];
    if (updated[qIndex].options.length > 2) {
      updated[qIndex].options.splice(oIndex, 1);
      setQuizQuestions(updated);
    }
  };

  const handleSaveQuizQuestions = async () => {
    // Validate questions
    const validQuestions = quizQuestions.filter(q => q.question.trim() !== '');
    if (validQuestions.length === 0) {
      alert('Please add at least one question');
      return;
    }

    // In a real implementation, you would save these questions to the database
    // For now, we'll just show a success message
    alert(`Quiz questions prepared for ${selectedPendingCourse.userName}!\n\nThe user will see these questions when they click "Complete Course" on their dashboard.`);
    setShowQuizModal(false);
  };

  const handleApproveCourse = async (completionId) => {
    if (!window.confirm('Are you sure you want to approve this course completion?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.USER_COURSE_COMPLETIONS.UPDATE_STATUS(completionId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'approved' })
      });

      const data = await res.json();
      if (data.success) {
        alert('Course completion approved successfully!');
        fetchSubmittedCourses(); // Refresh the list
      } else {
        alert(data.message || 'Failed to approve course completion');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to approve course completion');
    }
  };

  const handleRejectCourse = async (completionId) => {
    if (!window.confirm('Are you sure you want to reject this course completion?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const res = await fetch(API_ENDPOINTS.USER_COURSE_COMPLETIONS.UPDATE_STATUS(completionId), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });

      const data = await res.json();
      if (data.success) {
        alert('Course completion rejected');
        fetchSubmittedCourses(); // Refresh the list
      } else {
        alert(data.message || 'Failed to reject course completion');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to reject course completion');
    }
  };

  const openLinkModal = (user) => {
    setSelectedUser(user);
    // User already has a plan selected, use it directly
    setSelectedCoursePlan({
      category: user.planCategory,
      title: user.planTitle,
      price: user.planPrice
    });
    setCourseCategory(user.planCategory);
    setCourseLink('');
    setShowLinkModal(true); // Go directly to link input
  };

  const handlePlanSelected = (plan) => {
    setSelectedCoursePlan(plan);
    setCourseCategory(plan.category);
    setShowPlanModal(false);
    setShowLinkModal(true); // Then show link input
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

  return (
    <div className="courses-container">
      {/* Floating Plans Button - Right Corner */}
      <button 
        className="floating-plans-button"
        onClick={() => setShowCoursePlansModal(true)}
        title="Manage Course Plans"
      >
        <FaClipboardList className="floating-icon" />
      </button>

      {/* Course Plans Modal */}
      {showCoursePlansModal && (
        <CoursePlansModal 
          onClose={() => setShowCoursePlansModal(false)} 
        />
      )}

      {/* Tabs */}
      <div className="courses-tabs-nav">
        <button
          type="button"
          className={`courses-tab-btn ${activeTab === 'verifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('verifications')}
        >
          <FaCheckCircle /> Verifications
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
          className={`courses-tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <FaClock /> Pending Courses
        </button>
        <button
          type="button"
          className={`courses-tab-btn ${activeTab === 'submitted' ? 'active' : ''}`}
          onClick={() => setActiveTab('submitted')}
        >
          <FaPaperPlane /> Submitted Courses
        </button>
        <button
          type="button"
          className={`courses-tab-btn ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          <FaCheckCircle /> Completed Courses
        </button>
      </div>

      {/* Verifications Tab */}
      {activeTab === 'verifications' && (
        <CourseVerifications />
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
              <p>Approve users in the Courses → Verifications section first</p>
            </div>
          ) : (
            <div className="users-table-container send-link-table">
              <table className="users-table">
                <thead>
                  <tr>
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

      {/* Course Plan Selection Modal */}
      {showPlanModal && selectedUser && (
        <div className="modal-overlay send-link-modal-overlay" onClick={() => setShowPlanModal(false)}>
          <div className="modal-content send-link-modal plan-selection-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select Course Plan for {selectedUser.userName}</h2>
              <button type="button" className="modal-close" onClick={() => setShowPlanModal(false)}>
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
                  <span className="info-label">Task Plan:</span>
                  <span className="info-value">{selectedUser.planTitle} – {selectedUser.planPrice}</span>
                </div>
              </div>
              
              <div className="plan-selection-section">
                <h3>Choose a Course Plan</h3>
                <p className="plan-selection-desc">Select the course plan category for this user</p>
                
                {coursePlans.length === 0 ? (
                  <div className="no-plans-message">
                    <p>No course plans available. Please create course plans first.</p>
                  </div>
                ) : (
                  <div className="course-plans-grid">
                    {coursePlans.filter(plan => plan.isActive).map((plan) => (
                      <div 
                        key={plan._id} 
                        className={`course-plan-card ${plan.category}`}
                        onClick={() => handlePlanSelected(plan)}
                      >
                        <div className="plan-badge">{plan.category.toUpperCase()}</div>
                        <h4>{plan.title}</h4>
                        <div className="plan-price">{plan.price}</div>
                        {plan.description && <p className="plan-description">{plan.description}</p>}
                        {plan.features && plan.features.length > 0 && (
                          <ul className="plan-features">
                            {plan.features.slice(0, 3).map((feature, idx) => (
                              <li key={idx}>{feature}</li>
                            ))}
                          </ul>
                        )}
                        <button type="button" className="btn-select-plan">
                          Select {plan.category}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
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
                  <span className="info-label">Email:</span>
                  <span className="info-value">{selectedUser.userEmail || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Phone:</span>
                  <span className="info-value">{selectedUser.userPhone || 'N/A'}</span>
                </div>
                {selectedCoursePlan && (
                  <div className="info-row selected-course-plan">
                    <span className="info-label">Course Plan:</span>
                    <span className="info-value">
                      <span className={`plan-badge-inline ${selectedCoursePlan.category}`}>
                        {selectedCoursePlan.title}
                      </span>
                      {' – '}{selectedCoursePlan.price}
                    </span>
                  </div>
                )}
              </div>
              <form onSubmit={handleSendCourseLink} className="message-form">
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

      {/* Pending Courses Tab */}
      {activeTab === 'pending' && (
        <div className="pending-courses-section">
          <div className="section-header">
            <h1><FaClock /> Pending Courses</h1>
            <p>Courses assigned to users but not yet completed</p>
          </div>

          {coursesLoading ? (
            <div className="loading">Loading pending courses...</div>
          ) : pendingCourses.length === 0 ? (
            <div className="no-courses-message">
              <FaClock size={60} />
              <h3>No Pending Courses</h3>
              <p>All assigned courses have been completed</p>
            </div>
          ) : (
            <div className="courses-table-wrapper">
              <table className="courses-data-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Category</th>
                    <th>Course Link</th>
                    <th>Sent Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingCourses.map((course) => (
                    <tr key={course._id}>
                      <td>
                        <div className="user-name-cell">
                          <div className="user-avatar-small"><FaUsers /></div>
                          <span>{course.userName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="email-cell">
                          <FaEnvelope className="email-icon" />
                          <span>{course.userEmail || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`category-badge-${course.category}`}>
                          {course.category}
                        </span>
                      </td>
                      <td>
                        <div className="link-cell">
                          <FaLink className="link-icon" />
                          <a href={course.courseLink} target="_blank" rel="noopener noreferrer">
                            {course.courseLink.length > 40 
                              ? `${course.courseLink.substring(0, 40)}...` 
                              : course.courseLink}
                          </a>
                        </div>
                      </td>
                      <td>
                        <div className="date-cell">
                          <FaCalendarAlt className="date-icon" />
                          <span>{new Date(course.sentAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view-btn"
                            onClick={() => window.open(course.courseLink, '_blank')}
                            title="Open Course Link"
                          >
                            <FaExternalLinkAlt />
                          </button>
                          <button 
                            className="action-btn edit-btn"
                            onClick={() => handleSendQuizQuestions(course)}
                            title="Send Quiz Questions"
                          >
                            <FaQuestionCircle />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Submitted Courses Tab */}
      {activeTab === 'submitted' && (
        <SubmittedCourses />
      )}

      {/* Completed Courses Tab */}
      {activeTab === 'completed' && (
        <div className="completed-courses-section">
          <div className="section-header">
            <h1><FaCheckCircle /> Completed Courses</h1>
            <p>Courses completed by users with quiz answers</p>
          </div>

          {coursesLoading ? (
            <div className="loading">Loading completed courses...</div>
          ) : completedCourses.length === 0 ? (
            <div className="no-courses-message">
              <FaCheckCircle size={60} />
              <h3>No Completed Courses</h3>
              <p>No users have completed courses yet</p>
            </div>
          ) : (
            <div className="courses-table-wrapper">
              <table className="courses-data-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>Email</th>
                    <th>Category</th>
                    <th>Course Link</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Completed Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {completedCourses.map((completion) => (
                    <tr key={completion._id}>
                      <td>
                        <div className="user-name-cell">
                          <div className="user-avatar-small"><FaUsers /></div>
                          <span>{completion.userName}</span>
                        </div>
                      </td>
                      <td>
                        <div className="email-cell">
                          <FaEnvelope className="email-icon" />
                          <span>{completion.userEmail || 'N/A'}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`category-badge-${completion.category}`}>
                          {completion.category}
                        </span>
                      </td>
                      <td>
                        <div className="link-cell">
                          <FaLink className="link-icon" />
                          <a href={completion.courseLink} target="_blank" rel="noopener noreferrer">
                            {completion.courseLink.length > 40 
                              ? `${completion.courseLink.substring(0, 40)}...` 
                              : completion.courseLink}
                          </a>
                        </div>
                      </td>
                      <td>
                        <span className="score-badge">
                          {completion.score}/{completion.totalQuestions}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge status-${completion.status}`}>
                          {completion.status}
                        </span>
                      </td>
                      <td>
                        <div className="date-cell">
                          <FaCalendarAlt className="date-icon" />
                          <span>{new Date(completion.completedAt).toLocaleDateString()}</span>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn view-btn"
                            onClick={() => window.open(completion.courseLink, '_blank')}
                            title="Open Course Link"
                          >
                            <FaExternalLinkAlt />
                          </button>
                          <button 
                            className="action-btn info-btn"
                            onClick={() => {
                              const answers = completion.quizAnswers.map((a, i) => 
                                `Q${i+1}: ${a.question}\nAnswer: ${a.userAnswer}\n${a.isCorrect !== undefined ? (a.isCorrect ? '✓ Correct' : '✗ Incorrect') : ''}`
                              ).join('\n\n');
                              alert(`Quiz Answers:\n\n${answers}`);
                            }}
                            title="View Quiz Answers"
                          >
                            <FaQuestionCircle />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Quiz Questions Modal */}
      {showQuizModal && selectedPendingCourse && (
        <div className="modal-overlay quiz-modal-overlay" onClick={() => setShowQuizModal(false)}>
          <div className="modal-content quiz-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaQuestionCircle /> Quiz Questions for {selectedPendingCourse.userName}</h2>
              <button type="button" className="modal-close" onClick={() => setShowQuizModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body quiz-modal-body">
              <p className="quiz-info">
                Create quiz questions that the user will answer when they complete the course. 
                These questions will help verify course completion.
              </p>

              {quizQuestions.map((q, qIndex) => (
                <div key={qIndex} className="quiz-question-editor">
                  <div className="question-header">
                    <h4>Question {qIndex + 1}</h4>
                    {quizQuestions.length > 1 && (
                      <button 
                        type="button"
                        className="btn-remove-question"
                        onClick={() => handleRemoveQuestion(qIndex)}
                      >
                        <FaTrash /> Remove
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Question Text *</label>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleQuestionChange(qIndex, 'question', e.target.value)}
                      placeholder="Enter your question"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label>Answer Options</label>
                    <div className="options-list">
                      {q.options.map((option, oIndex) => (
                        <div key={oIndex} className="option-row">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
                            placeholder={`Option ${oIndex + 1}`}
                            className="form-control option-input"
                          />
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              className="btn-remove-option"
                              onClick={() => handleRemoveOption(qIndex, oIndex)}
                              title="Remove option"
                            >
                              <FaTimes />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        className="btn-add-option"
                        onClick={() => handleAddOption(qIndex)}
                      >
                        <FaPlus /> Add Option
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Correct Answer (Optional)</label>
                    <select
                      value={q.correctAnswer}
                      onChange={(e) => handleQuestionChange(qIndex, 'correctAnswer', e.target.value)}
                      className="form-select"
                    >
                      <option value="">No correct answer</option>
                      {q.options.filter(o => o.trim()).map((option, oIndex) => (
                        <option key={oIndex} value={option}>{option}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}

              <button 
                type="button"
                className="btn-add-question"
                onClick={handleAddQuestion}
              >
                <FaPlus /> Add Another Question
              </button>
            </div>
            <div className="modal-footer">
              <button 
                type="button"
                className="btn-cancel"
                onClick={() => setShowQuizModal(false)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="btn-submit"
                onClick={handleSaveQuizQuestions}
              >
                <FaPaperPlane /> Save Quiz Questions
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
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
