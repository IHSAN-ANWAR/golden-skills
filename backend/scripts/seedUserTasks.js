import dotenv from 'dotenv';
import mongoose from 'mongoose';
import UserPlanSubmission from '../models/UserPlanSubmission.js';
import UserTask from '../models/UserTask.js';

dotenv.config();

function requireMongoUri() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is missing. Set it in backend/.env');
  }
  return uri;
}

async function connect() {
  const uri = requireMongoUri();
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 30000,
    socketTimeoutMS: 45000,
  });
}

function daysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

async function ensureTask({
  userPlanSubmission,
  taskTitle,
  taskDescription,
  taskDeadline,
  taskPoints,
  status,
  adminNotes = '',
  userNotes = '',
}) {
  const existing = await UserTask.findOne({
    userPlanSubmissionId: userPlanSubmission._id,
    isCustomTask: true,
    taskTitle,
  }).lean();

  if (existing) {
    return { created: false, id: existing._id };
  }

  const doc = new UserTask({
    // Note: codebase uses submission id in userId field too
    userId: userPlanSubmission._id,
    userPlanSubmissionId: userPlanSubmission._id,
    userName: userPlanSubmission.userName,
    userEmail: userPlanSubmission.userEmail || '',
    planId: userPlanSubmission.planId,
    planTitle: userPlanSubmission.planTitle,
    planPrice: userPlanSubmission.planPrice,
    taskId: null,
    taskTitle,
    taskDescription,
    isCustomTask: true,
    customTaskMessage: taskDescription,
    taskDeadline,
    taskPoints,
    status,
    assignedAt: new Date(),
    startedAt: status === 'in-progress' ? new Date() : undefined,
    completedAt: status === 'completed' ? new Date() : undefined,
    adminNotes,
    userNotes,
  });

  await doc.save();
  return { created: true, id: doc._id };
}

async function main() {
  await connect();

  const approved = await UserPlanSubmission.find({ status: 'approved' })
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();

  if (approved.length === 0) {
    console.log('No approved submissions found. Approve a user in Verifications first.');
    return;
  }

  const results = [];

  for (let i = 0; i < approved.length; i++) {
    const submission = approved[i];

    // Create one Assigned task (shows in Pending Tasks tab)
    results.push(
      await ensureTask({
        userPlanSubmission: submission,
        taskTitle: 'Sample Task (Assigned)',
        taskDescription: 'Submit a screenshot proof for this sample task.',
        taskDeadline: daysFromNow(3),
        taskPoints: 10,
        status: 'assigned',
      })
    );

    // Create one Completed task (shows in Submitted Tasks tab)
    results.push(
      await ensureTask({
        userPlanSubmission: submission,
        taskTitle: 'Sample Task (Completed)',
        taskDescription: 'This is a sample completed submission for admin review.',
        taskDeadline: daysFromNow(1),
        taskPoints: 15,
        status: 'completed',
        userNotes: 'User says: completed and uploaded proof.',
      })
    );

    // For the first user only, create one Overdue task too (optional)
    if (i === 0) {
      results.push(
        await ensureTask({
          userPlanSubmission: submission,
          taskTitle: 'Sample Task (Overdue)',
          taskDescription: 'This task is overdue for testing the filter.',
          taskDeadline: daysFromNow(-2),
          taskPoints: 5,
          status: 'overdue',
          adminNotes: 'Auto-seeded overdue task.',
        })
      );
    }
  }

  const createdCount = results.filter(r => r.created).length;
  console.log(`Seed done. Created ${createdCount} tasks. (Skipped ${results.length - createdCount} existing)`);  
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    try {
      await mongoose.disconnect();
    } catch {
      // ignore
    }
  });

