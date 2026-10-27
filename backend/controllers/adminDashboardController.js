import User from '../models/User.js';
import CourseLinkAssignment from '../models/CourseLinkAssignment.js';
import UserCourseCompletion from '../models/UserCourseCompletion.js';
import { getCache, setCache } from '../config/redis.js';

// ======================================================
// GET REFERRAL TREE - Admin view of all referrals
// ======================================================
// Endpoint: GET /api/admin/referral-tree
// Returns: every user with who referred them + how many they referred
// ======================================================
export const getReferralTree = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const search = req.query.search?.trim()  || '';
    const skip   = (page - 1) * limit;

    const cacheKey = `admin_referral_tree_v5:page${page}:limit${limit}:search${search}`;
    // Skip cache — always fetch fresh data
    // const cached = await getCache(cacheKey);
    // if (cached) return res.status(200).json({ success: true, ...cached, fromCache: true });

    // Fetch all users — only needed fields
    const users = await User.find(
      {},
      '_id fullName firstName lastName email myReferralCode referralCode referredBy referredUsersCount hasActivatedPlan createdAt'
    ).lean();

    // Build id→user map for referrer lookup
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    // Build full tree
    let tree = users.map(u => {
      const referrer = u.referredBy ? userMap[u.referredBy.toString()] : null;
      return {
        userId: u._id,
        fullName: u.fullName || `${u.firstName} ${u.lastName}`.trim(),
        email: u.email,
        myReferralCode: u.myReferralCode,
        usedReferralCode: u.referralCode || null,
        referredBy: referrer
          ? {
              userId: referrer._id,
              fullName: referrer.fullName || `${referrer.firstName} ${referrer.lastName}`.trim(),
              email: referrer.email,
              myReferralCode: referrer.myReferralCode
            }
          : null,
        referredUsersCount: u.referredUsersCount || 0,
        hasActivatedPlan: u.hasActivatedPlan || false,
        joinedAt: u.createdAt
      };
    });

    // Sort: newest users first
    tree.sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt));

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      tree = tree.filter(u =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.myReferralCode && u.myReferralCode.toLowerCase().includes(q)) ||
        (u.referredBy?.fullName?.toLowerCase().includes(q)) ||
        (u.referredBy?.email?.toLowerCase().includes(q))
      );
    }

    const total           = tree.length;
    const withReferral    = tree.filter(u => u.referredBy).length;
    const withoutReferral = tree.filter(u => !u.referredBy).length;
    const totalPages      = Math.ceil(total / limit) || 1;
    const paginatedUsers  = tree.slice(skip, skip + limit);

    const responseData = {
      total,
      withReferral,
      withoutReferral,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      users: paginatedUsers
    };

    await setCache(cacheKey, responseData, 60);
    return res.status(200).json({ success: true, ...responseData });

  } catch (err) {
    console.error('Referral tree error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch referral tree' });
  }
};

