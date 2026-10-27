import express from 'express';
import {
  adminLogin,
  userLogin,
  userRegister,
  getAllUsers,
  createUserManually,
  forgotPassword,
  resetPassword,
  sendOtp,
  verifyOtp,
  verifyOtpAndReset,
  deleteUser,
  getUserById,
  validateReferralCode,
  getMyReferralInfo,
  getMyProfile,
  updateMyProfile,
  getReferralStats
} from '../controllers/authController.js';
import { getReferralTree } from '../controllers/adminDashboardController.js';
import { authenticateAdmin, authenticateUser } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Admin and user login routes - rate limiting temporarily disabled
router.post('/login', adminLogin);
router.post('/user/login', userLogin);
router.get('/users', authenticateAdmin, getAllUsers);

// User registration route
router.post('/user/register', userRegister);

// Referral routes
router.post('/validate-referral', validateReferralCode);
router.get('/user/referral-info', authenticateUser, getMyReferralInfo);
router.get('/user/referral-stats/:referralCode', getReferralStats);

// User profile routes
router.get('/user/profile', authenticateUser, getMyProfile);
router.put('/user/profile', authenticateUser, updateMyProfile);       // User — password ya phone number update karo

// Forgot password routes — OTP based (mobile app)
router.post('/forgot-password', forgotPassword);         // Step 1: Email do → OTP aayega
router.post('/verify-otp', verifyOtp);                   // Step 2: OTP check karo (sirf verify)
router.post('/reset-password', verifyOtpAndReset);       // Step 3: email + OTP + newPassword

// Manual user creation route (for admin) - requires authentication
router.post('/user/create', authenticateAdmin, createUserManually);

// User management routes (admin only)
router.get('/user/:id', authenticateAdmin, getUserById);
router.delete('/user/:id', authenticateAdmin, deleteUser);

// Admin referral tree
router.get('/admin/referral-tree', authenticateAdmin, getReferralTree);

// Test route
router.get('/test', (_req, res) => {
  res.json({ message: 'Auth route is working!' });
});

export default router;
