const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
if (process.env.NODE_ENV !== "test") require("dotenv").config();

const app = express();
const usersRoute = require("./routes/users");
const watchesRoute = require("./routes/watches");
const productsRoute = require("./routes/products");
const authRoute = require("./routes/auth");
const brandsRoute = require("./routes/brands");
const collectionsRoute = require("./routes/collections");
const assetsRoute = require("./routes/assets");
const paymentsRoute = require("./routes/payments");
const searchRoute = require("./routes/search");
const cartRoute = require("./routes/cart");
const wishlistRoute = require("./routes/wishlist");
const recentlyViewedRoute = require("./routes/recentlyViewed");
const ordersRoute = require("./routes/orders");
const accountRoute = require("./routes/account");
const paymentsController = require("./controllers/paymentsController");
const config = require("./config/secrets");
const { validateProductionConfig } = require("./config/production");
const logger = require("./utils/logger");
const { generalRateLimiter } = require("./middleware/rateLimiter");
const {
  createCorsMiddleware,
  createHelmetMiddleware,
} = require("./middleware/security");
const {
  errorHandler,
  notFoundHandler,
  requestIdMiddleware,
} = require("./middleware/errorHandler");

validateProductionConfig();
app.disable("x-powered-by");
app.set("trust proxy", process.env.TRUST_PROXY || 1);

app.use(requestIdMiddleware);
app.use(createHelmetMiddleware());
app.use(createCorsMiddleware());
app.use(morgan(config.env === "production" ? "combined" : "dev", { stream: logger.stream }));
app.use(cookieParser(config.cookies.secret));
// This release accepts requests only; stored payment credentials cannot enable charging.
app.use("/api/payments", (_req, res) => res.status(503).json({
  error: "Online payments are currently unavailable. No payment has been taken.",
}));
app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  paymentsController.handleWebhook
);
app.use(express.json({ limit: "1mb" }));
app.use(generalRateLimiter);

// API Routes
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/watches", watchesRoute);
app.use("/api/products", productsRoute);
app.use("/api/brands", brandsRoute);
app.use("/api/collections", collectionsRoute);
app.use("/api/assets", assetsRoute);
app.use("/api/payments", paymentsRoute);
app.use("/api/search", searchRoute);
app.use("/api/cart", cartRoute);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/recently-viewed", recentlyViewedRoute);
app.use("/api/orders", ordersRoute);
app.use("/api/account", accountRoute);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
