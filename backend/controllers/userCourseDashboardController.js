import UserCoursePlanSubmission from '../models/UserCoursePlanSubmission.js';
import CourseLinkAssignment from '../models/CourseLinkAssignment.js';
import UserCourseCompletion from '../models/UserCourseCompletion.js';
import mongoose from 'mongoose';
import { getCache, setCache } from '../config/redis.js';

// ======================================================
// GET USER COURSE DASHBOARD
// ======================================================
// Purpose: Mobile app calls this to get all course data
//          for a specific user in one single API call.
//
// Endpoint: GET /api/user-course-dashboard/:email/:userId
//
// Both email AND userId are required — they are used
// together to query across all collections consistently.
//
// Response Structure:
// {
//   pending:    { ... }   ← Plan submitted, waiting for admin approval
//   inProgress: [ ... ]   ← Admin approved + course link sent, not completed yet
//   completed:  [ ... ]   ← User submitted quiz + admin approved
// }
//
// Flow:
//   1. PENDING     → UserCoursePlanSubmission  (status: 'pending')
//   2. IN PROGRESS → CourseLinkAssignment      (link sent, no approved completion yet)
//   3. COMPLETED   → UserCourseCompletion       (status: 'approved')
// ======================================================
export const getUserCourseDashboard = async (req, res) => {
  try {
    const { email, userId } = req.params;

    if (!email || !userId) {
      return res.status(400).json({
        success: false,
        message: 'Both email and userId are required'
      });
    }

    // Normalize email to lowercase to avoid case mismatch
    const normalizedEmail = email.toLowerCase().trim();

    const cacheKey = `user_course_dashboard:${normalizedEmail}:${userId}`;

    // ── Try Redis cache first ────────────────────────────────────────────────
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, ...cached, fromCache: true });
    }

    // ── 1. PENDING SECTION ───────────────────────────────────────────────────
    // Query by both email and userId for accuracy
    const planSubmission = await UserCoursePlanSubmission.findOne({
      userId,
      userEmail: normalizedEmail
    })
      .populate('coursePlanId')
      .lean();

    let pending = null;
    if (planSubmission && planSubmission.status === 'pending') {
      pending = {
        submissionId: planSubmission._id,
        planTitle: planSubmission.planTitle,
        planCategory: planSubmission.planCategory,
        planPrice: planSubmission.planPrice,
        status: planSubmission.status,
        submittedAt: planSubmission.submittedAt,
        planDetails: planSubmission.coursePlanId || null
      };
    }

    // ── 2. IN PROGRESS SECTION ───────────────────────────────────────────────
    // Admin sent course link — query by both userId and userEmail
    const allAssignments = await CourseLinkAssignment.find({
      userId,
      userEmail: normalizedEmail
    })
      .populate('coursePlanId', 'title category price features description icon')
      .lean();

    // Approved completions — query by both userId and userEmail
    const approvedCompletions = await UserCourseCompletion.find({
      userId,
      userEmail: normalizedEmail,
      status: 'approved'
    }).select('courseLinkAssignmentId').lean();

    const approvedAssignmentIds = new Set(
      approvedCompletions.map(c => c.courseLinkAssignmentId.toString())
    );

    // Submitted completions (quiz done, awaiting admin review)
    const submittedCompletions = await UserCourseCompletion.find({
      userId,
      userEmail: normalizedEmail,
      status: 'submitted'
    }).select('courseLinkAssignmentId score totalQuestions completedAt').lean();

    const submittedMap = {};
    submittedCompletions.forEach(c => {
      submittedMap[c.courseLinkAssignmentId.toString()] = c;
    });

    // Build inProgress — assignments not yet approved
    const inProgress = allAssignments
      .filter(a => !approvedAssignmentIds.has(a._id.toString()))
      .map(a => {
        const submittedCompletion = submittedMap[a._id.toString()];
        return {
          assignmentId: a._id,
          courseLink: a.courseLink,
          category: a.category,
          sentAt: a.sentAt,
          planDetails: a.coursePlanId || null,
          quizSubmitted: !!submittedCompletion,
          quizSubmission: submittedCompletion
            ? {
                score: submittedCompletion.score,
                totalQuestions: submittedCompletion.totalQuestions,
                submittedAt: submittedCompletion.completedAt,
                status: 'pending_review'
              }
            : null
        };
      });

    // ── 3. COMPLETED SECTION ─────────────────────────────────────────────────
    const completedCourses = await UserCourseCompletion.find({
      userId,
      userEmail: normalizedEmail,
      status: 'approved'
    })
      .sort({ completedAt: -1 })
      .lean();

    // Enrich with assignment details
    const completedAssignmentIds = completedCourses.map(c => c.courseLinkAssignmentId);
    const completedAssignments = await CourseLinkAssignment.find({
      _id: { $in: completedAssignmentIds }
    })
      .populate('coursePlanId', 'title category price features description icon')
      .lean();

    const completedAssignmentMap = {};
    completedAssignments.forEach(a => {
      completedAssignmentMap[a._id.toString()] = a;
    });

    const completed = completedCourses.map(c => {
      const assignment = completedAssignmentMap[c.courseLinkAssignmentId.toString()];
      return {
        completionId: c._id,
        courseLink: c.courseLink,
        courseTitle: c.courseTitle,
        category: c.category,
        completedAt: c.completedAt,
        approvedAt: c.approvedAt,
        certificateUrl: c.certificateUrl || null,
        planDetails: assignment?.coursePlanId || null
      };
    });

    // ── Build final response ─────────────────────────────────────────────────
    const responseData = {
      email: normalizedEmail,
      userId,
      summary: {
        hasPendingApplication: !!pending,
        inProgressCount: inProgress.length,
        completedCount: completed.length
      },
      pending,
      inProgress,
      completed
    };

    // Cache for 30 seconds
    await setCache(cacheKey, responseData, 30);

    return res.status(200).json({
      success: true,
      ...responseData
    });

  } catch (err) {
    console.error('Get user course dashboard error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch user course dashboard'
    });
  }
};

