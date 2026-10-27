import UserCourseCompletion from '../models/UserCourseCompletion.js';
import CourseLinkAssignment from '../models/CourseLinkAssignment.js';
import CoursePlan from '../models/CoursePlan.js';
import { getCache, setCache, deleteCache } from '../config/redis.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Certificates folder
const CERT_DIR = path.join(__dirname, '..', 'certificates');

// ======================================================
// POST /api/user-course-completions/submit
// User "Mark as Complete" karta hai — no quiz
// ======================================================
export const submitCourseCompletion = async (req, res) => {
  try {
    const { courseLinkAssignmentId } = req.body;

    if (!courseLinkAssignmentId) {
      return res.status(400).json({
        success: false,
        message: 'courseLinkAssignmentId is required'
      });
    }

    // Get the course link assignment
    const assignment = await CourseLinkAssignment.findById(courseLinkAssignmentId)
      .populate('coursePlanId', 'title category')
      .lean();

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Course assignment not found'
      });
    }

    // Already submitted check
    const existingCompletion = await UserCourseCompletion.findOne({ courseLinkAssignmentId });
    if (existingCompletion) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted this course for review'
      });
    }

    // Course title — from populated plan or fallback
    const courseTitle = assignment.coursePlanId?.title || `${assignment.category} Course Plan`;

    const completion = new UserCourseCompletion({
      courseLinkAssignmentId,
      userId: assignment.userId,
      userName: assignment.userName,
      userEmail: assignment.userEmail,
      category: assignment.category,
      courseTitle,
      status: 'submitted'
    });

    await completion.save();

    // Invalidate dashboard cache
    if (assignment.userEmail) {
      await deleteCache(`user_course_dashboard:${assignment.userEmail.toLowerCase()}:${assignment.userId}`);
    }

    return res.status(201).json({
      success: true,
      message: 'Course marked as complete! Admin will review and generate your certificate.',
      completion: {
        _id: completion._id,
        status: completion.status,
        courseTitle,
        completedAt: completion.completedAt
      }
    });
  } catch (err) {
    console.error('Submit course completion error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to submit course completion'
    });
  }
};

// ======================================================
// GET /api/user-course-completions/all  (Admin)
// ======================================================
export const getAllCourseCompletions = async (req, res) => {
  try {
    const { status } = req.query;
    const cacheKey = `course_completions:${status || 'all'}`;

    const cached = await getCache(cacheKey);
    if (cached) return res.json({ success: true, completions: cached, fromCache: true });

    const filter = status ? { status } : {};

    const completions = await UserCourseCompletion.find(filter)
      .sort({ approvedAt: -1, completedAt: -1 })
      .lean();

    await setCache(cacheKey, completions, 30);
    return res.json({ success: true, completions });
  } catch (err) {
    console.error('Get course completions error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch course completions'
    });
  }
};

// ======================================================
// GET /api/user-course-completions/user/:userId
// ======================================================
export const getUserCourseCompletions = async (req, res) => {
  try {
    const { userId } = req.params;

    const completions = await UserCourseCompletion.find({ userId })
      .sort({ completedAt: -1 })
      .lean();

    return res.json({ success: true, completions });
  } catch (err) {
    console.error('Get user course completions error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch user course completions'
    });
  }
};

// ======================================================
// GET /api/user-course-completions/user/:userId/assigned
// Courses assigned but not yet marked complete
// ======================================================
export const getUserAssignedCourses = async (req, res) => {
  try {
    const { userId } = req.params;

    const assignments = await CourseLinkAssignment.find({ userId })
      .sort({ sentAt: -1 })
      .lean();

    const completions = await UserCourseCompletion.find({ userId }).select('courseLinkAssignmentId');
    const completedIds = completions.map(c => c.courseLinkAssignmentId.toString());

    const pendingCourses = assignments.filter(
      a => !completedIds.includes(a._id.toString())
    );

    return res.json({ success: true, courses: pendingCourses });
  } catch (err) {
    console.error('Get user assigned courses error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch assigned courses'
    });
  }
};

// ======================================================
// GET /api/user-course-completions/pending  (Admin)
// Courses assigned but user hasn't marked complete yet
// ======================================================
export const getAllPendingCourses = async (req, res) => {
  try {
    const allAssignments = await CourseLinkAssignment.find()
      .sort({ sentAt: -1 })
      .lean();

    const completions = await UserCourseCompletion.find().select('courseLinkAssignmentId');
    const completedIds = completions.map(c => c.courseLinkAssignmentId.toString());

    const pendingCourses = allAssignments.filter(
      a => !completedIds.includes(a._id.toString())
    );

    return res.json({ success: true, pendingCourses });
  } catch (err) {
    console.error('Get pending courses error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch pending courses'
    });
  }
};

// ======================================================
// GET /api/user-course-completions/submitted  (Admin)
// User marked complete, waiting for admin approval
// ======================================================
export const getAllSubmittedCourses = async (req, res) => {
  try {
    const submissions = await UserCourseCompletion.find({ status: 'submitted' })
      .sort({ completedAt: -1 })
      .lean();

    return res.json({ success: true, submissions });
  } catch (err) {
    console.error('Get submitted courses error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch submitted courses'
    });
  }
};

// ======================================================
// PUT /api/user-course-completions/:id/status  (Admin)
// Approve with certificate upload
// Reject → just update status
// ======================================================
export const updateCourseCompletionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either approved or rejected'
      });
    }

    const completion = await UserCourseCompletion.findById(id);
    if (!completion) {
      return res.status(404).json({
        success: false,
        message: 'Course completion not found'
      });
    }

    completion.status = status;

    // ── Manual certificate upload when approved ──────────────────
    if (status === 'approved') {
      completion.approvedAt = new Date();

      // Check if certificate file is uploaded
      if (req.file) {
        const baseUrl = process.env.FRONTEND_URL || `http://localhost:5000`;
        completion.certificateUrl = `${baseUrl}/certificates/${req.file.filename}`;
        completion.certificateFilename = req.file.filename;
      } else {
        // No certificate uploaded - still approve but without certificate
        return res.status(400).json({
          success: false,
          message: 'Please upload a certificate file to approve'
        });
      }
    }

    // If re-rejecting after approval — delete old certificate
    if (status === 'rejected' && completion.certificateFilename) {
      const filepath = path.join(CERT_DIR, completion.certificateFilename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
      }
      completion.certificateUrl = null;
      completion.certificateFilename = null;
    }

    await completion.save();

    // Invalidate dashboard cache
    if (completion.userEmail) {
      await deleteCache(`user_course_dashboard:${completion.userEmail.toLowerCase()}:${completion.userId}`);
    }
    await deleteCache(`course_completions:all`);
    await deleteCache(`course_completions:${status}`);
    await deleteCache(`course_completions:submitted`);

    return res.json({
      success: true,
      message: status === 'approved'
        ? `Course approved and certificate uploaded successfully`
        : `Course completion rejected`,
      completion: {
        _id: completion._id,
        status: completion.status,
        certificateUrl: completion.certificateUrl || null,
        approvedAt: completion.approvedAt
      }
    });
  } catch (err) {
    console.error('Update course completion status error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to update course completion status'
    });
  }
};
