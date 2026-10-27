import express from 'express';
import {
  getAllPromotions,
  getAllPromotionsAdmin,
  createPromotion,
  updatePromotion,
  deletePromotion,
  checkPromotionEligibility
} from '../controllers/promotionController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route - active promotions only
router.get('/public', getAllPromotions);

// User eligibility check — GET /api/promotions/eligibility/:email
router.get('/eligibility/:email', checkPromotionEligibility);

// Admin routes
router.get('/', authenticateAdmin, getAllPromotionsAdmin);
router.post('/', authenticateAdmin, createPromotion);
router.put('/:id', authenticateAdmin, updatePromotion);
router.delete('/:id', authenticateAdmin, deletePromotion);

export default router;
