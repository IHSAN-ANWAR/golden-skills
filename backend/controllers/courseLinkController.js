import CourseLinkAssignment from '../models/CourseLinkAssignment.js';
import UserCoursePlanSubmission from '../models/UserCoursePlanSubmission.js';

// ======================================================
// POST /api/course-links/send  (Admin only)
// ======================================================
// Admin ek approved user ko course content share karta hai.
// Content mein ho sakta hai: video link, PDF, Google Drive,
// YouTube link, ya koi bhi URL — multiple bhi bhej sakte hain.
//
// Request Body:
// {
//   userPlanSubmissionId: "...",
//   category: "premium" | "pro" | "lite",
//   courseLink: "https://...",          ← optional (legacy/single link)
//   courseContents: [                   ← optional (recommended — multiple)
//     { type: "video", title: "Lecture 1", url: "https://...", description: "" },
//     { type: "pdf",   title: "Notes",     url: "https://...", description: "" },
//     { type: "google_drive", title: "Resources", url: "https://drive.google.com/..." }
//   ]
// }
// ======================================================
export const sendCourseLink = async (req, res) => {
  try {
    const { userPlanSubmissionId, category, courseLink, courseContents } = req.body;

    if (!userPlanSubmissionId || !category) {
      return res.status(400).json({
        success: false,
        message: 'userPlanSubmissionId and category are required'
      });
    }

    // At least ek link hona chahiye — ya courseLink ya courseContents
    const hasLegacyLink = courseLink && courseLink.trim();
    const hasContents = Array.isArray(courseContents) && courseContents.length > 0;

    if (!hasLegacyLink && !hasContents) {
      return res.status(400).json({
        success: false,
        message: 'At least one course link or courseContents array is required'
      });
    }

    // Validate category
    const validCategories = ['premium', 'pro', 'lite'];
    const normalizedCategory = String(category).toLowerCase().trim().replace(/\s+/g, '');

    if (!validCategories.includes(normalizedCategory)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category: "${category}". Must be: premium, pro, or lite`
      });
    }

    // Validate courseContents items
    const validTypes = ['video', 'pdf', 'google_drive', 'youtube', 'other'];
    if (hasContents) {
      for (const item of courseContents) {
        if (!item.url || !item.url.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Each courseContents item must have a url'
          });
        }
        if (!item.type || !validTypes.includes(item.type)) {
          return res.status(400).json({
            success: false,
            message: `Invalid content type: "${item.type}". Must be: video, pdf, google_drive, youtube, other`
          });
        }
      }
    }

    // Submission check
    const submission = await UserCoursePlanSubmission.findById(userPlanSubmissionId);
    if (!submission) {
      return res.status(404).json({
        success: false,
        message: `Submission not found with ID: ${userPlanSubmissionId}`
      });
    }

    if (submission.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: `Cannot send course content. Submission status is "${submission.status}". Only approved submissions can receive course links.`
      });
    }

    // Build assignment
    const assignmentData = {
      userPlanSubmissionId,
      coursePlanId: submission.coursePlanId,
      userId: submission.userId,
      userName: submission.userName,
      userEmail: submission.userEmail,
      category: normalizedCategory,
      courseLink: hasLegacyLink ? courseLink.trim() : '',
      courseContents: hasContents ? courseContents.map(item => ({
        type: item.type,
        title: item.title || '',
        url: item.url.trim(),
        description: item.description || ''
      })) : []
    };

    const assignment = new CourseLinkAssignment(assignmentData);
    await assignment.save();

    return res.status(201).json({
      success: true,
      message: `Course content sent to ${submission.userName} successfully`,
      assignment: {
        _id: assignment._id,
        userName: assignment.userName,
        category: assignment.category,
        courseLink: assignment.courseLink,
        courseContents: assignment.courseContents,
        sentAt: assignment.sentAt
      }
    });
  } catch (err) {
    console.error('Send course link error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to send course content'
    });
  }
};

// ======================================================
// GET /api/course-links/  (Admin only)
// Sab assignments — filter by category optional
// ======================================================
export const getCourseLinkAssignments = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = category ? { category } : {};
    const assignments = await CourseLinkAssignment.find(filter)
      .sort({ sentAt: -1 })
      .lean();
    return res.json({
      success: true,
      assignments
    });
  } catch (err) {
    console.error('Get course links error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch course links'
    });
  }
};

// ======================================================
// GET /api/course-links/my-courses/:userId  (Mobile App)
// ======================================================
// Mobile app is API se user ke sare assigned course
// contents fetch karta hai — videos, PDFs, Drive links sab.
//
// Response mein har assignment ke andar courseContents array
// hoga jisme type, title, url aata hai.
// ======================================================
export const getUserCourseContents = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const assignments = await CourseLinkAssignment.find({ userId })
      .populate('coursePlanId', 'title category price description icon')
      .sort({ sentAt: -1 })
      .lean();

    if (!assignments || assignments.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'No course content assigned yet',
        total: 0,
        courses: []
      });
    }

    // Clean response for mobile app
    const courses = assignments.map(a => ({
      assignmentId: a._id,
      category: a.category,
      sentAt: a.sentAt,
      planDetails: a.coursePlanId || null,

      // Legacy single link (agar sirf ek link tha)
      courseLink: a.courseLink || null,

      // All content items (video, pdf, google_drive, youtube, other)
      courseContents: a.courseContents && a.courseContents.length > 0
        ? a.courseContents
        : (a.courseLink
            ? [{ type: 'other', title: 'Course Link', url: a.courseLink, description: '' }]
            : [])
    }));

    return res.status(200).json({
      success: true,
      userId,
      total: courses.length,
      courses
    });
  } catch (err) {
    console.error('Get user course contents error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch course contents'
    });
  }
};
