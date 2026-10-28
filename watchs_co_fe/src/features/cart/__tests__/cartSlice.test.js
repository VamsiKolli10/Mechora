import { configureStore } from "@reduxjs/toolkit";
import { vi } from "vitest";
import cartReducer, { addToCart, clearCartState, fetchCart, mergeCart } from "../cartSlice";
import authReducer, { loginUser } from "@/features/auth/authSlice";
import { cartApi } from "@/services/cartApi";
vi.mock("@/services/cartApi", () => ({ cartApi: { addItem: vi.fn(), getCart: vi.fn(), mergeCart: vi.fn() } }));
vi.mock("@/services/authApi", () => ({ authApi: {} }));
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
const makeStore = () => configureStore({ reducer: { auth: authReducer, cart: cartReducer } });
const bag = count => ({ data: { id: 1, items: [{ id: 10, watch_id: 3, quantity: count }], item_count: count, subtotal: count * 100 } });
beforeEach(() => vi.resetAllMocks());

describe("cart request ordering and ownership", () => {
  it("clears the bag and ignores an older response after checkout", async () => {
    const pending = deferred();
    cartApi.getCart.mockReturnValue(pending.promise);
    const store = makeStore();
    const fetch = store.dispatch(fetchCart());
    await vi.waitFor(() => expect(cartApi.getCart).toHaveBeenCalledOnce());
    store.dispatch(clearCartState());
    pending.resolve(bag(1));
    await fetch;
    expect(store.getState().cart.items).toEqual([]);
  });
  it("serializes mutations so responses cannot restore an older bag snapshot", async () => {
    const first = deferred();
    cartApi.addItem.mockReturnValueOnce(first.promise).mockResolvedValueOnce(bag(2));
    const store = makeStore();
    const one = store.dispatch(addToCart({ watch_id: 3 }));
    const two = store.dispatch(addToCart({ watch_id: 3 }));
    await vi.waitFor(() => expect(cartApi.addItem).toHaveBeenCalledTimes(1));
    first.resolve(bag(1));
    await Promise.all([one, two]);
    expect(cartApi.addItem).toHaveBeenCalledTimes(2);
    expect(store.getState().cart.itemCount).toBe(2);
    expect(store.getState().cart.loading).toBe(false);
  });
  it("discards old-owner responses and never sends queued mutations for a replacement session", async () => {
    const first = deferred();
    cartApi.addItem.mockReturnValue(first.promise);
    const store = makeStore();
    const one = store.dispatch(addToCart({ watch_id: 3 }));
    const queued = store.dispatch(addToCart({ watch_id: 4 }));
    await vi.waitFor(() => expect(cartApi.addItem).toHaveBeenCalledTimes(1));
    store.dispatch(loginUser.pending("login"));
    store.dispatch(loginUser.fulfilled({ user: { id: 2 } }, "login"));
    store.dispatch(clearCartState({ ownerKey: "2:1" }));
    first.resolve(bag(1));
    await Promise.all([one, queued]);
    expect(cartApi.addItem).toHaveBeenCalledTimes(1);
    expect(store.getState().cart.items).toEqual([]);
  });
  it("retains merge failures while loading the account bag for recovery", async () => {
    cartApi.mergeCart.mockRejectedValue(new Error("Combined quantity exceeds stock"));
    cartApi.getCart.mockResolvedValue(bag(1));
    const store = makeStore();
    await store.dispatch(mergeCart());
    await store.dispatch(fetchCart());
    expect(store.getState().cart).toMatchObject({ itemCount: 1, mergeError: "Combined quantity exceeds stock" });
  });
});
