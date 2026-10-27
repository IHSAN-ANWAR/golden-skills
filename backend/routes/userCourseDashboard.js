import express from 'express';
import { getUserCourseDashboard, getCourseStatus } from '../controllers/userCourseDashboardController.js';

const router = express.Router();

// GET /api/user-course-dashboard/:email/:userId
// Mobile app calls this with user's email + userId
// Returns: pending application, in-progress courses, completed courses
router.get('/:email/:userId', getUserCourseDashboard);

// GET /api/user-course-dashboard/course-status/:userId/:coursePlanId
// Unified course status API for mobile app
// Returns: payment_under_review | in_progress | completed | rejected | not_enrolled
router.get('/course-status/:userId/:coursePlanId', getCourseStatus);

export default router;
