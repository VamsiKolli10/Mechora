import { fireEvent, render, screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Checkout from "../Checkout";
import authReducer from "@/features/auth/authSlice";
import cartReducer from "@/features/cart/cartSlice";
import { ordersApi } from "@/services/ordersApi";
vi.mock("@/services/ordersApi", () => ({ ordersApi: { createOrder: vi.fn() } }));
vi.mock("@/services/authApi", () => ({ authApi: {} }));

it("shows an availability error without crashing or clearing the bag", async () => {
  ordersApi.createOrder.mockRejectedValue({ response: { data: { error: { code: "REQUEST_ERROR", message: "A selected watch is no longer available" } } } });
  const cart = { ...cartReducer(undefined, { type: "init" }), cart: { id: 1 }, items: [{ id: 1, model: "Test Watch", quantity: 1, current_price: "125.55" }], itemCount: 1 };
  const store = configureStore({ reducer: { auth: authReducer, cart: cartReducer }, preloadedState: { cart } });
  const previousScroll = window.scrollTo;
  window.scrollTo = vi.fn();
  render(<Provider store={store}><MemoryRouter><Checkout /></MemoryRouter></Provider>);
  fireEvent.click(screen.getByRole("button", { name: "Continue to your details" }));
  for (const [label, value] of [[/^Email address/, "buyer@example.com"], [/^Full name/, "Test Buyer"], [/^Street address/, "1 Main St"], [/^City/, "Test City"], [/^State \/ Province/, "CA"], [/^Postal code/, "94105"]]) {
    fireEvent.change(screen.getByLabelText(label), { target: { value } });
  }
  fireEvent.click(screen.getByRole("button", { name: "Review request" }));
  fireEvent.click(screen.getByRole("button", { name: "Submit order request" }));
  expect(await screen.findByText("A selected watch is no longer available")).toBeInTheDocument();
  expect(store.getState().cart.items).toHaveLength(1);
  window.scrollTo = previousScroll;
});
