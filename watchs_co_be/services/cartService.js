const cartRepository = require("../repositories/cartRepository");
const { withTransaction } = require("../utils/transaction");

const createCartError = (message, status = 400) => Object.assign(new Error(message), { status });
const getCartRecord = ({ userId, guestToken }, client) => {
  if (userId) return cartRepository.getOrCreateUserCart(userId, client);
  if (guestToken) return cartRepository.getOrCreateGuestCart(guestToken, client);
  throw createCartError("User or guest token required");
};

const withCart = (context, mutate = null) => withTransaction(async (client) => {
  const cart = await getCartRecord(context, client);
  await cartRepository.getCartWithItems(cart.id, client);
  if (mutate) await mutate(cart.id, client);
  return cartRepository.getCartWithItems(cart.id, client);
});

const getCurrentCart = context => withCart(context);
const addItem = context => withCart(context, (id, client) =>
  cartRepository.addItemToCart(id, context.watchId, context.quantity, client));
const updateItem = context => withCart(context, (id, client) =>
  cartRepository.updateCartItemQuantity(id, context.itemId, context.quantity, client));
const removeItem = context => withCart(context, (id, client) =>
  cartRepository.removeCartItem(id, context.itemId, client));
const clearCurrentCart = context => withCart(context, (id, client) => cartRepository.clearCart(id, client));
const mergeGuestCart = ({ guestToken, userId }) => cartRepository.mergeGuestCartIntoUserCart(guestToken, userId);

module.exports = { getCurrentCart, addItem, updateItem, removeItem, clearCurrentCart, mergeGuestCart };
