import express from 'express';
import { getWhatsappSettings, updateWhatsappSettings, getSocialLinks, updateSocialLinks, getNtnNumber, updateNtnNumber } from '../controllers/siteSettingsController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/whatsapp', getWhatsappSettings);
router.put('/whatsapp', authenticateAdmin, updateWhatsappSettings);

router.get('/social-links', getSocialLinks);
router.put('/social-links', authenticateAdmin, updateSocialLinks);

router.get('/ntn', getNtnNumber);
router.put('/ntn', authenticateAdmin, updateNtnNumber);

export default router;
