const Brand = require("../models/brandModel");

exports.getAllBrands = async (req, res) => {
  try {
    const includeInactive = req.query.include_inactive === "true";
    const result = await Brand.getAllBrands(includeInactive);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBrandById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Brand.getBrandById(id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Brand not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBrandBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await Brand.getBrandBySlug(slug);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Brand not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createBrand = async (req, res) => {
  try {
    const result = await Brand.createBrand(req.body);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Brand with this name or slug already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Brand.updateBrand(id, req.body);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Brand not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Brand with this name or slug already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Brand.deleteBrand(id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Brand not found" });
    }
    res.json({ message: "Brand deleted successfully", brand: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

