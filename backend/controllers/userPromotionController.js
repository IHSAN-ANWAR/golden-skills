import UserPromotion from '../models/UserPromotion.js';
import Promotion from '../models/Promotion.js';
import Plan from '../models/Plan.js';
import User from '../models/User.js';
import UserTask from '../models/UserTask.js';

// ─── USER: Submit plan purchase for a promotion ───────────────────────────────
export const submitPromotionPlanPurchase = async (req, res) => {
  try {
    const { planId, promotionId, userName, userEmail, userPhone, userImage } = req.body;

    if (!planId || !userName || !userEmail) {
      return res.status(400).json({ success: false, message: 'Plan ID, user name, and email are required' });
    }
    if (!userImage) {
      return res.status(400).json({ success: false, message: 'Payment screenshot is required' });
    }

    const plan = await Plan.findById(planId);
    if (!plan) return res.status(404).json({ success: false, message: 'Plan not found' });

    // Find user by email
    const user = await User.findOne({ email: userEmail.trim().toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: 'User not found. Please register first.' });

    let promotionTitle = '';
    let rewardAmount = '';

    if (promotionId) {
      const promotion = await Promotion.findById(promotionId);
      if (!promotion) return res.status(404).json({ success: false, message: 'Promotion not found' });

      // ── Eligibility check ──────────────────────────────────────────────────
      // If this promotion requires a minimum number of completed tasks,
      // verify the user has met that threshold before allowing submission.
      if (promotion.requiredTaskCount && promotion.requiredTaskCount > 0) {
        const completedTaskCount = await UserTask.countDocuments({
          userEmail: userEmail.trim().toLowerCase(),
          status: { $in: ['approved', 'completed'] }
        });

        if (completedTaskCount < promotion.requiredTaskCount) {
          return res.status(403).json({
            success: false,
            message: `You need to complete at least ${promotion.requiredTaskCount} tasks to apply for this promotion. You have completed ${completedTaskCount} so far.`,
            completedTaskCount,
            requiredTaskCount: promotion.requiredTaskCount,
            tasksRemaining: promotion.requiredTaskCount - completedTaskCount
          });
        }
      }
      // ───────────────────────────────────────────────────────────────────────

      promotionTitle = promotion.title;
      rewardAmount = promotion.rewardAmount;
    }

    const userPromotion = new UserPromotion({
      userId: user._id,
      userName: userName.trim(),
      userEmail: userEmail.trim().toLowerCase(),
      userPhone: userPhone ? userPhone.trim() : '',
      userImage,
      planId,
      planTitle: plan.title,
      planPrice: plan.price,
      promotionId: promotionId || null,
      promotionTitle,
      rewardAmount,
      paymentStatus: 'pending',
      status: 'pending'
    });

    await userPromotion.save();

    res.status(201).json({
      success: true,
      message: 'Promotion plan purchase submitted successfully. Awaiting admin approval.',
      userPromotion
    });
  } catch (error) {
    console.error('Error submitting promotion plan purchase:', error);
    res.status(500).json({ success: false, message: 'Error submitting', error: error.message });
  }
};

// ─── ADMIN: Get all user promotions ──────────────────────────────────────────
export const getAllUserPromotions = async (req, res) => {
  try {
    const { paymentStatus, status, userEmail } = req.query;

    let query = {};
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (status) query.status = status;
    if (userEmail) query.userEmail = { $regex: new RegExp(userEmail, 'i') };

    const userPromotions = await UserPromotion.find(query)
      .populate('planId')
      .populate('promotionId')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: userPromotions.length, userPromotions });
  } catch (error) {
    console.error('Error fetching user promotions:', error);
    res.status(500).json({ success: false, message: 'Error fetching user promotions', error: error.message });
  }
};

// ─── ADMIN: Get single user promotion ────────────────────────────────────────
export const getUserPromotionById = async (req, res) => {
  try {
    const userPromotion = await UserPromotion.findById(req.params.id)
      .populate('planId')
      .populate('promotionId');
    if (!userPromotion) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, userPromotion });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching', error: error.message });
  }
};

// ─── ADMIN: Approve/Reject payment ───────────────────────────────────────────
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus, paymentNotes } = req.body;

    if (!['approved', 'rejected'].includes(paymentStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid payment status' });
    }

    const userPromotion = await UserPromotion.findById(id);
    if (!userPromotion) return res.status(404).json({ success: false, message: 'Not found' });

    userPromotion.paymentStatus = paymentStatus;
    userPromotion.paymentNotes = paymentNotes || '';

    if (paymentStatus === 'approved') {
      userPromotion.status = 'active';
    } else if (paymentStatus === 'rejected') {
      userPromotion.status = 'rejected';
    }

    await userPromotion.save();

    res.json({ success: true, message: `Payment ${paymentStatus} successfully`, userPromotion });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ success: false, message: 'Error updating', error: error.message });
  }
};

// ─── ADMIN: Assign tasks to a user promotion ─────────────────────────────────
export const assignPromotionTasks = async (req, res) => {
  try {
    const { id } = req.params;
    const { tasks } = req.body; // Array of { taskTitle, taskDescription, taskDeadline }

    if (!tasks || !Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one task is required' });
    }

    const userPromotion = await UserPromotion.findById(id);
    if (!userPromotion) return res.status(404).json({ success: false, message: 'Not found' });

    if (userPromotion.paymentStatus !== 'approved') {
      return res.status(400).json({ success: false, message: 'Payment must be approved before assigning tasks' });
    }

    // Validate and add tasks
    for (const task of tasks) {
      if (!task.taskTitle || !task.taskDescription || !task.taskDeadline) {
        return res.status(400).json({ success: false, message: 'Each task needs title, description, and deadline' });
      }
      userPromotion.tasks.push({
        taskTitle: task.taskTitle.trim(),
        taskDescription: task.taskDescription.trim(),
        taskDeadline: new Date(task.taskDeadline),
        status: 'assigned'
      });
    }

    userPromotion.status = 'active';
    await userPromotion.save();

    res.json({ success: true, message: 'Tasks assigned successfully', userPromotion });
  } catch (error) {
    console.error('Error assigning tasks:', error);
    res.status(500).json({ success: false, message: 'Error assigning tasks', error: error.message });
  }
};

