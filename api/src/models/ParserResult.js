const mongoose = require("mongoose");

const parserResultSchema = new mongoose.Schema({
  documentationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Documentation",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  summary: {
    totalFiles: { type: Number, default: 0 },
    successfulFiles: { type: Number, default: 0 },
    failedFiles: { type: Number, default: 0 },
    totalEndpoints: { type: Number, default: 0 },
    skippedFiles: { type: Number, default: 0 },
  },
  successfulParsing: [
    {
      file: String,
      endpointCount: Number,
      path: String,
    },
  ],
  failedParsing: [
    {
      file: String,
      path: String,
      error: String,
      errorType: String, // 'SyntaxError', 'ParseError', 'UnknownError'
      line: Number,
      details: String,
    },
  ],
  skippedFiles: [
    {
      file: String,
      path: String,
      reason: String, // 'NoRoutes', 'NotJavaScript', 'Ignored'
    },
  ],
  warnings: [
    {
      type: { type: String }, // Changed from 'type: String' to avoid conflict
      message: String,
      files: { type: [String], default: [] },
    },
  ],
  hasErrors: { type: Boolean, default: false },
  hasWarnings: { type: Boolean, default: false },
  completionStatus: {
    type: String,
    enum: ["success", "partial", "failed"],
    default: "success",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster lookups
parserResultSchema.index({ documentationId: 1 });
parserResultSchema.index({ userId: 1 });

module.exports = mongoose.model("ParserResult", parserResultSchema);
