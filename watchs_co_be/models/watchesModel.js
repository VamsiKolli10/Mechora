// models/watchModel.js
const { query } = require("../db");

// Helper function to generate slug from text
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const ensureSlugForWatch = async (watch) => {
  if (!watch || watch.slug) return;

  const baseParts = `${watch.brand || ""} ${watch.model || ""} ${
    watch.reference || ""
  }`.trim();
  const baseSlug = generateSlug(baseParts) || "watch";
  const uniqueSlug = `${baseSlug}-${watch.id}`;

  const result = await query(
    `UPDATE watches SET slug = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING slug`,
    [uniqueSlug, watch.id]
  );

  watch.slug = result.rows[0]?.slug || uniqueSlug;
};

const ensureSlugs = async (watches = []) => {
  const updates = watches
    .filter((watch) => watch && !watch.slug)
    .map((watch) => ensureSlugForWatch(watch));
  await Promise.all(updates);
};

const ensureAllSlugs = async () => {
  const batchSize = 500;
  let processed = 0;

  while (true) {
    const result = await query(
      `SELECT id, brand, model, reference, slug FROM watches 
       WHERE slug IS NULL OR slug = ''
       LIMIT $1`,
      [batchSize]
    );

    if (result.rows.length === 0) break;

    await ensureSlugs(result.rows);
    processed += result.rows.length;
  }

  return processed;
};

// CREATE watch
const insertWatch = async (data) => {
  const {
    brand_id,
    collection_id,
    brand, // Legacy support
    model,
    reference,
    sku,
    slug,
    complication,
    case_material,
    bracelet_material,
    dial,
    hour_markings,
    lunette_material,
    sale_price,
    price, // Legacy support
    msrp,
    stock_status = "in_stock",
    stock_quantity = 0,
    movement,
    condition = "new",
    case_size,
    water_resistance,
    power_reserve,
    description,
    short_description,
    is_active = true,
    is_featured = false,
  } = data;

  // Generate slug if not provided
  const watchSlug = slug || generateSlug(`${brand || ""} ${model || ""} ${reference || ""}`.trim());
  
  // Use sale_price or price (legacy)
  const finalSalePrice = sale_price || price;

  return query(
    `INSERT INTO watches (
      brand_id, collection_id, brand, model, reference, sku, slug,
      complication, case_material, bracelet_material, dial, hour_markings,
      lunette_material, sale_price, msrp, stock_status, stock_quantity,
      movement, condition, case_size, water_resistance, power_reserve,
      description, short_description, is_active, is_featured
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26)
    RETURNING *`,
    [
      brand_id, collection_id, brand, model, reference, sku, watchSlug,
      complication, case_material, bracelet_material, dial, hour_markings,
      lunette_material, finalSalePrice, msrp, stock_status, stock_quantity,
      movement, condition, case_size, water_resistance, power_reserve,
      description, short_description, is_active, is_featured,
    ]
  );
};

