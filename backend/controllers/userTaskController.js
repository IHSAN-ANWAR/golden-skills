import UserTask from '../models/UserTask.js';
import UserPlanSubmission from '../models/UserPlanSubmission.js';
import Task from '../models/Task.js';
import Plan from '../models/Plan.js';
import User from '../models/User.js';

// Admin assigns a task to a user who purchased a plan
// Supports both regular tasks and referral tasks (isReferralTask: true)
export const assignTaskToUser = async (req, res) => {
  try {
    const {
      userPlanSubmissionId,
      taskId,
      adminNotes,
      isCustomTask,
      customTaskTitle,
      customTaskDescription,
      customTaskMessage,
      taskDeadline,
      taskPoints,
      // Referral task fields
      isReferralTask,
      referralTarget,
      referralReward,
      referralPackagePrice
    } = req.body;

    // Validate required fields
    if (!userPlanSubmissionId) {
      return res.status(400).json({
        success: false,
        message: 'User plan submission ID is required'
      });
    }

    // For custom tasks, we don't need taskId
    const isCustom = isCustomTask === true;
    const isReferral = isReferralTask === true;

    if (!isCustom && !isReferral && !taskId) {
      return res.status(400).json({
        success: false,
        message: 'Task ID is required for non-custom, non-referral tasks'
      });
    }

    // Validate referral task fields
    if (isReferral) {
      if (!referralTarget || referralTarget < 1) {
        return res.status(400).json({
          success: false,
          message: 'referralTarget must be at least 1 for referral tasks'
        });
      }
      if (!referralReward || String(referralReward).trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'referralReward is required for referral tasks (e.g. "10000")'
        });
      }
    }

    // Get user plan submission
    const userPlanSubmission = await UserPlanSubmission.findById(userPlanSubmissionId);
    if (!userPlanSubmission) {
      return res.status(404).json({
        success: false,
        message: 'User plan submission not found'
      });
    }

    // Check if user has approved payment
    if (userPlanSubmission.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Can only assign tasks to users with approved payments'
      });
    }

    let taskData;

    if (isReferral) {
      // Referral task — admin defines target, reward, and optional package price
      taskData = {
        taskTitle: customTaskTitle || `Refer ${referralTarget} People`,
        taskDescription: customTaskDescription ||
          `Refer ${referralTarget} people who must each activate a package. ` +
          `Reward: ${referralReward}${referralPackagePrice ? ` | Required package: ${referralPackagePrice}` : ''}`,
        taskDeadline: taskDeadline
          ? new Date(taskDeadline)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // default 30 days
        taskPoints: taskPoints || 0
      };
    } else if (isCustom) {
      // Custom task data
      taskData = {
        taskTitle: customTaskTitle || 'Custom Task',
        taskDescription: customTaskDescription || 'Custom task assigned by admin',
        taskDeadline: taskDeadline
          ? new Date(taskDeadline)
          : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // default 7 days
        taskPoints: taskPoints || 10
      };
    } else {
      // Standard task from Task collection
      const task = await Task.findById(taskId);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found'
        });
      }
      taskData = {
        taskTitle: task.title,
        taskDescription: task.description,
        taskDeadline: task.deadline,
        taskPoints: task.points
      };
    }

    // Check for duplicate assignment
    const existingAssignmentQuery = { userPlanSubmissionId };
    if (isCustom || isReferral) {
      existingAssignmentQuery.taskTitle = taskData.taskTitle;
      if (isReferral) existingAssignmentQuery.isReferralTask = true;
      else existingAssignmentQuery.isCustomTask = true;
    } else {
      existingAssignmentQuery.taskId = taskId;
    }

    const existingAssignment = await UserTask.findOne(existingAssignmentQuery);
    if (existingAssignment) {
      return res.status(400).json({
        success: false,
        message: 'This task is already assigned to this user'
      });
    }

    // Get plan details
    const plan = await Plan.findById(userPlanSubmission.planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    // Create user task assignment
    const userTask = new UserTask({
      userId: userPlanSubmission._id,
      userPlanSubmissionId,
      userName: userPlanSubmission.userName,
      userEmail: userPlanSubmission.userEmail,
      planId: userPlanSubmission.planId,
      planTitle: userPlanSubmission.planTitle,
      planPrice: userPlanSubmission.planPrice,
      taskId: (isCustom || isReferral) ? null : taskId,
      taskTitle: taskData.taskTitle,
      taskDescription: taskData.taskDescription,
      isCustomTask: isCustom,
      isReferralTask: isReferral,
      referralTarget: isReferral ? Number(referralTarget) : 0,
      referralReward: isReferral ? String(referralReward).trim() : '',
      referralPackagePrice: isReferral && referralPackagePrice ? String(referralPackagePrice).trim() : '',
      referralProgress: 0,
      customTaskMessage: customTaskMessage || '',
      taskDeadline: taskData.taskDeadline,
      taskPoints: taskData.taskPoints,
      status: 'assigned',
      adminNotes: adminNotes || '',
      assignedAt: new Date()
    });

    await userTask.save();

    const populatedUserTask = await UserTask.findById(userTask._id)
      .populate('userPlanSubmissionId')
      .populate('taskId');

    res.status(201).json({
      success: true,
      message: isReferral
        ? `Referral task assigned: user must refer ${referralTarget} people who activate a package`
        : 'Task assigned to user successfully',
      userTask: populatedUserTask
    });

  } catch (error) {
    console.error('Assign task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during task assignment',
      error: error.message
    });
  }
};

