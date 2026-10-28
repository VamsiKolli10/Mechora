import api from "@/utils/api";

export const ordersApi = {
  createOrder(orderData, requestKey) {
    return requestKey
      ? api.post("/api/orders", orderData, { headers: { "Idempotency-Key": requestKey } })
      : api.post("/api/orders", orderData);
  },
};
