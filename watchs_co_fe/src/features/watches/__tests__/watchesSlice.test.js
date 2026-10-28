import { configureStore } from "@reduxjs/toolkit";
import { vi } from "vitest";
import reducer, { fetchWatches, fetchWatchBySlug, fetchWatchById, clearCurrentWatch } from "../watchesSlice";
import { productsApi } from "@/services/productsApi";
vi.mock("@/services/productsApi", () => ({ productsApi: { getProducts: vi.fn(), getProductBySlug: vi.fn(), getProductById: vi.fn() } }));
const deferred = () => { let resolve; const promise = new Promise(done => { resolve = done; }); return { promise, resolve }; };
beforeEach(() => vi.resetAllMocks());

it("keeps the newest filter results when an older request finishes last", async () => {
  const old = deferred();
  productsApi.getProducts.mockReturnValueOnce(old.promise).mockResolvedValueOnce({ data: { products: [{ id: 2 }] } });
  const store = configureStore({ reducer });
  const first = store.dispatch(fetchWatches({ brand_id: 1 }));
  await store.dispatch(fetchWatches({ brand_id: 2 }));
  old.resolve({ data: { products: [{ id: 1 }] } });
  await first;
  expect(store.getState().watches).toEqual([{ id: 2 }]);
});
it("ignores a previous watch after navigating to a new detail route", async () => {
  const old = deferred();
  productsApi.getProductBySlug.mockReturnValue(old.promise);
  productsApi.getProductById.mockResolvedValue({ data: { id: 2 } });
  const store = configureStore({ reducer });
  const first = store.dispatch(fetchWatchBySlug("first-watch"));
  store.dispatch(clearCurrentWatch());
  await store.dispatch(fetchWatchById(2));
  old.resolve({ data: { id: 1 } });
  await first;
  expect(store.getState().currentWatch.id).toBe(2);
  expect(store.getState().detailLoading).toBe(false);
});
it("clears a previous detail error when loading a numeric watch route", async () => {
  productsApi.getProductBySlug.mockRejectedValue(new Error("Not found"));
  productsApi.getProductById.mockResolvedValue({ data: { id: 2 } });
  const store = configureStore({ reducer });
  await store.dispatch(fetchWatchBySlug("missing"));
  await store.dispatch(fetchWatchById(2));
  expect(store.getState().detailError).toBeNull();
  expect(store.getState().currentWatch.id).toBe(2);
});
