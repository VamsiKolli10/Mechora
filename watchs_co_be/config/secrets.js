const durationPattern = /^(\d+)(ms|s|m|h|d)$/i;

const toMs = (value, fallbackMs) => {
  if (!value) return fallbackMs;
  if (typeof value === "number") return value;
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) {
    return parseInt(trimmed, 10);
  }
  const match = trimmed.match(durationPattern);
  if (!match) {
    return fallbackMs;
  }
  const amount = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const unitMap = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };
  return amount * (unitMap[unit] || 1);
};

const requiredSecrets = [
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "GUEST_TOKEN_SECRET",
  "COOKIE_SECRET",
];

const missing = requiredSecrets.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(
    `Missing required environment secrets: ${missing.join(", ")}. ` +
      "Populate these variables before starting the API."
  );
}

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";
const cookieSameSite = (process.env.COOKIE_SAMESITE || "lax").toLowerCase();

const config = {
  env: nodeEnv,
  isProduction,
  jwt: {
    accessSecret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessTtl: process.env.JWT_EXPIRES_IN || "15m",
    refreshTtl: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    accessTtlMs: toMs(process.env.JWT_EXPIRES_IN || "15m", 15 * 60 * 1000),
    refreshTtlMs: toMs(process.env.JWT_REFRESH_EXPIRES_IN || "7d", 7 * 24 * 60 * 60 * 1000),
  },
  guestTokens: {
    secret: process.env.GUEST_TOKEN_SECRET,
    ttl: process.env.GUEST_TOKEN_TTL || "30d",
    ttlMs: toMs(process.env.GUEST_TOKEN_TTL || "30d", 30 * 24 * 60 * 60 * 1000),
    allowLegacy: process.env.ALLOW_LEGACY_GUEST_TOKENS !== "false",
  },
  cookies: {
    secret: process.env.COOKIE_SECRET,
    access: process.env.ACCESS_TOKEN_COOKIE || "mechora_access_token",
    refresh: process.env.REFRESH_TOKEN_COOKIE || "mechora_refresh_token",
    guest: process.env.GUEST_TOKEN_COOKIE || "mechora_guest_token",
    domain: process.env.COOKIE_DOMAIN || undefined,
    sameSite: ["lax", "strict", "none"].includes(cookieSameSite)
      ? cookieSameSite
      : "lax",
    secure:
      process.env.COOKIE_SECURE === "true" ||
      (process.env.COOKIE_SECURE !== "false" && isProduction),
  },
};

config.cookies.accessMaxAgeMs = config.jwt.accessTtlMs;
config.cookies.refreshMaxAgeMs = config.jwt.refreshTtlMs;
config.cookies.guestMaxAgeMs = config.guestTokens.ttlMs;

module.exports = config;
