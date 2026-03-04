require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/db");
const fs = require("fs-extra");
const path = require("path");

const PORT = process.env.PORT || 5000;

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("💥 UNCAUGHT EXCEPTION! Shutting down...");
  console.error(error.name, error.message);
  console.error(error.stack);
  process.exit(1);
});

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("📁 Created uploads directory");
}

// Hubungkan ke MongoDB sebelum menyalakan server
connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on("unhandledRejection", (error) => {
    console.error("💥 UNHANDLED REJECTION! Shutting down...");
    console.error(error.name, error.message);
    console.error(error.stack);
    server.close(() => {
      process.exit(1);
    });
  });
});
