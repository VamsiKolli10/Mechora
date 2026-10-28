const { query } = require("../db");

// Add to recently viewed
const addToRecentlyViewed = async (userId, guestToken, watchId) => {
  // Remove existing entry if it exists
  if (userId) {
    await query(
      "DELETE FROM recently_viewed WHERE user_id = $1 AND watch_id = $2",
      [userId, watchId]
    );
  } else if (guestToken) {
    await query(
      "DELETE FROM recently_viewed WHERE guest_token = $1 AND watch_id = $2",
      [guestToken, watchId]
    );
  }

  // Add new entry
  const result = await query(
    `INSERT INTO recently_viewed (user_id, guest_token, watch_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [userId || null, guestToken || null, watchId]
  );
  return result.rows[0];
};

// Get recently viewed for user
const getRecentlyViewed = async (userId, limit = 10) => {
  const result = await query(
    `SELECT recent.* FROM (SELECT DISTINCT ON (rv.watch_id)
      rv.*,
      w.id as watch_id,
      w.brand,
      w.model,
      w.reference,
      w.slug,
      w.sale_price,
      w.msrp,
      w.stock_status,
      w.is_active,
      w.short_description,
      b.name as brand_name,
      b.slug as brand_slug
    FROM recently_viewed rv
    JOIN watches w ON rv.watch_id = w.id
    LEFT JOIN brands b ON w.brand_id = b.id
    WHERE rv.user_id = $1 AND w.deleted_at IS NULL
    ORDER BY rv.watch_id, rv.viewed_at DESC, rv.id DESC
    ) recent ORDER BY recent.viewed_at DESC, recent.id DESC LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
};

// Get recently viewed for guest
const getGuestRecentlyViewed = async (guestToken, limit = 10) => {
  const result = await query(
    `SELECT recent.* FROM (SELECT DISTINCT ON (rv.watch_id)
      rv.*,
      w.id as watch_id,
      w.brand,
      w.model,
      w.reference,
      w.slug,
      w.sale_price,
      w.msrp,
      w.stock_status,
      w.is_active,
      w.short_description,
      b.name as brand_name,
      b.slug as brand_slug
    FROM recently_viewed rv
    JOIN watches w ON rv.watch_id = w.id
    LEFT JOIN brands b ON w.brand_id = b.id
    WHERE rv.guest_token = $1 AND w.deleted_at IS NULL
    ORDER BY rv.watch_id, rv.viewed_at DESC, rv.id DESC
    ) recent ORDER BY recent.viewed_at DESC, recent.id DESC LIMIT $2`,
    [guestToken, limit]
  );
  return result.rows;
};

// Clear recently viewed
const clearRecentlyViewed = async (userId, guestToken) => {
  if (userId) {
    await query("DELETE FROM recently_viewed WHERE user_id = $1", [userId]);
  } else if (guestToken) {
    await query("DELETE FROM recently_viewed WHERE guest_token = $1", [guestToken]);
  }
};

module.exports = {
  addToRecentlyViewed,
  getRecentlyViewed,
  getGuestRecentlyViewed,
  clearRecentlyViewed,
};

