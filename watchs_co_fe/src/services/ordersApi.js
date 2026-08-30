import api from "@/utils/api";

export const ordersApi = {
  createOrder(orderData) {
    return api.post("/api/orders", orderData);
  },
};
