import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  submitCourseCompletion,
  getAllCourseCompletions,
  getUserCourseCompletions,
  getUserAssignedCourses,
  getAllPendingCourses,
  getAllSubmittedCourses,
  updateCourseCompletionStatus
} from '../controllers/userCourseCompletionController.js';
import { authenticateAdmin } from '../middleware/authMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// ── Multer Configuration for Certificate Upload ──────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const certDir = path.join(__dirname, '..', 'certificates');
    cb(null, certDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: cert_{completionId}_{timestamp}.pdf
    const ext = path.extname(file.originalname);
    const filename = `cert_${req.params.id}_${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only PDF files
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB max
});

// User routes
router.post('/submit', submitCourseCompletion);
router.get('/user/:userId/assigned', getUserAssignedCourses);
router.get('/user/:userId', getUserCourseCompletions);

// Admin routes
router.get('/all', authenticateAdmin, getAllCourseCompletions);
router.get('/pending', authenticateAdmin, getAllPendingCourses);
router.get('/submitted', authenticateAdmin, getAllSubmittedCourses);
router.put('/:id/status', authenticateAdmin, upload.single('certificate'), updateCourseCompletionStatus);

export default router;
