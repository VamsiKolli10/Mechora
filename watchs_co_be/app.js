const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();
const usersRoute = require("./routes/users");
const watchesRoute = require("./routes/watches");
const productsRoute = require("./routes/products");
const authRoute = require("./routes/auth");
const brandsRoute = require("./routes/brands");
const collectionsRoute = require("./routes/collections");
const assetsRoute = require("./routes/assets");
const searchRoute = require("./routes/search");
const cartRoute = require("./routes/cart");
const wishlistRoute = require("./routes/wishlist");
const recentlyViewedRoute = require("./routes/recentlyViewed");
const ordersRoute = require("./routes/orders");
const accountRoute = require("./routes/account");
const config = require("./config/secrets");
const logger = require("./utils/logger");
const { generalRateLimiter } = require("./middleware/rateLimiter");

const allowedOrigins = (process.env.CLIENT_ORIGIN ||
  "http://localhost:5173,http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(morgan(config.env === "production" ? "combined" : "dev", { stream: logger.stream }));
app.use(cookieParser(config.cookies.secret));
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

module.exports = app;
