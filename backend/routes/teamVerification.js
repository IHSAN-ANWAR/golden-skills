import express from 'express';
import { 
  verifyTeamMember, 
  getAllTeamMembers,
  getAllBlacklistedUsers,
  addToBlacklist,
  removeFromBlacklist,
  updateTeamMemberStatus,
  getAllSearchTracking,
  deleteSearchTracking
} from '../controllers/teamVerificationController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';
import { validate, verifyTeamSchema, blacklistSchema } from '../validators/teamValidators.js';

const router = express.Router();

// ── PUBLIC ────────────────────────────────────────────── 
// No rate limit - tracked in database for suspicious patterns
router.post('/verify', validate(verifyTeamSchema), verifyTeamMember);

// ── ADMIN ───────────────────────────────────────────────
router.get('/members', authenticateAdmin, getAllTeamMembers);
router.get('/blacklist', authenticateAdmin, getAllBlacklistedUsers);

// Direct blacklist (no user account needed)
router.post('/blacklist/add', authenticateAdmin, validate(blacklistSchema), addToBlacklist);
router.delete('/blacklist/:id', authenticateAdmin, removeFromBlacklist);

// Update registered user status
router.put('/member/:userId', authenticateAdmin, updateTeamMemberStatus);

// Search tracking
router.get('/search-tracking', authenticateAdmin, getAllSearchTracking);
router.delete('/search-tracking/:id', authenticateAdmin, deleteSearchTracking);

export default router;
