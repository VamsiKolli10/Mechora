const Wishlist = require("../models/wishlistModel");

// Get user's wishlist
exports.getWishlist = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const wishlist = await Wishlist.getUserWishlist(userId);
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add item to wishlist
exports.addItem = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { watch_id } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!watch_id) {
      return res.status(400).json({ error: "watch_id is required" });
    }

    const item = await Wishlist.addToWishlist(userId, watch_id);
    res.status(201).json(item);
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// Remove item from wishlist
exports.removeItem = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { watchId } = req.params;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const item = await Wishlist.removeFromWishlist(userId, watchId);
    if (!item) {
      return res.status(404).json({ error: "Item not found in wishlist" });
    }

    res.json({ message: "Item removed from wishlist", item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Check if item is in wishlist
exports.checkItem = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { watchId } = req.params;

    if (!userId) {
      return res.json({ in_wishlist: false });
    }

    const inWishlist = await Wishlist.isInWishlist(userId, watchId);
    res.json({ in_wishlist: inWishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

