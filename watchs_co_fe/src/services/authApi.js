import api from "@/utils/api";
import { supabase, isSupabaseAuthConfigured } from "./supabaseClient";

const exchangeSession = async (session, mfaCode) => {
  if (!session?.access_token) return { data: { user: null, session: null } };
  const { data } = await api.post("/api/auth/supabase-session", {
    access_token: session.access_token,
    ...(mfaCode ? { mfa_code: mfaCode } : {}),
  });
  return { data };
};

export const authApi = {
  async getCurrentUser() {
    try {
      const response = await api.get("/api/users/me", { skipSessionExpiredNotification: true });
      if (isSupabaseAuthConfigured && response.data.user?.auth_provider === "supabase") {
        const { data, error } = await supabase.auth.getSession();
        const email = data?.session?.user?.email;
        if (!error && email && email.toLowerCase() !== response.data.user.email.toLowerCase()) {
          return exchangeSession(data.session);
        }
      }
      return response;
    } catch (apiError) {
      if (!isSupabaseAuthConfigured || apiError.response?.status !== 401) {
        throw apiError;
      }

      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) throw apiError;
      return exchangeSession(data.session);
    }
  },
  login(credentials) {
    if (isSupabaseAuthConfigured) {
      return supabase.auth.signInWithPassword({ email: credentials.email, password: credentials.password }).then(({ data, error }) => {
        if (error) throw error;
        return exchangeSession(data.session, credentials.mfa_code);
      });
    }
    return api.post("/api/auth/login", credentials);
  },
  signup(userData) {
    if (isSupabaseAuthConfigured) {
      return supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: { data: { name: userData.name } },
      }).then(({ data, error }) => {
        if (error) throw error;
        if (!data.session) {
          return {
            data: {
              user: null,
              session: null,
              pending_confirmation: true,
              message: "Check your email to confirm your account before signing in.",
            },
          };
        }
        return exchangeSession(data.session);
      });
    }
    return api.post("/api/auth/signup", userData);
  },
  logout() {
    if (isSupabaseAuthConfigured) {
      return supabase.auth.signOut().finally(() => api.post("/api/auth/logout"));
    }
    return api.post("/api/auth/logout");
  },
};
