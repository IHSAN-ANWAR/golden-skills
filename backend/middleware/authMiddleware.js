import jwt from 'jsonwebtoken';

// ── Shared token verifier ─────────────────────────────────────────────────────
const verifyToken = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    return null;
  }
  try {
    return jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
  } catch (error) {
    const msg = error.name === 'TokenExpiredError' ? 'Token expired.' : 'Invalid token.';
    res.status(401).json({ success: false, message: msg });
    return null;
  }
};

// Middleware to authenticate regular users
export const authenticateUser = (req, res, next) => {
  const decoded = verifyToken(req, res);
  if (!decoded) return;
  req.user = decoded;
  next();
};

// Middleware to authenticate admin users
export const authenticateAdmin = (req, res, next) => {
  const decoded = verifyToken(req, res);
  if (!decoded) return;

  if (decoded.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
  }

  req.admin = decoded;
  next();
};