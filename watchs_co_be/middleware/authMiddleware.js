const { verifyAccessToken } = require("../utils/tokenUtils");
const config = require("../config/secrets");

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }
  if (req.cookies?.[config.cookies.access]) {
    return req.cookies[config.cookies.access];
  }
  return null;
};

const decodeToken = (token) => {
  if (!token) return null;
  return verifyAccessToken(token);
};

const requireAuth = (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const decoded = decodeToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  req.user = decoded;
  next();
};

const optionalAuth = (req, res, next) => {
  const token = getTokenFromRequest(req);
  const decoded = decodeToken(token);
  req.user = decoded || null;
  next();
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Insufficient permissions" });
  }
  next();
};

const requireAdmin = requireRole("admin");

module.exports = {
  requireAuth,
  optionalAuth,
  optional: optionalAuth,
  requireRole,
  requireAdmin,
};
