// src/app.js
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

const authRoutes = require("./api/routes/authRoutes");
const docRoutes = require("./api/routes/docRoutes");
const { errorHandler, notFound } = require("./api/middlewares/errorHandler");

// Middleware Global
const corsOptions = ["https://spec2docs.netlify.app", "https://spec2docs.netlify.app/", "http://localhost:5000", "http://localhost:5173", "http://localhost:8081", "https://localhost:8000"];
app.use(cors({ origin: corsOptions })); // Mengizinkan akses dari frontend React
app.use(express.json()); // Memproses body format JSON
app.use(express.urlencoded({ extended: true }));

// Folder Statis untuk Upload (Opsional)
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Root Route (Health Check)
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Spec2Docs API Generator",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      docs: "/api/docs",
    },
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/docs", docRoutes);

// 404 Handler - harus setelah semua routes
app.use(notFound);

// Error Handler - harus paling terakhir
app.use(errorHandler);

module.exports = app;
