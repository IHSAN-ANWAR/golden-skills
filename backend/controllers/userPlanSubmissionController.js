import UserPlanSubmission from '../models/UserPlanSubmission.js';
import Plan from '../models/Plan.js';
import User from '../models/User.js';
import UserTask from '../models/UserTask.js';
import { getCache, setCache, deleteCache } from '../config/redis.js';

// User submits a plan selection with their data
export const submitPlanSelection = async (req, res) => {
  try {
    console.log('Plan submission received:', req.body);
    const { planId, userName, userEmail, userPhone, userImage, additionalData } = req.body;

    // Validate required fields
    if (!planId || !userName) {
      return res.status(400).json({
        success: false,
        message: 'Plan ID and user name are required'
      });
    }

    // Check if payment screenshot is provided
    if (!userImage) {
      return res.status(400).json({
        success: false,
        message: 'Payment screenshot is required for verification'
      });
    }

    // Get plan details
    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Create submission
    const submission = new UserPlanSubmission({
      userId: req.body.userId || null,
      planId,
      planTitle: plan.title,
      planPrice: plan.price,
      userName: userName.trim(),
      userEmail: userEmail ? userEmail.trim() : '',
      userPhone: userPhone ? userPhone.trim() : '',
      userImage: userImage || '',
      additionalData: additionalData || {}
    });
    
    await submission.save();
    console.log('Submission created successfully:', submission);

    res.status(201).json({
      success: true,
      message: 'Payment verification submitted successfully',
      submission
    });
  } catch (error) {
    console.error('Error submitting plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting payment verification',
      error: error.message
    });
  }
};

// Admin gets all submissions (Task History)
export const getAllSubmissions = async (req, res) => {
  try {
    const { status, planId, userEmail } = req.query;
    const cacheKey = `submissions:${status || 'all'}:${planId || 'all'}:${userEmail || 'all'}`;

    const cached = await getCache(cacheKey);
    if (cached) return res.json({ success: true, count: cached.length, submissions: cached, fromCache: true });

    let query = {};
    if (status) query.status = status;
    if (planId) query.planId = planId;
    if (userEmail) query.userEmail = { $regex: new RegExp(userEmail, 'i') };

    const submissions = await UserPlanSubmission.find(query)
      .populate('planId')
      .sort({ userId: 1 })
      .lean();

    await setCache(cacheKey, submissions, 30);
    res.json({ success: true, count: submissions.length, submissions });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ success: false, message: 'Error fetching submissions', error: error.message });
  }
};

// Admin gets a single submission
export const getSubmissionById = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await UserPlanSubmission.findById(id).populate('planId');
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.json({
      success: true,
      submission
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submission',
      error: error.message
    });
  }
};

// Admin updates submission status
export const updateSubmissionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const submission = await UserPlanSubmission.findById(id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    const previousStatus = submission.status;

    if (status) submission.status = status;
    if (notes !== undefined) submission.notes = notes;

    await submission.save();

    // ── Referral counting logic ──────────────────────────────────────────────
    // When admin approves a plan submission (status → 'approved'),
    // find the user by email, mark them as having activated a plan,
    // and increment their referrer's referredUsersCount by 1.
    // Also update referralProgress on any active referral tasks assigned to the referrer.
    // ── FIX 2: Per-submission referralCounted flag use karo (per-user nahi) ─
    // Pehle: hasActivatedPlan per-user tha — doosra plan approve hone pe block skip hota tha
    // Ab: har submission ka apna referralCounted flag hai — har plan sahi track hoga
    if (status === 'approved' && previousStatus !== 'approved' && submission.userEmail && !submission.referralCounted) {
      try {
        const activatedUser = await User.findOne({ 
          email: submission.userEmail.toLowerCase() 
        });

        if (activatedUser) {
          // Mark this submission as referral counted (per-submission flag)
          submission.referralCounted = true;
          await submission.save();

          // Pehli baar plan activate ho raha hai to per-user flag bhi set karo
          if (!activatedUser.hasActivatedPlan) {
            activatedUser.hasActivatedPlan = true;
            await activatedUser.save();
          }

          // If they were referred by someone, increment that referrer's count
          if (activatedUser.referredBy) {
            await User.findByIdAndUpdate(
              activatedUser.referredBy,
              { $inc: { referredUsersCount: 1 } }
            );

            // Find the referrer's email to look up their UserPlanSubmission
            const referrer = await User.findById(activatedUser.referredBy).select('email').lean();

            if (referrer) {
              // Find ALL active referral tasks assigned to the referrer via userEmail
              const referralTasks = await UserTask.find({
                userEmail: referrer.email.toLowerCase(),
                isReferralTask: true,
                status: { $in: ['assigned', 'in-progress'] }
              });

              for (const rTask of referralTasks) {
                rTask.referralProgress = (rTask.referralProgress || 0) + 1;

                // ❌ Auto-complete REMOVED — user manually submits via button
                // Sirf in-progress mark karo, completed NAHI karo
                if (rTask.status === 'assigned') {
                  rTask.status = 'in-progress';
                  rTask.startedAt = rTask.startedAt || new Date();
                }
                // Note: target poora hone pe bhi status 'in-progress' rahega
                // User khud /submit endpoint se manually submit karega

                await rTask.save();
              }

              console.log(
                `Referral task progress updated for referrer ${referrer.email}: ` +
                `${referralTasks.length} task(s) updated`
              );
            }

            console.log(
              `Referral counted: user ${activatedUser.email} activated plan, ` +
              `referrer ${activatedUser.referredBy} count incremented`
            );
          }
        }
      } catch (referralErr) {
        // Log but don't fail the status update if referral tracking errors
        console.error('Referral count update error:', referralErr);
      }
    }
    // ────────────────────────────────────────────────────────────────────────

    await deleteCache(`submissions:all:all:all`);
    await deleteCache(`submissions:${submission.status}:all:all`);

    res.json({
      success: true,
      message: 'Submission updated successfully',
      submission
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating submission',
      error: error.message
    });
  }
};

// Admin deletes a submission
export const deleteSubmission = async (req, res) => {
  try {
    const { id } = req.params;

    const submission = await UserPlanSubmission.findByIdAndDelete(id);
    
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found'
      });
    }

    res.json({
      success: true,
      message: 'Submission deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting submission',
      error: error.message
    });
  }
};

// Mobile API — Get payment status by user email
export const getStatusByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const submission = await UserPlanSubmission.findOne({
      userEmail: { $regex: new RegExp(`^${email}$`, 'i') }
    })
      .sort({ createdAt: -1 })
      .lean();

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'No submission found for this email',
        status: null
      });
    }

    // Map status to user-friendly label
    const statusLabels = {
      pending:  'Payment Under Review',
      approved: 'Payment Approved — In Progress',
      rejected: 'Payment Rejected',
      completed: 'Completed'
    };

    res.json({
      success: true,
      status: submission.status,
      statusLabel: statusLabels[submission.status] || submission.status,
      submission: {
        _id:         submission._id,
        planTitle:   submission.planTitle,
        planPrice:   submission.planPrice,
        userName:    submission.userName,
        userEmail:   submission.userEmail,
        status:      submission.status,
        notes:       submission.notes || '',
        submittedAt: submission.submittedAt,
        updatedAt:   submission.updatedAt
      }
    });
  } catch (error) {
    console.error('Error fetching status by email:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching payment status',
      error: error.message
    });
  }
};

export default {
  submitPlanSelection,
  getAllSubmissions,
  getSubmissionById,
  updateSubmissionStatus,
  deleteSubmission,
  getStatusByEmail
};
