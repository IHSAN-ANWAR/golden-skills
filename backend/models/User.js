import mongoose from "mongoose";
import crypto from "crypto";

/**
 * Generates a short, user-friendly referral code.
 * Format: GS-XXXXX  (5 alphanumeric chars, A-Z + 0-9)
 * Example: GS-X7K2M
 * Combinations: 36^5 = 60,466,176 — more than enough for 10k users.
 */
function generateSecureReferralCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = crypto.randomBytes(5);
  const code = Array.from(bytes).map(b => chars[b % 36]).join('');
  return `GS-${code}`;
}

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    fullName: { type: String, trim: true },
    username: { type: String, unique: true, sparse: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true },
    age: { type: Number, min: 13 },
    city: { type: String, required: true, trim: true },

    // The referral code this user used when registering (who referred them)
    referralCode: { type: String, trim: true },

    // The referrer's User._id (populated at registration from referralCode lookup)
    referredBy: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User', 
      default: null 
    },

    // This user's own unique referral code — secure, crypto-generated
    myReferralCode: { 
      type: String, 
      trim: true, 
      unique: true, 
      sparse: true,
      default: generateSecureReferralCode
    },

    // Count of referred users who have purchased a package (activated plan)
    referredUsersCount: { type: Number, default: 0 },

    // Whether this user has purchased/activated a plan (used for referral counting)
    hasActivatedPlan: { type: Boolean, default: false },

    // User ka phone number (optional, user update kar sakta hai)
    phoneNumber: { type: String, trim: true, default: null },

    // Official team member flag (admin set karta hai)
    isTeamMember: { type: Boolean, default: false },
    teamRole: { type: String, trim: true, default: null }, // e.g., "Sales Agent", "Support", "Manager"
    
    // Blacklist flag for scammers
    isBlacklisted: { type: Boolean, default: false },
    blacklistReason: { type: String, trim: true, default: null }, // Reason for blacklisting

    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Number, default: null },

    // OTP for mobile password reset
    resetOtp: { type: String, default: null },
    resetOtpExpiry: { type: Number, default: null },

    // ── Rank / Badge (admin assigns after promotion reward approval) ──────────
    rank: { type: String, trim: true, default: null },          // e.g. "Gold", "Platinum", "Diamond"
    rankAssignedAt: { type: Date, default: null },              // when rank was given
    rankExpiresAt: { type: Date, default: null },               // when rank expires (null = permanent)
    rankAssignedBy: { type: String, default: 'admin' },         // always admin
    // ─────────────────────────────────────────────────────────────────────────

    createdAt: { type: Date, default: Date.now }
});

// ── Performance indexes ──────────────────────────────
userSchema.index({ createdAt: -1 });           // speeds up getAllUsers sort
// myReferralCode already indexed via unique:true in schema — no duplicate needed
userSchema.index({ referredBy: 1 });           // fast lookup of all users referred by someone
// email and username already indexed via unique:true
userSchema.index({ fullName: 'text', username: 'text', email: 'text', city: 'text' }); // speeds up search

export default mongoose.model("User", userSchema, "users");