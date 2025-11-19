const { query } = require("../db");

// Get or create cart for user
const getOrCreateUserCart = async (userId) => {
  // Try to find existing active cart
  const existingCart = await query(
    "SELECT * FROM carts WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1",
    [userId]
  );

  if (existingCart.rows.length > 0) {
    return existingCart.rows[0];
  }

  // Create new cart
  const newCart = await query(
    "INSERT INTO carts (user_id) VALUES ($1) RETURNING *",
    [userId]
  );
  return newCart.rows[0];
};

// Get or create cart for guest
const getOrCreateGuestCart = async (guestToken) => {
  if (!guestToken) {
    throw new Error("Guest token is required");
  }

  const existingCart = await query(
    "SELECT * FROM carts WHERE guest_token = $1 ORDER BY created_at DESC LIMIT 1",
    [guestToken]
  );

  if (existingCart.rows.length > 0) {
    return existingCart.rows[0];
  }

  const newCart = await query(
    "INSERT INTO carts (guest_token) VALUES ($1) RETURNING *",
    [guestToken]
  );
  return newCart.rows[0];
};

// Get cart with items
const getCartWithItems = async (cartId) => {
  const cartResult = await query("SELECT * FROM carts WHERE id = $1", [cartId]);
  if (cartResult.rows.length === 0) {
    return null;
  }

  const cart = cartResult.rows[0];

  const itemsResult = await query(
    `SELECT 
      ci.*,
      w.id as watch_id,
      w.brand,
      w.model,
      w.reference,
      w.slug,
      w.sale_price as current_price,
      w.stock_status,
      w.stock_quantity,
      w.is_active,
      b.name as brand_name,
      b.slug as brand_slug
    FROM cart_items ci
    JOIN watches w ON ci.watch_id = w.id
    LEFT JOIN brands b ON w.brand_id = b.id
    WHERE ci.cart_id = $1
    ORDER BY ci.created_at ASC`,
    [cartId]
  );

  cart.items = itemsResult.rows;

  // Calculate totals
  cart.subtotal = itemsResult.rows.reduce((sum, item) => {
    return sum + parseFloat(item.price_at_added || 0) * item.quantity;
  }, 0);

  cart.item_count = itemsResult.rows.reduce((sum, item) => sum + item.quantity, 0);

  return cart;
};

// Add item to cart
const addItemToCart = async (cartId, watchId, quantity = 1) => {
  // Get watch price
  const watchResult = await query(
    "SELECT sale_price, stock_status, stock_quantity, is_active FROM watches WHERE id = $1 AND deleted_at IS NULL",
    [watchId]
  );

  if (watchResult.rows.length === 0) {
    throw new Error("Watch not found");
  }

  const watch = watchResult.rows[0];
  if (!watch.is_active) {
    throw new Error("Watch is not available");
  }

  if (watch.stock_status !== "in_stock" || watch.stock_quantity < quantity) {
    throw new Error("Insufficient stock");
  }

  // Check if item already exists in cart
  const existingItem = await query(
    "SELECT * FROM cart_items WHERE cart_id = $1 AND watch_id = $2",
    [cartId, watchId]
  );

  if (existingItem.rows.length > 0) {
    // Update quantity
    const newQuantity = existingItem.rows[0].quantity + quantity;
    const result = await query(
      `UPDATE cart_items 
       SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [newQuantity, existingItem.rows[0].id]
    );
    return result.rows[0];
  } else {
    // Add new item
    const result = await query(
      `INSERT INTO cart_items (cart_id, watch_id, quantity, price_at_added)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [cartId, watchId, quantity, watch.sale_price]
    );
    return result.rows[0];
  }
};

// Update cart item quantity
const updateCartItemQuantity = async (cartId, cartItemId, quantity) => {
  if (!cartId) {
    throw new Error("Cart not found");
  }

  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    return await removeCartItem(cartId, cartItemId);
  }

  // Get cart item to check stock
  const itemResult = await query(
    `SELECT ci.*, w.stock_quantity, w.stock_status 
     FROM cart_items ci
     JOIN watches w ON ci.watch_id = w.id
     WHERE ci.id = $1 AND ci.cart_id = $2`,
    [cartItemId, cartId]
  );

  if (itemResult.rows.length === 0) {
    throw new Error("Cart item not found");
  }

  const item = itemResult.rows[0];
  if (item.stock_quantity < quantity) {
    throw new Error("Insufficient stock");
  }

  const result = await query(
    `UPDATE cart_items 
     SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 AND cart_id = $3
     RETURNING *`,
    [quantity, cartItemId, cartId]
  );
  return result.rows[0];
};

// Remove item from cart
const removeCartItem = async (cartId, cartItemId) => {
  if (!cartId) {
    throw new Error("Cart not found");
  }

  const result = await query(
    "DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING *",
    [cartItemId, cartId]
  );

  if (result.rows.length === 0) {
    throw new Error("Cart item not found");
  }

  return result.rows[0];
};

// Clear cart
const clearCart = async (cartId) => {
  await query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
  return { message: "Cart cleared" };
};

// Merge guest cart into user cart
const mergeGuestCartIntoUserCart = async (guestToken, userId) => {
  const guestCart = await query(
    "SELECT * FROM carts WHERE guest_token = $1",
    [guestToken]
  );

  if (guestCart.rows.length === 0) {
    return null;
  }

  const userCart = await getOrCreateUserCart(userId);

  // Move all items from guest cart to user cart
  await query(
    `UPDATE cart_items 
     SET cart_id = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE cart_id = $2`,
    [userCart.id, guestCart.rows[0].id]
  );

  // Delete guest cart
  await query("DELETE FROM carts WHERE id = $1", [guestCart.rows[0].id]);

  return await getCartWithItems(userCart.id);
};

module.exports = {
  getOrCreateUserCart,
  getOrCreateGuestCart,
  getCartWithItems,
  addItemToCart,
  updateCartItemQuantity,
  removeCartItem,
  clearCart,
  mergeGuestCartIntoUserCart,
};
