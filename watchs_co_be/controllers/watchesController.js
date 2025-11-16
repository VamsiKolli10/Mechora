const Watch = require("../models/watchesModel");
const Asset = require("../models/assetModel");

exports.createWatch = async (req, res) => {
  try {
    const result = await Watch.insertWatch(req.body);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Watch with this SKU or slug already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.getAllWatches = async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      brand_id: req.query.brand_id ? parseInt(req.query.brand_id) : undefined,
      collection_id: req.query.collection_id ? parseInt(req.query.collection_id) : undefined,
      min_price: req.query.min_price ? parseFloat(req.query.min_price) : undefined,
      max_price: req.query.max_price ? parseFloat(req.query.max_price) : undefined,
      stock_status: req.query.stock_status,
      condition: req.query.condition,
      is_active: req.query.is_active !== undefined ? req.query.is_active === "true" : true,
      is_featured: req.query.is_featured !== undefined ? req.query.is_featured === "true" : undefined,
      sort_by: req.query.sort_by || "created_at",
      sort_order: req.query.sort_order || "DESC",
      search: req.query.search,
    };

    const result = await Watch.findAll(options);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Watch.findById(id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Watch not found" });
    }

    // Get assets for this watch
    const assetsResult = await Asset.getAssetsByWatchId(id);
    const watch = {
      ...result.rows[0],
      assets: assetsResult.rows,
    };

    res.json(watch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWatchBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await Watch.findBySlug(slug);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Watch not found" });
    }

    const watch = result.rows[0];

    // Get assets for this watch
    const assetsResult = await Asset.getAssetsByWatchId(watch.id);
    watch.assets = assetsResult.rows;

    // Get recommended watches
    const recommendedResult = await Watch.getRecommendedWatches(watch.id, 6);
    watch.recommended = recommendedResult.rows;

    res.json(watch);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateWatch = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Watch.updateById(id, req.body);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Watch not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Watch with this SKU or slug already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.deleteWatch = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Watch.deleteById(id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Watch not found" });
    }
    res.json({ message: "Watch deleted successfully", watch: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchWatches = async (req, res) => {
  try {
    const { query: searchTerm } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await Watch.fullTextSearch(searchTerm, { page, limit });
    res.json({
      watches: result.rows,
      pagination: {
        page,
        limit,
        total: result.rows.length,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeaturedWatches = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await Watch.getFeaturedWatches(limit);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
