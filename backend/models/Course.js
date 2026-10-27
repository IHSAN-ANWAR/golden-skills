import mongoose from 'mongoose';

// ======================================================
// COURSE MODEL - Defines course data structure
// ======================================================
// Purpose: Store courses for mobile app display
// Fields: title, icon, createdAt
// Note: Using icon (emoji/text) instead of image for better performance
// ======================================================
const courseSchema = new mongoose.Schema({
  // Course title - required field
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },
  
  // Course icon (emoji or text icon) - required field
  // Using icon instead of image for better performance
  icon: { 
    type: String, 
    required: true,
    default: '📚'
  },
  
  // Optional course description
  description: {
    type: String,
    trim: true,
    default: ''
  },
  
  // Track when course was created
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

// ── Performance indexes ──────────────────────────────
courseSchema.index({ createdAt: -1 }); // speeds up getAllCourses sort
courseSchema.index({ title: 1 });      // speeds up title lookups

// Export Course model
const Course = mongoose.model('Course', courseSchema);
export default Course;
