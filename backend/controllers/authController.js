import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import UserTask from '../models/UserTask.js';
import { getCache, setCache, deleteCachePattern } from '../config/redis.js';

const USERS_TTL = 30; // cache user lists for 30 seconds

// ── Email transporter (Gmail) ─────────────────────────────────────────────────
// Lazy transporter — har call pe fresh env vars use karta hai
const getTransporter = () => nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ======================================================
// ADMIN LOGIN - Authenticates admin users
// ======================================================
// Purpose: Admin authentication for admin dashboard
// Endpoint: POST /api/auth/login
// Input: { username, password }
// Output: JWT token + user info
// ======================================================
export const adminLogin = async (req, res) => {
  const { username, password } = req.body;

  // Validate required fields
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      message: "Username and password are required"
    });
  }

  // Check against environment variables for admin credentials
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Admin login - generate JWT token
    const token = jwt.sign(
      { username, role: "admin", loginTime: Date.now() },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    return res.json({
      success: true,
      message: "Login successful!",
      token,
      user: { username, role: "admin" }
    });
  }

  // Invalid admin credentials
  return res.status(401).json({
    success: false,
    message: "Invalid admin credentials"
  });
};

// ======================================================
// USER LOGIN - Authenticates regular users via email
// ======================================================
// Purpose: User authentication for mobile app
// Endpoint: POST /api/auth/user/login
// Input: { email, password }
// Output: JWT token + user info (without password)
// ======================================================
export const userLogin = async (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  try {
    // Find user by email only in database
    const user = await User.findOne({ email: email.toLowerCase() }).lean();

    // Check if user exists
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Compare password with hashed password using bcrypt
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Generate JWT token for regular user (valid for 24 hours)
    const token = jwt.sign(
      { id: user._id, username: user.username, role: "user" },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      age: user.age,
      city: user.city,
      referralCode: user.referralCode,
      createdAt: user.createdAt,
    };

    const responsePayload = {
      success: true,
      message: "Login successful!",
      token,   // JWT token for authenticated requests
      user: userResponse,
    };

    return res.status(200).json(responsePayload);

  } catch (error) {
    console.error("User login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

// ======================================================
// FORGOT PASSWORD - Mobile app ke liye OTP bhejo
// ======================================================
// Purpose: User email pe OTP bhejo password reset ke liye
// Endpoint: POST /api/auth/forgot-password
// Input: { email }
// Output: Success message (OTP email pe gaya)
// ======================================================
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address"
      });
    }

    // 6-digit OTP generate karo
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // OTP database mein save karo
    user.resetOtp = otp;
    user.resetOtpExpiry = otpExpiry;
    await user.save();

    // Email bhejo
    try {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"Golden Skills" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Password Reset OTP — Golden Skills',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Golden Skills</h2>
            <h3>Password Reset OTP</h3>
            <p>Hello <strong>${user.fullName || user.firstName}</strong>,</p>
            <p>Your OTP for password reset is:</p>
            <div style="text-align:center; margin: 30px 0;">
              <span style="font-size:40px; font-weight:bold; letter-spacing:10px; color:#f59e0b; background:#fff8e1; padding:15px 30px; border-radius:8px; border:2px dashed #f59e0b;">
                ${otp}
              </span>
            </div>
            <p style="color:#666;">This OTP will expire in <strong>10 minutes</strong>.</p>
            <p style="color:#666;">If you did not request this, please ignore this email.</p>
            <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
            <p style="color:#999; font-size:12px;">Golden Skills Team</p>
          </div>
        `
      });
      console.log(`✅ OTP sent to ${email}`);
    } catch (emailError) {
      console.error('❌ OTP email failed:', emailError.message);
      return res.status(500).json({ success: false, message: "Failed to send OTP email" });
    }

    return res.status(200).json({
      success: true,
      message: "OTP has been sent to your email. Valid for 10 minutes."
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during password reset request"
    });
  }
};

// ======================================================
// RESET PASSWORD - Updates password with new one
// ======================================================
// Purpose: Verify token and update user password
// Endpoint: POST /api/auth/reset-password
// Input: { token, newPassword }
// Output: Success message or error
// ======================================================
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  // Validate required fields
  if (!token || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Token and new password are required"
    });
  }

  // Validate password length (minimum 6 characters)
  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters"
    });
  }

  try {
    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Check if token is for password reset
    if (decoded.type !== 'password_reset') {
      return res.status(401).json({
        success: false,
        message: "Invalid reset token"
      });
    }

    // Find user by ID from token
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // Check if token matches and hasn't expired
    if (user.resetToken !== token || user.resetTokenExpiry < Date.now()) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired reset token"
      });
    }

    // Hash new password with bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password and clear reset token from database
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return res.json({
      success: true,
      message: "Password reset successful! You can now login with your new password."
    });

  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during password reset"
    });
  }
};

// ======================================================
// SEND OTP - Mobile app ke liye OTP bhejo
// ======================================================
// Purpose: User email pe 6-digit OTP bhejo
// Endpoint: POST /api/auth/send-otp
// Input: { email }
// Output: Success message (OTP email pe gaya)
// ======================================================
export const sendOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address"
      });
    }

    // 6-digit OTP generate karo
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    // OTP database mein save karo
    user.resetOtp = otp;
    user.resetOtpExpiry = otpExpiry;
    await user.save();

    // Email bhejo
    try {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: `"Golden Skills" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Password Reset OTP — Golden Skills',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Golden Skills</h2>
            <h3>Password Reset OTP</h3>
            <p>Hello <strong>${user.fullName || user.firstName}</strong>,</p>
            <p>Your OTP for password reset is:</p>
            <div style="text-align:center; margin: 30px 0;">
              <span style="font-size:40px; font-weight:bold; letter-spacing:10px; color:#f59e0b; background:#fff8e1; padding:15px 30px; border-radius:8px; border:2px dashed #f59e0b;">
                ${otp}
              </span>
            </div>
            <p style="color:#666;">This OTP will expire in <strong>10 minutes</strong>.</p>
            <p style="color:#666;">If you did not request this, please ignore this email.</p>
            <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
            <p style="color:#999; font-size:12px;">Golden Skills Team</p>
          </div>
        `
      });
      console.log(`✅ OTP sent to ${email}`);
    } catch (emailError) {
      console.error('❌ OTP email failed:', emailError.message);
      return res.status(500).json({ success: false, message: "Failed to send OTP email" });
    }

    return res.status(200).json({
      success: true,
      message: "OTP has been sent to your email. Valid for 10 minutes."
    });

  } catch (error) {
    console.error("Send OTP error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================================
// VERIFY OTP ONLY - Sirf OTP check karo (password change nahi)
// ======================================================
// Purpose: Mobile app mein OTP screen pe verify karo
// Endpoint: POST /api/auth/verify-otp
// Input: { email, otp }
// Output: { success: true } ya error
// ======================================================
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ success: false, message: "Email and OTP are required" });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!user.resetOtp || user.resetOtp !== otp.toString()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now reset your password."
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// ======================================================
// VERIFY OTP & RESET PASSWORD - OTP verify karo aur password update karo
// ======================================================
// Purpose: OTP check karo aur naya password set karo
// Endpoint: POST /api/auth/verify-otp-reset
// Input: { email, otp, newPassword }
// Output: Success message
// ======================================================
export const verifyOtpAndReset = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "Email, OTP, and new password are required"
    });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters"
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // OTP check karo
    if (!user.resetOtp || user.resetOtp !== otp.toString()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    // OTP expiry check karo
    if (user.resetOtpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP has expired. Please request a new one." });
    }

    // Naya password hash karo
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Password update karo aur OTP clear karo
    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpiry = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful! You can now login with your new password.",
      email: user.email,
      passwordUpdated: true,
      updatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error("Verify OTP reset error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
// CREATE USER MANUALLY - Admin creates user in database
// ======================================================
// Purpose: Allow admin to manually create a new user
// Endpoint: POST /api/auth/user/create (requires admin auth)
// Input: { fullName, username, email, password, age, city, referralCode }
// Output: Created user info (without password)
// ======================================================
export const createUserManually = async (req, res) => {
  try {
    const { fullName, firstName, lastName, username, email, password, age, city, referralCode } = req.body;

    // Validation — firstName + lastName required (fullName auto-built if not provided)
    if (!firstName || !lastName || !email || !password || !age || !city) {
      return res.status(400).json({
        success: false,
        message: "firstName, lastName, email, password, age, city are required"
      });
    }

    // Check if user already exists
    const orQuery = [{ email: email.toLowerCase() }];
    if (username) orQuery.push({ username: username.toLowerCase() });

    const existingUser = await User.findOne({ $or: orQuery });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or username already exists"
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const computedFullName = fullName?.trim() || `${firstName.trim()} ${lastName.trim()}`;

    // Create new user
    const newUserData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName: computedFullName,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      age: parseInt(age),
      city: city.trim(),
      isActive: true
    };

    // Only set username if provided — avoids null duplicate key error
    if (username && username.trim()) {
      newUserData.username = username.trim().toLowerCase();
    }

    if (referralCode && referralCode.trim()) {
      newUserData.referralCode = referralCode.trim();
    }

    const newUser = new User(newUserData);

    await newUser.save();
    await deleteCachePattern('users:*');

    // Return success response (excluding password)
    const userResponse = {
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      fullName: newUser.fullName,
      username: newUser.username,
      email: newUser.email,
      age: newUser.age,
      city: newUser.city,
      referralCode: newUser.referralCode,
      myReferralCode: newUser.myReferralCode,
      createdAt: newUser.createdAt
    };

    return res.status(201).json({
      success: true,
      message: "User created successfully!",
      user: userResponse
    });

  } catch (error) {
    console.error("Manual user creation error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during user creation",
      error: error.message
    });
  }
};

// ======================================================
// GET ALL USERS - Fetch users with pagination and search
// ======================================================
// Purpose: Admin dashboard to view all users
// Endpoint: GET /api/auth/users (requires admin auth)
// Query Params: ?page=1&limit=10&search=term
// Output: Array of users with pagination info
// ======================================================
export const getAllUsers = async (req, res) => {
  try {
    // Extract pagination parameters from query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    
    // Validate pagination parameters
    if (page < 1) {
      return res.status(400).json({
        success: false,
        message: "Page number must be greater than 0"
      });
    }
    
    if (limit < 1 || limit > 100) {
      return res.status(400).json({
        success: false,
        message: "Limit must be between 1 and 100"
      });
    }
    
    // Calculate skip value
    const skip = (page - 1) * limit;
    
    // Build query
    let query = { password: { $ne: null } }; // Exclude password field
    
    // Add search functionality if search term is provided
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { fullName: searchRegex },
        { username: searchRegex },
        { email: searchRegex },
        { city: searchRegex }
      ];
    }
    
    // ── Try cache first ──────────────────────────────────────────────────────
    const cacheKey = `users:page${page}:limit${limit}:search${search}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.status(200).json({ ...cached, fromCache: true });
    }

    // ── Cache miss — hit MongoDB ─────────────────────────────────────────────
    // Count total documents matching the query
    const totalUsers = await User.countDocuments(query);
    
    // Fetch paginated users
    const users = await User.find(query, { password: 0 })
      .lean()                        // plain JS objects — 2x faster, less memory
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(totalUsers / limit);

    const responseData = {
      success: true,
      message: "Users fetched successfully!",
      count: users.length,
      total: totalUsers,
      page,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      users,
    };

    await setCache(cacheKey, responseData, USERS_TTL);

    return res.status(200).json(responseData);
    
  } catch (error) {
    console.error("Fetch users error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching users",
      error: error.message
    });
  }
};

