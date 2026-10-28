const RecentlyViewed = require("../models/recentlyViewedModel");
const {
  ensureGuestToken,
  extractGuestToken,
} = require("../utils/guestTokens");

// Add to recently viewed
exports.addItem = async (req, res) => {
  try {
    const userId = req.user?.id;
    const guestContext = userId ? null : ensureGuestToken(req, res);
    const guestToken = guestContext?.rawToken;
    const { watch_id } = req.body;

    if (!watch_id) {
      return res.status(400).json({ error: "watch_id is required" });
    }

    await RecentlyViewed.addToRecentlyViewed(userId, guestToken, watch_id);
    res.json({
      message: "Added to recently viewed",
      guest_token: guestContext?.signedToken,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get recently viewed
exports.getRecentlyViewed = async (req, res) => {
  try {
    const userId = req.user?.id;
    const guestContext = extractGuestToken(req);
    const guestToken = guestContext?.rawToken;
    const limit = parseInt(req.query.limit) || 10;

    let items;
    if (userId) {
      items = await RecentlyViewed.getRecentlyViewed(userId, limit);
    } else if (guestToken) {
      items = await RecentlyViewed.getGuestRecentlyViewed(guestToken, limit);
    } else {
      return res.json([]);
    }

    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Clear recently viewed
exports.clearRecentlyViewed = async (req, res) => {
  try {
    const userId = req.user?.id;
    const guestContext = extractGuestToken(req);
    const guestToken = guestContext?.rawToken;

    await RecentlyViewed.clearRecentlyViewed(userId, guestToken);
    res.json({ message: "Recently viewed cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