// ─── ADMIN: Update a single task status (approve/reject) ─────────────────────
export const updatePromotionTaskStatus = async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { status, adminNotes } = req.body;

    const validStatuses = ['assigned', 'in-progress', 'completed', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const userPromotion = await UserPromotion.findById(id);
    if (!userPromotion) return res.status(404).json({ success: false, message: 'Not found' });

    const task = userPromotion.tasks.id(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.status = status;
    if (adminNotes) task.adminNotes = adminNotes;
    if (status === 'completed' || status === 'approved') {
      task.completedAt = new Date();
    }

    // Check if all tasks are approved → mark promotion as completed
    const allApproved = userPromotion.tasks.length > 0 &&
      userPromotion.tasks.every(t => t.status === 'approved');
    if (allApproved) {
      userPromotion.status = 'completed';
    }

    await userPromotion.save();

    res.json({ success: true, message: `Task ${status} successfully`, userPromotion });
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ success: false, message: 'Error updating task', error: error.message });
  }
};

// ─── ADMIN: Approve reward payment ───────────────────────────────────────────
export const approveRewardPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const { rewardStatus, rewardNotes } = req.body;

    if (!['approved', 'rejected'].includes(rewardStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid reward status' });
    }

    const userPromotion = await UserPromotion.findById(id);
    if (!userPromotion) return res.status(404).json({ success: false, message: 'Not found' });

    userPromotion.rewardStatus = rewardStatus;
    userPromotion.rewardNotes = rewardNotes || '';
    if (rewardStatus === 'approved') {
      userPromotion.rewardApprovedAt = new Date();
      userPromotion.status = 'reward-approved';
    }

    await userPromotion.save();

    res.json({ success: true, message: `Reward ${rewardStatus} successfully`, userPromotion });
  } catch (error) {
    console.error('Error approving reward:', error);
    res.status(500).json({ success: false, message: 'Error approving reward', error: error.message });
  }
};

// ─── USER: Submit a task (from mobile/user side) ──────────────────────────────
export const submitPromotionTask = async (req, res) => {
  try {
    const { id, taskId } = req.params;
    const { submissionData, userNotes } = req.body;

    const userPromotion = await UserPromotion.findById(id);
    if (!userPromotion) return res.status(404).json({ success: false, message: 'Not found' });

    const task = userPromotion.tasks.id(taskId);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

    task.submissionData = submissionData || '';
    task.userNotes = userNotes || '';
    task.status = 'completed';
    task.completedAt = new Date();

    await userPromotion.save();

    res.json({ success: true, message: 'Task submitted successfully', task });
  } catch (error) {
    console.error('Error submitting task:', error);
    res.status(500).json({ success: false, message: 'Error submitting task', error: error.message });
  }
};

// ─── ADMIN: Delete a user promotion ──────────────────────────────────────────
export const deleteUserPromotion = async (req, res) => {
  try {
    const userPromotion = await UserPromotion.findByIdAndDelete(req.params.id);
    if (!userPromotion) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting', error: error.message });
  }
};

// ─── USER: Get promotions by email ───────────────────────────────────────────
export const getUserPromotionsByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    const userPromotions = await UserPromotion.find({ userEmail: email.toLowerCase() })
      .sort({ createdAt: -1 })
      .lean();
    res.json({ success: true, userPromotions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching', error: error.message });
  }
};

// ======================================================
// POST /api/user-promotions/:id/rank  (Admin)
// Assign a custom rank/badge to user after promotion
// Admin types any rank name (Gold, Platinum, Diamond etc.)
// and sets start + optional expiry date from calendar
// ======================================================
export const assignRank = async (req, res) => {
  try {
    const { id } = req.params;
    const { rank, rankStartDate, rankExpiresAt } = req.body;

    if (!rank || !rank.trim()) {
      return res.status(400).json({ success: false, message: 'Rank name is required' });
    }

    // Find the UserPromotion to get the user's email
    const userPromotion = await UserPromotion.findById(id);
    if (!userPromotion) {
      return res.status(404).json({ success: false, message: 'Promotion record not found' });
    }

    // Find the user by email
    const user = await User.findOne({ email: userPromotion.userEmail.toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User account not found' });
    }

    // Guard: reward must be approved before rank can be assigned
    if (userPromotion.rewardStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Reward must be approved before assigning a rank'
      });
    }

    // Assign rank
    user.rank = rank.trim();
    user.rankAssignedAt = rankStartDate ? new Date(rankStartDate) : new Date();
    user.rankExpiresAt = rankExpiresAt ? new Date(rankExpiresAt) : null; // null = no expiry
    user.rankAssignedBy = 'admin';
    await user.save();

    return res.json({
      success: true,
      message: `Rank "${rank.trim()}" assigned to ${user.fullName || user.email} successfully`,
      rank: {
        rank: user.rank,
        rankAssignedAt: user.rankAssignedAt,
        rankExpiresAt: user.rankExpiresAt
      }
    });

  } catch (error) {
    console.error('Assign rank error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during rank assignment',
      error: error.message
    });
  }
};