// Get all user tasks with filtering and statistics
export const getAllUserTasks = async (req, res) => {
  try {
    const { status, userEmail, planId, includeStats } = req.query;
    
    let query = {};
    if (status) query.status = status;
    if (userEmail) query.userEmail = { $regex: new RegExp(userEmail, 'i') };
    if (planId) query.planId = planId;

    // Fetch tasks without populate for better performance
    const userTasks = await UserTask.find(query)
      .select('-__v') // Exclude version field
      .sort({ assignedAt: -1 })
      .lean(); // Use lean() for faster queries

    // Only calculate stats if explicitly requested
    let stats = null;
    let userStats = null;

    if (includeStats === 'true') {
      // Use single aggregation for all counts
      const statusCounts = await UserTask.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      const countsMap = {};
      statusCounts.forEach(item => {
        countsMap[item._id] = item.count;
      });

      const totalTasks = statusCounts.reduce((sum, item) => sum + item.count, 0);

      stats = {
        total: totalTasks,
        completed: countsMap['completed'] || 0,
        inProgress: countsMap['in-progress'] || 0,
        assigned: countsMap['assigned'] || 0,
        overdue: countsMap['overdue'] || 0,
        approved: countsMap['approved'] || 0,
        rejected: countsMap['rejected'] || 0
      };

      // Get user completion statistics
      userStats = await UserTask.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$userEmail',
            userName: { $first: '$userName' },
            totalTasks: { $sum: 1 },
            completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            inProgressTasks: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
            assignedTasks: { $sum: { $cond: [{ $eq: ['$status', 'assigned'] }, 1, 0] } },
            totalPoints: { $sum: '$taskPoints' },
            earnedPoints: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$taskPoints', 0] } }
          }
        },
        { $sort: { completedTasks: -1, totalTasks: -1 } }
      ]);
    }

    res.json({
      success: true,
      count: userTasks.length,
      stats: stats,
      userStats: userStats,
      userTasks: userTasks
    });

  } catch (error) {
    console.error('Get user tasks error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user tasks',
      error: error.message
    });
  }
};

// Update user task status (admin or user)
export const updateUserTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, userNotes, adminNotes, submissionData, rewardAmount } = req.body;

    console.log('Updating task:', id, 'to status:', status);

    const userTask = await UserTask.findById(id);
    if (!userTask) {
      return res.status(404).json({
        success: false,
        message: 'User task not found'
      });
    }

    // Prepare update object
    const updateData = {};

    // Handle status updates
    if (status === 'in-progress') {
      updateData.status = 'in-progress';
      if (!userTask.startedAt) {
        updateData.startedAt = new Date();
      }
    } else if (status === 'completed') {
      updateData.status = 'completed';
      updateData.completedAt = new Date();
    } else if (status === 'approved') {
      updateData.status = 'approved';
      updateData.approvedAt = new Date();
      if (!userTask.completedAt) {
        updateData.completedAt = new Date();
      }
      // Save reward amount if admin provided it
      if (typeof rewardAmount === 'string' && rewardAmount.trim() !== '') {
        updateData.rewardAmount = rewardAmount.trim();
      }
    } else if (status === 'rejected') {
      updateData.status = 'assigned'; // Move back to pending
      updateData.rejectedAt = new Date();
      updateData.completedAt = null;
    } else {
      updateData.status = status;
    }

    // Handle notes
    if (typeof userNotes === 'string') {
      updateData.userNotes = userNotes;
    }
    if (typeof adminNotes === 'string') {
      updateData.adminNotes = adminNotes;
    }
    if (typeof submissionData === 'string') {
      updateData.submissionData = submissionData;
    }

    // Use findByIdAndUpdate to bypass schema validation issues
    const updatedTask = await UserTask.findByIdAndUpdate(
      id,
      { $set: updateData },
      { 
        new: true, 
        runValidators: false // Bypass validation to avoid enum issues
      }
    );

    console.log('Task updated successfully:', updatedTask._id, 'new status:', updatedTask.status);

    res.json({
      success: true,
      message: status === 'rejected' 
        ? 'Task rejected and moved back to pending' 
        : status === 'approved'
        ? 'Task approved successfully'
        : 'User task status updated successfully',
      userTask: updatedTask
    });

  } catch (error) {
    console.error('Update user task status error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      success: false,
      message: 'Server error during status update',
      error: error.message,
      details: error.toString()
    });
  }
};