// ======================================================
// USER REGISTER - Register new user via mobile app
// ======================================================
// Purpose: Register new user for mobile app
// Endpoint: POST /api/auth/user/register
// Input: { firstName, lastName, email, city, referralCode, password }
// Output: Created user info (without password)
//
// Rules:
//  1. referralCode is MANDATORY — no registration without it
//  2. User cannot use their own referral code (self-referral blocked)
//  3. referralCode must belong to an existing user (validated in DB)
//  4. Referred user is only counted once they activate/purchase a plan
// ======================================================
export const userRegister = async (req, res) => {
  try {
    const { firstName, lastName, email, city, referralCode, password } = req.body;

    const errors = [];

    if (!firstName || firstName.trim().length < 2) {
      errors.push("First name is required and must be at least 2 characters");
    }

    if (!lastName || lastName.trim().length < 2) {
      errors.push("Last name is required and must be at least 2 characters");
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.push("A valid email address is required");
    }

    if (!city || city.trim().length < 2) {
      errors.push("City is required and must be at least 2 characters");
    }

    // Rule 1: Referral code is optional — skip validation if not provided

    if (!password || password.length < 6) {
      errors.push("Password is required and must be at least 6 characters");
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }

    const cleanReferralCode = referralCode ? referralCode.trim().toUpperCase() : null;

    // Check for existing email
    const existingEmail = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "A user with this email already exists"
      });
    }

    // Rule 3: Validate referral code only if provided
    let referrer = null;
    if (cleanReferralCode) {
      referrer = await User.findOne({ myReferralCode: cleanReferralCode }).lean();
      if (!referrer) {
        return res.status(400).json({
          success: false,
          message: "Invalid referral code. Please enter a valid referral code"
        });
      }

      // Rule 2: Block self-referral — compare email with referrer's email
      if (referrer.email === email.trim().toLowerCase()) {
        return res.status(400).json({
          success: false,
          message: "You cannot use your own referral code"
        });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const fullName = `${firstName.trim()} ${lastName.trim()}`;

    // Create new user — store referralCode used + referrer's _id for tracking
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      fullName,
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      city: city.trim(),
      ...(cleanReferralCode && { referralCode: cleanReferralCode }),   // only if provided
      ...(referrer && { referredBy: referrer._id })                    // only if referrer found
    });

    await newUser.save();
    await deleteCachePattern('users:*'); // bust user list cache

    const userResponse = {
      _id: newUser._id,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      fullName: newUser.fullName,
      email: newUser.email,
      city: newUser.city,
      referralCode: newUser.referralCode,
      myReferralCode: newUser.myReferralCode,
      createdAt: newUser.createdAt
    };

    return res.status(201).json({
      success: true,
      message: "User registered successfully!",
      // token,   // TODO: uncomment when mobile app is ready to handle auth
      user: userResponse
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during registration",
      error: error.message
    });
  }
};