// ======================================================
// GET ADMIN COURSE DASHBOARD
// ======================================================
// Purpose: Admin panel calls this to see all users with
//          their course completion stats in one API call.
//
// Endpoint: GET /api/admin/course-dashboard
// Access:   Admin only (authenticateAdmin middleware)
//
// Response Structure:
// {
//   totalUsers: 50,
//   users: [
//     {
//       userId: "...",
//       email: "user@example.com",
//       fullName: "...",
//       completedCourses: 3,
//       inProgressCourses: 2,
//       totalAssigned: 5
//     },
//     ...
//   ]
// }
// ======================================================
export const getAdminCourseDashboard = async (req, res) => {
  try {
    const cacheKey = 'admin_course_dashboard';

    // ── Try Redis cache first (cache for 60 seconds) ─────────────────────────
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, ...cached, fromCache: true });
    }

    // ── Fetch all users ───────────────────────────────────────────────────────
    const users = await User.find({}, '_id email fullName firstName lastName').lean();

    if (!users.length) {
      return res.status(200).json({
        success: true,
        totalUsers: 0,
        users: []
      });
    }

    const userIds = users.map(u => u._id.toString());

    // ── Fetch all course link assignments (courses assigned to users) ─────────
    const allAssignments = await CourseLinkAssignment.find({
      userId: { $in: userIds }
    }).select('userId userEmail category sentAt').lean();

    // ── Fetch all approved completions ────────────────────────────────────────
    const allCompletions = await UserCourseCompletion.find({
      userId: { $in: userIds },
      status: 'approved'
    }).select('userId userEmail courseLinkAssignmentId completedAt').lean();

    // ── Build lookup maps keyed by userId ─────────────────────────────────────
    const assignmentCountMap = {};   // userId → total assigned count
    const completionCountMap = {};   // userId → completed count

    allAssignments.forEach(a => {
      assignmentCountMap[a.userId] = (assignmentCountMap[a.userId] || 0) + 1;
    });

    allCompletions.forEach(c => {
      completionCountMap[c.userId] = (completionCountMap[c.userId] || 0) + 1;
    });

    // ── Build final user list ─────────────────────────────────────────────────
    const userStats = users.map(u => {
      const uid = u._id.toString();
      const totalAssigned = assignmentCountMap[uid] || 0;
      const completedCourses = completionCountMap[uid] || 0;
      const inProgressCourses = totalAssigned - completedCourses;

      return {
        userId: uid,
        email: u.email,
        fullName: u.fullName || `${u.firstName} ${u.lastName}`.trim(),
        completedCourses,
        inProgressCourses: inProgressCourses > 0 ? inProgressCourses : 0,
        totalAssigned
      };
    });

    const responseData = {
      totalUsers: userStats.length,
      users: userStats
    };

    // Cache for 60 seconds
    await setCache(cacheKey, responseData, 60);

    return res.status(200).json({
      success: true,
      ...responseData
    });

  } catch (err) {
    console.error('Admin course dashboard error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch admin course dashboard'
    });
  }
};


// ======================================================
// GET SINGLE USER COURSE DETAIL (Admin View)
// ======================================================
// Endpoint: GET /api/admin/course-dashboard/:userId
// Returns detailed course info for one specific user
// ======================================================
export const getAdminUserCourseDetail = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: 'userId is required' });
    }

    const cacheKey = `admin_user_course_detail:${userId}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json({ success: true, ...cached, fromCache: true });
    }

    // ── Get user info ─────────────────────────────────────────────────────────
    const user = await User.findById(userId, '_id email fullName firstName lastName').lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // ── Get all assigned courses ──────────────────────────────────────────────
    const assignments = await CourseLinkAssignment.find({ userId })
      .populate('coursePlanId', 'title category price')
      .lean();

    // ── Get approved completions ──────────────────────────────────────────────
    const completions = await UserCourseCompletion.find({
      userId,
      status: 'approved'
    }).select('courseLinkAssignmentId score totalQuestions completedAt').lean();

    const completedAssignmentIds = new Set(
      completions.map(c => c.courseLinkAssignmentId.toString())
    );

    const completionMap = {};
    completions.forEach(c => {
      completionMap[c.courseLinkAssignmentId.toString()] = c;
    });

    // ── Build course list ─────────────────────────────────────────────────────
    const courses = assignments.map(a => {
      const isCompleted = completedAssignmentIds.has(a._id.toString());
      const completion = completionMap[a._id.toString()];
      return {
        assignmentId: a._id,
        category: a.category,
        courseLink: a.courseLink,
        sentAt: a.sentAt,
        planTitle: a.coursePlanId?.title || null,
        status: isCompleted ? 'completed' : 'in_progress',
        score: completion?.score ?? null,
        totalQuestions: completion?.totalQuestions ?? null,
        completedAt: completion?.completedAt ?? null
      };
    });

    const responseData = {
      userId: user._id.toString(),
      email: user.email,
      fullName: user.fullName || `${user.firstName} ${user.lastName}`.trim(),
      summary: {
        totalAssigned: assignments.length,
        completedCourses: completions.length,
        inProgressCourses: assignments.length - completions.length
      },
      courses
    };

    await setCache(cacheKey, responseData, 60);

    return res.status(200).json({ success: true, ...responseData });

  } catch (err) {
    console.error('Admin user course detail error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch user course detail'
    });
  }
};
