const cartService = require("../services/cartService");
const { AppError, asyncHandler } = require("../middleware/errorHandler");
const { ensureGuestToken, extractGuestToken, verifyGuestToken, clearGuestToken } = require("../utils/guestTokens");

const attachGuestToken = (payload, context) => context?.signedToken ? { ...payload, guest_token: context.signedToken } : payload;
const resolveContext = (req, res) => {
  if (req.user?.id) return { userId: req.user.id, guestContext: null };
  const guestContext = ensureGuestToken(req, res);
  return { userId: null, guestContext };
};

exports.getCart = asyncHandler(async (req, res) => {
  const { userId, guestContext } = resolveContext(req, res);
  const cart = await cartService.getCurrentCart({ userId, guestToken: guestContext?.rawToken });
  res.json(attachGuestToken(cart, guestContext));
});

exports.addItem = asyncHandler(async (req, res) => {
  const { watch_id: watchId, quantity = 1 } = req.body;
  if (!watchId) throw new AppError("watch_id is required", { statusCode: 400, code: "WATCH_ID_REQUIRED" });
  const { userId, guestContext } = resolveContext(req, res);
  const cart = await cartService.addItem({ userId, guestToken: guestContext?.rawToken, watchId, quantity });
  res.json(attachGuestToken(cart, guestContext));
});

exports.updateItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  if (quantity === undefined || quantity < 0) throw new AppError("Valid quantity is required", { statusCode: 400, code: "INVALID_QUANTITY" });
  const { userId, guestContext } = resolveContext(req, res);
  const cart = await cartService.updateItem({ userId, guestToken: guestContext?.rawToken, itemId: req.params.itemId, quantity });
  res.json(attachGuestToken(cart, guestContext));
});

exports.removeItem = asyncHandler(async (req, res) => {
  const { userId, guestContext } = resolveContext(req, res);
  const cart = await cartService.removeItem({ userId, guestToken: guestContext?.rawToken, itemId: req.params.itemId });
  res.json(attachGuestToken(cart, guestContext));
});

exports.clearCart = asyncHandler(async (req, res) => {
  const { userId, guestContext } = resolveContext(req, res);
  await cartService.clearCurrentCart({ userId, guestToken: guestContext?.rawToken });
  res.json(attachGuestToken({ message: "Cart cleared" }, guestContext));
});

exports.mergeCart = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) throw new AppError("Authentication required", { statusCode: 401, code: "AUTHENTICATION_REQUIRED" });
  const guestContext = extractGuestToken(req);
  const guestToken = guestContext?.rawToken || (req.body.guest_token ? verifyGuestToken(req.body.guest_token) : null);
  const mergedCart = await cartService.mergeGuestCart({ guestToken, userId });
  clearGuestToken(res);
  res.json(mergedCart);
});
