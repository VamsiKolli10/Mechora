const { query } = require("../db");

// GET all assets for a watch
const getAssetsByWatchId = (watchId) => {
  return query(
    "SELECT * FROM assets WHERE watch_id = $1 ORDER BY sort_order ASC, created_at ASC",
    [watchId]
  );
};

// GET asset by ID
const getAssetById = (id) => {
  return query("SELECT * FROM assets WHERE id = $1", [id]);
};

// CREATE asset
const createAsset = ({
  watch_id,
  url,
  type,
  alt_text,
  sort_order = 0,
  width,
  height,
  file_size,
  mime_type,
}) => {
  return query(
    `INSERT INTO assets (watch_id, url, type, alt_text, sort_order, width, height, file_size, mime_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [watch_id, url, type, alt_text, sort_order, width, height, file_size, mime_type]
  );
};

// UPDATE asset
const updateAsset = (id, updates) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setString = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const queryText = `UPDATE assets SET ${setString}, updated_at = CURRENT_TIMESTAMP 
                     WHERE id = $${fields.length + 1} 
                     RETURNING *`;
  return query(queryText, [...values, id]);
};

// DELETE asset
const deleteAsset = (id) => {
  return query("DELETE FROM assets WHERE id = $1 RETURNING *", [id]);
};

// DELETE all assets for a watch
const deleteAssetsByWatchId = (watchId) => {
  return query("DELETE FROM assets WHERE watch_id = $1 RETURNING *", [watchId]);
};

module.exports = {
  getAssetsByWatchId,
  getAssetById,
  createAsset,
  updateAsset,
  deleteAsset,
  deleteAssetsByWatchId,
};

