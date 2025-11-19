const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config/secrets");
const logger = require("./logger");

const cookieOptions = {
  httpOnly: true,
  sameSite: config.cookies.sameSite,
  secure: config.cookies.secure,
  maxAge: config.cookies.guestMaxAgeMs,
  path: "/",
};

if (config.cookies.domain) {
  cookieOptions.domain = config.cookies.domain;
}

const signGuestToken = (rawToken) =>
  jwt.sign({ g: rawToken }, config.guestTokens.secret, {
    expiresIn: config.guestTokens.ttl,
  });

const verifyGuestToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.guestTokens.secret);
    return decoded?.g;
  } catch (err) {
    logger.warn("Failed to verify guest token", err.message);
    return null;
  }
};

const generateRawGuestToken = () => crypto.randomBytes(32).toString("hex");

const persistGuestCookie = (res, rawToken) => {
  const signed = signGuestToken(rawToken);
  res.cookie(config.cookies.guest, signed, cookieOptions);
  return signed;
};

const extractGuestToken = (req) => {
  const cookieToken = req.cookies?.[config.cookies.guest];
  if (cookieToken) {
    const raw = verifyGuestToken(cookieToken);
    if (raw) {
      return { rawToken: raw, signedToken: cookieToken, source: "cookie" };
    }
  }

  const headerToken = req.headers?.["x-guest-token"];
  if (headerToken) {
    const sanitized = Array.isArray(headerToken) ? headerToken[0] : headerToken;
    const raw = verifyGuestToken(sanitized) ||
      (config.guestTokens.allowLegacy ? sanitized : null);
    if (raw) {
      return { rawToken: raw, signedToken: signGuestToken(raw), source: "header" };
    }
  }

  const queryToken = req.query?.guest_token;
  if (queryToken) {
    const raw = verifyGuestToken(queryToken) ||
      (config.guestTokens.allowLegacy ? queryToken : null);
    if (raw) {
      return { rawToken: raw, signedToken: signGuestToken(raw), source: "query" };
    }
  }

  return null;
};

const ensureGuestToken = (req, res) => {
  const existing = extractGuestToken(req);
  if (existing) {
    if (existing.source !== "cookie") {
      persistGuestCookie(res, existing.rawToken);
    }
    return existing;
  }

  const rawToken = generateRawGuestToken();
  const signedToken = persistGuestCookie(res, rawToken);
  return { rawToken, signedToken, source: "minted", minted: true };
};

const clearGuestToken = (res) => {
  res.clearCookie(config.cookies.guest, {
    httpOnly: true,
    sameSite: config.cookies.sameSite,
    secure: config.cookies.secure,
    path: "/",
    domain: config.cookies.domain,
  });
};

module.exports = {
  ensureGuestToken,
  extractGuestToken,
  generateRawGuestToken,
  signGuestToken,
  verifyGuestToken,
  persistGuestCookie,
  clearGuestToken,
};
