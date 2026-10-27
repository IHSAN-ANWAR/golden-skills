import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserCourseCompletion from '../models/UserCourseCompletion.js';
import CourseLinkAssignment from '../models/CourseLinkAssignment.js';

dotenv.config();

const seedCourseCompletions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get some existing course assignments
    const assignments = await CourseLinkAssignment.find().limit(3);
    
    if (assignments.length === 0) {
      console.log('❌ No course assignments found. Please send some course links first.');
      process.exit(1);
    }

    // Create dummy submitted course completions
    const dummyCompletions = assignments.map((assignment, index) => ({
      courseLinkAssignmentId: assignment._id,
      userId: assignment.userId,
      userName: assignment.userName,
      userEmail: assignment.userEmail,
      category: assignment.category,
      courseLink: assignment.courseLink,
      quizAnswers: [
        {
          question: 'Did you complete watching the entire course?',
          userAnswer: 'Yes',
          correctAnswer: 'Yes',
          isCorrect: true
        },
        {
          question: 'How would you rate the course content?',
          userAnswer: index === 0 ? 'Excellent' : index === 1 ? 'Good' : 'Average',
          correctAnswer: '',
          isCorrect: undefined
        },
        {
          question: 'Would you recommend this course to others?',
          userAnswer: 'Yes',
          correctAnswer: '',
          isCorrect: undefined
        }
      ],
      score: 1,
      totalQuestions: 3,
      status: 'submitted', // Waiting for admin approval
      completedAt: new Date()
    }));

    // Check if completions already exist for these assignments
    for (const completion of dummyCompletions) {
      const existing = await UserCourseCompletion.findOne({ 
        courseLinkAssignmentId: completion.courseLinkAssignmentId 
      });
      
      if (!existing) {
        await UserCourseCompletion.create(completion);
        console.log(`✅ Created submitted course completion for ${completion.userName}`);
      } else {
        console.log(`⚠️  Course completion already exists for ${completion.userName}`);
      }
    }

    console.log('\n✅ Seed completed successfully!');
    console.log(`📊 Total submitted courses: ${dummyCompletions.length}`);
    console.log('\n👉 Go to Admin Panel → Courses → Submitted Courses to see them');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding course completions:', error);
    process.exit(1);
  }
};

seedCourseCompletions();
