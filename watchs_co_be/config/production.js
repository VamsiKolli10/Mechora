const isPlaceholder = (value) =>
  !value || /^(change-me|replace-me|your-|localhost|127\.0\.0\.1)/i.test(value);

const validateProductionConfig = (env = process.env) => {
  if (env.NODE_ENV !== "production") return;

  const requiredSecrets = [
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "GUEST_TOKEN_SECRET",
    "COOKIE_SECRET",
  ];
  const weakSecrets = requiredSecrets.filter(
    (key) => isPlaceholder(env[key]) || env[key].length < 32
  );
  if (weakSecrets.length > 0) {
    throw new Error(
      `Production secrets must be random values of at least 32 characters: ${weakSecrets.join(", ")}`
    );
  }

  if (!env.DATABASE_URL && !(env.DB_HOST && env.DB_NAME && env.DB_USER && env.DB_PASSWORD)) {
    throw new Error("Production requires DATABASE_URL or complete DB_HOST, DB_NAME, DB_USER, and DB_PASSWORD settings.");
  }
  if (env.DB_SSL !== "true") {
    throw new Error("DB_SSL=true is required for production database connections.");
  }
  if (!env.CLIENT_ORIGIN || /localhost|127\.0\.0\.1/i.test(env.CLIENT_ORIGIN)) {
    throw new Error("CLIENT_ORIGIN must be a deployed HTTPS origin in production.");
  }
  if (env.COOKIE_SECURE !== "true") {
    throw new Error("COOKIE_SECURE=true is required for production sessions.");
  }
  if (!env.SUPABASE_URL || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(env.SUPABASE_URL)) {
    throw new Error("A valid HTTPS SUPABASE_URL is required for production authentication.");
  }
  if (!env.SUPABASE_ANON_KEY) {
    throw new Error("SUPABASE_ANON_KEY is required for production authentication.");
  }
};

module.exports = { validateProductionConfig };