// Delete user task assignment
export const deleteUserTask = async (req, res) => {
  try {
    const { id } = req.params;

    const userTask = await UserTask.findByIdAndDelete(id);
    if (!userTask) {
      return res.status(404).json({
        success: false,
        message: 'User task not found'
      });
    }

    res.json({
      success: true,
      message: 'User task deleted successfully'
    });

  } catch (error) {
    console.error('Delete user task error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during task deletion',
      error: error.message
    });
  }
};

// Get task completion history/statistics
export const getTaskCompletionStats = async (req, res) => {
  try {
    // Use single aggregation for all statistics
    const statsAggregation = await UserTask.aggregate([
      {
        $facet: {
          // Overall counts by status
          statusCounts: [
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ],
          // User rankings
          userRankings: [
            {
              $group: {
                _id: '$userEmail',
                userName: { $first: '$userName' },
                totalAssigned: { $sum: 1 },
                completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
                inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
                totalPoints: { $sum: '$taskPoints' },
                earnedPoints: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$taskPoints', 0] } }
              }
            },
            {
              $project: {
                userName: 1,
                totalAssigned: 1,
                completed: 1,
                inProgress: 1,
                completionRate: {
                  $cond: [
                    { $eq: ['$totalAssigned', 0] },
                    0,
                    { $multiply: [{ $divide: ['$completed', '$totalAssigned'] }, 100] }
                  ]
                },
                totalPoints: 1,
                earnedPoints: 1
              }
            },
            { $sort: { completed: -1, completionRate: -1 } }
          ]
        }
      }
    ]);

    // Process status counts
    const statusCounts = {};
    statsAggregation[0].statusCounts.forEach(item => {
      statusCounts[item._id] = item.count;
    });

    const totalAssignments = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    const completedTasks = statusCounts['completed'] || 0;

    // Get recent completions (separate query, limited to 10)
    const recentCompletions = await UserTask.find({ status: 'completed' })
      .select('userName userEmail taskTitle completedAt taskPoints')
      .sort({ completedAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      stats: {
        totalAssignments,
        completedTasks,
        inProgressTasks: statusCounts['in-progress'] || 0,
        assignedTasks: statusCounts['assigned'] || 0,
        overdueTasks: statusCounts['overdue'] || 0,
        completionRate: totalAssignments > 0 ? (completedTasks / totalAssignments) * 100 : 0
      },
      userRankings: statsAggregation[0].userRankings,
      recentCompletions
    });

  } catch (error) {
    console.error('Get task completion stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching completion statistics',
      error: error.message
    });
  }
};

