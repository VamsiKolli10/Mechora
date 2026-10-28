const { query } = require("../db");
const { withTransaction } = require("../utils/transaction");

const resolveQuery = (client) =>
  client ? client.query.bind(client) : query;

const createCartError = (message, status = 400) => Object.assign(new Error(message), { status });
const getOrCreateCart = (field, owner, client = null) => withTransaction(async (tx) => {
  if (!owner) throw createCartError("Cart owner is required");
  // Serialize first creation without relying on indexes absent from legacy databases.
  await tx.query("SELECT pg_advisory_xact_lock(hashtextextended($1, 0))", [`cart:${field}:${owner}`]);
  const existing = await tx.query(
    `SELECT * FROM carts WHERE ${field} = $1 ORDER BY created_at DESC LIMIT 1 FOR UPDATE`, [owner]
  );
  if (existing.rows.length) return existing.rows[0];
  const inserted = await tx.query(`INSERT INTO carts (${field}) VALUES ($1) RETURNING *`, [owner]);
  return inserted.rows[0];
}, client);

const getOrCreateUserCart = (userId, client = null) => getOrCreateCart("user_id", userId, client);
const getOrCreateGuestCart = (guestToken, client = null) => getOrCreateCart("guest_token", guestToken, client);

// Get cart with items
const getCartWithItems = async (cartId, client = null) => {
  const dbQuery = resolveQuery(client);
  const cartResult = await dbQuery(
    `SELECT * FROM carts WHERE id = $1${client ? " FOR UPDATE" : ""}`,
    [cartId]
  );
  if (cartResult.rows.length === 0) {
    return null;
  }

  const cart = cartResult.rows[0];

  const itemsResult = await dbQuery(
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
      b.slug as brand_slug,
      media.primary_image_url,
      media.primary_image_alt
    FROM cart_items ci
    JOIN watches w ON ci.watch_id = w.id
    LEFT JOIN brands b ON w.brand_id = b.id
    LEFT JOIN LATERAL (
      SELECT
        a.url AS primary_image_url,
        a.alt_text AS primary_image_alt
      FROM assets a
      WHERE a.watch_id = w.id
        AND a.type IN ('image', 'thumbnail')
      ORDER BY a.sort_order ASC, a.created_at ASC
      LIMIT 1
    ) media ON true
    WHERE ci.cart_id = $1
    ORDER BY ci.created_at ASC`,
    [cartId]
  );

  cart.items = itemsResult.rows;

  // Calculate totals
  cart.subtotal = itemsResult.rows.reduce((sum, item) => {
    return sum + Math.round(Number(item.current_price ?? item.price_at_added ?? 0) * 100) * item.quantity;
  }, 0) / 100;

  cart.item_count = itemsResult.rows.reduce((sum, item) => sum + item.quantity, 0);

  return cart;
};

// Add item to cart
const addItemToCart = async (cartId, watchId, quantity = 1, client = null) => {
  const dbQuery = resolveQuery(client);
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) throw createCartError("Invalid quantity");
  // Get watch price
  const watchResult = await dbQuery(
    "SELECT sale_price, stock_status, stock_quantity, is_active FROM watches WHERE id = $1 AND deleted_at IS NULL",
    [watchId]
  );

  if (watchResult.rows.length === 0) {
    throw createCartError("Watch not found");
  }

  const watch = watchResult.rows[0];
  if (!watch.is_active) {
    throw createCartError("Watch is not available");
  }

  if (!["in_stock", "low_stock"].includes(watch.stock_status) || watch.stock_quantity < quantity) {
    throw createCartError("Insufficient stock");
  }

  // Check if item already exists in cart
  const existingItem = await dbQuery(
    "SELECT * FROM cart_items WHERE cart_id = $1 AND watch_id = $2",
    [cartId, watchId]
  );

  if (existingItem.rows.length > 0) {
    // Update quantity
    const newQuantity = existingItem.rows[0].quantity + quantity;
    if (newQuantity > watch.stock_quantity || newQuantity > 10) {
      throw createCartError("Insufficient stock");
    }
    const result = await dbQuery(
      `UPDATE cart_items 
       SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
      [newQuantity, existingItem.rows[0].id]
    );
    return result.rows[0];
  } else {
    // Add new item
    const result = await dbQuery(
      `INSERT INTO cart_items (cart_id, watch_id, quantity, price_at_added)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [cartId, watchId, quantity, watch.sale_price]
    );
    return result.rows[0];
  }
};

// Update cart item quantity
const updateCartItemQuantity = async (cartId, cartItemId, quantity, client = null) => {
  const dbQuery = resolveQuery(client);
  if (!cartId) {
    throw createCartError("Cart not found");
  }

  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    return await removeCartItem(cartId, cartItemId, client);
  }

  if (!Number.isInteger(quantity) || quantity > 10) throw createCartError("Invalid quantity");
  // Get cart item to check stock
  const itemResult = await dbQuery(
    `SELECT ci.*, w.stock_quantity, w.stock_status, w.is_active, w.deleted_at
     FROM cart_items ci
     JOIN watches w ON ci.watch_id = w.id
     WHERE ci.id = $1 AND ci.cart_id = $2`,
    [cartItemId, cartId]
  );

  if (itemResult.rows.length === 0) {
    throw createCartError("Cart item not found");
  }

  const item = itemResult.rows[0];
  if (!item.is_active || item.deleted_at || !["in_stock", "low_stock"].includes(item.stock_status) || item.stock_quantity < quantity) {
    throw createCartError("Insufficient stock");
  }

  const result = await dbQuery(
    `UPDATE cart_items 
     SET quantity = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 AND cart_id = $3
     RETURNING *`,
    [quantity, cartItemId, cartId]
  );
  return result.rows[0];
};

// Remove item from cart
const removeCartItem = async (cartId, cartItemId, client = null) => {
  const dbQuery = resolveQuery(client);
  if (!cartId) {
    throw createCartError("Cart not found");
  }

  const result = await dbQuery(
    "DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING *",
    [cartItemId, cartId]
  );

  if (result.rows.length === 0) {
    throw createCartError("Cart item not found");
  }

  return result.rows[0];
};

// Clear cart
const clearCart = async (cartId, client = null) => {
  const dbQuery = resolveQuery(client);
  await dbQuery("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);
  return { message: "Cart cleared" };
};

// Merge guest cart into user cart
const mergeGuestCartIntoUserCart = (guestToken, userId) => withTransaction(async (client) => {
  const userCart = await getOrCreateUserCart(userId, client);
  const user = await getCartWithItems(userCart.id, client);
  if (!guestToken) return user;
  const { rows } = await client.query("SELECT * FROM carts WHERE guest_token = $1 FOR UPDATE", [guestToken]);
  if (!rows.length) return user;
  const guest = await getCartWithItems(rows[0].id, client);
  const existing = new Map(user.items.map(item => [item.watch_id, item]));
  for (const item of guest.items) {
    const target = existing.get(item.watch_id);
    if (target) {
      const quantity = target.quantity + item.quantity;
      if (quantity > 10 || quantity > item.stock_quantity) {
        throw createCartError("Your bags exceed availability for a selected watch. Adjust the quantity in your account bag, then retry merging.", 409);
      }
      await client.query("UPDATE cart_items SET quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [quantity, target.id]);
    } else {
      await client.query("UPDATE cart_items SET cart_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2", [user.id, item.id]);
    }
  }
  await client.query("DELETE FROM carts WHERE id = $1", [guest.id]);
  return getCartWithItems(user.id, client);
});

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
