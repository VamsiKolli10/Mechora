// models/watchModel.js
const pool = require("../db");

exports.insertWatch = (data) => {
  const {
    brand,
    model,
    reference,
    complication,
    case_material,
    bracelet_material,
    dial,
    hour_markings,
    lunette_material,
    price,
  } = data;

  return pool.query(
    `INSERT INTO watches
     (brand, model, reference, complication, case_material, bracelet_material, dial, hour_markings, lunette_material, price)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
     RETURNING *`,
    [
      brand,
      model,
      reference,
      complication,
      case_material,
      bracelet_material,
      dial,
      hour_markings,
      lunette_material,
      price,
    ]
  );
};

exports.findAll = () => {
  return pool.query("SELECT * FROM watches ORDER BY id DESC");
};

exports.findById = (id) => {
  return pool.query("SELECT * FROM watches WHERE id = $1", [id]);
};

exports.updateById = (id, updates) => {
  const fields = Object.keys(updates);
  const values = Object.values(updates);
  const setString = fields.map((f, i) => `${f} = $${i + 1}`).join(", ");
  const query = `UPDATE watches SET ${setString} WHERE id = $${
    fields.length + 1
  } RETURNING *`;
  return pool.query(query, [...values, id]);
};

exports.deleteById = (id) => {
  return pool.query("DELETE FROM watches WHERE id = $1 RETURNING *", [id]);
};

exports.search = (searchTerm) => {
  return pool.query(
    `SELECT * FROM watches WHERE
     brand ILIKE $1 OR
     model ILIKE $1 OR
     reference ILIKE $1 OR
     complication ILIKE $1`,
    [`%${searchTerm}%`]
  );
};
