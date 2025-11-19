import authReducer, { logout } from "../authSlice";

describe("authSlice", () => {
  it("should return the initial state when passed an unknown action", () => {
    const initialState = authReducer(undefined, { type: "unknown" });
    expect(initialState).toEqual({
      user: null,
      session: null,
      status: "idle",
      authStatus: "idle",
      error: null,
      authError: null,
    });
  });

  it("should clear the user and session on logout", () => {
    const populatedState = {
      user: { id: 1, email: "test@example.com" },
      session: { access_expires_in_ms: 1000 },
      status: "succeeded",
      authStatus: "succeeded",
      error: null,
      authError: null,
    };

    const nextState = authReducer(populatedState, logout());
    expect(nextState.user).toBeNull();
    expect(nextState.session).toBeNull();
    expect(nextState.status).toBe(populatedState.status);
    expect(nextState.authStatus).toBe(populatedState.authStatus);
  });
});