// ======================================================
// VALIDATE REFERRAL CODE - Check if a referral code is valid
// ======================================================
// Purpose: Frontend can call this to validate referral code in real-time
// Endpoint: POST /api/auth/validate-referral
// Input: { referralCode }
// Output: { valid: true/false, referrerName }
// ======================================================
export const validateReferralCode = async (req, res) => {
  try {
    const { referralCode } = req.body;

    if (!referralCode || referralCode.trim().length === 0) {
      return res.status(400).json({
        success: false,
        valid: false,
        message: "Referral code is required"
      });
    }

    const referrer = await User.findOne({ 
      myReferralCode: referralCode.trim().toUpperCase() 
    }).select('fullName firstName').lean();

    if (!referrer) {
      return res.status(200).json({
        success: true,
        valid: false,
        message: "Invalid referral code"
      });
    }

    return res.status(200).json({
      success: true,
      valid: true,
      message: "Valid referral code",
      referrerName: referrer.fullName || referrer.firstName
    });

  } catch (error) {
    console.error("Validate referral error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during referral validation",
      error: error.message
    });
  }
};

// ======================================================
// GET MY REFERRAL INFO - Get current user's referral code & stats
// ======================================================
// Purpose: User can see their own referral code, stats, and active referral task progress
// Endpoint: GET /api/auth/user/referral-info (requires user auth)
// Output: { myReferralCode, referredUsersCount, referralTask }
// ======================================================
export const getMyReferralInfo = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await User.findById(userId)
      .select('myReferralCode referredUsersCount fullName email')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Is user ke referral se join hone wale sare users
    const referredUsers = await User.find({ referredBy: userId })
      .select('fullName city hasActivatedPlan createdAt')
      .sort({ createdAt: -1 })
      .lean();

    const totalJoined = referredUsers.length;
    const totalPurchased = referredUsers.filter(u => u.hasActivatedPlan).length;

    // Active referral task dhundo (agar koi assigned/in-progress hai)
    const activeReferralTask = await UserTask.findOne({
      userEmail: user.email,
      isReferralTask: true,
      status: { $in: ['assigned', 'in-progress'] }
    }).select('taskTitle referralTarget referralProgress referralReward referralPackagePrice taskDeadline status').lean();

    return res.status(200).json({
      success: true,
      myReferralCode: user.myReferralCode,
      referredUsersCount: user.referredUsersCount,
      fullName: user.fullName,
      // Referred users list with plan purchase status
      referralStats: {
        totalJoined,
        totalPurchased,
        totalPending: totalJoined - totalPurchased
      },
      referredUsers: referredUsers.map((u, index) => ({
        serial: index + 1,
        name: u.fullName || 'Unknown',
        city: u.city || '',
        joinedAt: u.createdAt,
        hasPurchasedPlan: u.hasActivatedPlan
      })),
      // Active referral task info (null if no task assigned)
      referralTask: activeReferralTask ? {
        title: activeReferralTask.taskTitle,
        target: activeReferralTask.referralTarget,
        progress: activeReferralTask.referralProgress,
        reward: activeReferralTask.referralReward,
        packagePrice: activeReferralTask.referralPackagePrice,
        deadline: activeReferralTask.taskDeadline,
        status: activeReferralTask.status,
        remaining: Math.max(0, activeReferralTask.referralTarget - activeReferralTask.referralProgress)
      } : null
    });

  } catch (error) {
    console.error("Get referral info error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// ======================================================
// GET REFERRAL STATS - Public endpoint (referral code se)
// ======================================================
// Purpose: Mobile app mein user apne referral stats dekhe
//          — kitne log join hue, kitne ne plan purchase kiya
// Endpoint: GET /api/auth/user/referral-stats/:referralCode
// Auth: Public (no token needed)
// Output: referred users list with plan purchase status
// ======================================================
export const getReferralStats = async (req, res) => {
  try {
    const { referralCode } = req.params;

    if (!referralCode || !referralCode.trim()) {
      return res.status(400).json({ success: false, message: "Referral code is required" });
    }

    // Us user ko dhundo jiska ye referral code hai
    const owner = await User.findOne({ myReferralCode: referralCode.trim().toUpperCase() })
      .select('fullName email myReferralCode referredUsersCount')
      .lean();

    if (!owner) {
      return res.status(404).json({ success: false, message: "Invalid referral code" });
    }

    // Is user ke referral se join hone wale sare users dhundo
    const referredUsers = await User.find({ referredBy: owner._id })
      .select('fullName email hasActivatedPlan createdAt city')
      .sort({ createdAt: -1 })
      .lean();

    const totalJoined = referredUsers.length;
    const totalPurchased = referredUsers.filter(u => u.hasActivatedPlan).length;

    // List banao — sensitive info (email) hide karo, sirf naam aur status dikhao
    const referredList = referredUsers.map((u, index) => ({
      serial: index + 1,
      name: u.fullName || 'Unknown',
      city: u.city || '',
      joinedAt: u.createdAt,
      hasPurchasedPlan: u.hasActivatedPlan
    }));

    return res.status(200).json({
      success: true,
      referralCode: owner.myReferralCode,
      ownerName: owner.fullName,
      summary: {
        totalJoined,       // kitne log join hue
        totalPurchased,    // kitne ne plan purchase kiya
        totalPending: totalJoined - totalPurchased  // kitne ne abhi tak purchase nahi kiya
      },
      referredUsers: referredList
    });

  } catch (error) {
    console.error("Get referral stats error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};

// ======================================================
// GET MY PROFILE - Logged-in user ka apna profile
// ======================================================
// Purpose: Mobile app mein user apni profile dekhe
// Endpoint: GET /api/auth/user/profile (requires user auth)
// Headers: Authorization: Bearer <token>
// Output: Registration ke waqt fill kiya hua sara data +
//         apna referral code (myReferralCode)
// ======================================================
export const getMyProfile = async (req, res) => {
  try {
    // Token se userId lo, ya query param se email (temporary testing only)
    const userId = req.user?.id;
    const emailParam = req.query.email;

    let user;

    if (userId) {
      // Token wala flow — ID se fetch
      user = await User.findById(userId)
        .select('-password -resetToken -resetTokenExpiry')
        .lean();
    } else if (emailParam) {
      // Testing flow — email se fetch
      user = await User.findOne({ email: emailParam.toLowerCase() })
        .select('-password -resetToken -resetTokenExpiry')
        .lean();
    } else {
      return res.status(401).json({ success: false, message: "Unauthorized — provide token or email query param" });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Agar user ne kisi ke referral se register kiya tha to referrer ka naam bhi dikhao
    let referredByName = null;
    if (user.referredBy) {
      const referrer = await User.findById(user.referredBy)
        .select('fullName')
        .lean();
      referredByName = referrer?.fullName || null;
    }

    const profile = {
      _id:                user._id,
      firstName:          user.firstName,
      lastName:           user.lastName,
      fullName:           user.fullName,
      email:              user.email,
      city:               user.city,
      age:                user.age ?? null,
      username:           user.username ?? null,

      // Referral info
      myReferralCode:     user.myReferralCode,       // apna code — share karo doston ko
      referralCode:       user.referralCode ?? null, // jis code se register kiya tha
      referredByName:     referredByName,            // us insaan ka naam jisne refer kiya
      referredUsersCount: user.referredUsersCount,   // kitne logon ko refer kiya

      // Plan status
      hasActivatedPlan:   user.hasActivatedPlan,

      // Account dates
      createdAt:          user.createdAt,
    };

    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      profile
    });

  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching profile",
      error: error.message
    });
  }
};
// ======================================================
// UPDATE MY PROFILE - Logged-in user apna password ya phone number update kare
// ======================================================
// Purpose: Mobile app mein user sirf apna password aur phone number update kar sake
// Endpoint: PUT /api/auth/user/profile (requires user auth)
// Headers: Authorization: Bearer <token>
// Input: { password, newPassword } ya { phoneNumber }
// Output: Updated profile info
// ======================================================
export const updateMyProfile = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const { currentPassword, newPassword, phoneNumber, firstName, lastName } = req.body;

    // Kuch to update karna chahiye
    if (!newPassword && phoneNumber === undefined && !firstName && !lastName) {
      return res.status(400).json({
        success: false,
        message: "Kuch update karne ke liye newPassword, phoneNumber, firstName ya lastName provide karo"
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // ── Password update ──────────────────────────────────────────────────────
    if (newPassword) {
      // Current password verify karna zaroori hai
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: "Password change ke liye currentPassword bhi do"
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: "Current password galat hai"
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password kam se kam 6 characters ka hona chahiye"
        });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // ── Name update ──────────────────────────────────────────────────────────
    if (firstName !== undefined && firstName.trim()) {
      user.firstName = firstName.trim();
    }

    if (lastName !== undefined && lastName.trim()) {
      user.lastName = lastName.trim();
    }

    // Update fullName if either firstName or lastName is updated
    if ((firstName !== undefined && firstName.trim()) || (lastName !== undefined && lastName.trim())) {
      user.fullName = `${user.firstName} ${user.lastName}`;
    }

    // ── Phone number update ──────────────────────────────────────────────────
    if (phoneNumber !== undefined) {
      const phone = phoneNumber.toString().trim();

      if (phone.length > 0 && !/^\+?[0-9]{7,15}$/.test(phone)) {
        return res.status(400).json({
          success: false,
          message: "Phone number valid nahi hai (7-15 digits, optional + prefix)"
        });
      }

      user.phoneNumber = phone.length > 0 ? phone : null;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Profile update ho gaya!",
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber
      },
      updated: {
        ...(newPassword && { passwordChanged: true }),
        ...(firstName && { firstName: true }),
        ...(lastName && { lastName: true }),
        ...(phoneNumber !== undefined && { phoneNumber: true })
      }
    });

  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during profile update",
      error: error.message
    });
  }
};

// ======================================================
// DELETE USER - Admin deletes user from database
// ======================================================
// Purpose: Allow admin to delete a user
// Endpoint: DELETE /api/auth/user/:id (requires admin auth)
// Input: User ID in URL params
// Output: Success message
// ======================================================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate ObjectId format
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    // Find and delete user
    const user = await User.findByIdAndDelete(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      message: "User deleted successfully!"
    });

  } catch (error) {
    console.error("Delete user error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during user deletion",
      error: error.message
    });
  }
};

// ======================================================
// GET USER BY ID - Fetch single user details
// ======================================================
// Purpose: Get detailed information about a specific user
// Endpoint: GET /api/auth/user/:id (requires admin auth)
// Input: User ID in URL params
// Output: User info (without password)
// ======================================================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    // Find user by ID (excluding password)
    const user = await User.findById(id).select('-password').lean();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.json({
      success: true,
      user: user
    });

  } catch (error) {
    console.error("Get user error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching user",
      error: error.message
    });
  }
};