// ======================================================
// POST /api/user-tasks/assign-all  (Admin)
// Send same task to ALL approved users at once
// Skips users who already have the same task assigned
// ======================================================
export const assignTaskToAll = async (req, res) => {
  try {
    const {
      customTaskTitle,
      customTaskDescription,
      customTaskMessage,
      taskDeadline,
      taskPoints,
      isReferralTask,
      referralTarget,
      referralReward,
      referralPackagePrice,
      tutorialVideoUrl
    } = req.body;

    // Validate
    if (!customTaskTitle || !customTaskTitle.trim()) {
      return res.status(400).json({ success: false, message: 'Task title is required' });
    }

    const isReferral = isReferralTask === true;

    if (isReferral && (!referralTarget || referralTarget < 1)) {
      return res.status(400).json({ success: false, message: 'referralTarget must be at least 1' });
    }
    if (isReferral && (!referralReward || String(referralReward).trim() === '')) {
      return res.status(400).json({ success: false, message: 'referralReward is required for referral tasks' });
    }

    // Get ALL approved submissions
    const approvedSubmissions = await UserPlanSubmission.find({ status: 'approved' }).lean();

    if (approvedSubmissions.length === 0) {
      return res.status(404).json({ success: false, message: 'No approved users found' });
    }

    // Build deadline date
    const deadlineDate = taskDeadline
      ? new Date(taskDeadline)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // default 7 days

    let sent = 0;
    let skipped = 0;
    const errors = [];

    for (const submission of approvedSubmissions) {
      try {
        // Skip if same task title already assigned to this user
        const alreadyAssigned = await UserTask.findOne({
          userPlanSubmissionId: submission._id,
          taskTitle: customTaskTitle.trim(),
          ...(isReferral ? { isReferralTask: true } : {})
        });

        if (alreadyAssigned) {
          skipped++;
          continue;
        }

        const plan = await Plan.findById(submission.planId).lean();

        const newTask = new UserTask({
          userId: submission._id,
          userPlanSubmissionId: submission._id,
          userName: submission.userName,
          userEmail: submission.userEmail,
          planId: submission.planId,
          planTitle: submission.planTitle,
          planPrice: submission.planPrice,
          taskId: null,
          taskTitle: customTaskTitle.trim(),
          taskDescription: customTaskDescription || customTaskTitle.trim(),
          isCustomTask: !isReferral,
          isReferralTask: isReferral,
          referralTarget: isReferral ? Number(referralTarget) : 0,
          referralReward: isReferral ? String(referralReward).trim() : '',
          referralPackagePrice: isReferral && referralPackagePrice ? String(referralPackagePrice).trim() : '',
          referralProgress: 0,
          customTaskMessage: customTaskMessage || '',
          tutorialVideoUrl: tutorialVideoUrl ? tutorialVideoUrl.trim() : '',
          taskDeadline: deadlineDate,
          taskPoints: taskPoints || 0,
          status: 'assigned',
          assignedAt: new Date()
        });

        await newTask.save();
        sent++;
      } catch (err) {
        errors.push({ user: submission.userEmail, error: err.message });
      }
    }

    return res.status(201).json({
      success: true,
      message: `Task sent to ${sent} users. ${skipped} skipped (already had this task).`,
      summary: {
        total: approvedSubmissions.length,
        sent,
        skipped,
        failed: errors.length
      },
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Assign task to all error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during bulk task assignment',
      error: error.message
    });
  }
};

// ======================================================
// GET /api/user-tasks/earnings/:email  (Public)
// Returns total approved task earnings for a user
// Also fetches plan tax to show net balance
// ======================================================
export const getUserTaskEarnings = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Fetch all approved tasks for this user
    const approvedTasks = await UserTask.find({
      userEmail: { $regex: new RegExp(`^${email}$`, 'i') },
      status: 'approved'
    })
      .select('taskTitle rewardAmount referralReward isReferralTask approvedAt planId planTitle planPrice')
      .lean();

    // Sum up task earnings
    let totalTaskEarnings = 0;
    const breakdown = approvedTasks.map((task) => {
      const amountStr = task.isReferralTask ? task.referralReward : task.rewardAmount;
      const amount = parseFloat(amountStr) || 0;
      totalTaskEarnings += amount;
      return {
        taskTitle: task.taskTitle,
        amount,
        isReferralTask: task.isReferralTask,
        approvedAt: task.approvedAt
      };
    });

    // Get plan info for this user (latest approved submission)
    let planInfo = null;
    try {
      const UserPlanSubmission = (await import('../models/UserPlanSubmission.js')).default;
      const Plan = (await import('../models/Plan.js')).default;

      const latestSub = await UserPlanSubmission.findOne({
        userEmail: { $regex: new RegExp(`^${email}$`, 'i') },
        status: 'approved'
      }).sort({ createdAt: -1 }).lean();

      if (latestSub) {
        const plan = await Plan.findById(latestSub.planId).lean();
        if (plan) {
          const planPrice = parseFloat(plan.price) || 0;
          const taxAmount = plan.taxAmount || 0;
          const netAmount = planPrice - taxAmount;
          planInfo = {
            planTitle: plan.title,
            planPrice,
            taxAmount,
            netAmount
          };
        }
      }
    } catch (e) {
      // plan info optional — don't fail if not found
    }

    return res.json({
      success: true,
      totalEarnings: totalTaskEarnings,
      approvedTaskCount: approvedTasks.length,
      planInfo,          // null if no plan found
      breakdown
    });

  } catch (error) {
    console.error('Get user task earnings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching earnings',
      error: error.message
    });
  }
};