// ======================================================
// GET COURSE STATUS (Unified — single API for mobile app)
// ======================================================
// Endpoint: GET /api/user-course-dashboard/course-status/:userId/:coursePlanId
//
// 3 States only:
//   1. payment_under_review → pending approval
//   2. in_progress          → approved, course link assigned
//   3. completed            → course done
// ======================================================
export const getCourseStatus = async (req, res) => {
  try {
    const { userId, coursePlanId } = req.params;

    if (!userId || !coursePlanId) {
      return res.status(400).json({
        success: false,
        message: 'userId and coursePlanId are required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(coursePlanId)) {
      return res.status(400).json({ success: false, message: 'Invalid coursePlanId' });
    }

    // ── Submission check ─────────────────────────────────────────────────────
    const submission = await UserCoursePlanSubmission.findOne({ userId, coursePlanId }).lean();

    if (!submission) {
      return res.status(404).json({ success: false, message: 'No enrollment found' });
    }

    const base = {
      planTitle: submission.planTitle,
      planCategory: submission.planCategory,
      planPrice: submission.planPrice,
      submittedAt: submission.submittedAt
    };

    // ── State 1: Payment Under Review ────────────────────────────────────────
    if (submission.status === 'pending') {
      return res.json({
        success: true,
        status: 'payment_under_review',
        displayMessage: 'Your payment is under review. Please wait for admin approval.',
        displayColor: 'orange',
        ...base
      });
    }

    // ── State 2 & 3: Approved — check assignment + completion ────────────────
    if (submission.status === 'approved' || submission.status === 'completed') {

      const assignment = await CourseLinkAssignment.findOne({ userId, coursePlanId }).lean();

      // No assignment yet — still show in_progress (link coming soon)
      if (!assignment) {
        return res.json({
          success: true,
          status: 'in_progress',
          displayMessage: 'Your course is in progress. Keep learning!',
          displayColor: 'blue',
          courseLink: null,
          ...base
        });
      }

      // Check completion
      const completion = await UserCourseCompletion.findOne({
        userId,
        courseLinkAssignmentId: assignment._id,
        status: 'approved'
      }).lean();

      // ── State 3: Completed ───────────────────────────────────────────────
      if (completion) {
        return res.json({
          success: true,
          status: 'completed',
          displayMessage: 'Congratulations! You have successfully completed this course.',
          displayColor: 'green',
          courseLink: assignment.courseLink,
          completedAt: completion.completedAt,
          approvedAt: completion.approvedAt,
          certificateUrl: completion.certificateUrl || null,
          ...base
        });
      }

      // ── State 2: In Progress ─────────────────────────────────────────────
      return res.json({
        success: true,
        status: 'in_progress',
        displayMessage: 'Your course is in progress. Keep learning!',
        displayColor: 'blue',
        courseLink: assignment.courseLink,
        sentAt: assignment.sentAt,
        ...base
      });
    }

    // Fallback (rejected ya koi aur status)
    return res.status(404).json({ success: false, message: 'No active enrollment found' });

  } catch (err) {
    console.error('Get course status error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch course status'
    });
  }
};
