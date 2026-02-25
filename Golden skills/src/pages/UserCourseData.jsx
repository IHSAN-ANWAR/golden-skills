import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/apiConfig';
import './UserCourseData.css';
import { FaGraduationCap, FaCheckCircle, FaLink, FaCalendarAlt, FaQuestionCircle } from 'react-icons/fa';

const UserCourseData = () => {
  const [userId, setUserId] = useState('');
  const [assignedCourses, setAssignedCourses] = useState([]);
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [submittingQuiz, setSubmittingQuiz] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    
    if (!userId.trim()) {
      alert('Please enter your User ID');
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      // Fetch assigned courses
      const assignedResponse = await fetch(API_ENDPOINTS.USER_COURSE_COMPLETIONS.GET_USER_ASSIGNED(userId));
      const assignedData = await assignedResponse.json();
      
      // Fetch completed courses
      const completedResponse = await fetch(API_ENDPOINTS.USER_COURSE_COMPLETIONS.GET_USER_COMPLETIONS(userId));
      const completedData = await completedResponse.json();
      
      if (assignedData.success) {
        setAssignedCourses(assignedData.courses || []);
      }
      
      if (completedData.success) {
        setCompletedCourses(completedData.completions || []);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
      alert('Failed to load your courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteCourse = async (course) => {
    setCurrentCourse(course);
    
    // For now, show simple quiz questions
    // In production, you'd fetch these from the course
    const defaultQuestions = [
      {
        question: "Did you complete watching the entire course?",
        options: ["Yes", "No"]
      },
      {
        question: "How would you rate the course content?",
        options: ["Excellent", "Good", "Average", "Poor"]
      },
      {
        question: "Would you recommend this course to others?",
        options: ["Yes", "No", "Maybe"]
      }
    ];
    
    setQuizQuestions(defaultQuestions);
    setQuizAnswers({});
    setShowQuizModal(true);
  };

  const handleAnswerChange = (questionIndex, answer) => {
    setQuizAnswers(prev => ({
      ...prev,
      [questionIndex]: answer
    }));
  };

  const handleSubmitQuiz = async () => {
    // Validate all questions are answered
    if (Object.keys(quizAnswers).length !== quizQuestions.length) {
      alert('Please answer all questions before submitting');
      return;
    }

    setSubmittingQuiz(true);

    try {
      const formattedAnswers = quizQuestions.map((q, index) => ({
        question: q.question,
        userAnswer: quizAnswers[index],
        correctAnswer: q.correctAnswer || null
      }));

      const response = await fetch(API_ENDPOINTS.USER_COURSE_COMPLETIONS.SUBMIT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseLinkAssignmentId: currentCourse._id,
          quizAnswers: formattedAnswers
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Course completed successfully! 🎉');
        setShowQuizModal(false);
        setCurrentCourse(null);
        // Refresh the lists
        handleSearch({ preventDefault: () => {} });
      } else {
        alert(data.message || 'Failed to submit course completion');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Failed to submit course completion');
    } finally {
      setSubmittingQuiz(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryBadge = (category) => {
    const categoryConfig = {
      premium: { className: 'category-premium', label: 'Premium' },
      pro: { className: 'category-pro', label: 'Pro' },
      lite: { className: 'category-lite', label: 'Lite' }
    };
    
    const config = categoryConfig[category] || categoryConfig.premium;
    return (
      <span className={`category-badge ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="user-course-data-container">
      <div className="course-data-header">
        <h1><FaGraduationCap /> My Courses</h1>
        <p>View and complete your assigned courses</p>
      </div>

      {/* Search Form */}
      <div className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter your User ID"
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Loading...' : 'View My Courses'}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {loading && (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your courses...</p>
        </div>
      )}

      {searched && !loading && (
        <>
          {/* Assigned Courses */}
          <div className="courses-section">
            <h2>Assigned Courses ({assignedCourses.length})</h2>
            {assignedCourses.length === 0 ? (
              <div className="no-courses">
                <FaGraduationCap size={50} />
                <p>No assigned courses found</p>
              </div>
            ) : (
              <div className="courses-grid">
                {assignedCourses.map((course) => (
                  <div key={course._id} className="course-card">
                    <div className="course-card-header">
                      {getCategoryBadge(course.category)}
                      <span className="course-date">
                        <FaCalendarAlt /> {formatDate(course.sentAt)}
                      </span>
                    </div>
                    <div className="course-card-body">
                      <div className="course-link">
                        <FaLink />
                        <a href={course.courseLink} target="_blank" rel="noopener noreferrer">
                          View Course
                        </a>
                      </div>
                    </div>
                    <div className="course-card-footer">
                      <button 
                        className="complete-btn"
                        onClick={() => handleCompleteCourse(course)}
                      >
                        <FaCheckCircle /> Complete Course
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Completed Courses */}
          <div className="courses-section">
            <h2>Completed Courses ({completedCourses.length})</h2>
            {completedCourses.length === 0 ? (
              <div className="no-courses">
                <FaCheckCircle size={50} />
                <p>No completed courses yet</p>
              </div>
            ) : (
              <div className="courses-grid">
                {completedCourses.map((completion) => (
                  <div key={completion._id} className="course-card completed">
                    <div className="course-card-header">
                      {getCategoryBadge(completion.category)}
                      <span className="completion-badge">
                        <FaCheckCircle /> Completed
                      </span>
                    </div>
                    <div className="course-card-body">
                      <div className="course-link">
                        <FaLink />
                        <a href={completion.courseLink} target="_blank" rel="noopener noreferrer">
                          View Course
                        </a>
                      </div>
                      <div className="completion-info">
                        <p>Score: {completion.score}/{completion.totalQuestions}</p>
                        <p>Status: {completion.status}</p>
                        <p>Completed: {formatDate(completion.completedAt)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Quiz Modal */}
      {showQuizModal && (
        <div className="quiz-modal-overlay" onClick={() => !submittingQuiz && setShowQuizModal(false)}>
          <div className="quiz-modal" onClick={(e) => e.stopPropagation()}>
            <div className="quiz-modal-header">
              <h2><FaQuestionCircle /> Course Completion Quiz</h2>
              <p>Please answer the following questions to complete the course</p>
            </div>
            <div className="quiz-modal-body">
              {quizQuestions.map((q, index) => (
                <div key={index} className="quiz-question">
                  <h3>Question {index + 1}</h3>
                  <p>{q.question}</p>
                  <div className="quiz-options">
                    {q.options.map((option, optIndex) => (
                      <label key={optIndex} className="quiz-option">
                        <input
                          type="radio"
                          name={`question-${index}`}
                          value={option}
                          checked={quizAnswers[index] === option}
                          onChange={() => handleAnswerChange(index, option)}
                          disabled={submittingQuiz}
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="quiz-modal-footer">
              <button 
                className="cancel-btn"
                onClick={() => setShowQuizModal(false)}
                disabled={submittingQuiz}
              >
                Cancel
              </button>
              <button 
                className="submit-btn"
                onClick={handleSubmitQuiz}
                disabled={submittingQuiz}
              >
                {submittingQuiz ? 'Submitting...' : 'Submit Answers'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCourseData;
