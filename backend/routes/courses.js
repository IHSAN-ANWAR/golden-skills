import express from 'express';
import { getAllCourses, createCourse, deleteCourse, getCourseById, getCourseQuiz, updateCourseQuiz } from '../controllers/courseController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ======================================================
// COURSE ROUTES
// ======================================================

// GET all courses - Public (for mobile app)
// Mobile app calls this to display courses
router.get('/', getAllCourses);

// GET single course - Public
router.get('/:id', getCourseById);

// GET course quiz questions - Public
router.get('/:id/quiz', getCourseQuiz);

// POST create course - Admin only
// Admin uses this to add new course
router.post('/', authenticateAdmin, createCourse);

// PUT update course quiz - Admin only
router.put('/:id/quiz', authenticateAdmin, updateCourseQuiz);

// DELETE course - Admin only
// Admin uses this to delete course
router.delete('/:id', authenticateAdmin, deleteCourse);

export default router;