// GET all watches with pagination and filters
const findAll = async (options = {}) => {
  const {
    page = 1,
    limit = 20,
    brand_id,
    collection_id,
    min_price,
    max_price,
    stock_status,
    condition,
    is_active = true,
    is_featured,
    sort_by = "created_at",
    sort_order = "DESC",
    search,
  } = options;

  const offset = (page - 1) * limit;
  const conditions = ["w.deleted_at IS NULL"];
  const params = [];
  let paramCount = 0;

  if (is_active !== undefined) {
    paramCount++;
    conditions.push(`w.is_active = $${paramCount}`);
    params.push(is_active);
  }

  if (brand_id) {
    paramCount++;
    conditions.push(`w.brand_id = $${paramCount}`);
    params.push(brand_id);
  }

  if (collection_id) {
    paramCount++;
    conditions.push(`w.collection_id = $${paramCount}`);
    params.push(collection_id);
  }

  if (min_price !== undefined) {
    paramCount++;
    conditions.push(`w.sale_price >= $${paramCount}`);
    params.push(min_price);
  }

  if (max_price !== undefined) {
    paramCount++;
    conditions.push(`w.sale_price <= $${paramCount}`);
    params.push(max_price);
  }

  if (stock_status) {
    paramCount++;
    conditions.push(`w.stock_status = $${paramCount}`);
    params.push(stock_status);
  }

  if (condition) {
    paramCount++;
    conditions.push(`w.condition = $${paramCount}`);
    params.push(condition);
  }

  if (is_featured !== undefined) {
    paramCount++;
    conditions.push(`w.is_featured = $${paramCount}`);
    params.push(is_featured);
  }

  if (search) {
    paramCount++;
    conditions.push(`(
      to_tsvector('english', 
        COALESCE(w.brand, '') || ' ' || 
        COALESCE(w.model, '') || ' ' || 
        COALESCE(w.reference, '') || ' ' || 
        COALESCE(w.complication, '') || ' ' || 
        COALESCE(w.description, '')
      ) @@ plainto_tsquery('english', $${paramCount})
      OR w.brand ILIKE $${paramCount + 1}
      OR w.model ILIKE $${paramCount + 1}
      OR w.reference ILIKE $${paramCount + 1}
    )`);
    params.push(search, `%${search}%`);
    paramCount++;
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Validate sort_by to prevent SQL injection
  const allowedSortFields = [
    "created_at", "updated_at", "sale_price", "msrp", "model", "brand",
    "stock_quantity", "is_featured", "case_size"
  ];
  const safeSortBy = allowedSortFields.includes(sort_by) ? sort_by : "created_at";
  const safeSortOrder = sort_order.toUpperCase() === "ASC" ? "ASC" : "DESC";

  const sql = `
    SELECT 
      w.*,
      b.name as brand_name,
      b.slug as brand_slug,
      c.name as collection_name,
      c.slug as collection_slug
    FROM watches w
    LEFT JOIN brands b ON w.brand_id = b.id
    LEFT JOIN collections c ON w.collection_id = c.id
    ${whereClause}
    ORDER BY w.${safeSortBy} ${safeSortOrder}
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `;

  params.push(limit, offset);

  // Get total count
  const countSql = `
    SELECT COUNT(*) as total
    FROM watches w
    ${whereClause}
  `;
  const countParams = params.slice(0, -2); // Remove limit and offset

  const [results, countResult] = await Promise.all([
    query(sql, params),
    query(countSql, countParams),
  ]);

  return {
    watches: results.rows,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(countResult.rows[0].total),
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    },
  };
};

// GET watch by ID
const findById = (id) => {
  return query(
    `SELECT 
      w.*,
      b.name as brand_name,
      b.slug as brand_slug,
      b.description as brand_description,
      c.name as collection_name,
      c.slug as collection_slug
    FROM watches w
    LEFT JOIN brands b ON w.brand_id = b.id
    LEFT JOIN collections c ON w.collection_id = c.id
    WHERE w.id = $1 AND w.deleted_at IS NULL`,
    [id]
  );
};

// GET watch by slug
const findBySlug = (slug) => {
  return query(
    `SELECT 
      w.*,
      b.name as brand_name,
      b.slug as brand_slug,
      b.description as brand_description,
      c.name as collection_name,
      c.slug as collection_slug
    FROM watches w
    LEFT JOIN brands b ON w.brand_id = b.id
    LEFT JOIN collections c ON w.collection_id = c.id
    WHERE w.slug = $1 AND w.deleted_at IS NULL`,
    [slug]
  );
};

// UPDATE watch
const updateById = (id, updates) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setString = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const queryText = `UPDATE watches SET ${setString}, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = $${fields.length + 1} AND deleted_at IS NULL 
                     RETURNING *`;
  return query(queryText, [...values, id]);
};

