import { configureStore } from "@reduxjs/toolkit";
import { vi } from "vitest";
import authReducer, { logout, fetchCurrentUser, loginUser } from "../authSlice";
import { authApi } from "@/services/authApi";
vi.mock("@/services/authApi", () => ({ authApi: { getCurrentUser: vi.fn() } }));

describe("authentication lifecycle", () => {
  it("starts without an authenticated user", () => {
    expect(authReducer(undefined, { type: "unknown" })).toMatchObject({ user: null, session: null, status: "idle", authStatus: "idle" });
  });
  it("finishes anonymous bootstrap and permits a subsequent login to leave the loading state", () => {
    let state = authReducer(undefined, fetchCurrentUser.pending("bootstrap"));
    state = authReducer(state, fetchCurrentUser.rejected(null, "bootstrap", undefined, "unauthenticated"));
    expect(state.status).toBe("succeeded");
    state = authReducer(state, loginUser.pending("login"));
    state = authReducer(state, loginUser.fulfilled({ user: { id: 1 } }, "login"));
    expect(state).toMatchObject({ user: { id: 1 }, status: "succeeded" });
  });
  it("ignores bootstrap responses belonging to a previous login attempt", () => {
    let state = authReducer(undefined, fetchCurrentUser.pending("old"));
    state = authReducer(state, loginUser.pending("new"));
    state = authReducer(state, loginUser.fulfilled({ user: { id: 2 } }, "new"));
    state = authReducer(state, fetchCurrentUser.rejected(null, "old", undefined, "unauthenticated"));
    expect(state.user.id).toBe(2);
  });
  it("clears user and session state on logout", () => {
    const initial = authReducer(undefined, { type: "unknown" });
    const state = authReducer({ ...initial, user: { id: 1 }, session: { access_expires_in_ms: 1000 }, status: "succeeded" }, logout());
    expect(state).toMatchObject({ user: null, session: null, status: "succeeded", authStatus: "idle" });
  });
  it("does not turn an MFA challenge from the provider bridge into a user object", async () => {
    authApi.getCurrentUser.mockResolvedValue({ data: { requires_mfa: true, message: "MFA code required" } });
    const store = configureStore({ reducer: { auth: authReducer } });
    await store.dispatch(fetchCurrentUser());
    expect(store.getState().auth).toMatchObject({ user: null, status: "succeeded" });
  });
});
