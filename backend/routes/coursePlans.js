import express from 'express';
import {
  getCoursePlans,
  getCoursePlanById,
  createCoursePlan,
  updateCoursePlan,
  deleteCoursePlan
} from '../controllers/coursePlanController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (for users to view available plans)
router.get('/', getCoursePlans);
router.get('/:id', getCoursePlanById);

// Admin routes (protected)
router.post('/', authenticateAdmin, createCoursePlan);
router.put('/:id', authenticateAdmin, updateCoursePlan);
router.delete('/:id', authenticateAdmin, deleteCoursePlan);

export default router;
