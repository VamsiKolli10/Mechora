const Collection = require("../models/collectionModel");

exports.getAllCollections = async (req, res) => {
  try {
    const includeInactive = req.query.include_inactive === "true";
    const result = await Collection.getAllCollections(includeInactive);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Collection.getCollectionById(id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Collection not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCollectionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await Collection.getCollectionBySlug(slug);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Collection not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createCollection = async (req, res) => {
  try {
    const result = await Collection.createCollection(req.body);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Collection with this slug already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.updateCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Collection.updateCollection(id, req.body);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Collection not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Collection with this slug already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Collection.deleteCollection(id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Collection not found" });
    }
    res.json({ message: "Collection deleted successfully", collection: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

