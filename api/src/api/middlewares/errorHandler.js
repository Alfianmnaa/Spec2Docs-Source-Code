/**
 * Enhanced error handling middleware
 * Menangkap semua error di aplikasi dengan informasi yang jelas
 */

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log error untuk debugging
  console.error("❌ Error occurred:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    path: req.path,
    method: req.method,
  });

  // Default status code
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern)[0];
    message = `${field} already exists`;
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 404;
    message = "Resource not found";
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }

  // Multer errors (file upload)
  if (err.name === "MulterError") {
    statusCode = 400;
    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File size too large. Maximum size is 50MB";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Too many files uploaded";
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  // Custom file filter error
  if (err.message === "Only ZIP files are allowed") {
    statusCode = 400;
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    message: message,
    // Only show stack trace in development
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

/**
 * Not found handler - untuk route yang tidak ada
 */
const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
