const Cart = require("../models/cartModel");
const {
  ensureGuestToken,
  extractGuestToken,
  verifyGuestToken,
  clearGuestToken,
} = require("../utils/guestTokens");

const attachGuestToken = (payload, guestContext) => {
  if (!guestContext?.signedToken) {
    return payload;
  }
  return {
    ...payload,
    guest_token: guestContext.signedToken,
  };
};

// Get cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    let guestContext = null;

    let cart;
    if (userId) {
      const userCart = await Cart.getOrCreateUserCart(userId);
      cart = await Cart.getCartWithItems(userCart.id);
    } else {
      guestContext = ensureGuestToken(req, res);
      const guestCart = await Cart.getOrCreateGuestCart(guestContext.rawToken);
      cart = await Cart.getCartWithItems(guestCart.id);
      return res.json(attachGuestToken(cart, guestContext));
    }

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
    }

    if (!userId) {
      guestContext = guestContext || ensureGuestToken(req, res);
      return res.json(attachGuestToken(cart, guestContext));
    }

    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add item to cart
exports.addItem = async (req, res) => {
  try {
    const { watch_id, quantity = 1 } = req.body;
    const userId = req.user?.id;
    let guestContext = null;

    if (!watch_id) {
      return res.status(400).json({ error: "watch_id is required" });
    }

    let cart;
    if (userId) {
      const userCart = await Cart.getOrCreateUserCart(userId);
      cart = userCart;
    } else {
      guestContext = ensureGuestToken(req, res);
      const guestCart = await Cart.getOrCreateGuestCart(guestContext.rawToken);
      cart = guestCart;
    }

    await Cart.addItemToCart(cart.id, watch_id, quantity);
    const updatedCart = await Cart.getCartWithItems(cart.id);

    res.json(attachGuestToken(updatedCart, guestContext));
  } catch (err) {
    if (err.message.includes("not found") || err.message.includes("not available") || err.message.includes("stock")) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// Update cart item quantity
exports.updateItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({ error: "Valid quantity is required" });
    }

    const userId = req.user?.id;
    const guestContext = extractGuestToken(req);

    let cartId;
    if (userId) {
      const userCart = await Cart.getOrCreateUserCart(userId);
      cartId = userCart.id;
    } else if (guestContext?.rawToken) {
      const guestCart = await Cart.getOrCreateGuestCart(guestContext.rawToken);
      cartId = guestCart.id;
    } else {
      return res.status(400).json({ error: "User or guest token required" });
    }

    await Cart.updateCartItemQuantity(cartId, itemId, quantity);
    const updatedCart = await Cart.getCartWithItems(cartId);

    res.json(attachGuestToken(updatedCart, guestContext));
  } catch (err) {
    if (err.message.includes("not found") || err.message.includes("stock")) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// Remove item from cart
exports.removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const userId = req.user?.id;
    const guestContext = extractGuestToken(req);

    let cartId;
    if (userId) {
      const userCart = await Cart.getOrCreateUserCart(userId);
      cartId = userCart.id;
    } else if (guestContext?.rawToken) {
      const guestCart = await Cart.getOrCreateGuestCart(guestContext.rawToken);
      cartId = guestCart.id;
    } else {
      return res.status(400).json({ error: "User or guest token required" });
    }

    await Cart.removeCartItem(cartId, itemId);
    const updatedCart = await Cart.getCartWithItems(cartId);

    res.json(attachGuestToken(updatedCart, guestContext));
  } catch (err) {
    if (err.message.includes("not found")) {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const guestContext = extractGuestToken(req);

    let cart;
    if (userId) {
      const userCart = await Cart.getOrCreateUserCart(userId);
      cart = userCart;
    } else if (guestContext?.rawToken) {
      const guestCart = await Cart.getOrCreateGuestCart(guestContext.rawToken);
      cart = guestCart;
    } else {
      return res.status(400).json({ error: "User or guest token required" });
    }

    await Cart.clearCart(cart.id);
    res.json(attachGuestToken({ message: "Cart cleared" }, guestContext));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Merge guest cart into user cart
exports.mergeCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const providedToken = req.body.guest_token;
    const guestContext = extractGuestToken(req);
    const verifiedFromBody = providedToken
      ? verifyGuestToken(providedToken)
      : null;
    const guestToken = guestContext?.rawToken || verifiedFromBody;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!guestToken) {
      return res.status(400).json({ error: "Guest token required" });
    }

    const mergedCart = await Cart.mergeGuestCartIntoUserCart(guestToken, userId);
    clearGuestToken(res);
    res.json(mergedCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
