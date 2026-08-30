import { vi } from "vitest";
import api from "@/utils/api";
import { ordersApi } from "../ordersApi";
import { paymentsApi } from "../paymentsApi";

vi.mock("@/utils/api", () => ({
  default: {
    post: vi.fn(),
  },
}));

describe("checkout API services", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates orders and payment intents through stable API wrappers", () => {
    const orderPayload = { shipping_address: { name: "Buyer" } };
    const paymentPayload = { order_id: 10, payment_method: "card" };

    ordersApi.createOrder(orderPayload);
    paymentsApi.createPaymentIntent(paymentPayload);

    expect(api.post).toHaveBeenCalledWith("/api/orders", orderPayload);
    expect(api.post).toHaveBeenCalledWith("/api/payments/intent", paymentPayload);
  });
});
