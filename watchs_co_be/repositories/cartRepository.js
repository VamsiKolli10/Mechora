const Cart = require("../models/cartModel");

module.exports = {
  getOrCreateUserCart: Cart.getOrCreateUserCart,
  getOrCreateGuestCart: Cart.getOrCreateGuestCart,
  getCartWithItems: Cart.getCartWithItems,
  addItemToCart: Cart.addItemToCart,
  updateCartItemQuantity: Cart.updateCartItemQuantity,
  removeCartItem: Cart.removeCartItem,
  clearCart: Cart.clearCart,
  mergeGuestCartIntoUserCart: Cart.mergeGuestCartIntoUserCart,
};
