const cartRepository = require("../repositories/cartRepository");

const createCartError = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

const getCartRecord = async ({ userId, guestToken }) => {
  if (userId) return cartRepository.getOrCreateUserCart(userId);
  if (guestToken) return cartRepository.getOrCreateGuestCart(guestToken);
  throw createCartError("User or guest token required");
};

const getCurrentCart = async ({ userId, guestToken }) => {
  const cart = await getCartRecord({ userId, guestToken });
  return cartRepository.getCartWithItems(cart.id);
};

const addItem = async ({ userId, guestToken, watchId, quantity }) => {
  const cart = await getCartRecord({ userId, guestToken });
  await cartRepository.addItemToCart(cart.id, watchId, quantity);
  return cartRepository.getCartWithItems(cart.id);
};

const updateItem = async ({ userId, guestToken, itemId, quantity }) => {
  const cart = await getCartRecord({ userId, guestToken });
  await cartRepository.updateCartItemQuantity(cart.id, itemId, quantity);
  return cartRepository.getCartWithItems(cart.id);
};

const removeItem = async ({ userId, guestToken, itemId }) => {
  const cart = await getCartRecord({ userId, guestToken });
  await cartRepository.removeCartItem(cart.id, itemId);
  return cartRepository.getCartWithItems(cart.id);
};

const clearCurrentCart = async ({ userId, guestToken }) => {
  const cart = await getCartRecord({ userId, guestToken });
  return cartRepository.clearCart(cart.id);
};

const mergeGuestCart = async ({ guestToken, userId }) => {
  if (!guestToken) throw createCartError("Guest token required");
  return cartRepository.mergeGuestCartIntoUserCart(guestToken, userId);
};

module.exports = {
  getCurrentCart,
  addItem,
  updateItem,
  removeItem,
  clearCurrentCart,
  mergeGuestCart,
};
