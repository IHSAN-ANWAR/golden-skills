import express from 'express';
import planController from '../controllers/planController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - Get all active plans (no auth required for reading)
router.get('/', planController.getAllPlans);

// Protected routes - Admin only
router.post('/', authenticateAdmin, planController.createPlan);

router.put('/:id', authenticateAdmin, planController.updatePlan);
router.delete('/:id', authenticateAdmin, planController.deletePlan);

export default router;
