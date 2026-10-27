import Course from '../models/Course.js';
import { getCache, setCache, deleteCache } from '../config/redis.js';

const COURSES_CACHE_KEY = 'all_courses';
const COURSES_TTL = 60; // cache for 60 seconds

// ======================================================
// GET ALL COURSES - Fetch all courses for mobile app
// ======================================================
// Purpose: Mobile app calls this to get all courses
// Endpoint: GET /api/courses
// Output: Array of all courses (for mobile app display)
// ======================================================
export const getAllCourses = async (req, res) => {
  try {
    // ── Try cache first ──────────────────────────────────────────────────────
    const cached = await getCache(COURSES_CACHE_KEY);
    if (cached) {
      return res.status(200).json({ success: true, count: cached.length, courses: cached, fromCache: true });
    }

    // ── Cache miss — hit MongoDB ─────────────────────────────────────────────
    const courses = await Course.find()
      .lean()
      .sort({ createdAt: -1 });

    await setCache(COURSES_CACHE_KEY, courses, COURSES_TTL);

    return res.status(200).json({ success: true, count: courses.length, courses });

  } catch (error) {
    console.error("Get courses error:", error);
    return res.status(500).json({ success: false, message: "Server error while fetching courses", error: error.message });
  }
};

// ======================================================
// CREATE COURSE - Add new course (Admin only)
// ======================================================
// Purpose: Admin adds new course to database
// Endpoint: POST /api/courses (requires admin auth)
// Input: { title, icon, description }
// Output: Created course info
// ======================================================
export const createCourse = async (req, res) => {
  try {
    const { title, icon, description, quizQuestions } = req.body;

    // Validate required fields
    if (!title || !icon) {
      return res.status(400).json({
        success: false,
        message: "Title and icon are required"
      });
    }

    // Create new course
    const newCourse = new Course({
      title: title.trim(),
      icon: icon.trim(),
      description: description ? description.trim() : '',
      quizQuestions: quizQuestions || []
    });

    // Save to database
    await newCourse.save();
    await deleteCache(COURSES_CACHE_KEY); // bust cache on write

    return res.status(201).json({
      success: true,
      message: "Course created successfully!",
      course: newCourse
    });

  } catch (error) {
    console.error("Create course error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating course",
      error: error.message
    });
  }
};

// ======================================================
// DELETE COURSE - Remove course (Admin only)
// ======================================================
// Purpose: Admin deletes course from database
// Endpoint: DELETE /api/courses/:id (requires admin auth)
// Input: Course ID in URL
// Output: Success message
// ======================================================
export const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    // Find and delete course
    const course = await Course.findByIdAndDelete(id);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    await deleteCache(COURSES_CACHE_KEY); // bust cache on delete

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully!"
    });

  } catch (error) {
    console.error("Delete course error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting course",
      error: error.message
    });
  }
};

// ======================================================
// GET SINGLE COURSE - Get one course by ID
// ======================================================
// Purpose: Get single course details
// Endpoint: GET /api/courses/:id
// Input: Course ID in URL
// Output: Course details
// ======================================================
export const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    return res.status(200).json({
      success: true,
      course,
    });

  } catch (error) {
    console.error("Get course error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching course",
      error: error.message
    });
  }
};


// ======================================================
// GET COURSE QUIZ QUESTIONS
// ======================================================
// Purpose: Get quiz questions for a specific course
// Endpoint: GET /api/courses/:id/quiz
// Input: Course ID in URL
// Output: Quiz questions (without correct answers for users)
// ======================================================
export const getCourseQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeAnswers } = req.query;

    const course = await Course.findById(id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // Return quiz questions without correct answers (unless admin requests them)
    const quizQuestions = course.quizQuestions.map(q => ({
      question: q.question,
      options: q.options,
      ...(includeAnswers === 'true' && { correctAnswer: q.correctAnswer })
    }));

    return res.status(200).json({
      success: true,
      quizQuestions
    });

  } catch (error) {
    console.error("Get course quiz error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching quiz",
      error: error.message
    });
  }
};

// ======================================================
// UPDATE COURSE QUIZ QUESTIONS (Admin only)
// ======================================================
// Purpose: Update quiz questions for a course
// Endpoint: PUT /api/courses/:id/quiz
// Input: Course ID in URL, quizQuestions in body
// Output: Updated course
// ======================================================
export const updateCourseQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { quizQuestions } = req.body;

    if (!Array.isArray(quizQuestions)) {
      return res.status(400).json({
        success: false,
        message: "Quiz questions must be an array"
      });
    }

    const course = await Course.findByIdAndUpdate(
      id,
      { quizQuestions },
      { new: true, runValidators: true }
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Quiz questions updated successfully!",
      course
    });

  } catch (error) {
    console.error("Update course quiz error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating quiz",
      error: error.message
    });
  }
};
