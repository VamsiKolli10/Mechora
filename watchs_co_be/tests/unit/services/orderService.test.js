jest.mock("../../../db", () => ({
  getClient: jest.fn(),
}));

jest.mock("../../../repositories/cartRepository", () => ({
  getOrCreateUserCart: jest.fn(),
  getOrCreateGuestCart: jest.fn(),
  getCartWithItems: jest.fn(),
  clearCart: jest.fn(),
}));

jest.mock("../../../repositories/orderRepository", () => ({
  createOrder: jest.fn(),
  addOrderItems: jest.fn(),
  getOrderById: jest.fn(),
}));

jest.mock("../../../services/productService", () => ({
  reserveInventory: jest.fn(),
}));

const { getClient } = require("../../../db");
const cartRepository = require("../../../repositories/cartRepository");
const orderRepository = require("../../../repositories/orderRepository");
const productService = require("../../../services/productService");
const orderService = require("../../../services/orderService");

describe("orderService", () => {
  let client;

  beforeEach(() => {
    jest.clearAllMocks();
    client = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
      release: jest.fn(),
    };
    getClient.mockResolvedValue(client);
  });

  test("calculates server-side checkout totals", () => {
    expect(orderService.calculateTotals(1000)).toEqual({
      subtotal: 1000,
      taxAmount: 80,
      shippingAmount: 50,
    });

    expect(orderService.calculateTotals(6000)).toEqual({
      subtotal: 6000,
      taxAmount: 480,
      shippingAmount: 0,
    });
  });

  test("creates an order from an authenticated cart inside a transaction", async () => {
    const shippingAddress = {
      name: "Test User",
      street: "1 Main St",
      city: "San Francisco",
      state: "CA",
      zip: "94105",
      country: "US",
    };
    const cart = {
      id: 10,
      subtotal: 2000,
      items: [{ watch_id: 5, quantity: 1, price_at_added: 2000 }],
    };
    const reservedItems = [
      {
        watch_id: 5,
        quantity: 1,
        unit_price: 2000,
        watch_snapshot: { brand: "Rolex", model: "Explorer" },
      },
    ];
    const createdOrder = { id: 99 };
    const fullOrder = { id: 99, total_amount: 2210 };

    cartRepository.getOrCreateUserCart.mockResolvedValue({ id: 10 });
    cartRepository.getCartWithItems.mockResolvedValue(cart);
    productService.reserveInventory.mockResolvedValue(reservedItems);
    orderRepository.createOrder.mockResolvedValue(createdOrder);
    orderRepository.getOrderById.mockResolvedValue(fullOrder);

    const result = await orderService.createOrderFromCart(
      { shipping_address: shippingAddress },
      { userId: 7 }
    );

    expect(result).toEqual(fullOrder);
    expect(client.query).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(orderRepository.createOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 7,
        subtotal: 2000,
        tax_amount: 160,
        shipping_amount: 50,
        shipping_address: shippingAddress,
      }),
      client
    );
    expect(orderRepository.addOrderItems).toHaveBeenCalledWith(
      99,
      reservedItems,
      client
    );
    expect(cartRepository.clearCart).toHaveBeenCalledWith(10, client);
    expect(client.query).toHaveBeenLastCalledWith("COMMIT");
    expect(client.release).toHaveBeenCalled();
  });

  test("rolls back and surfaces cart errors", async () => {
    cartRepository.getOrCreateGuestCart.mockResolvedValue({ id: 10 });
    cartRepository.getCartWithItems.mockResolvedValue({ id: 10, items: [] });

    await expect(
      orderService.createOrderFromCart(
        {
          guest_email: "guest@example.com",
          shipping_address: { name: "Guest" },
        },
        { guestToken: "guest-token" }
      )
    ).rejects.toMatchObject({
      message: "Cart is empty",
      status: 400,
    });

    expect(client.query).toHaveBeenCalledWith("ROLLBACK");
    expect(client.release).toHaveBeenCalled();
  });
});
