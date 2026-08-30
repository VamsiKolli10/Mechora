const Asset = require("../models/assetModel");
const productService = require("../services/productService");

exports.createProduct = async (req, res) => {
  try {
    const result = await productService.createProduct(req.body);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Product with this SKU or slug already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 20,
      brand_id: req.query.brand_id ? parseInt(req.query.brand_id) : undefined,
      brand_name: req.query.brand_name,
      brand_slug: req.query.brand_slug,
      collection_id: req.query.collection_id ? parseInt(req.query.collection_id) : undefined,
      collection_name: req.query.collection_name,
      collection_slug: req.query.collection_slug,
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

    const result = await productService.getAllProducts(options);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await productService.getProductById(id, Asset);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const product = await productService.getProductBySlug(slug, Asset);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productService.updateProduct(id, req.body);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Product with this SKU or slug already exists" });
    }
    res.status(500).json({ error: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productService.deleteProduct(id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully", product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const { query: searchTerm } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await productService.searchProducts(searchTerm, { page, limit });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const result = await productService.getFeaturedProducts(limit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getProductSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const limit = parseInt(req.query.limit) || 10;
    const result = await productService.getProductSuggestions(q.trim(), limit);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
