import express from 'express';
import submissionController from '../controllers/userPlanSubmissionController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/', submissionController.submitPlanSelection);

// Public route for users to view their own submissions by email
router.get('/my-submissions', submissionController.getAllSubmissions);

// Mobile API — get payment status by email
router.get('/status/:email', submissionController.getStatusByEmail);

// Protected routes - Admin only
router.get('/', authenticateAdmin, submissionController.getAllSubmissions);
router.get('/:id', authenticateAdmin, submissionController.getSubmissionById);
router.put('/:id', authenticateAdmin, submissionController.updateSubmissionStatus);
router.delete('/:id', authenticateAdmin, submissionController.deleteSubmission);

export default router;
