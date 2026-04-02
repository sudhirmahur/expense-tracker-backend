const express = require("express");
const cors = require("cors");

const routes = require("./routes/index");
const { errorHandler, notFound } = require("./middlewares/error.middleware");

const app = express();

// ─── CORS CONFIG ──────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// ─── BODY PARSER ──────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── HEALTH CHECK ─────────────────
app.get("/", (req, res) => {
  res.json({ message: "API is running 🚀" });
});

// ─── ROUTES ───────────────────────
app.use("/api", routes);

// ─── 404 ──────────────────────────
app.use(notFound);

// ─── ERROR HANDLER ───────────────
app.use(errorHandler);

module.exports = app;