import express from 'express';
import {
  submitFraudReport,
  getAllFraudReports,
  updateFraudReport,
  deleteFraudReport
} from '../controllers/fraudReportController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';
import { fraudReportLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../validators/teamValidators.js';
import { fraudReportSchema } from '../validators/teamValidators.js';

const router = express.Router();

// Public - with strict rate limit (7 per hour)
router.post('/report', fraudReportLimiter, validate(fraudReportSchema), submitFraudReport);

// Admin only
router.get('/reports', authenticateAdmin, getAllFraudReports);
router.put('/report/:id', authenticateAdmin, updateFraudReport);
router.delete('/report/:id', authenticateAdmin, deleteFraudReport);

export default router;
