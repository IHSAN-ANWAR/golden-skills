import express from 'express';
import {
  submitPromotionPlanPurchase,
  getAllUserPromotions,
  getUserPromotionById,
  updatePaymentStatus,
  assignPromotionTasks,
  updatePromotionTaskStatus,
  approveRewardPayment,
  submitPromotionTask,
  deleteUserPromotion,
  getUserPromotionsByEmail,
  assignRank
} from '../controllers/userPromotionController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / User routes
router.post('/submit', submitPromotionPlanPurchase);
router.get('/user/:email', getUserPromotionsByEmail);
router.post('/:id/tasks/:taskId/submit', submitPromotionTask);

// Admin routes
router.get('/', authenticateAdmin, getAllUserPromotions);
router.get('/:id', authenticateAdmin, getUserPromotionById);
router.put('/:id/payment', authenticateAdmin, updatePaymentStatus);
router.post('/:id/tasks', authenticateAdmin, assignPromotionTasks);
router.put('/:id/tasks/:taskId', authenticateAdmin, updatePromotionTaskStatus);
router.put('/:id/reward', authenticateAdmin, approveRewardPayment);
router.post('/:id/rank', authenticateAdmin, assignRank);
router.delete('/:id', authenticateAdmin, deleteUserPromotion);

export default router;
