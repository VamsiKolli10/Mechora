import api from "@/utils/api";

export const paymentsApi = {
  createPaymentIntent(paymentData) {
    return api.post("/api/payments/intent", paymentData);
  },
};
