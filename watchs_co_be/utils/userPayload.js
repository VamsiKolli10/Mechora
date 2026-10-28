const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  email_verified: user.email_verified,
  mfa_enabled: user.mfa_enabled,
  role: user.role || "customer",
  auth_provider: user.supabase_user_id ? "supabase" : "local",
  created_at: user.created_at,
  updated_at: user.updated_at,
});

module.exports = { sanitizeUser };
