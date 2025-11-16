const { query } = require("../db");

// Get user's wishlist
const getUserWishlist = async (userId) => {
  const result = await query(
    `SELECT 
      w.*,
      watch.id as watch_id,
      watch.brand,
      watch.model,
      watch.reference,
      watch.slug,
      watch.sale_price,
      watch.msrp,
      watch.stock_status,
      watch.stock_quantity,
      watch.is_active,
      watch.short_description,
      b.name as brand_name,
      b.slug as brand_slug
    FROM wishlists w
    JOIN watches watch ON w.watch_id = watch.id
    LEFT JOIN brands b ON watch.brand_id = b.id
    WHERE w.user_id = $1 AND watch.deleted_at IS NULL
    ORDER BY w.created_at DESC`,
    [userId]
  );
  return result.rows;
};

// Add item to wishlist
const addToWishlist = async (userId, watchId) => {
  // Check if already in wishlist
  const existing = await query(
    "SELECT * FROM wishlists WHERE user_id = $1 AND watch_id = $2",
    [userId, watchId]
  );

  if (existing.rows.length > 0) {
    return existing.rows[0];
  }

  // Verify watch exists and is active
  const watchResult = await query(
    "SELECT id FROM watches WHERE id = $1 AND deleted_at IS NULL",
    [watchId]
  );

  if (watchResult.rows.length === 0) {
    throw new Error("Watch not found");
  }

  const result = await query(
    "INSERT INTO wishlists (user_id, watch_id) VALUES ($1, $2) RETURNING *",
    [userId, watchId]
  );
  return result.rows[0];
};

// Remove item from wishlist
const removeFromWishlist = async (userId, watchId) => {
  const result = await query(
    "DELETE FROM wishlists WHERE user_id = $1 AND watch_id = $2 RETURNING *",
    [userId, watchId]
  );
  return result.rows[0];
};

// Check if item is in wishlist
const isInWishlist = async (userId, watchId) => {
  const result = await query(
    "SELECT * FROM wishlists WHERE user_id = $1 AND watch_id = $2",
    [userId, watchId]
  );
  return result.rows.length > 0;
};

module.exports = {
  getUserWishlist,
  addToWishlist,
  removeFromWishlist,
  isInWishlist,
};

