const Asset = require("../models/assetModel");

exports.getAssetsByWatchId = async (req, res) => {
  try {
    const { watchId } = req.params;
    const result = await Asset.getAssetsByWatchId(watchId);
    res.json(result.rows);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Asset.getAssetById(id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Asset not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.createAsset = async (req, res) => {
  try {
    const result = await Asset.createAsset(req.body);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Asset.updateAsset(id, req.body);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Asset not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

exports.deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Asset.deleteAsset(id);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Asset not found" });
    }
    res.json({ message: "Asset deleted successfully", asset: result.rows[0] });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
};

