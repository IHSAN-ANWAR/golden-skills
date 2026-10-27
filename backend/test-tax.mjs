import { readFileSync } from 'fs';
const env = readFileSync('.env', 'utf8');
env.split('\n').forEach(l => { const m = l.match(/^([^#=]+)=(.*)/); if(m) process.env[m[1].trim()] = m[2].trim().replace(/['"]/g,''); });

import mongoose from 'mongoose';
import Plan from './models/Plan.js';
import UserPlanSubmission from './models/UserPlanSubmission.js';
import UserTask from './models/UserTask.js';

await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ DB connected');

const TEST_EMAIL = 'taxtest@goldenskills.com';

// Cleanup
await Plan.deleteMany({ title: 'Tax Test Plan' });
await UserPlanSubmission.deleteMany({ userEmail: TEST_EMAIL });
await UserTask.deleteMany({ userEmail: TEST_EMAIL });
console.log('🧹 Cleaned old test data');

// 1. Plan with taxAmount
const plan = await Plan.create({
  title: 'Tax Test Plan',
  price: '1570',
  taxAmount: 97,
  description: 'Test plan for tax feature'
});
console.log('✅ Plan created — price:1570 tax:97 net:', 1570-97);

// 2. Approved UserPlanSubmission
const sub = await UserPlanSubmission.create({
  userName: 'Tax Test User',
  userEmail: TEST_EMAIL,
  planId: plan._id,
  planTitle: plan.title,
  planPrice: plan.price,
  status: 'approved',
  submittedAt: new Date()
});
console.log('✅ Plan Submission created — status: approved');

// 3. Approved UserTask with rewardAmount
const fakeId = new mongoose.Types.ObjectId();
const task = await UserTask.create({
  userId: fakeId,
  userPlanSubmissionId: sub._id,
  userName: 'Tax Test User',
  userEmail: TEST_EMAIL,
  planId: plan._id,
  planTitle: plan.title,
  planPrice: plan.price,
  taskTitle: 'Social Media Task',
  taskDescription: 'Post on all platforms',
  taskDeadline: new Date(Date.now() + 7*86400000),
  status: 'approved',
  rewardAmount: '5000',
  approvedAt: new Date()
});
console.log('✅ UserTask created — status: approved, rewardAmount: 5000');

// 4. One more approved referral task
const task2 = await UserTask.create({
  userId: fakeId,
  userPlanSubmissionId: sub._id,
  userName: 'Tax Test User',
  userEmail: TEST_EMAIL,
  planId: plan._id,
  planTitle: plan.title,
  planPrice: plan.price,
  taskTitle: 'Refer 3 People',
  taskDescription: 'Bring 3 referrals',
  taskDeadline: new Date(Date.now() + 30*86400000),
  isReferralTask: true,
  referralTarget: 3,
  referralReward: '3000',
  status: 'approved',
  approvedAt: new Date()
});
console.log('✅ Referral UserTask created — status: approved, referralReward: 3000');

// 5. One pending task — should NOT count
await UserTask.create({
  userId: fakeId,
  userPlanSubmissionId: sub._id,
  userName: 'Tax Test User',
  userEmail: TEST_EMAIL,
  planId: plan._id,
  planTitle: plan.title,
  planPrice: plan.price,
  taskTitle: 'Pending Task',
  taskDescription: 'Not approved yet',
  taskDeadline: new Date(Date.now() + 7*86400000),
  status: 'completed',
  rewardAmount: '9999'
});
console.log('✅ Pending task created — should NOT appear in earnings');

console.log('\n📊 EXPECTED RESULT:');
console.log('   Plan: 1570 RS | Tax: 97 | Net: 1473');
console.log('   Task earnings: 5000 + 3000 = 8000');
console.log('   Approved tasks: 2');

await mongoose.disconnect();
