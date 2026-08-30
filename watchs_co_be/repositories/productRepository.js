const Watch = require("../models/watchesModel");

const reserveInventory = async (items, client) => {
  const orderItems = [];

  for (const item of items) {
    const stockResult = await client.query(
      `UPDATE watches
       SET stock_quantity = stock_quantity - $1,
           stock_status = CASE
             WHEN stock_quantity - $1 <= 0 THEN 'out_of_stock'
             ELSE stock_status
           END,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
         AND deleted_at IS NULL
         AND stock_status = 'in_stock'
         AND stock_quantity >= $1
       RETURNING brand, model, reference, slug, sale_price`,
      [item.quantity, item.watch_id]
    );

    if (stockResult.rows.length === 0) {
      const watchName = [item.brand_name || item.brand, item.model]
        .filter(Boolean)
        .join(" ")
        .trim();
      const error = new Error(
        `Insufficient stock for ${watchName || "selected watch"}`
      );
      error.status = 400;
      throw error;
    }

    const watchSnapshot = stockResult.rows[0];
    orderItems.push({
      watch_id: item.watch_id,
      quantity: item.quantity,
      unit_price: parseFloat(item.price_at_added),
      watch_snapshot: {
        brand: watchSnapshot.brand,
        model: watchSnapshot.model,
        reference: watchSnapshot.reference,
        slug: watchSnapshot.slug,
        price: watchSnapshot.sale_price,
      },
    });
  }

  return orderItems;
};

module.exports = {
  insertWatch: Watch.insertWatch,
  findAll: Watch.findAll,
  findById: Watch.findById,
  findBySlug: Watch.findBySlug,
  updateById: Watch.updateById,
  deleteById: Watch.deleteById,
  fullTextSearch: Watch.fullTextSearch,
  getFeaturedWatches: Watch.getFeaturedWatches,
  getSearchSuggestions: Watch.getSearchSuggestions,
  getRecommendedWatches: Watch.getRecommendedWatches,
  ensureSlugs: Watch.ensureSlugs,
  reserveInventory,
};
