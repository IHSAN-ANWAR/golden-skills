import express from 'express';
import {
  sendCourseLink,
  getCourseLinkAssignments,
  getUserCourseContents
} from '../controllers/courseLinkController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── Admin Routes ─────────────────────────────────────────────────────────────
// POST /api/course-links/send       → Admin sends course content to a user
router.post('/send', authenticateAdmin, sendCourseLink);

// GET  /api/course-links/           → Admin sees all assignments (filter: ?category=premium)
router.get('/', authenticateAdmin, getCourseLinkAssignments);

// ── Mobile App Routes ─────────────────────────────────────────────────────────
// GET  /api/course-links/my-courses/:userId  → User ke assigned courses (no auth — userId se query)
router.get('/my-courses/:userId', getUserCourseContents);

export default router;
