import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { vi } from "vitest";
import Login from "../Login";
import ProtectedRoute from "@/components/ProtectedRoute";
import authReducer from "@/features/auth/authSlice";
import { authApi } from "@/services/authApi";
vi.mock("@/services/authApi", () => ({ authApi: { login: vi.fn() } }));

it("completes an MFA challenge and opens the protected account page after a fresh login", async () => {
  authApi.login.mockResolvedValueOnce({ data: { requires_mfa: true, message: "Enter a code" } })
    .mockResolvedValueOnce({ data: { user: { id: 1, email: "buyer@example.com" } } });
  const store = configureStore({ reducer: { auth: authReducer } });
  render(<Provider store={store}><MemoryRouter initialEntries={["/login"]}><Routes>
    <Route path="/login" element={<Login />} />
    <Route element={<ProtectedRoute />}><Route path="/account" element={<div>Account opened</div>} /></Route>
  </Routes></MemoryRouter></Provider>);
  fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: "buyer@example.com" } });
  fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: "CorrectPassword123!" } });
  fireEvent.click(screen.getByRole("button", { name: "Login" }));
  const code = await screen.findByLabelText(/Authentication code/);
  expect(store.getState().auth.user).toBeNull();
  fireEvent.change(code, { target: { value: "012345" } });
  fireEvent.click(screen.getByRole("button", { name: "Login" }));
  await waitFor(() => expect(screen.getByText("Account opened")).toBeInTheDocument());
  expect(authApi.login).toHaveBeenLastCalledWith({ email: "buyer@example.com", password: "CorrectPassword123!", mfa_code: "012345" });
});
