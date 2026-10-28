import { render, screen } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import Cart from "../Cart";
import authReducer from "@/features/auth/authSlice";
import cartReducer from "@/features/cart/cartSlice";
import { cartApi } from "@/services/cartApi";
vi.mock("@/services/cartApi", () => ({ cartApi: { getCart: vi.fn() } }));
vi.mock("@/services/authApi", () => ({ authApi: {} }));

it("shows current prices and disables quantity increases at the server limit", async () => {
  const response = { id: 1, items: [{ id: 1, watch_id: 1, model: "Test Watch", quantity: 10, stock_quantity: 15, price_at_added: "100.25", current_price: "125.55" }], item_count: 10 };
  cartApi.getCart.mockResolvedValue({ data: response });
  const cart = { ...cartReducer(undefined, { type: "init" }), cart: response, items: response.items, itemCount: 10 };
  const store = configureStore({ reducer: { auth: authReducer, cart: cartReducer }, preloadedState: { cart } });
  render(<Provider store={store}><MemoryRouter><Cart /></MemoryRouter></Provider>);
  expect(await screen.findByText("$125.55")).toBeInTheDocument();
  expect(screen.queryByText("$100.25")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Increase quantity/ })).toBeDisabled();
});
