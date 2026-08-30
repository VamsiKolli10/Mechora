const paymentService = require("../../../services/paymentService");

describe("paymentService", () => {
  test("converts dollar amounts to cents", () => {
    expect(paymentService.toCents(12.34)).toBe(1234);
    expect(paymentService.toCents("12.345")).toBe(1235);
    expect(paymentService.toCents(null)).toBe(0);
    expect(paymentService.toCents("not-a-number")).toBe(0);
  });

  test("maps Stripe intent statuses to local payment statuses", () => {
    expect(paymentService.mapStripeStatus("succeeded")).toBe("succeeded");
    expect(paymentService.mapStripeStatus("processing")).toBe("processing");
    expect(paymentService.mapStripeStatus("requires_capture")).toBe("processing");
    expect(paymentService.mapStripeStatus("canceled")).toBe("failed");
    expect(paymentService.mapStripeStatus("requires_payment_method")).toBe("pending");
  });

  test("rejects guest payment access when the email does not match", () => {
    expect(() =>
      paymentService.assertOrderAccess(
        { user_id: null, guest_email: "buyer@example.com" },
        null,
        "other@example.com"
      )
    ).toThrow("Order not found");
  });
});
