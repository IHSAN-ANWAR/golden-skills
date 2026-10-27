import express from 'express';
import { assignTaskToUser, assignTaskToAll, getAllUserTasks, updateUserTaskStatus, deleteUserTask, getTaskCompletionStats, getUserTaskEarnings } from '../controllers/userTaskController.js';
import { authenticateAdmin, authenticateUser } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — Get total earnings for a user by email
// MUST be at the top — before any /:id routes to avoid conflict
// Endpoint: GET /api/user-tasks/earnings/:email
// ─────────────────────────────────────────────────────────────────────────────
router.get('/earnings/:email', getUserTaskEarnings);

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE APP — Get my completed tasks (approved + completed)
// Endpoint: GET /api/user-tasks/my-completed-tasks
// Headers:  Authorization: Bearer <token>
// ─────────────────────────────────────────────────────────────────────────────
router.get('/my-completed-tasks', authenticateUser, async (req, res) => {
  try {
    const { default: User } = await import('../models/User.js');
    const { default: UserTask } = await import('../models/UserTask.js');

    const user = await User.findById(req.user.id).select('email').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const tasks = await UserTask.find({
      userEmail: user.email,
      status: { $in: ['completed', 'approved'] }
    })
      .select('-__v')
      .sort({ completedAt: -1 })
      .lean();

    res.json({
      success: true,
      count: tasks.length,
      tasks
    });

  } catch (error) {
    console.error('Get my completed tasks error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch completed tasks', error: error.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN — Referral task verification data
// Endpoint: GET /api/user-tasks/:id/referral-verification
// Access:   Admin only
// Purpose:  Admin submitted task review mein actual referral data dikhao
//           — kaun kaun join hua, kisne plan purchase kiya
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id/referral-verification', authenticateAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { default: UserTask } = await import('../models/UserTask.js');
    const { default: User } = await import('../models/User.js');

    const task = await UserTask.findById(id).lean();
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (!task.isReferralTask) {
      return res.status(400).json({ success: false, message: 'Not a referral task' });
    }

    // Task owner dhundo (jis user ko task assign hua)
    const taskOwner = await User.findOne({
      email: task.userEmail.toLowerCase()
    }).select('_id fullName email myReferralCode').lean();

    if (!taskOwner) {
      return res.status(404).json({ success: false, message: 'Task owner not found' });
    }

    // Is user ke referral se join hone wale sab users dhundo
    const referredUsers = await User.find({ referredBy: taskOwner._id })
      .select('fullName email city hasActivatedPlan createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const totalJoined = referredUsers.length;
    const totalPurchased = referredUsers.filter(u => u.hasActivatedPlan).length;

    res.json({
      success: true,
      task: {
        _id: task._id,
        taskTitle: task.taskTitle,
        referralTarget: task.referralTarget,
        referralProgress: task.referralProgress,
        status: task.status,
        assignedAt: task.assignedAt,
        completedAt: task.completedAt
      },
      owner: {
        name: taskOwner.fullName,
        email: taskOwner.email,
        referralCode: taskOwner.myReferralCode
      },
      summary: {
        target: task.referralTarget,
        totalJoined,
        totalPurchased,
        targetMet: totalPurchased >= task.referralTarget
      },
      referredUsers: referredUsers.map((u, i) => ({
        serial: i + 1,
        name: u.fullName,
        email: u.email,
        city: u.city || '—',
        joinedAt: u.createdAt,
        hasPurchasedPlan: u.hasActivatedPlan
      }))
    });

  } catch (error) {
    console.error('Referral verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch referral verification data',
      error: error.message
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — Top 5 Users Leaderboard (sabse zyada tasks complete)
// Endpoint: GET /api/user-tasks/leaderboard
// No auth required — mobile app mein directly show karo
// Returns: Top 5 users sorted by completed+approved task count
// ─────────────────────────────────────────────────────────────────────────────
router.get('/leaderboard', async (req, res) => {
  try {
    const { default: UserTask } = await import('../models/UserTask.js');

    const limit = parseInt(req.query.limit) || 5;

    const leaderboard = await UserTask.aggregate([
      // Sirf completed ya approved tasks count karo
      {
        $match: {
          status: { $in: ['completed', 'approved'] }
        }
      },
      // User ke hisaab se group karo
      {
        $group: {
          _id: '$userEmail',
          userName: { $first: '$userName' },
          userEmail: { $first: '$userEmail' },
          completedTasks: { $sum: 1 },
          // Approved tasks alag count
          approvedTasks: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          // Total points
          totalPoints: { $sum: '$taskPoints' },
          // Last task complete kab hua
          lastCompletedAt: { $max: '$completedAt' }
        }
      },
      // Sabse zyada completed tasks pehle
      { $sort: { completedTasks: -1, totalPoints: -1 } },
      { $limit: limit },
      // Rank add karo
      {
        $group: {
          _id: null,
          users: { $push: '$$ROOT' }
        }
      },
      {
        $unwind: { path: '$users', includeArrayIndex: 'users.rankIndex' }
      },
      {
        $replaceRoot: {
          newRoot: {
            $mergeObjects: [
              '$users',
              { rank: { $add: ['$users.rankIndex', 1] } }
            ]
          }
        }
      },
      {
        $project: {
          _id: 0,
          rankIndex: 0
        }
      }
    ]);

    return res.json({
      success: true,
      total: leaderboard.length,
      leaderboard
    });

  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard',
      error: error.message
    });
  }
});

// Admin routes (protected)
router.post('/assign', authenticateAdmin, assignTaskToUser);
router.post('/assign-all', authenticateAdmin, assignTaskToAll);
router.get('/', authenticateAdmin, getAllUserTasks);
router.get('/stats', authenticateAdmin, getTaskCompletionStats);

router.put('/:id', authenticateAdmin, updateUserTaskStatus);
router.delete('/:id', authenticateAdmin, deleteUserTask);

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE APP — Get MY tasks (JWT token required)
// Endpoint: GET /api/user-tasks/my-tasks
// Headers:  Authorization: Bearer <token>
// Returns tasks split into:
//   activeTasks   → assigned, in-progress  (user can act on these)
//   pendingReview → completed              (submitted, waiting admin)
//   history       → approved, rejected     (done/closed)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/my-tasks', authenticateUser, async (req, res) => {
  try {
    const { default: User } = await import('../models/User.js');
    const { default: UserTask } = await import('../models/UserTask.js');
    const { default: UserPlanSubmission } = await import('../models/UserPlanSubmission.js');

    // Token se verified user nikalo
    const user = await User.findById(req.user.id).select('email').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // ── FIX 1: Sirf LATEST approved submission ke tasks dikhao ──────────────
    // Email se saari approved submissions dhundo, latest wali lo
    const latestApprovedSubmission = await UserPlanSubmission.findOne({
      userEmail: user.email,
      status: 'approved'
    })
      .sort({ createdAt: -1 })  // latest pehle
      .select('_id planTitle planPrice')
      .lean();

    // Agar koi approved submission nahi hai to empty response
    if (!latestApprovedSubmission) {
      return res.json({
        success: true,
        email: user.email,
        currentPlan: null,
        counts: { active: 0, pendingReview: 0, history: 0, total: 0 },
        activeTasks: [],
        pendingReview: [],
        history: []
      });
    }

    // Sirf is submission ke tasks fetch karo — dusre plans ke tasks nahi aayenge
    const tasks = await UserTask.find({
      userPlanSubmissionId: latestApprovedSubmission._id   // ← submission ID se filter
    })
      .select('-__v')
      .sort({ assignedAt: -1 })
      .lean();

    // Tasks ko categories mein split karo
    const activeTasks   = tasks.filter(t => ['assigned', 'in-progress'].includes(t.status));
    const pendingReview = tasks.filter(t => t.status === 'completed');
    const history       = tasks.filter(t => ['approved', 'rejected'].includes(t.status));

    // Referral tasks ke liye real-time progress inject karo
    // User already imported above — reuse karo
    const taskOwnerForRef = await User.findOne({ email: user.email }).select('_id').lean();
    let liveReferralCount = 0;
    if (taskOwnerForRef) {
      liveReferralCount = await User.countDocuments({
        referredBy: taskOwnerForRef._id,
        hasActivatedPlan: true
      });
    }

    // Inject live progress into referral tasks
    const enrichTask = (t) => {
      if (!t.isReferralTask) return t;
      return {
        ...t,
        referralProgress: liveReferralCount,
        remaining: Math.max(0, t.referralTarget - liveReferralCount),
        liveProgressSynced: true
      };
    };

    res.json({
      success: true,
      email: user.email,
      currentPlan: {
        submissionId: latestApprovedSubmission._id,
        planTitle:    latestApprovedSubmission.planTitle,
        planPrice:    latestApprovedSubmission.planPrice
      },
      counts: {
        active:        activeTasks.length,
        pendingReview: pendingReview.length,
        history:       history.length,
        total:         tasks.length
      },
      activeTasks:    activeTasks.map(enrichTask),
      pendingReview:  pendingReview.map(enrichTask),
      history:        history.map(enrichTask)
    });

  } catch (error) {
    console.error('Get my tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LEGACY — Get tasks by email (kept for backward compatibility)
// ⚠️  Deprecated: Mobile app should use /my-tasks instead
// Now uses same logic as /my-tasks — latest approved submission only
// Token required — URL email parameter is ignored for security
// ─────────────────────────────────────────────────────────────────────────────
router.get('/user/:email', authenticateUser, async (req, res) => {
  try {
    const { default: User } = await import('../models/User.js');
    const { default: UserTask } = await import('../models/UserTask.js');
    const { default: UserPlanSubmission } = await import('../models/UserPlanSubmission.js');

    // Token se verified email — URL parameter ignore (security)
    const user = await User.findById(req.user.id).select('email').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Sirf latest approved submission ke tasks — purane plans exclude
    const latestApprovedSubmission = await UserPlanSubmission.findOne({
      userEmail: user.email,
      status: 'approved'
    })
      .sort({ createdAt: -1 })
      .select('_id planTitle planPrice')
      .lean();

    if (!latestApprovedSubmission) {
      return res.json({
        success: true,
        tasks: [],
        activeTasks: [],
        pendingReview: [],
        history: [],
        currentPlan: null
      });
    }

    const tasks = await UserTask.find({
      userPlanSubmissionId: latestApprovedSubmission._id
    })
      .select('-__v')
      .sort({ assignedAt: -1 })
      .lean();

    // Split by status — same as /my-tasks
    const activeTasks   = tasks.filter(t => ['assigned', 'in-progress'].includes(t.status));
    const pendingReview = tasks.filter(t => t.status === 'completed');
    const history       = tasks.filter(t => ['approved', 'rejected'].includes(t.status));

    res.json({
      success: true,
      currentPlan: {
        submissionId: latestApprovedSubmission._id,
        planTitle:    latestApprovedSubmission.planTitle,
        planPrice:    latestApprovedSubmission.planPrice
      },
      // Legacy flat array — mobile app purana format expect karta hai
      tasks,
      // New split format
      activeTasks,
      pendingReview,
      history
    });
  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks',
      error: error.message
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC — Get completed task count by userId
// Endpoint: GET /api/user-tasks/user/:userId/completed-count
// Returns:  Sirf kitne tasks complete kiye (completed + approved)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/user/:userId/completed-count', async (req, res) => {
  try {
    const { userId } = req.params;
    const { default: UserTask } = await import('../models/UserTask.js');
    const { default: UserPlanSubmission } = await import('../models/UserPlanSubmission.js');

    // userId se submission dhundo
    const submission = await UserPlanSubmission.findOne({ userId }).select('_id').lean();

    if (!submission) {
      return res.json({ success: true, userId, completedTasks: 0 });
    }

    // Sirf completed + approved count karo
    const completedTasks = await UserTask.countDocuments({
      userPlanSubmissionId: submission._id,
      status: { $in: ['completed', 'approved'] }
    });

    res.json({
      success: true,
      userId,
      completedTasks
    });

  } catch (error) {
    console.error('Get completed count error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch completed task count',
      error: error.message
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE APP — Get MY completed tasks with details (JWT token required)
// Endpoint: GET /api/user-tasks/my-completed-tasks
// Headers:  Authorization: Bearer <token>
// Returns:
//   completedCount  → total tasks jo complete + approved hain
//   tasks           → har task ki poori details (title, description, dates, etc.)
//
// Mobile app mein user ki "Meri Taraqqi" / history screen pe use karo.
// Sirf woh tasks aate hain jinka status 'completed' ya 'approved' hai.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/my-completed-tasks', authenticateUser, async (req, res) => {
  try {
    const { default: User } = await import('../models/User.js');
    const { default: UserTask } = await import('../models/UserTask.js');
    const { default: UserPlanSubmission } = await import('../models/UserPlanSubmission.js');

    // Token se verified user nikalo
    const user = await User.findById(req.user.id).select('email fullName').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Latest approved submission dhundo (sirf us plan ke tasks)
    const latestApprovedSubmission = await UserPlanSubmission.findOne({
      userEmail: user.email,
      status: 'approved'
    })
      .sort({ createdAt: -1 })
      .select('_id planTitle planPrice')
      .lean();

    // Koi approved plan nahi
    if (!latestApprovedSubmission) {
      return res.json({
        success: true,
        userName: user.fullName,
        email: user.email,
        currentPlan: null,
        completedCount: 0,
        tasks: []
      });
    }

    // Sirf completed + approved tasks fetch karo — latest submission se
    const completedTasks = await UserTask.find({
      userPlanSubmissionId: latestApprovedSubmission._id,
      status: { $in: ['completed', 'approved'] }
    })
      .select('taskTitle taskDescription taskPoints status assignedAt startedAt completedAt approvedAt isCustomTask isReferralTask referralTarget referralProgress referralReward userNotes adminNotes')
      .sort({ completedAt: -1 })   // sabse pehle woh jo haal mein complete hua
      .lean();

    // Mobile app ke liye readable format mein transform karo
    const formattedTasks = completedTasks.map((task, index) => ({
      serialNo:       index + 1,
      taskId:         task._id,
      title:          task.taskTitle,
      description:    task.taskDescription,
      points:         task.taskPoints,
      status:         task.status,                   // 'completed' ya 'approved'
      isApproved:     task.status === 'approved',    // quick boolean check
      taskType:       task.isReferralTask ? 'referral' : task.isCustomTask ? 'custom' : 'standard',
      // Referral task extra info
      referralInfo: task.isReferralTask ? {
        target:   task.referralTarget,
        achieved: task.referralProgress,
        reward:   task.referralReward
      } : null,
      // Dates
      assignedAt:     task.assignedAt,
      startedAt:      task.startedAt   || null,
      completedAt:    task.completedAt || null,
      approvedAt:     task.approvedAt  || null,
      // Notes
      userNotes:      task.userNotes   || '',
      adminNotes:     task.adminNotes  || ''
    }));

    res.json({
      success: true,
      userName:       user.fullName,
      email:          user.email,
      currentPlan: {
        submissionId: latestApprovedSubmission._id,
        planTitle:    latestApprovedSubmission.planTitle,
        planPrice:    latestApprovedSubmission.planPrice
      },
      completedCount:   formattedTasks.length,
      approvedCount:    formattedTasks.filter(t => t.isApproved).length,
      pendingApproval:  formattedTasks.filter(t => !t.isApproved).length,
      tasks:            formattedTasks
    });

  } catch (error) {
    console.error('Get my completed tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch completed tasks',
      error: error.message
    });
  }
});

// Public: Check promotion eligibility by email (3 approved/completed tasks required)
router.get('/check-eligibility/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const { default: UserTask } = await import('../models/UserTask.js');

    // Count tasks that are completed or approved
    const completedCount = await UserTask.countDocuments({
      userEmail: email.toLowerCase(),
      status: { $in: ['completed', 'approved'] }
    });

    const REQUIRED_TASKS = 3;
    const isEligible = completedCount >= REQUIRED_TASKS;

    res.json({
      success: true,
      completedTasks: completedCount,
      requiredTasks: REQUIRED_TASKS,
      isEligible,
      remaining: isEligible ? 0 : REQUIRED_TASKS - completedCount
    });
  } catch (error) {
    console.error('Check eligibility error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check eligibility',
      error: error.message
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE APP — Referral task progress sync (CHECK ONLY — NO AUTO-SUBMIT)
// Endpoint: POST /api/user-tasks/:id/sync-referral-progress
// Headers:  Authorization: Bearer <token>
// Purpose:  Sirf referral count update karo aur progress dikhao.
//           ❌ Auto-complete NAHI hogi — user khud /submit dabayega.
//           ✅ readyToSubmit: true aayega jab target poora ho — mobile app
//              tab "Submit Task" button enable karega.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/sync-referral-progress', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { default: User } = await import('../models/User.js');
    const { default: UserTask } = await import('../models/UserTask.js');

    // Token se user dhundo
    const user = await User.findById(req.user.id).select('email myReferralCode').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Task dhundo aur verify karo ke ye is user ka hai
    const task = await UserTask.findById(id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.userEmail.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(403).json({ success: false, message: 'Not authorized to sync this task' });
    }

    if (!task.isReferralTask) {
      return res.status(400).json({ success: false, message: 'This is not a referral task' });
    }

    // Already submitted ya approved hai to sirf current state return karo
    if (task.status === 'completed' || task.status === 'approved') {
      return res.json({
        success: true,
        message: 'Task already submitted for review',
        referralProgress: task.referralProgress,
        referralTarget: task.referralTarget,
        remaining: 0,
        readyToSubmit: false,   // already submitted — button na dikhao
        task
      });
    }

    // Live referral count fetch karo
    const referredAndPurchased = await User.countDocuments({
      referredBy: user._id,
      hasActivatedPlan: true
    });

    const previousProgress = task.referralProgress;
    task.referralProgress = referredAndPurchased;

    // Sirf in-progress mark karo agar progress shuru hua — COMPLETED NAHI KARO
    if (referredAndPurchased > 0 && task.status === 'assigned') {
      task.status = 'in-progress';
      task.startedAt = task.startedAt || new Date();
    }

    // ❌ task.status = 'completed' — REMOVED (user manually submit karega)

    await task.save();

    const remaining = Math.max(0, task.referralTarget - referredAndPurchased);
    const readyToSubmit = referredAndPurchased >= task.referralTarget;

    res.json({
      success: true,
      message: readyToSubmit
        ? `🎉 Target complete! ${referredAndPurchased}/${task.referralTarget} referrals done. Ab Submit button dabao.`
        : `Progress updated: ${referredAndPurchased}/${task.referralTarget} referrals done. ${remaining} baaki hain.`,
      progressChanged: referredAndPurchased !== previousProgress,
      referralProgress: referredAndPurchased,
      referralTarget: task.referralTarget,
      remaining,
      readyToSubmit,   // ← mobile app is flag se Submit button enable/disable kare
      task
    });

  } catch (error) {
    console.error('Sync referral progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to sync referral progress',
      error: error.message
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE APP — Smart Submit Button Endpoint
// Endpoint: POST /api/user-tasks/:id/submit
// Headers:  Authorization: Bearer <token>
//
// Ye ek hi endpoint hai jo "Submit Task" button pe lagao.
// Button click hone pe ye khud check karta hai:
//
//   REFERRAL TASK:
//     → Live referral count check karta hai
//     → Target poora nahi? BLOCK + "X referrals baaki hain" message
//     → Target poora? Submit ho jaata hai ✅
//
//   NORMAL / CUSTOM TASK:
//     → Status "assigned" hai? BLOCK + "Pehle task start karo" message
//     → Status "in-progress" hai? Submit ho jaata hai ✅
//
//   ALREADY SUBMITTED / APPROVED:
//     → Block with message
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/submit', authenticateUser, async (req, res) => {
  try {
    const { id } = req.params;
    const { submissionData, submissionImage, userNotes } = req.body;

    const { default: UserTask } = await import('../models/UserTask.js');
    const { default: User } = await import('../models/User.js');

    // Token se user verify karo
    const user = await User.findById(req.user.id).select('email _id').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const task = await UserTask.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Security: sirf apni task submit kar sako
    if (task.userEmail.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to submit this task'
      });
    }

    // ── Already submitted / approved check ───────────────────────────────
    if (task.status === 'completed') {
      return res.status(400).json({
        success: false,
        canSubmit: false,
        reason: 'already_submitted',
        message: 'Task already submitted. Admin review ka wait karo.',
        task
      });
    }

    if (task.status === 'approved') {
      return res.status(400).json({
        success: false,
        canSubmit: false,
        reason: 'already_approved',
        message: 'Task already approved by admin.',
        task
      });
    }

    // ── REFERRAL TASK — live count check karo ────────────────────────────
    if (task.isReferralTask) {
      const referredAndPurchased = await User.countDocuments({
        referredBy: user._id,
        hasActivatedPlan: true
      });

      // Progress sync karo
      task.referralProgress = referredAndPurchased;

      const remaining = task.referralTarget - referredAndPurchased;

      // Target poora nahi — BLOCK
      if (referredAndPurchased < task.referralTarget) {
        // in-progress mark karo agar shuru hua
        if (referredAndPurchased > 0 && task.status === 'assigned') {
          task.status = 'in-progress';
          task.startedAt = task.startedAt || new Date();
        }
        await task.save();

        return res.status(400).json({
          success: false,
          canSubmit: false,
          reason: 'referral_incomplete',
          message: `Pehle task complete karo. ${remaining} aur log refer karo jo package purchase karein.`,
          referralProgress: referredAndPurchased,
          referralTarget: task.referralTarget,
          remaining,
          task
        });
      }

      // Target poora — seedha submit karo, normal task check skip karo
      task.status = 'completed';
      task.completedAt = new Date();
      task.submissionData = submissionData || '';
      task.submissionImage = submissionImage || '';
      task.userNotes = userNotes || '';
      await task.save();

      return res.json({
        success: true,
        canSubmit: true,
        message: 'Task submitted successfully. Admin review karega.',
        task
      });
    }

    // ── NORMAL / CUSTOM TASK — status check karo ─────────────────────────
    if (!task.isReferralTask) {
      if (task.status === 'assigned') {
        return res.status(400).json({
          success: false,
          canSubmit: false,
          reason: 'task_not_started',
          message: 'Pehle task complete karo, phir submit karo.',
          task
        });
      }
      // status "in-progress" hai — allow submit
    }

    // ── SUBMIT ────────────────────────────────────────────────────────────
    task.status = 'completed';
    task.completedAt = new Date();
    task.submissionData = submissionData || '';
    task.submissionImage = submissionImage || '';
    task.userNotes = userNotes || '';

    await task.save();

    res.json({
      success: true,
      canSubmit: true,
      message: 'Task submitted successfully. Admin review karega.',
      task
    });

  } catch (error) {
    console.error('Submit task error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit task',
      error: error.message
    });
  }
});

export default router;