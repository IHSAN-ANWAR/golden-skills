import Plan from '../models/Plan.js';
import { getCache, setCache, deleteCache } from '../config/redis.js';

// Get all plans
export const getAllPlans = async (req, res) => {
  try {
    // Skip cache if client requests fresh data
    const skipCache = req.query.fresh === '1';
    
    if (!skipCache) {
      const cacheKey = 'all_plans';
      const cached = await getCache(cacheKey);
      if (cached) return res.json({ success: true, plans: cached, fromCache: true });
    }

    const plans = await Plan.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    await setCache('all_plans', plans, 60);
    res.json({ success: true, plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ success: false, message: 'Error fetching plans', error: error.message });
  }
};

// Create a new plan
export const createPlan = async (req, res) => {
  try {
    console.log('Create plan request received:', req.body);
    const { title, price, description, tutorialVideoUrl, taxAmount } = req.body;

    // Validate title and price
    if (!title || title.trim() === '') {
      console.log('Validation failed: title is empty');
      return res.status(400).json({
        success: false,
        message: 'Title is required and cannot be empty'
      });
    }

    if (!price || price.trim() === '') {
      console.log('Validation failed: price is empty');
      return res.status(400).json({
        success: false,
        message: 'Price is required and cannot be empty'
      });
    }

    const newPlan = new Plan({
      title: title.trim(),
      price: price.trim(),
      description: description ? description.trim() : '',
      tutorialVideoUrl: tutorialVideoUrl ? tutorialVideoUrl.trim() : '',
      taxAmount: taxAmount ? Number(taxAmount) : 0
    });

    await newPlan.save();
    await deleteCache('all_plans');
    console.log('Plan created successfully:', newPlan);

    res.status(201).json({
      success: true,
      message: 'Plan created successfully',
      plan: newPlan
    });
  } catch (error) {
    console.error('Error creating plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating plan',
      error: error.message
    });
  }
};

// Update a plan
export const updatePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, description, tutorialVideoUrl, isActive, taxAmount } = req.body;

    const plan = await Plan.findById(id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    if (title !== undefined && title.trim() !== '') plan.title = title;
    if (price !== undefined && price.trim() !== '') plan.price = price;
    if (description !== undefined) plan.description = description;
    if (tutorialVideoUrl !== undefined) plan.tutorialVideoUrl = tutorialVideoUrl.trim();
    if (isActive !== undefined) plan.isActive = isActive;
    if (taxAmount !== undefined) plan.taxAmount = Number(taxAmount) || 0;

    await plan.save();
    await deleteCache('all_plans');

    res.json({
      success: true,
      message: 'Plan updated successfully',
      plan
    });
  } catch (error) {
    console.error('Error updating plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating plan',
      error: error.message
    });
  }
};

// Delete a plan
export const deletePlan = async (req, res) => {
  try {
    const { id } = req.params;

    const plan = await Plan.findByIdAndDelete(id);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found'
      });
    }

    await deleteCache('all_plans');

    res.json({
      success: true,
      message: 'Plan deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting plan:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting plan',
      error: error.message
    });
  }
};

export default {
  getAllPlans,
  createPlan,
  updatePlan,
  deletePlan
};
