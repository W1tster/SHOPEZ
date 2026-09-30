const jwt = require('jsonwebtoken');

/**
 * Extracts bearer token from HTTP Authorization header
 */
const extractTokenFromHeader = (authHeader = '') => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7).trim();
};

/**
 * Protect middleware: Verifies JWT token and attaches user payload { id, role } to req.user
 */
const protect = (req, res, next) => {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, invalid or expired token' });
  }
};

/**
 * Admin gatekeeper middleware: Ensures authenticated user possesses admin role
 */
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({ message: 'Admin access required' });
};

module.exports = {
  protect,
  adminOnly,
  extractTokenFromHeader,
};

