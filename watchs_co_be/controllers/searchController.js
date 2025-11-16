const Watch = require("../models/watchesModel");

exports.search = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ error: "Search query is required" });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await Watch.fullTextSearch(q.trim(), { page, limit });
    res.json({
      query: q,
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

exports.getSuggestions = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const limit = parseInt(req.query.limit) || 10;
    const result = await Watch.getSearchSuggestions(q.trim(), limit);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

