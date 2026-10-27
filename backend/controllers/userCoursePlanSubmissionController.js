import UserCoursePlanSubmission from '../models/UserCoursePlanSubmission.js';
import CoursePlan from '../models/CoursePlan.js';
import CourseLinkAssignment from '../models/CourseLinkAssignment.js';
import mongoose from 'mongoose';
import { getCache, setCache, deleteCache } from '../config/redis.js';

// Submit course plan application (from mobile app)
export const submitCoursePlanApplication = async (req, res) => {
  try {
    const { userId, coursePlanId, userName, userEmail, userPhone, userImage, additionalData } = req.body;

    if (!userId || !coursePlanId || !userName) {
      return res.status(400).json({
        success: false,
        message: 'User ID, Course Plan ID, and User Name are required'
      });
    }

    // Check if user already submitted for THIS specific course plan
    const existingSubmission = await UserCoursePlanSubmission.findOne({ userId, coursePlanId });
    if (existingSubmission) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an application for this course plan'
      });
    }

    // Get course plan details
    const coursePlan = await CoursePlan.findById(coursePlanId);
    if (!coursePlan) {
      return res.status(404).json({
        success: false,
        message: 'Course plan not found'
      });
    }

    // Create submission
    const submission = new UserCoursePlanSubmission({
      userId,
      coursePlanId,
      planTitle: coursePlan.title,
      planCategory: coursePlan.category,
      planPrice: coursePlan.price,
      userName,
      userEmail,
      userPhone,
      userImage,
      additionalData,
      status: 'pending'
    });

    await submission.save();

    return res.status(201).json({
      success: true,
      message: 'Course plan application submitted successfully',
      submission
    });
  } catch (err) {
    console.error('Submit course plan application error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to submit course plan application'
    });
  }
};

// Get all course plan submissions (admin)
export const getAllCoursePlanSubmissions = async (req, res) => {
  try {
    const { status } = req.query;
    const cacheKey = `course_plan_submissions:${status || 'all'}`;

    const cached = await getCache(cacheKey);
    if (cached) return res.json({ success: true, submissions: cached, fromCache: true });

    const filter = status ? { status } : {};
    const submissions = await UserCoursePlanSubmission.find(filter)
      .populate('coursePlanId')
      .sort({ submittedAt: -1 })
      .lean();

    await setCache(cacheKey, submissions, 30);
    return res.json({ success: true, submissions });
  } catch (err) {
    console.error('Get course plan submissions error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch course plan submissions' });
  }
};

// Get single submission by ID
export const getCoursePlanSubmissionById = async (req, res) => {
  try {
    const submission = await UserCoursePlanSubmission.findById(req.params.id)
      .populate('coursePlanId');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    return res.json({
      success: true,
      submission
    });
  } catch (err) {
    console.error('Get course plan submission error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch submission'
    });
  }
};

// Update submission status (admin)
export const updateCoursePlanSubmissionStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    if (!status || !['pending', 'approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Valid status is required (pending, approved, rejected, completed)'
      });
    }

    const submission = await UserCoursePlanSubmission.findById(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    submission.status = status;
    if (notes) submission.notes = notes;

    await submission.save();

    // ── Auto-assign course link when approved ────────────────────────────────
    if (status === 'approved') {
      try {
        // CoursePlan se courseLink lo
        const coursePlan = await CoursePlan.findById(submission.coursePlanId).lean();

        if (coursePlan && coursePlan.courseLink) {
          // Check karo ke already assign nahi hua
          const existing = await CourseLinkAssignment.findOne({
            userPlanSubmissionId: submission._id
          });

          if (!existing) {
            await CourseLinkAssignment.create({
              userPlanSubmissionId: submission._id,
              coursePlanId: submission.coursePlanId,
              userId: submission.userId,
              userName: submission.userName,
              userEmail: submission.userEmail || '',
              category: submission.planCategory,
              courseLink: coursePlan.courseLink,
              sentAt: new Date()
            });
          }
        }
      } catch (linkErr) {
        // Link assign fail hone pe submission approve toh ho jaye, sirf log karo
        console.error('Auto course link assignment error:', linkErr.message);
      }
    }

    await deleteCache(`course_plan_submissions:all`);
    await deleteCache(`course_plan_submissions:${status}`);

    return res.json({
      success: true,
      message: `Submission ${status} successfully`,
      submission
    });
  } catch (err) {
    console.error('Update course plan submission status error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to update submission status'
    });
  }
};

// Delete submission (admin)
export const deleteCoursePlanSubmission = async (req, res) => {
  try {
    const submission = await UserCoursePlanSubmission.findByIdAndDelete(req.params.id);

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    return res.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (err) {
    console.error('Delete course plan submission error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete submission'
    });
  }
};

// Get enrollment status for a specific course plan (for mobile app)
export const getEnrollmentStatus = async (req, res) => {
  try {
    const { userId, coursePlanId } = req.params;

    if (!userId || !coursePlanId) {
      return res.status(400).json({
        success: false,
        message: 'userId and coursePlanId are required'
      });
    }

    // Invalid ObjectId hone pe gracefully handle karo
    if (!mongoose.Types.ObjectId.isValid(coursePlanId)) {
      return res.json({
        success: true,
        enrolled: false,
        status: null,
        displayMessage: 'You have not enrolled in this course yet',
        displayColor: 'gray'
      });
    }

    const submission = await UserCoursePlanSubmission.findOne({ userId, coursePlanId }).lean();

    if (!submission) {
      return res.json({
        success: true,
        enrolled: false,
        status: null,
        displayMessage: 'You have not enrolled in this course yet',
        displayColor: 'gray'
      });
    }

    // Status ke hisaab se clean response
    const statusMap = {
      pending: {
        displayMessage: 'Your request is under review. Please wait for admin approval.',
        displayColor: 'orange',
        displayIcon: 'clock'
      },
      approved: {
        displayMessage: 'Your request has been approved. Course is now active!',
        displayColor: 'green',
        displayIcon: 'check-circle'
      },
      rejected: {
        displayMessage: submission.notes
          ? `Your request was rejected. Reason: ${submission.notes}`
          : 'Your request was rejected. Please contact support.',
        displayColor: 'red',
        displayIcon: 'x-circle'
      },
      completed: {
        displayMessage: 'Congratulations! You have completed this course.',
        displayColor: 'blue',
        displayIcon: 'star'
      }
    };

    const statusInfo = statusMap[submission.status] || {
      displayMessage: 'Unknown status',
      displayColor: 'gray',
      displayIcon: 'info'
    };

    return res.json({
      success: true,
      enrolled: true,
      status: submission.status,
      planTitle: submission.planTitle,
      planCategory: submission.planCategory,
      planPrice: submission.planPrice,
      submittedAt: submission.submittedAt,
      notes: submission.notes || null,
      ...statusInfo
    });

  } catch (err) {
    console.error('Get enrollment status error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch enrollment status'
    });
  }
};

// Get user's own submissions (for mobile app) — multiple courses support
export const getUserCoursePlanSubmission = async (req, res) => {
  try {
    const { userId } = req.params;

    const submissions = await UserCoursePlanSubmission.find({ userId })
      .populate('coursePlanId')
      .sort({ submittedAt: -1 });

    if (!submissions || submissions.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No submissions found for this user'
      });
    }

    return res.json({
      success: true,
      count: submissions.length,
      submissions
    });
  } catch (err) {
    console.error('Get user course plan submission error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch user submissions'
    });
  }
};
