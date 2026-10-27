import express from 'express';
import {
  getAllAccountDetails,
  getPublicAccountDetails,
  createAccountDetail,
  updateAccountDetail,
  deleteAccountDetail
} from '../controllers/accountDetailsController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route — active accounts only (for mobile app)
router.get('/public', getPublicAccountDetails);

// Admin routes — protected
router.get('/', authenticateAdmin, getAllAccountDetails);
router.post('/', authenticateAdmin, createAccountDetail);
router.put('/:id', authenticateAdmin, updateAccountDetail);
router.delete('/:id', authenticateAdmin, deleteAccountDetail);

export default router;
