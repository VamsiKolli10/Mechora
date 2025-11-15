const Watch = require("../models/watchesModel");

exports.createWatch = async (req, res) => {
  try {
    const result = await Watch.insertWatch(req.body);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllWatches = async (req, res) => {
  try {
    const result = await Watch.findAll();
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getWatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Watch.findById(id);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateWatch = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Watch.updateById(id, req.body);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteWatch = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Watch.deleteById(id);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully", watch: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.searchWatches = async (req, res) => {
  try {
    const { query } = req.params;
    const result = await Watch.search(query);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
