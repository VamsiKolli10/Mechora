const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const usersRoute = require("./routes/users");
const watchesRoute = require("./routes/watches");
const productsRoute = require("./routes/products");
const authRoute = require("./routes/auth");

const allowedOrigins = (process.env.CLIENT_ORIGIN ||
  "http://localhost:5173,http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

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
app.use(express.json());
app.use("/api/auth", authRoute);
app.use("/api/users", usersRoute);
app.use("/api/watches", watchesRoute);
app.use("/api/products", productsRoute);

module.exports = app;
