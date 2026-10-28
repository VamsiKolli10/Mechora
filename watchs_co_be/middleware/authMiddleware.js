const { verifyAccessToken } = require("../utils/tokenUtils");
const config = require("../config/secrets");
const { query } = require("../db");
const { asyncHandler } = require("./errorHandler");

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

const authenticate = async (token) => {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  const { rows } = await query(
    "SELECT id, name, email, role, session_version FROM users WHERE id = $1 AND deleted_at IS NULL",
    [decoded.id]
  );
  const user = rows[0];
  if (!user || Number(decoded.session_version || 0) !== user.session_version) return null;
  return { ...decoded, ...user };
};

const requireAuth = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const decoded = await authenticate(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid or expired session" });
  }

  req.user = decoded;
  next();
});

const optionalAuth = asyncHandler(async (req, res, next) => {
  const token = getTokenFromRequest(req);
  const user = token ? await authenticate(token) : null;
  // A previous signed-in session must refresh rather than silently changing owners.
  if (!user && (token || req.cookies?.[config.cookies.refresh])) {
    return res.status(401).json({ error: "Session expired. Please sign in again." });
  }
  req.user = user;
  next();
});

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
