import api from "@/utils/api";

export const cartApi = {
  getCart() {
    return api.get("/api/cart");
  },
  addItem({ watch_id, quantity = 1 }) {
    return api.post("/api/cart/items", { watch_id, quantity });
  },
  updateItem({ itemId, quantity }) {
    return api.put(`/api/cart/items/${itemId}`, { quantity });
  },
  removeItem(itemId) {
    return api.delete(`/api/cart/items/${itemId}`);
  },
  clearCart() {
    return api.delete("/api/cart");
  },
  mergeCart() {
    return api.post("/api/cart/merge");
  },
};
