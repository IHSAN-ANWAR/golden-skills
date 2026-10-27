import mongoose from 'mongoose';
import dotenv from 'dotenv';
import CoursePlan from '../models/CoursePlan.js';

dotenv.config();

const coursePlans = [
  {
    title: 'Premium Course Plan',
    category: 'premium',
    price: 'Rs 4999',
    description: 'Access to all premium courses with lifetime support',
    features: [
      'All premium courses included',
      'Lifetime access',
      'Priority support',
      'Certificate of completion',
      'Live Q&A sessions'
    ],
    isActive: true
  },
  {
    title: 'Pro Course Plan',
    category: 'pro',
    price: 'Rs 2999',
    description: 'Professional courses with advanced content',
    features: [
      'Pro-level courses',
      '1 year access',
      'Email support',
      'Certificate of completion',
      'Monthly webinars'
    ],
    isActive: true
  },
  {
    title: 'Lite Course Plan',
    category: 'lite',
    price: 'Rs 1499',
    description: 'Essential courses for beginners',
    features: [
      'Basic courses',
      '6 months access',
      'Community support',
      'Certificate of completion'
    ],
    isActive: true
  }
];

const seedCoursePlans = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing course plans
    await CoursePlan.deleteMany({});
    console.log('🗑️  Cleared existing course plans');

    // Insert new course plans
    const result = await CoursePlan.insertMany(coursePlans);
    console.log(`✅ Successfully seeded ${result.length} course plans`);

    console.log('\nCourse Plans:');
    result.forEach(plan => {
      console.log(`  - ${plan.title} (${plan.category}): ${plan.price}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding course plans:', error);
    process.exit(1);
  }
};

seedCoursePlans();
