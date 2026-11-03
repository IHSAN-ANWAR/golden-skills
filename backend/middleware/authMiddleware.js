import jwt from 'jsonwebtoken';
import { getCache } from '../config/redis.js';

// ── Shared token verifier (blacklist check included) ─────────────────────────
const verifyToken = async (req, res, source = 'header') => {
  let token = null;

  if (source === 'cookie') {
    // Admin: httpOnly cookie se token lo
    token = req.cookies?.adminToken || null;
  } else {
    // User: Authorization header se token lo
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
      return null;
    }
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    return null;
  }

  // ── Redis blacklist check — agar token logout ho chuka hai to reject karo ──
  const isBlacklisted = await getCache(`blacklist:${token}`);
  if (isBlacklisted) {
    res.status(401).json({ success: false, message: 'Token has been revoked. Please login again.' });
    return null;
  }

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    const msg = error.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.';
    res.status(401).json({ success: false, message: msg });
    return null;
  }
};

// Middleware to authenticate regular users (Bearer token)
export const authenticateUser = async (req, res, next) => {
  const decoded = await verifyToken(req, res, 'header');
  if (!decoded) return;
  req.user = decoded;
  next();
};

// Middleware to authenticate admin users (httpOnly cookie)
export const authenticateAdmin = async (req, res, next) => {
  const decoded = await verifyToken(req, res, 'cookie');
  if (!decoded) return;

  if (decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
  }

  req.admin = decoded;
  next();
};