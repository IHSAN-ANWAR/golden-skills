import CoursePlan from '../models/CoursePlan.js';
import { getCache, setCache, deleteCache } from '../config/redis.js';

// Get all course plans
export const getCoursePlans = async (req, res) => {
  try {
    const { category, isActive } = req.query;
    const cacheKey = `course_plans:${category || 'all'}:${isActive || 'all'}`;

    const cached = await getCache(cacheKey);
    if (cached) return res.json({ success: true, plans: cached, fromCache: true });

    const filter = {};
    if (category) filter.category = category;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const plans = await CoursePlan.find(filter).sort({ category: 1 }).lean();
    await setCache(cacheKey, plans, 60);

    return res.json({ success: true, plans });
  } catch (err) {
    console.error('Get course plans error:', err);
    return res.status(500).json({ success: false, message: err.message || 'Failed to fetch course plans' });
  }
};

// Get single course plan by ID
export const getCoursePlanById = async (req, res) => {
  try {
    const plan = await CoursePlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Course plan not found'
      });
    }
    
    return res.json({
      success: true,
      plan
    });
  } catch (err) {
    console.error('Get course plan error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to fetch course plan'
    });
  }
};

// Create new course plan (admin only)
export const createCoursePlan = async (req, res) => {
  try {
    const { title, category, icon, price, description, features, courseLink } = req.body;
    
    if (!title || !category || !price) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, and price are required'
      });
    }
    
    const plan = new CoursePlan({
      title,
      category,
      icon: icon || 'FaBook',
      price,
      description,
      features: features || [],
      courseLink: courseLink || ''
    });
    
    await plan.save();
    await deleteCache(`course_plans:all:all`);
    await deleteCache(`course_plans:${plan.category}:all`);
    await deleteCache(`course_plans:${plan.category}:true`);
    
    return res.status(201).json({
      success: true,
      message: 'Course plan created successfully',
      plan
    });
  } catch (err) {
    console.error('Create course plan error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to create course plan'
    });
  }
};

// Update course plan (admin only)
export const updateCoursePlan = async (req, res) => {
  try {
    const { title, price, description, features, isActive, icon } = req.body;
    
    const plan = await CoursePlan.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Course plan not found'
      });
    }
    
    if (title) plan.title = title;
    if (icon) plan.icon = icon;
    if (price) plan.price = price;
    if (description !== undefined) plan.description = description;
    if (features) plan.features = features;
    if (isActive !== undefined) plan.isActive = isActive;
    if (req.body.courseLink !== undefined) plan.courseLink = req.body.courseLink;
    
    await plan.save();
    await deleteCache(`course_plans:all:all`);
    await deleteCache(`course_plans:${plan.category}:all`);
    
    return res.json({
      success: true,
      message: 'Course plan updated successfully',
      plan
    });
  } catch (err) {
    console.error('Update course plan error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to update course plan'
    });
  }
};

// Delete course plan (admin only)
export const deleteCoursePlan = async (req, res) => {
  try {
    const plan = await CoursePlan.findByIdAndDelete(req.params.id);
    
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Course plan not found'
      });
    }

    await deleteCache(`course_plans:all:all`);
    
    return res.json({
      success: true,
      message: 'Course plan deleted successfully'
    });
  } catch (err) {
    console.error('Delete course plan error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to delete course plan'
    });
  }
};
