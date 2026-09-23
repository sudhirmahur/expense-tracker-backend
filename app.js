const express = require("express");
const cors = require("cors");

const routes = require("./routes/index");

const {
  errorHandler,
  notFound,
} = require("./middlewares/error.middleware");

const app = express();

// ─── CORS CONFIG ─────────────────────────────────────

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin
      // (Postman, Thunder Client, server-to-server, etc.)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "workspace-id",
    ],

    credentials: true,
  })
);

// ─── BODY PARSER ─────────────────────────────────────

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── HEALTH CHECK ────────────────────────────────────

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Expense Tracker API is running 🚀",
  });
});

// ─── ROUTES ───────────────────────────────────────────

app.use("/api", routes);

// ─── 404 ──────────────────────────────────────────────

app.use(notFound);

// ─── ERROR HANDLER ───────────────────────────────────

app.use(errorHandler);

module.exports = app;