// DELETE watch (soft delete)
const deleteById = (id) => {
  return query(
    "UPDATE watches SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
    [id]
  );
};

// Full-text search
const fullTextSearch = (searchTerm, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;

  return query(
    `SELECT 
      w.*,
      b.name as brand_name,
      b.slug as brand_slug,
      c.name as collection_name,
      c.slug as collection_slug,
      ts_rank(
        to_tsvector('english', 
          COALESCE(w.brand, '') || ' ' || 
          COALESCE(w.model, '') || ' ' || 
          COALESCE(w.reference, '') || ' ' || 
          COALESCE(w.complication, '') || ' ' || 
          COALESCE(w.description, '')
        ),
        plainto_tsquery('english', $1)
      ) as rank
    FROM watches w
    LEFT JOIN brands b ON w.brand_id = b.id
    LEFT JOIN collections c ON w.collection_id = c.id
    WHERE w.deleted_at IS NULL
      AND w.is_active = true
      AND (
        to_tsvector('english', 
          COALESCE(w.brand, '') || ' ' || 
          COALESCE(w.model, '') || ' ' || 
          COALESCE(w.reference, '') || ' ' || 
          COALESCE(w.complication, '') || ' ' || 
          COALESCE(w.description, '')
        ) @@ plainto_tsquery('english', $1)
        OR w.brand ILIKE $2
        OR w.model ILIKE $2
        OR w.reference ILIKE $2
      )
    ORDER BY rank DESC, w.created_at DESC
    LIMIT $3 OFFSET $4`,
    [searchTerm, `%${searchTerm}%`, limit, offset]
  );
};

// Get search suggestions/autocomplete
const getSearchSuggestions = (searchTerm, limit = 10) => {
  return query(
    `SELECT DISTINCT
      w.id,
      w.brand,
      w.model,
      w.reference,
      w.slug,
      b.name as brand_name
    FROM watches w
    LEFT JOIN brands b ON w.brand_id = b.id
    WHERE w.deleted_at IS NULL
      AND w.is_active = true
      AND (
        w.brand ILIKE $1
        OR w.model ILIKE $1
        OR w.reference ILIKE $1
      )
    ORDER BY 
      CASE 
        WHEN w.brand ILIKE $2 THEN 1
        WHEN w.model ILIKE $2 THEN 2
        ELSE 3
      END
    LIMIT $3`,
    [`%${searchTerm}%`, `${searchTerm}%`, limit]
  );
};

// Get featured watches
const getFeaturedWatches = (limit = 10) => {
  return query(
    `SELECT 
      w.*,
      b.name as brand_name,
      b.slug as brand_slug,
      c.name as collection_name,
      c.slug as collection_slug
    FROM watches w
    LEFT JOIN brands b ON w.brand_id = b.id
    LEFT JOIN collections c ON w.collection_id = c.id
    WHERE w.deleted_at IS NULL
      AND w.is_active = true
      AND w.is_featured = true
    ORDER BY w.updated_at DESC
    LIMIT $1`,
    [limit]
  );
};

// Get recommended watches (exclude current watch)
const getRecommendedWatches = (watchId, limit = 6) => {
  return query(
    `SELECT 
      w.*,
      b.name as brand_name,
      b.slug as brand_slug
    FROM watches w
    LEFT JOIN brands b ON w.brand_id = b.id
    WHERE w.deleted_at IS NULL
      AND w.is_active = true
      AND w.id != $1
      AND w.stock_status = 'in_stock'
    ORDER BY RANDOM()
    LIMIT $2`,
    [watchId, limit]
  );
};

module.exports = {
  insertWatch,
  findAll,
  findById,
  findBySlug,
  updateById,
  deleteById,
  fullTextSearch,
  getSearchSuggestions,
  getFeaturedWatches,
  getRecommendedWatches,
  ensureSlugs,
  ensureAllSlugs,
  // Legacy exports for backward compatibility
  search: fullTextSearch,
};
