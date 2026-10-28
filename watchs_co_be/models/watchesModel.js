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

const productAssetsJoin = `
  LEFT JOIN LATERAL (
    SELECT COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', a.id,
          'url', a.url,
          'type', a.type,
          'alt_text', a.alt_text,
          'sort_order', a.sort_order
        )
        ORDER BY a.sort_order ASC, a.created_at ASC
      ),
      '[]'::jsonb
    ) AS assets
    FROM assets a
    WHERE a.watch_id = w.id
  ) media ON true
`;

// CREATE watch
const insertWatch = async (data, client = null) => {
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
  const finalSalePrice = sale_price ?? price;

  const dbQuery = client ? client.query.bind(client) : query;
  return dbQuery(
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
    brand_name,
    brand_slug,
    collection_id,
    collection_name,
    collection_slug,
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

  const brandConditions = [];

  if (brand_id) {
    paramCount++;
    brandConditions.push(`w.brand_id = $${paramCount}`);
    params.push(brand_id);
  }

  if (brand_slug) {
    paramCount++;
    brandConditions.push(`LOWER(b.slug) = LOWER($${paramCount})`);
    params.push(brand_slug);
  }

  if (brand_name) {
    paramCount++;
    brandConditions.push(
      `(LOWER(b.name) = LOWER($${paramCount}) OR LOWER(w.brand) = LOWER($${paramCount}))`
    );
    params.push(brand_name);
  }

  if (brandConditions.length > 0) {
    conditions.push(`(${brandConditions.join(" OR ")})`);
  }

  const collectionConditions = [];

  if (collection_id) {
    paramCount++;
    collectionConditions.push(`w.collection_id = $${paramCount}`);
    params.push(collection_id);
  }

  if (collection_slug) {
    paramCount++;
    collectionConditions.push(`LOWER(c.slug) = LOWER($${paramCount})`);
    params.push(collection_slug);
  }

  if (collection_name) {
    paramCount++;
    collectionConditions.push(`LOWER(c.name) = LOWER($${paramCount})`);
    params.push(collection_name);
  }

  if (collectionConditions.length > 0) {
    conditions.push(`(${collectionConditions.join(" OR ")})`);
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
    conditions.push(`LOWER(w.stock_status) = LOWER($${paramCount})`);
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
      c.slug as collection_slug,
      media.assets
    FROM watches w
    LEFT JOIN brands b ON w.brand_id = b.id
    LEFT JOIN collections c ON w.collection_id = c.id
    ${productAssetsJoin}
    ${whereClause}
    ORDER BY w.${safeSortBy} ${safeSortOrder}
    LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
  `;

  params.push(limit, offset);

  // Get total count
  const countSql = `
    SELECT COUNT(*) as total
    FROM watches w
    LEFT JOIN brands b ON w.brand_id = b.id
    LEFT JOIN collections c ON w.collection_id = c.id
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
const fullTextSearch = async (searchTerm, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const offset = (page - 1) * limit;
  const searchable = `to_tsvector('english',
    COALESCE(w.brand, '') || ' ' || COALESCE(w.model, '') || ' ' ||
    COALESCE(w.reference, '') || ' ' || COALESCE(w.complication, '') || ' ' || COALESCE(w.description, ''))`;
  const where = `WHERE w.deleted_at IS NULL AND w.is_active = true AND (
    ${searchable} @@ plainto_tsquery('english', $1) OR w.brand ILIKE $2 OR w.model ILIKE $2 OR w.reference ILIKE $2)`;
  const params = [searchTerm, `%${searchTerm}%`];
  const [result, count] = await Promise.all([
    query(`SELECT w.*, b.name AS brand_name, b.slug AS brand_slug,
      c.name AS collection_name, c.slug AS collection_slug, media.assets,
      ts_rank(${searchable}, plainto_tsquery('english', $1)) AS rank
      FROM watches w LEFT JOIN brands b ON w.brand_id = b.id
      LEFT JOIN collections c ON w.collection_id = c.id ${productAssetsJoin}
      ${where} ORDER BY rank DESC, w.created_at DESC, w.id DESC LIMIT $3 OFFSET $4`, [...params, limit, offset]),
    query(`SELECT COUNT(*) AS total FROM watches w ${where}`, params),
  ]);
  return { ...result, total: Number(count.rows[0].total), totalPages: Math.ceil(Number(count.rows[0].total) / limit) };
};

// Get search suggestions/autocomplete
const getSearchSuggestions = (searchTerm, limit = 10) => {
  return query(
    `SELECT
      w.id,
      w.brand,
      w.model,
      w.reference,
      w.slug,
      b.name as brand_name,
      media.assets
    FROM watches w
    LEFT JOIN brands b ON w.brand_id = b.id
    ${productAssetsJoin}
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
      c.slug as collection_slug,
      media.assets
    FROM watches w
    LEFT JOIN brands b ON w.brand_id = b.id
    LEFT JOIN collections c ON w.collection_id = c.id
    ${productAssetsJoin}
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
      b.slug as brand_slug,
      media.assets
    FROM watches w
    LEFT JOIN brands b ON w.brand_id = b.id
    ${productAssetsJoin}
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
