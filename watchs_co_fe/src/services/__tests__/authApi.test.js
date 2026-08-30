import { beforeEach, describe, expect, it, vi } from "vitest";
import api from "@/utils/api";
import { supabase } from "../supabaseClient";
import { authApi } from "../authApi";

vi.mock("@/utils/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

vi.mock("../supabaseClient", () => ({
  isSupabaseAuthConfigured: true,
  supabase: {
    auth: {
      getSession: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

describe("authApi Supabase session bridge", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns a confirmation state when signup has no session", async () => {
    supabase.auth.signUp.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const response = await authApi.signup({
      name: "Collector",
      email: "collector@example.com",
      password: "ValidPassword123!",
    });

    expect(response.data.pending_confirmation).toBe(true);
    expect(api.post).not.toHaveBeenCalled();
  });

  it("restores the Express session from an existing Supabase session", async () => {
    const unauthorized = Object.assign(new Error("Unauthorized"), {
      response: { status: 401 },
    });
    api.get.mockRejectedValue(unauthorized);
    supabase.auth.getSession.mockResolvedValue({
      data: { session: { access_token: "verified-token" } },
      error: null,
    });
    api.post.mockResolvedValue({ data: { user: { id: 1 } } });

    const response = await authApi.getCurrentUser();

    expect(api.post).toHaveBeenCalledWith("/api/auth/supabase-session", {
      access_token: "verified-token",
    });
    expect(response.data.user.id).toBe(1);
  });
});
