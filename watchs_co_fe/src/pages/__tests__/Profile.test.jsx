import { act, fireEvent, render, screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import Profile from "../Account/Profile";
import ProtectedRoute from "@/components/ProtectedRoute";
import authReducer from "@/features/auth/authSlice";
import { authApi } from "@/services/authApi";
import api from "@/utils/api";
vi.mock("@/services/authApi", () => ({ authApi: { getCurrentUser: vi.fn() } }));
vi.mock("@/utils/api", () => ({ default: { put: vi.fn() } }));
vi.mock("@/services/supabaseClient", () => ({ supabase: null }));

it("keeps email verification feedback visible while refreshing a saved profile", async () => {
  let finish;
  authApi.getCurrentUser.mockReturnValue(new Promise(resolve => { finish = resolve; }));
  api.put.mockResolvedValue({ data: { verification_sent: true } });
  const user = { id: 1, name: "Test Buyer", email: "old@example.com", auth_provider: "local" };
  const auth = { ...authReducer(undefined, { type: "init" }), user, status: "succeeded" };
  const store = configureStore({ reducer: { auth: authReducer }, preloadedState: { auth } });
  render(<Provider store={store}><MemoryRouter initialEntries={["/account/profile"]}><Routes>
    <Route element={<ProtectedRoute />}><Route path="/account/profile" element={<Profile />} /></Route>
  </Routes></MemoryRouter></Provider>);
  fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: "new@example.com" } });
  fireEvent.click(screen.getByRole("button", { name: "Update Profile" }));
  expect(await screen.findByText("Profile saved. Check your email to verify your address.")).toBeInTheDocument();
  expect(screen.queryByLabelText("Checking authentication")).not.toBeInTheDocument();
  await act(async () => { finish({ data: { user: { ...user, email: "new@example.com", email_verified: false } } }); });
  expect(screen.getByText("Profile saved. Check your email to verify your address.")).toBeInTheDocument();
  expect(store.getState().auth.user.email).toBe("new@example.com");
});
