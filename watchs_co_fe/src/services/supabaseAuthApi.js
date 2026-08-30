import { supabase } from "./supabaseClient";

const requireClient = () => {
  if (!supabase) {
    throw new Error("Supabase Auth is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }
  return supabase;
};

export const supabaseAuthApi = {
  signUp({ email, password, name }) {
    return requireClient().auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
  },
  signIn({ email, password }) {
    return requireClient().auth.signInWithPassword({ email, password });
  },
  signOut() {
    return requireClient().auth.signOut();
  },
  getSession() {
    return requireClient().auth.getSession();
  },
  onAuthStateChange(callback) {
    return requireClient().auth.onAuthStateChange(callback);
  },
};
