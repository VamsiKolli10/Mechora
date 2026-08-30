import { vi } from "vitest";
import api from "@/utils/api";
import { cartApi } from "../cartApi";

vi.mock("@/utils/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe("cartApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the cart API routes without exposing endpoint strings to slices", () => {
    cartApi.getCart();
    cartApi.addItem({ watch_id: 10, quantity: 2 });
    cartApi.updateItem({ itemId: 5, quantity: 3 });
    cartApi.removeItem(5);
    cartApi.clearCart();
    cartApi.mergeCart();

    expect(api.get).toHaveBeenCalledWith("/api/cart");
    expect(api.post).toHaveBeenCalledWith("/api/cart/items", {
      watch_id: 10,
      quantity: 2,
    });
    expect(api.put).toHaveBeenCalledWith("/api/cart/items/5", { quantity: 3 });
    expect(api.delete).toHaveBeenCalledWith("/api/cart/items/5");
    expect(api.delete).toHaveBeenCalledWith("/api/cart");
    expect(api.post).toHaveBeenCalledWith("/api/cart/merge");
  });
});
