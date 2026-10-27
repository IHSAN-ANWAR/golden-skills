import express from 'express';
import {
  submitCoursePlanApplication,
  getAllCoursePlanSubmissions,
  getCoursePlanSubmissionById,
  updateCoursePlanSubmissionStatus,
  deleteCoursePlanSubmission,
  getUserCoursePlanSubmission,
  getEnrollmentStatus
} from '../controllers/userCoursePlanSubmissionController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (for mobile app)
router.post('/submit', submitCoursePlanApplication);
router.get('/user/:userId', getUserCoursePlanSubmission);
router.get('/status/:userId/:coursePlanId', getEnrollmentStatus);

// Admin routes (protected)
router.get('/', authenticateAdmin, getAllCoursePlanSubmissions);
router.get('/:id', authenticateAdmin, getCoursePlanSubmissionById);
router.put('/:id', authenticateAdmin, updateCoursePlanSubmissionStatus);
router.delete('/:id', authenticateAdmin, deleteCoursePlanSubmission);

export default router;
