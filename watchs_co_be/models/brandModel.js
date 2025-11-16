const { query } = require("../db");

// GET all brands
const getAllBrands = (includeInactive = false) => {
  const sql = includeInactive
    ? "SELECT * FROM brands WHERE deleted_at IS NULL ORDER BY name ASC"
    : "SELECT * FROM brands WHERE is_active = true AND deleted_at IS NULL ORDER BY name ASC";
  return query(sql);
};

// GET brand by ID
const getBrandById = (id) => {
  return query("SELECT * FROM brands WHERE id = $1 AND deleted_at IS NULL", [id]);
};

// GET brand by slug
const getBrandBySlug = (slug) => {
  return query("SELECT * FROM brands WHERE slug = $1 AND deleted_at IS NULL", [slug]);
};

// CREATE brand
const createBrand = ({ name, slug, description, logo_url, website_url, is_active = true }) => {
  return query(
    `INSERT INTO brands (name, slug, description, logo_url, website_url, is_active)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [name, slug, description, logo_url, website_url, is_active]
  );
};

// UPDATE brand
const updateBrand = (id, updates) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setString = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const queryText = `UPDATE brands SET ${setString}, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = $${fields.length + 1} AND deleted_at IS NULL 
                     RETURNING *`;
  return query(queryText, [...values, id]);
};

// DELETE brand (soft delete)
const deleteBrand = (id) => {
  return query(
    "UPDATE brands SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *",
    [id]
  );
};

module.exports = {
  getAllBrands,
  getBrandById,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
};

