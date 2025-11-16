const { query } = require("../db");

// GET all collections
const getAllCollections = (includeInactive = false) => {
  const sql = includeInactive
    ? "SELECT * FROM collections WHERE deleted_at IS NULL ORDER BY sort_order ASC, name ASC"
    : "SELECT * FROM collections WHERE is_active = true AND deleted_at IS NULL ORDER BY sort_order ASC, name ASC";
  return query(sql);
};

// GET collection by ID
const getCollectionById = (id) => {
  return query("SELECT * FROM collections WHERE id = $1 AND deleted_at IS NULL", [id]);
};

// GET collection by slug
const getCollectionBySlug = (slug) => {
  return query("SELECT * FROM collections WHERE slug = $1 AND deleted_at IS NULL", [slug]);
};

// CREATE collection
const createCollection = ({
  name,
  slug,
  description,
  hero_image_url,
  seo_title,
  seo_description,
  is_active = true,
  sort_order = 0,
}) => {
  return query(
    `INSERT INTO collections (name, slug, description, hero_image_url, seo_title, seo_description, is_active, sort_order)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [name, slug, description, hero_image_url, seo_title, seo_description, is_active, sort_order]
  );
};

// UPDATE collection
const updateCollection = (id, updates) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setString = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const queryText = `UPDATE collections SET ${setString}, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = $${fields.length + 1} AND deleted_at IS NULL 
                     RETURNING *`;
  return query(queryText, [...values, id]);
};

// DELETE collection (soft delete)
const deleteCollection = (id) => {
  return query(
    "UPDATE collections SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
    [id]
  );
};

module.exports = {
  getAllCollections,
  getCollectionById,
  getCollectionBySlug,
  createCollection,
  updateCollection,
  deleteCollection,
};

