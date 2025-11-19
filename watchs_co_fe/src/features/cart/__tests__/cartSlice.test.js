import cartReducer, { clearCartState } from "../cartSlice";

const buildState = (overrides = {}) => ({
  cart: { id: 1, items: [] },
  items: [{ id: 2 }],
  subtotal: 100,
  itemCount: 1,
  loading: false,
  error: null,
  ...overrides,
});

describe("cartSlice", () => {
  it("should reset cart values when clearCartState is dispatched", () => {
    const initial = buildState();
    const next = cartReducer(initial, clearCartState());

    expect(next.cart).toBeNull();
    expect(next.items).toEqual([]);
    expect(next.subtotal).toBe(0);
    expect(next.itemCount).toBe(0);
  });
});
