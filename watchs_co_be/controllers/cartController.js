const Cart = require("../models/cartModel");

// Get cart
exports.getCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const guestToken = req.headers["x-guest-token"] || req.query.guest_token;

    let cart;
    if (userId) {
      const userCart = await Cart.getOrCreateUserCart(userId);
      cart = await Cart.getCartWithItems(userCart.id);
    } else if (guestToken) {
      const guestCart = await Cart.getOrCreateGuestCart(guestToken);
      cart = await Cart.getCartWithItems(guestCart.id);
    } else {
      // Create new guest cart
      const newGuestCart = await Cart.getOrCreateGuestCart();
      cart = await Cart.getCartWithItems(newGuestCart.id);
      return res.json({ ...cart, guest_token: newGuestCart.guest_token });
    }

    if (!cart) {
      return res.status(404).json({ error: "Cart not found" });
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
    const guestToken = req.headers["x-guest-token"] || req.query.guest_token;

    if (!watch_id) {
      return res.status(400).json({ error: "watch_id is required" });
    }

    let cart;
    if (userId) {
      const userCart = await Cart.getOrCreateUserCart(userId);
      cart = userCart;
    } else if (guestToken) {
      const guestCart = await Cart.getOrCreateGuestCart(guestToken);
      cart = guestCart;
    } else {
      // Create new guest cart
      const newGuestCart = await Cart.getOrCreateGuestCart();
      cart = newGuestCart;
    }

    await Cart.addItemToCart(cart.id, watch_id, quantity);
    const updatedCart = await Cart.getCartWithItems(cart.id);

    res.json({
      ...updatedCart,
      guest_token: cart.guest_token,
    });
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
    const guestToken = req.headers["x-guest-token"] || req.query.guest_token;

    let cartId;
    if (userId) {
      const userCart = await Cart.getOrCreateUserCart(userId);
      cartId = userCart.id;
    } else if (guestToken) {
      const guestCart = await Cart.getOrCreateGuestCart(guestToken);
      cartId = guestCart.id;
    } else {
      return res.status(400).json({ error: "User or guest token required" });
    }

    await Cart.updateCartItemQuantity(cartId, itemId, quantity);
    const updatedCart = await Cart.getCartWithItems(cartId);

    res.json(updatedCart);
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
    const guestToken = req.headers["x-guest-token"] || req.query.guest_token;

    let cartId;
    if (userId) {
      const userCart = await Cart.getOrCreateUserCart(userId);
      cartId = userCart.id;
    } else if (guestToken) {
      const guestCart = await Cart.getOrCreateGuestCart(guestToken);
      cartId = guestCart.id;
    } else {
      return res.status(400).json({ error: "User or guest token required" });
    }

    await Cart.removeCartItem(cartId, itemId);
    const updatedCart = await Cart.getCartWithItems(cartId);

    res.json(updatedCart);
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
    const guestToken = req.headers["x-guest-token"] || req.query.guest_token;

    let cart;
    if (userId) {
      const userCart = await Cart.getOrCreateUserCart(userId);
      cart = userCart;
    } else if (guestToken) {
      const guestCart = await Cart.getOrCreateGuestCart(guestToken);
      cart = guestCart;
    } else {
      return res.status(400).json({ error: "User or guest token required" });
    }

    await Cart.clearCart(cart.id);
    res.json({ message: "Cart cleared" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Merge guest cart into user cart
exports.mergeCart = async (req, res) => {
  try {
    const userId = req.user?.id;
    const guestToken = req.headers["x-guest-token"] || req.body.guest_token;

    if (!userId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!guestToken) {
      return res.status(400).json({ error: "Guest token required" });
    }

    const mergedCart = await Cart.mergeGuestCartIntoUserCart(guestToken, userId);
    res.json(mergedCart);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
