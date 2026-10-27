import User from '../models/User.js';
import Blacklist from '../models/Blacklist.js';
import SearchTracking from '../models/SearchTracking.js';
import logger from '../utils/logger.js';

// ======================================================
// VERIFY TEAM MEMBER - Public endpoint
// Checks: 1) Standalone Blacklist, 2) User blacklist flag, 3) Team member
// Also tracks repeated searches - flags as suspicious at 3+
// ======================================================
export const verifyTeamMember = async (req, res) => {
  try {
    const { phoneNumber } = req.body;

    if (!phoneNumber || phoneNumber.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    const cleanPhone = phoneNumber.trim();

    // ── Track this search ──────────────────────────────
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
             || req.socket?.remoteAddress
             || 'unknown';
    const userAgent = req.headers['user-agent'] || '';

    try {
      const existing = await SearchTracking.findOne({ phoneNumber: cleanPhone });
      if (existing) {
        existing.searchCount += 1;
        existing.lastSearchedAt = new Date();
        existing.searches.push({ ip, userAgent, searchedAt: new Date() });
        
        // ✅ DUAL SUSPICIOUS CHECK
        // Condition 1: Total searches >= 3 (any IPs)
        // Condition 2: Same IP ne >= 3 searches kiye
        
        const sameIPSearches = existing.searches.filter(s => s.ip === ip);
        
        if (existing.searchCount >= 3 || sameIPSearches.length >= 3) {
          existing.isSuspicious = true;
        } else {
          existing.isSuspicious = false;
        }
        
        await existing.save();
      } else {
        await SearchTracking.create({
          phoneNumber: cleanPhone,
          searchCount: 1,
          isSuspicious: false,
          searches: [{ ip, userAgent, searchedAt: new Date() }],
          lastSearchedAt: new Date()
        });
      }
    } catch (trackErr) {
      // Tracking failure should never break the verify response
      logger.error('Search tracking error:', trackErr);
    }
    // ──────────────────────────────────────────────────

    // 1) Check standalone Blacklist collection FIRST (scammers not in system)
    const blacklistEntry = await Blacklist.findOne({ phoneNumber: cleanPhone }).lean();
    if (blacklistEntry) {
      return res.status(200).json({
        success: true,
        verified: false,
        status: 'blacklisted',
        message: "⚠️ WARNING: BLACKLISTED SCAMMER",
        alert: {
          _id: blacklistEntry._id,
          name: blacklistEntry.name || 'Unknown',
          phoneNumber: blacklistEntry.phoneNumber,
          reason: blacklistEntry.reason || "Reported for fraudulent activities using our company name",
          warning: "DO NOT PROCEED with any transactions. Report to authorities immediately."
        }
      });
    }

    // 2) Check registered users
    const user = await User.findOne({ phoneNumber: cleanPhone })
      .select('fullName firstName lastName phoneNumber teamRole city myReferralCode isTeamMember isBlacklisted blacklistReason username email')
      .lean();

    if (!user) {
      return res.status(200).json({
        success: true,
        verified: false,
        status: 'unknown',
        message: "This phone number is not registered in our system"
      });
    }

    // 3) Check if user is blacklisted via User flag
    if (user.isBlacklisted) {
      return res.status(200).json({
        success: true,
        verified: false,
        status: 'blacklisted',
        message: "⚠️ WARNING: BLACKLISTED",
        alert: {
          _id: user._id,
          name: user.fullName || user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          phoneNumber: user.phoneNumber,
          reason: user.blacklistReason || "Reported for fraudulent activities using our company name",
          warning: "DO NOT PROCEED with any transactions. Report to authorities immediately."
        }
      });
    }

    // 4) Check if verified team member
    if (user.isTeamMember) {
      return res.status(200).json({
        success: true,
        verified: true,
        status: 'verified',
        message: "✓ Verified Official Team Member",
        teamMember: {
          _id: user._id,
          name: user.fullName || user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
          phoneNumber: user.phoneNumber,
          role: user.teamRole || "Team Member",
          city: user.city || "N/A",
          referralCode: user.myReferralCode
        }
      });
    }

    // 5) Registered but not verified
    return res.status(200).json({
      success: true,
      verified: false,
      status: 'unverified',
      message: "This number is registered but NOT an official team member",
      teamMember: {
        _id: user._id,
        name: user.fullName || user.username || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        phoneNumber: user.phoneNumber
      }
    });

  } catch (error) {
    console.error("Team verification error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ======================================================
// ADD TO BLACKLIST DIRECTLY - Admin only
// Works without user account - saves to Blacklist collection
// ======================================================
export const addToBlacklist = async (req, res) => {
  try {
    const { phoneNumber, name, reason } = req.body;

    if (!phoneNumber || phoneNumber.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Phone number is required" });
    }

    const cleanPhone = phoneNumber.trim();

    // Check if already blacklisted
    const existing = await Blacklist.findOne({ phoneNumber: cleanPhone });
    if (existing) {
      return res.status(400).json({ success: false, message: "This number is already blacklisted" });
    }

    // Create blacklist entry
    const entry = await Blacklist.create({
      phoneNumber: cleanPhone,
      name: name?.trim() || 'Unknown',
      reason: reason?.trim() || 'Reported for fraudulent activities using our company name',
      addedBy: 'Admin'
    });

    // Also flag the user account if they exist in the system
    await User.findOneAndUpdate(
      { phoneNumber: cleanPhone },
      { isBlacklisted: true, blacklistReason: entry.reason }
    );

    return res.status(201).json({
      success: true,
      message: "Number blacklisted successfully",
      entry
    });

  } catch (error) {
    console.error("Add to blacklist error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ======================================================
// REMOVE FROM BLACKLIST - Admin only
// ======================================================
export const removeFromBlacklist = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await Blacklist.findByIdAndDelete(id);
    if (!entry) {
      return res.status(404).json({ success: false, message: "Blacklist entry not found" });
    }

    // Also unset the flag on user account if exists
    await User.findOneAndUpdate(
      { phoneNumber: entry.phoneNumber },
      { isBlacklisted: false, blacklistReason: '' }
    );

    return res.status(200).json({ success: true, message: "Removed from blacklist" });

  } catch (error) {
    console.error("Remove from blacklist error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ======================================================
// GET ALL BLACKLISTED - Admin only (both collections)
// ======================================================
export const getAllBlacklistedUsers = async (req, res) => {
  try {
    // From standalone Blacklist collection
    const standaloneBlacklist = await Blacklist.find().sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      count: standaloneBlacklist.length,
      blacklistedUsers: standaloneBlacklist.map(entry => ({
        _id: entry._id,
        username: entry.name || 'Unknown',
        phoneNumber: entry.phoneNumber,
        email: 'N/A',
        blacklistReason: entry.reason,
        addedAt: entry.createdAt,
        isStandalone: true
      }))
    });

  } catch (error) {
    console.error("Fetch blacklisted error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ======================================================
// GET ALL TEAM MEMBERS - Admin only
// ======================================================
export const getAllTeamMembers = async (req, res) => {
  try {
    const teamMembers = await User.find({ isTeamMember: true })
      .select('fullName firstName lastName username phoneNumber email teamRole city myReferralCode createdAt')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: teamMembers.length,
      teamMembers: teamMembers.map(member => ({
        _id: member._id,
        username: member.username || member.fullName || `${member.firstName || ''} ${member.lastName || ''}`.trim(),
        phoneNumber: member.phoneNumber || "Not provided",
        email: member.email,
        teamRole: member.teamRole || "Team Member",
        city: member.city,
        referralCode: member.myReferralCode,
        joinedAt: member.createdAt
      }))
    });

  } catch (error) {
    console.error("Fetch team members error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ======================================================
// UPDATE TEAM MEMBER STATUS - Admin only (for registered users)
// ======================================================
export const updateTeamMemberStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isTeamMember, teamRole, isBlacklisted, blacklistReason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (typeof isTeamMember === 'boolean') user.isTeamMember = isTeamMember;
    if (teamRole !== undefined) user.teamRole = teamRole ? teamRole.trim() : null;
    if (typeof isBlacklisted === 'boolean') user.isBlacklisted = isBlacklisted;
    if (blacklistReason !== undefined) user.blacklistReason = blacklistReason ? blacklistReason.trim() : null;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      user: {
        _id: user._id,
        phoneNumber: user.phoneNumber,
        isTeamMember: user.isTeamMember,
        isBlacklisted: user.isBlacklisted
      }
    });

  } catch (error) {
    console.error("Update team member error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ======================================================
// GET ALL SEARCH TRACKING - Admin only
// ======================================================
export const getAllSearchTracking = async (req, res) => {
  try {
    const { filter } = req.query; // 'suspicious' | 'all'
    const query = filter === 'suspicious' ? { isSuspicious: true } : {};

    const records = await SearchTracking.find(query)
      .sort({ searchCount: -1, lastSearchedAt: -1 })
      .lean();

    const totalSuspicious = await SearchTracking.countDocuments({ isSuspicious: true });
    const totalAll = await SearchTracking.countDocuments();

    return res.status(200).json({
      success: true,
      records,
      counts: { all: totalAll, suspicious: totalSuspicious }
    });
  } catch (error) {
    console.error('Get search tracking error:', error);
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// ======================================================
// DELETE SEARCH TRACKING RECORD - Admin only
// ======================================================
export const deleteSearchTracking = async (req, res) => {
  try {
    const { id } = req.params;
    await SearchTracking.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: 'Record deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};
