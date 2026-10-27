
import Promotion from '../models/Promotion.js';
import UserTask from '../models/UserTask.js';
import { getCache, setCache, deleteCache } from '../config/redis.js';

// Get all promotions
export const getAllPromotions = async (req, res) => {
  try {
    const cacheKey = 'all_promotions';
    const cached = await getCache(cacheKey);
    if (cached) return res.json({ success: true, promotions: cached, fromCache: true });

    const promotions = await Promotion.find({ isActive: true }).sort({ createdAt: -1 }).lean();
    await setCache(cacheKey, promotions, 60);
    res.json({ success: true, promotions });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ success: false, message: 'Error fetching promotions', error: error.message });
  }
};

// Get all promotions (admin - includes inactive)
export const getAllPromotionsAdmin = async (req, res) => {
  try {
    const promotions = await Promotion.find().sort({ createdAt: -1 }).lean();
    res.json({ success: true, promotions });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ success: false, message: 'Error fetching promotions', error: error.message });
  }
};

// Create a new promotion
export const createPromotion = async (req, res) => {
  try {
    const { title, description, requiredPlanPrice, rewardAmount, requiredTaskCount } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, message: 'Title is required' });
    }
    if (!requiredPlanPrice || String(requiredPlanPrice).trim() === '') {
      return res.status(400).json({ success: false, message: 'Required plan price is required' });
    }
    if (!rewardAmount || String(rewardAmount).trim() === '') {
      return res.status(400).json({ success: false, message: 'Reward amount is required' });
    }

    const promotion = new Promotion({
      title: title.trim(),
      description: description ? description.trim() : '',
      requiredPlanPrice: String(requiredPlanPrice).trim(),
      rewardAmount: String(rewardAmount).trim(),
      requiredTaskCount: requiredTaskCount !== undefined ? Number(requiredTaskCount) : 0
    });

    await promotion.save();
    await deleteCache('all_promotions');

    res.status(201).json({ success: true, message: 'Promotion created successfully', promotion });
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ success: false, message: 'Error creating promotion', error: error.message });
  }
};

// Update a promotion
export const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, requiredPlanPrice, rewardAmount, isActive, requiredTaskCount } = req.body;

    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }

    if (title !== undefined) promotion.title = title.trim();
    if (description !== undefined) promotion.description = description.trim();
    if (requiredPlanPrice !== undefined) promotion.requiredPlanPrice = String(requiredPlanPrice).trim();
    if (rewardAmount !== undefined) promotion.rewardAmount = String(rewardAmount).trim();
    if (isActive !== undefined) promotion.isActive = isActive;
    if (requiredTaskCount !== undefined) promotion.requiredTaskCount = Number(requiredTaskCount);

    await promotion.save();
    await deleteCache('all_promotions');

    res.json({ success: true, message: 'Promotion updated successfully', promotion });
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ success: false, message: 'Error updating promotion', error: error.message });
  }
};

// Delete a promotion
export const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findByIdAndDelete(id);
    if (!promotion) {
      return res.status(404).json({ success: false, message: 'Promotion not found' });
    }
    await deleteCache('all_promotions');
    res.json({ success: true, message: 'Promotion deleted successfully' });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ success: false, message: 'Error deleting promotion', error: error.message });
  }
};

// ─── USER: Check promotion eligibility by email ───────────────────────────────
// Returns all active promotions with eligibility status for a given user.
// isEligible = true  → user has completed enough tasks, can apply
// isEligible = false → user needs more tasks (completedTasks / requiredTaskCount shown)
export const checkPromotionEligibility = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    // Count how many tasks this user has with status 'approved' or 'completed'
    const completedTaskCount = await UserTask.countDocuments({
      userEmail: email.trim().toLowerCase(),
      status: { $in: ['approved', 'completed'] }
    });

    // Get all active promotions
    const promotions = await Promotion.find({ isActive: true }).sort({ createdAt: -1 }).lean();

    // Attach eligibility info to each promotion
    const promotionsWithEligibility = promotions.map(promo => {
      const required = promo.requiredTaskCount || 0;
      const isEligible = required === 0 || completedTaskCount >= required;

      return {
        ...promo,
        requiredTaskCount: required,
        completedTaskCount,          // how many tasks user has done
        isEligible,                  // true = can apply, false = locked
        tasksRemaining: isEligible ? 0 : required - completedTaskCount
      };
    });

    res.json({
      success: true,
      completedTaskCount,
      promotions: promotionsWithEligibility
    });
  } catch (error) {
    console.error('Error checking promotion eligibility:', error);
    res.status(500).json({ success: false, message: 'Error checking eligibility', error: error.message });
  }
};
