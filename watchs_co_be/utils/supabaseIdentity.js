const verifiedSupabaseIdentity = async (accessToken) => {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw Object.assign(new Error("Supabase Auth is not configured"), { status: 503 });
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw Object.assign(new Error("Invalid Supabase session"), { status: 401 });
  const identity = await response.json();
  if (!identity.id || !identity.email || !identity.email_confirmed_at) {
    throw Object.assign(new Error("A verified email is required"), { status: 401 });
  }
  return { ...identity, email: identity.email.trim().toLowerCase() };
};
module.exports = { verifiedSupabaseIdentity };
